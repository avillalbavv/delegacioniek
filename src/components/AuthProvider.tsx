/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { LOCAL_STATE_CHANGED_EVENT, pushLocalState, synchronizeUserState } from "@/lib/user-state";
import { checkScheduleUpdates } from "@/lib/schedule-update-service";

export type SyncStatus = "disabled" | "idle" | "syncing" | "synced" | "error";
export type UserRole = "student" | "superadmin" | "admin" | "editor" | "viewer";

interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  role: UserRole;
  syncStatus: SyncStatus;
  syncError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  syncNow: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo completar la operación";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [role, setRole] = useState<UserRole>("student");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    isSupabaseConfigured ? "idle" : "disabled",
  );
  const [syncError, setSyncError] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);
  const activeSyncRef = useRef(false);

  const runSync = useCallback(async (userId: string, fullMerge = false) => {
    if (!supabase || activeSyncRef.current) return;
    activeSyncRef.current = true;
    setSyncStatus("syncing");
    setSyncError(null);
    try {
      if (fullMerge) await synchronizeUserState(userId);
      else await pushLocalState(userId);
      await checkScheduleUpdates();
      setSyncStatus("synced");
    } catch (error) {
      setSyncStatus("error");
      setSyncError(errorMessage(error));
    } finally {
      activeSyncRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId || !supabase) {
      setRole("student");
      if (isSupabaseConfigured) setSyncStatus("idle");
      return;
    }
    // La autoridad real vive en user_roles y es calculada por una función
    // SECURITY DEFINER. profiles.role queda únicamente como compatibilidad.
    const authClient = supabase;
    authClient.rpc("current_app_role", { target_user: userId }).then(({ data, error }) => {
      if (!error && data) setRole(data as UserRole);
      else
        authClient
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle()
          .then(({ data: legacy }) => {
            if (legacy?.role) setRole(legacy.role as UserRole);
          });
    });
    void runSync(userId, true);
  }, [session?.user.id, runSync]);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) return;
    const onLocalChange = () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => void runSync(userId), 1200);
    };
    window.addEventListener(LOCAL_STATE_CHANGED_EVENT, onLocalChange);
    return () => {
      window.removeEventListener(LOCAL_STATE_CHANGED_EVENT, onLocalChange);
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [session?.user.id, runSync]);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      session,
      user: session?.user ?? null,
      role,
      syncStatus,
      syncError,
      signIn: async (email, password) => {
        if (!supabase) throw new Error("Supabase todavía no está configurado");
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signUp: async (email, password, displayName) => {
        if (!supabase) throw new Error("Supabase todavía no está configurado");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName.trim() || null } },
        });
        if (error) throw error;
        return { needsConfirmation: !data.session };
      },
      signOut: async () => {
        if (!supabase) return;
        if (session?.user.id) await pushLocalState(session.user.id);
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
      resetPassword: async (email) => {
        if (!supabase) throw new Error("Supabase todavía no está configurado");
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/cuenta`,
        });
        if (error) throw error;
      },
      updatePassword: async (password) => {
        if (!supabase) throw new Error("Supabase todavía no está configurado");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
      },
      syncNow: async () => {
        if (!session?.user.id) throw new Error("Iniciá sesión para sincronizar");
        await runSync(session.user.id, true);
      },
    }),
    [loading, role, runSync, session, syncError, syncStatus],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return value;
}
