import assert from "node:assert/strict";
import test from "node:test";
import { calcularStats, generarFechasClase, type Materia } from "./asistencia.ts";

const materia = (asistencias: Materia["asistencias"] = {}): Materia => ({
  id: "test-materia", nombre: "Electrónica I", carrera: "IEK", docente: "Docente",
  dias: ["Lunes"], asistencias, practicasLab: null,
});

test("la asistencia comienza en cero sin clases marcadas", () => {
  const stats = calcularStats(materia());
  assert.equal(stats.porcentajeActual, 0);
  assert.equal(stats.presentes, 0);
  assert.equal(stats.faltasConsumidas, 0);
});

test("la asistencia aumenta solamente según las marcas del alumno", () => {
  const [first, second] = generarFechasClase(["Lunes"]);
  assert.equal(calcularStats(materia({ [first]: "presente" })).porcentajeActual, 100);
  assert.equal(calcularStats(materia({ [first]: "presente", [second]: "ausente" })).porcentajeActual, 50);
});

test("una clase justificada es neutral para el porcentaje", () => {
  const [first, second] = generarFechasClase(["Lunes"]);
  assert.equal(calcularStats(materia({ [first]: "presente", [second]: "justificada" })).porcentajeActual, 100);
});
