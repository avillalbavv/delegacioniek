import { supabase } from "./supabase.ts";
import { upsertNotification } from "./notification-service.ts";
import { writeLocalState } from "./user-state.ts";

const ACK_KEY = "iek-schedule-revision:v1";
export interface ScheduleRevision {
  id: string;
  revision: number;
  file_name: string;
  change_summary: string;
  affects_all: boolean;
  affected_subject_ids: string[];
  affected_section_ids: string[];
  published_at: string;
}

export async function checkScheduleUpdates(): Promise<ScheduleRevision | null> {
  if (!supabase || typeof window === "undefined") return null;
  const { data, error } = await supabase
    .from("schedule_revisions")
    .select(
      "id,revision,file_name,change_summary,affects_all,affected_subject_ids,affected_section_ids,published_at",
    )
    .eq("is_active", true)
    .order("revision", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  const revision = data as ScheduleRevision;
  const acknowledged = Number(localStorage.getItem(ACK_KEY) || 0);
  if (revision.revision <= acknowledged) return null;
  let selection: { materiaIds: string[]; secciones: Record<string, string> } = {
    materiaIds: [],
    secciones: {},
  };
  try {
    const parsed = JSON.parse(localStorage.getItem("poliplanner:seleccion:v2") || "{}");
    selection = {
      materiaIds: Array.isArray(parsed.materiaIds) ? parsed.materiaIds : [],
      secciones: parsed.secciones && typeof parsed.secciones === "object" ? parsed.secciones : {},
    };
  } catch {
    // Sin selección válida: el aviso general igualmente puede mostrarse.
  }
  const chosenSections = new Set(Object.values(selection.secciones));
  const affected =
    revision.affects_all ||
    revision.affected_subject_ids.some((id) => selection.materiaIds.includes(id)) ||
    revision.affected_section_ids.some((id) => chosenSections.has(id));
  if (affected)
    upsertNotification({
      id: `schedule-revision:${revision.id}`,
      type: "schedule-update",
      title: "Se actualizaron los horarios",
      message: `${revision.change_summary} Revisá tus materias, fechas, aulas y exámenes.`,
      priority: "high",
      createdAt: revision.published_at,
      actionUrl: "/poliplanner",
    });
  writeLocalState(ACK_KEY, String(revision.revision));
  return affected ? revision : null;
}

export async function publishScheduleRevision(file: File, summary: string): Promise<void> {
  if (!supabase) throw new Error("Supabase no está configurado");
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !["xlsx", "xls", "csv"].includes(extension))
    throw new Error("Formato no permitido. Seleccioná un archivo XLSX, XLS o CSV.");
  if (file.size > 10 * 1024 * 1024) throw new Error("El archivo supera el límite de 10 MB.");
  if (!summary.trim()) throw new Error("Describí brevemente qué cambió en los horarios.");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Sesión administrativa requerida");
  const checksum = [
    ...new Uint8Array(await crypto.subtle.digest("SHA-256", await file.arrayBuffer())),
  ]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
  const path = `${new Date().toISOString().replace(/[:.]/g, "-")}-${safeName}`;
  const contentType =
    file.type ||
    (extension === "csv"
      ? "text/csv"
      : extension === "xls"
        ? "application/vnd.ms-excel"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  const { error: uploadError } = await supabase.storage
    .from("schedule-imports")
    .upload(path, file, { contentType, upsert: false });
  if (uploadError) throw uploadError;
  const { error } = await supabase.from("schedule_revisions").insert({
    file_name: file.name,
    file_path: path,
    checksum,
    change_summary: summary.trim(),
    affects_all: true,
    published_by: userData.user.id,
  });
  if (error) {
    // Evita archivos huérfanos cuando el registro de la revisión es rechazado.
    await supabase.storage.from("schedule-imports").remove([path]);
    throw error;
  }
}
