import { supabase } from "./supabase.ts";

const META_KEY = "iek-sync-meta:v1";
export const LOCAL_STATE_CHANGED_EVENT = "iek:local-state-changed";
export const CLOUD_STATE_RESTORED_EVENT = "iek:cloud-state-restored";

const EXACT_KEYS = new Set([
  "poliplanner:seleccion:v2",
  "iek-asistencia:v2",
  "iek-promedio-db-v2",
  "iek-calculadora-notas:v1",
  "iek-mapa-enfasis-seleccionado",
  "iek-study-plans:v1",
  "iek-notifications:v1",
  "iek-semesters:v1",
  "iek-generator-preferences:v1",
  "iek-schedule-revision:v1",
]);
const PREFIXES = ["iek-mapa-progreso-v1:"];

export interface SyncedState {
  version: 1;
  values: Record<string, string>;
  updatedAt: Record<string, string>;
}

function isSyncedKey(key: string): boolean {
  return EXACT_KEYS.has(key) || PREFIXES.some((prefix) => key.startsWith(prefix));
}

function loadMeta(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(META_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveMeta(meta: Record<string, string>) {
  window.localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function writeLocalState(key: string, value: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
  if (!isSyncedKey(key)) return;
  const meta = loadMeta();
  meta[key] = new Date().toISOString();
  saveMeta(meta);
  window.dispatchEvent(new CustomEvent(LOCAL_STATE_CHANGED_EVENT, { detail: { key } }));
}

export function removeLocalState(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
  const meta = loadMeta();
  delete meta[key];
  saveMeta(meta);
  window.dispatchEvent(new CustomEvent(LOCAL_STATE_CHANGED_EVENT, { detail: { key } }));
}

export function collectLocalState(): SyncedState {
  const values: Record<string, string> = {};
  const updatedAt = loadMeta();
  if (typeof window === "undefined") return { version: 1, values, updatedAt };
  const migrationTime = new Date().toISOString();
  for (let index = 0; index < window.localStorage.length; index++) {
    const key = window.localStorage.key(index);
    if (!key || !isSyncedKey(key)) continue;
    const value = window.localStorage.getItem(key);
    if (value === null) continue;
    values[key] = value;
    if (!updatedAt[key]) updatedAt[key] = migrationTime;
  }
  saveMeta(updatedAt);
  return { version: 1, values, updatedAt };
}

function normalizeRemoteState(value: unknown): SyncedState {
  if (!value || typeof value !== "object") return { version: 1, values: {}, updatedAt: {} };
  const candidate = value as Partial<SyncedState>;
  return {
    version: 1,
    values: candidate.values && typeof candidate.values === "object" ? candidate.values : {},
    updatedAt:
      candidate.updatedAt && typeof candidate.updatedAt === "object" ? candidate.updatedAt : {},
  };
}

export function mergeStates(local: SyncedState, remote: SyncedState): SyncedState {
  const keys = new Set([...Object.keys(local.values), ...Object.keys(remote.values)]);
  const merged: SyncedState = { version: 1, values: {}, updatedAt: {} };
  for (const key of keys) {
    const localTime = local.updatedAt[key] ?? "";
    const remoteTime = remote.updatedAt[key] ?? "";
    const source = localTime >= remoteTime ? local : remote;
    const value = source.values[key];
    if (value !== undefined) merged.values[key] = value;
    merged.updatedAt[key] =
      source.updatedAt[key] || localTime || remoteTime || new Date().toISOString();
  }
  return merged;
}

export function applyStateLocally(state: SyncedState): void {
  if (typeof window === "undefined") return;
  for (const [key, value] of Object.entries(state.values)) {
    if (isSyncedKey(key)) window.localStorage.setItem(key, value);
  }
  saveMeta(state.updatedAt);
  window.dispatchEvent(new CustomEvent(CLOUD_STATE_RESTORED_EVENT));
}

export async function synchronizeUserState(userId: string): Promise<SyncedState> {
  if (!supabase) throw new Error("Supabase no está configurado");
  const local = collectLocalState();
  const { data, error } = await supabase
    .from("user_app_state")
    .select("state")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  const remote = normalizeRemoteState(data?.state);
  if (
    Object.keys(local.values).length > 0 &&
    Object.keys(remote.values).length > 0 &&
    JSON.stringify(local.values) !== JSON.stringify(remote.values)
  ) {
    const { error: backupError } = await supabase.from("user_state_backups").insert([
      { user_id: userId, state: local, source: "local-before-merge" },
      { user_id: userId, state: remote, source: "cloud-before-merge" },
    ]);
    if (backupError) throw backupError;
  }
  const merged = mergeStates(local, remote);
  const { error: writeError } = await supabase
    .from("user_app_state")
    .upsert({ user_id: userId, state: merged, revision: 1 }, { onConflict: "user_id" });
  if (writeError) throw writeError;
  applyStateLocally(merged);
  return merged;
}

export async function pushLocalState(userId: string): Promise<void> {
  if (!supabase) return;
  const local = collectLocalState();
  const { data, error: readError } = await supabase
    .from("user_app_state")
    .select("state")
    .eq("user_id", userId)
    .maybeSingle();
  if (readError) throw readError;
  const remote = normalizeRemoteState(data?.state);
  const state = mergeStates(local, remote);
  const { error } = await supabase
    .from("user_app_state")
    .upsert({ user_id: userId, state, revision: 1 }, { onConflict: "user_id" });
  if (error) throw error;
  applyStateLocally(state);
}

export async function deleteSyncedAcademicData(userId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase no está configurado");
  const { error } = await supabase.from("user_app_state").delete().eq("user_id", userId);
  if (error) throw error;
  const { error: backupError } = await supabase
    .from("user_state_backups")
    .delete()
    .eq("user_id", userId);
  if (backupError) throw backupError;
  if (typeof window !== "undefined") {
    const keys: string[] = [];
    for (let index = 0; index < window.localStorage.length; index++) {
      const key = window.localStorage.key(index);
      if (key && isSyncedKey(key)) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
    window.localStorage.removeItem(META_KEY);
  }
}

export function exportAcademicData(): string {
  return JSON.stringify(
    { exportedAt: new Date().toISOString(), state: collectLocalState() },
    null,
    2,
  );
}
