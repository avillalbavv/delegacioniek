import type { RadarItem } from "./academic-radar.ts";
import { supabase } from "./supabase.ts";
import { writeLocalState } from "./user-state.ts";
export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
}
const KEY = "iek-notifications:v1";

function isAppNotification(value: unknown): value is AppNotification {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<AppNotification>;
  return (
    typeof item.id === "string" &&
    typeof item.type === "string" &&
    typeof item.title === "string" &&
    typeof item.message === "string" &&
    typeof item.priority === "string" &&
    typeof item.createdAt === "string" &&
    (item.readAt === undefined || typeof item.readAt === "string") &&
    (item.actionUrl === undefined || typeof item.actionUrl === "string")
  );
}

export function normalizeNotifications(value: unknown): AppNotification[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isAppNotification).slice(0, 100);
}
export function upsertNotifications(notifications: AppNotification[]): AppNotification[] {
  const existing = loadNotifications();
  const map = new Map(existing.map((item) => [item.id, item]));
  let changed = false;
  for (const notification of notifications)
    if (!map.has(notification.id)) {
      map.set(notification.id, notification);
      changed = true;
    }
  if (!changed) return existing;
  const next = [...map.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 100);
  writeLocalState(KEY, JSON.stringify(next));
  return next;
}
export function upsertNotification(notification: AppNotification): AppNotification[] {
  return upsertNotifications([notification]);
}
export function loadNotifications(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    return normalizeNotifications(JSON.parse(localStorage.getItem(KEY) || "[]"));
  } catch {
    return [];
  }
}
export function syncRadarNotifications(items: RadarItem[]): AppNotification[] {
  const existing = loadNotifications(),
    map = new Map(existing.map((n) => [n.id, n]));
  for (const i of items.filter((i) => i.priority === "high" || i.priority === "critical"))
    if (!map.has(i.id))
      map.set(i.id, {
        id: i.id,
        type: i.type,
        title: i.title,
        message: i.description,
        priority: i.priority,
        createdAt: i.createdAt,
        actionUrl: i.actionUrl,
      });
  const next = [...map.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 100);
  writeLocalState(KEY, JSON.stringify(next));
  return next;
}
export function markNotificationRead(id: string) {
  const next = loadNotifications().map((n) =>
    n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
  );
  writeLocalState(KEY, JSON.stringify(next));
}
export function markAllNotificationsRead() {
  const readAt = new Date().toISOString();
  const next = loadNotifications().map((n) => (n.readAt ? n : { ...n, readAt }));
  writeLocalState(KEY, JSON.stringify(next));
}

interface PublishedNotice {
  id: string;
  title: string;
  summary: string;
  priority: string;
  publish_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface PublishedEvent {
  id: string;
  title: string;
  description: string | null;
  category: string;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

function noticePriority(priority: string): string {
  if (priority === "urgente") return "critical";
  if (priority === "importante") return "high";
  return "low";
}

function eventMessage(event: PublishedEvent): string {
  const startsAt = new Date(event.starts_at).toLocaleString("es-PY", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return `${startsAt}${event.description ? ` · ${event.description}` : ""}`;
}

/** Incorpora publicaciones oficiales globales sin duplicarlas entre actualizaciones periódicas. */
export async function syncOfficialNotifications(): Promise<AppNotification[]> {
  if (!supabase) return loadNotifications();
  const now = Date.now();
  const [{ data: notices, error: noticesError }, { data: events, error: eventsError }] =
    await Promise.all([
      supabase
        .from("admin_notices")
        .select("id,title,summary,priority,publish_at,expires_at,created_at,updated_at")
        .eq("status", "published")
        .order("updated_at", { ascending: false })
        .limit(25),
      supabase
        .from("academic_events")
        .select("id,title,description,category,starts_at,ends_at,created_at,updated_at")
        .eq("status", "published")
        .order("updated_at", { ascending: false })
        .limit(25),
    ]);
  if (noticesError) throw noticesError;
  if (eventsError) throw eventsError;

  const noticeItems = ((notices || []) as PublishedNotice[])
    .filter((notice) => !notice.expires_at || new Date(notice.expires_at).getTime() > now)
    .map((notice) => {
      const version = notice.updated_at || notice.publish_at || notice.created_at;
      return {
        id: `official-notice:${notice.id}:${version}`,
        type: "official-notice",
        title: `Aviso: ${notice.title}`,
        message: notice.summary,
        priority: noticePriority(notice.priority),
        createdAt: version,
        actionUrl: "/avisos",
      } satisfies AppNotification;
    });
  const eventItems = ((events || []) as PublishedEvent[])
    .filter(
      (event) =>
        new Date(event.ends_at || event.starts_at).getTime() >= now - 7 * 24 * 60 * 60 * 1000,
    )
    .map((event) => {
      const version = event.updated_at || event.created_at;
      const startsIn = new Date(event.starts_at).getTime() - now;
      return {
        id: `official-event:${event.id}:${version}`,
        type: "calendar-update",
        title: `Calendario: ${event.title}`,
        message: eventMessage(event),
        priority: startsIn >= 0 && startsIn <= 7 * 24 * 60 * 60 * 1000 ? "high" : "medium",
        createdAt: version,
        actionUrl: "/calendario-academico",
      } satisfies AppNotification;
    });
  return upsertNotifications([...noticeItems, ...eventItems]);
}
