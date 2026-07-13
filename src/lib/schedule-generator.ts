import {
  DATA,
  findScheduleConflicts,
  overlapMinutes,
  parseHora,
  type Seccion,
} from "./poliplanner.ts";
export interface GeneratorPreferences {
  materiaIds: string[];
  maxSubjects?: number;
  blocked?: { day: string; start: number; end: number }[];
  preferredShift?: "M" | "T" | "N";
  freeDay?: string;
  maxDays?: number;
  allowOverlap?: boolean;
  maxOverlapMinutes?: number;
}
export interface ScheduleProposal {
  id: string;
  label: string;
  sections: Seccion[];
  score: number;
  days: number;
  weeklyMinutes: number;
  gapMinutes: number;
  conflicts: number;
  explanation: string[];
}
type ScheduleCandidate = ReturnType<typeof metrics> & { sections: Seccion[] };
function metrics(sections: Seccion[]) {
  const byDay = new Map<string, { start: number; end: number }[]>();
  let weeklyMinutes = 0;
  for (const s of sections)
    for (const c of s.clases) {
      const r = parseHora(c.hora);
      if (!r) continue;
      weeklyMinutes += r.end - r.start;
      byDay.set(c.dia, [...(byDay.get(c.dia) || []), r]);
    }
  let gapMinutes = 0;
  for (const ranges of byDay.values()) {
    ranges.sort((a, b) => a.start - b.start);
    for (let i = 1; i < ranges.length; i++)
      gapMinutes += Math.max(0, ranges[i].start - ranges[i - 1].end);
  }
  return {
    days: byDay.size,
    weeklyMinutes,
    gapMinutes,
    conflicts: findScheduleConflicts(sections).length,
  };
}
function valid(section: Seccion, p: GeneratorPreferences) {
  if (p.freeDay && section.clases.some((c) => c.dia === p.freeDay)) return false;
  return !(p.blocked || []).some((b) =>
    section.clases.some((c) => {
      if (c.dia !== b.day) return false;
      const r = parseHora(c.hora);
      return r ? overlapMinutes(r, b) > 0 : false;
    }),
  );
}
function enumerate(
  ids: string[],
  p: GeneratorPreferences,
  index = 0,
  current: Seccion[] = [],
  out: Seccion[][] = [],
): Seccion[][] {
  if (out.length > 300) return out;
  if (index === ids.length) {
    out.push([...current]);
    return out;
  }
  const options = DATA.filter((s) => s.materiaId === ids[index] && valid(s, p));
  enumerate(ids, p, index + 1, current, out);
  for (const option of options) enumerate(ids, p, index + 1, [...current, option], out);
  return out;
}
export function generateSemesterSchedules(p: GeneratorPreferences): ScheduleProposal[] {
  const ids = [...new Set(p.materiaIds)].slice(0, p.maxSubjects || 8);
  const candidates = enumerate(ids, p)
    .filter((s) => s.length > 0)
    .map((sections) => ({ sections, ...metrics(sections) }))
    .filter(
      (x) =>
        (p.allowOverlap ? x.conflicts <= 1 : x.conflicts === 0) &&
        (!p.maxDays || x.days <= p.maxDays),
    );
  const profiles = [
    {
      label: "Opción equilibrada",
      fn: (x: ScheduleCandidate) =>
        x.sections.length * 1000 -
        x.days * 80 -
        x.gapMinutes -
        x.conflicts * 500 +
        (p.preferredShift
          ? x.sections.filter((s) => s.turno === p.preferredShift).length * 100
          : 0),
      explanation: "Equilibra materias, días y ventanas.",
    },
    {
      label: "Horario más compacto",
      fn: (x: ScheduleCandidate) => x.sections.length * 500 - x.gapMinutes * 3 - x.days * 30,
      explanation: "Minimiza horas libres entre clases.",
    },
    {
      label: "Menor cantidad de días",
      fn: (x: ScheduleCandidate) => x.sections.length * 500 - x.days * 400 - x.gapMinutes,
      explanation: "Concentra la cursada en menos días.",
    },
    {
      label: "Máxima cantidad de materias",
      fn: (x: ScheduleCandidate) => x.sections.length * 2000 - x.conflicts * 1000 - x.gapMinutes,
      explanation: "Incluye la mayor cantidad posible sin conflictos bloqueantes.",
    },
  ];
  return profiles
    .map((profile) => {
      const best = [...candidates].sort((a, b) => profile.fn(b) - profile.fn(a))[0];
      if (!best) return null;
      return {
        id: profile.label.toLowerCase().replace(/\s/g, "-"),
        label: profile.label,
        score: Math.max(0, Math.round(profile.fn(best))),
        sections: best.sections,
        days: best.days,
        weeklyMinutes: best.weeklyMinutes,
        gapMinutes: best.gapMinutes,
        conflicts: best.conflicts,
        explanation: [
          profile.explanation,
          p.preferredShift
            ? `Prioriza el turno ${p.preferredShift}.`
            : "Sin preferencia de turno obligatoria.",
        ],
      };
    })
    .filter((x): x is ScheduleProposal => Boolean(x));
}
