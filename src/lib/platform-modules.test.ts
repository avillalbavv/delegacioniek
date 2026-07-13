import test from "node:test";
import assert from "node:assert/strict";
import { generateStudyPlan, planProgress, reprogramOverdue } from "./study-planner.ts";
test("el plan de estudio reserva repaso y simulacro", () => {
  const now = new Date("2026-08-01T10:00:00Z");
  const plan = generateStudyPlan(
    {
      subjectName: "Electrónica II",
      deadline: "2026-08-10T22:00:00Z",
      topics: ["Transistores", "Polarización"],
      hoursPerDay: 1,
      availableDays: [1, 2, 3, 4, 5, 6],
      sessionMinutes: 60,
      priority: "high",
    },
    now,
  );
  assert.ok(plan.sessions.some((s) => s.topic.includes("Repaso")));
  assert.ok(plan.sessions.some((s) => s.topic.includes("Simulacro")));
  assert.equal(planProgress(plan).percentage, 0);
});
test("la reprogramación conserva las sesiones", () => {
  const now = new Date("2026-08-05T10:00:00Z");
  const plan = generateStudyPlan(
    {
      subjectName: "Cálculo",
      deadline: "2026-08-20T20:00:00Z",
      topics: ["Integrales"],
      hoursPerDay: 1,
      availableDays: [1, 2, 3, 4, 5, 6],
      sessionMinutes: 60,
      priority: "medium",
    },
    new Date("2026-08-01T10:00:00Z"),
  );
  const count = plan.sessions.length;
  assert.equal(reprogramOverdue(plan, now).sessions.length, count);
});
