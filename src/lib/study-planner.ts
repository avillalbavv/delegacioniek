import { writeLocalState } from "./user-state.ts";
export type StudySessionStatus = "pending" | "partial" | "completed" | "skipped";
export interface StudySession {
  id: string;
  topic: string;
  startsAt: string;
  durationMinutes: number;
  status: StudySessionStatus;
  progress: number;
  notes?: string;
  difficulty?: number;
}
export interface StudyPlan {
  id: string;
  subjectId?: string;
  subjectName: string;
  title: string;
  deadline: string;
  targetGrade?: number;
  priority: "low" | "medium" | "high";
  status: "active" | "completed" | "archived";
  sessions: StudySession[];
  createdAt: string;
}
export interface StudyPlanInput {
  subjectId?: string;
  subjectName: string;
  title?: string;
  deadline: string;
  topics: string[];
  hoursPerDay: number;
  availableDays: number[];
  sessionMinutes: number;
  priority: "low" | "medium" | "high";
  targetGrade?: number;
}
const KEY = "iek-study-plans:v1";
export function loadStudyPlans(): StudyPlan[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as StudyPlan[];
  } catch {
    return [];
  }
}
export function saveStudyPlans(plans: StudyPlan[]) {
  writeLocalState(KEY, JSON.stringify(plans));
}
export function generateStudyPlan(input: StudyPlanInput, now = new Date()): StudyPlan {
  const deadline = new Date(input.deadline);
  if (!(deadline > now)) throw new Error("La fecha límite debe ser futura");
  if (!input.subjectName.trim()) throw new Error("Seleccioná una materia");
  const topics = input.topics.map((t) => t.trim()).filter(Boolean);
  if (!topics.length) throw new Error("Agregá al menos un tema");
  const slots: Date[] = [];
  for (let d = new Date(now); d < deadline; d.setDate(d.getDate() + 1)) {
    const day = new Date(d);
    day.setHours(19, 0, 0, 0);
    if (input.availableDays.includes(day.getDay())) {
      const count = Math.max(1, Math.floor((input.hoursPerDay * 60) / input.sessionMinutes));
      for (let i = 0; i < count; i++) {
        const slot = new Date(day);
        slot.setMinutes(slot.getMinutes() + i * (input.sessionMinutes + 15));
        slots.push(slot);
      }
    }
  }
  if (!slots.length) throw new Error("No hay días disponibles antes de la fecha límite");
  const topicsWithReview = [...topics, "Repaso general", "Simulacro y corrección"];
  const sessions = slots
    .slice(
      0,
      Math.max(topicsWithReview.length, Math.min(slots.length, topicsWithReview.length * 2)),
    )
    .map((at, i): StudySession => ({
      id: crypto.randomUUID(),
      topic:
        topicsWithReview[
          Math.min(
            topicsWithReview.length - 1,
            Math.floor(
              (i * topicsWithReview.length) / Math.min(slots.length, topicsWithReview.length * 2),
            ),
          )
        ],
      startsAt: at.toISOString(),
      durationMinutes: input.sessionMinutes,
      status: "pending",
      progress: 0,
    }));
  return {
    id: crypto.randomUUID(),
    subjectId: input.subjectId,
    subjectName: input.subjectName,
    title: input.title?.trim() || `Plan para ${input.subjectName}`,
    deadline: deadline.toISOString(),
    targetGrade: input.targetGrade,
    priority: input.priority,
    status: "active",
    sessions,
    createdAt: now.toISOString(),
  };
}
export function reprogramOverdue(plan: StudyPlan, now = new Date()): StudyPlan {
  const overdue = plan.sessions.filter((s) => s.status === "pending" && new Date(s.startsAt) < now);
  const future = plan.sessions.filter(
    (s) => !(s.status === "pending" && new Date(s.startsAt) < now),
  );
  let cursor = new Date(now);
  cursor.setDate(cursor.getDate() + 1);
  cursor.setHours(19, 0, 0, 0);
  return {
    ...plan,
    sessions: [
      ...future,
      ...overdue.map((s) => {
        const startsAt = cursor.toISOString();
        cursor = new Date(cursor.getTime() + 864e5);
        return { ...s, startsAt };
      }),
    ].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  };
}
export function planProgress(plan: StudyPlan) {
  const total = plan.sessions.reduce((n, s) => n + s.durationMinutes, 0);
  const done = plan.sessions.reduce((n, s) => n + (s.durationMinutes * s.progress) / 100, 0);
  return {
    percentage: total ? Math.round((done / total) * 100) : 0,
    doneMinutes: Math.round(done),
    pendingMinutes: Math.round(total - done),
    next:
      plan.sessions.find((s) => s.status === "pending" && new Date(s.startsAt) >= new Date()) ??
      null,
  };
}
