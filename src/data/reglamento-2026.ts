/**
 * reglamento-2026.ts — Datos para la sección "Nuevo Reglamento Académico 2026".
 *
 * Fuente: Anexo 11, Acta 1249/29/06/2026 (Reglamento Académico de Carreras
 * de Grado de la FP-UNA) vs. Resolución 0540-00-2016 (Reglamento General
 * de Cátedra, régimen anterior que este reglamento deroga).
 *
 * Ver informe interno de análisis para el detalle artículo por artículo.
 */

export const VIGENCIA_DESDE = "el segundo periodo académico del año 2026";
export const APROBADO_CD = "29/06/2026 (Consejo Directivo FP-UNA, Resolución 26/14/50-00)";
export const ELEVADO_CSU = "06/07/2026, en trámite de homologación por el Consejo Superior Universitario (CSU) de la UNA";

export interface CambioCard {
  id: string;
  tema: string;
  antes: string;
  ahora: string;
  explicacion: string;
  impacto: string;
}

export const CAMBIOS: CambioCard[] = [
  {
    id: "formula",
    tema: "Cálculo de la nota final",
    antes: "PF = 0,6 × Examen Final + 0,4 × Promedio Ponderado (PP)",
    ahora: "RP = 0,4 × Examen Final + 0,6 × PEP (promedio de las dos etapas)",
    explicacion: "Se invierten los pesos: antes el examen final valía más que todo el proceso junto; ahora el trabajo de todo el semestre (PEP) pesa más que el examen final.",
    impacto: "Rendir bien en parciales y actividades de proceso ahora tiene más impacto en tu nota que antes. Un mal examen final duele menos si el PEP es alto — pero seguís necesitando 50% en el final sí o sí.",
  },
  {
    id: "etapas",
    tema: "Estructura de la evaluación de proceso",
    antes: "PP = parciales + TPs + labs + taller, con al menos la mitad como promedio de parciales.",
    ahora: "PEP = (PPEP1 + PPEP2) / 2. Cada etapa pondera 50% su parcial y 50% las demás actividades de esa etapa. Los labs obligatorios deben pesar ≥15% dentro de esas actividades.",
    explicacion: "El semestre se organiza en dos etapas evaluativas explícitas (más una tercera de retroalimentación), cada una con su propio parcial y actividades.",
    impacto: "Tenés que llevar la cuenta por etapa, no de forma global — la Calculadora de Notas ya lo hace por vos.",
  },
  {
    id: "asistencia-clases",
    tema: "Asistencia mínima a clases",
    antes: "Sin porcentaje institucional fijo: lo definía cada cátedra en su Planilla de Cátedra.",
    ahora: "Fijo para todas las materias: ≥70% → derecho a rendir desde la 1ª convocatoria. 50–70% → derecho solo desde la 2ª convocatoria. <50% → sin derecho.",
    explicacion: "Se reemplaza el criterio de cada cátedra por un esquema único de dos niveles válido para toda la Facultad.",
    impacto: "Ya no varía según la materia o el profesor — es la misma regla siempre, y ahora la Calculadora de Asistencia la aplica automáticamente.",
  },
  {
    id: "labs",
    tema: "Prácticas de laboratorio",
    antes: "100% de asistencia obligatoria; se permitía recuperación sin un tope numérico explícito.",
    ahora: "100% de asistencia obligatoria; se puede recuperar hasta el 25% del total, gestionado por el Departamento de Aprendizaje de la Carrera.",
    explicacion: "Se mantiene la exigencia del 100%, pero ahora el margen de recuperación está cuantificado.",
    impacto: "Sabés exactamente cuántas prácticas podés recuperar como máximo — la Calculadora de Asistencia lo controla aparte de la asistencia a clases.",
  },
  {
    id: "escala",
    tema: "Nombre de la nota 2",
    antes: "\"Regular\"",
    ahora: "\"Aceptable\"",
    explicacion: "Las bandas numéricas (60–70%, etc.) no cambian, solo el nombre de esa calificación.",
    impacto: "Cosmético — tu nota numérica no cambia, solo cómo se llama.",
  },
  {
    id: "limite-asignaturas",
    tema: "Plan académico, malla aplicable y límite de asignaturas",
    antes: "8 asignaturas para todos (excluidas las de derecho a examen final).",
    ahora: "La malla 2026 se aplica a ingresantes del año 2026; la malla 2008 continúa vigente para estudiantes pertenecientes a ese plan.",
    explicacion: "El reglamento contiene una regla general según el plan de estudios. La malla 2026 no reemplaza de forma general a la malla 2008.",
    impacto: "Para conocer el límite aplicable, verificá el plan académico consignado en tu registro institucional.",
  },
  {
    id: "solapamiento",
    tema: "Solapamiento de horario permitido",
    antes: "No estaba contemplado.",
    ahora: "Se permite inscribirse con hasta 30 minutos de solapamiento entre asignaturas.",
    explicacion: "Es una tolerancia nueva que no existía en el reglamento anterior.",
    impacto: "Planificador IEK ya no marca como choque bloqueante los solapamientos de 30 minutos o menos.",
  },
  {
    id: "tribunal",
    tema: "Tribunal examinador",
    antes: "El profesor de la asignatura y al menos un profesor de disciplina afín (2 como mínimo).",
    ahora: "El profesor de mayor categoría de la asignatura y dos docentes más (3 en total).",
    explicacion: "Se amplía la integración mínima del tribunal.",
    impacto: "Tus exámenes finales los evalúa un tribunal más numeroso.",
  },
  {
    id: "periodo-lectivo",
    tema: "Estructura del periodo lectivo",
    antes: "Mínimo 14 semanas; los parciales suspendían las clases 2 semanas cada uno.",
    ahora: "16 semanas fijas; los parciales NO suspenden clases — se integran en 3 etapas consecutivas (2 evaluativas + 1 de retroalimentación).",
    explicacion: "El calendario deja de tener 'cortes' por examen; las clases siguen durante los parciales.",
    impacto: "El semestre se siente más continuo, sin semanas completas dedicadas solo a exámenes parciales.",
  },
];

export const NO_CAMBIA: string[] = [
  "Recuperatorio de parciales: continúa realizándose junto con el examen final, como ya ocurría anteriormente. Este punto no representa un cambio introducido por el nuevo reglamento.",
  "La malla 2008 continúa vigente para quienes pertenecen a ese plan académico.",
  "El examen final sigue necesitando un mínimo de 50% para ser considerado — por debajo de eso, reprobás sin importar el resto.",
  "Las bandas numéricas de la escala (0–59 / 60–70 / 71–80 / 81–90 / 91–100).",
  "La regla de redondeo: fracción decimal ≥0,5 sube al entero superior.",
  "Reprobar 3 veces la misma asignatura obliga a recursarla antes de un nuevo examen final.",
  "Perdés los méritos académicos si no te presentás a rendir en 2 periodos académicos consecutivos.",
  "Siguen existiendo 2 convocatorias de examen final por periodo académico.",
  "Necesitás estar libre de sanciones disciplinarias para tener derecho a evaluación final.",
  "Las prácticas de laboratorio obligatorias siguen exigiendo 100% de asistencia como base.",
];

export interface ComparadorFila { tema: string; anterior: string; nuevo: string }

export const COMPARADOR: ComparadorFila[] = [
  { tema: "Fórmula de nota final", anterior: "0,6×EF + 0,4×PP", nuevo: "0,4×EF + 0,6×PEP" },
  { tema: "Mínimo de EF para ser considerado", anterior: "50%", nuevo: "50% (sin cambio)" },
  { tema: "Recuperatorio de parciales", anterior: "Junto con el examen final", nuevo: "Junto con el examen final (sin cambio)" },
  { tema: "Asistencia mínima a clases", anterior: "Definida por cada cátedra", nuevo: "70% (1ª conv.) / 50–70% (2ª conv.) fijo" },
  { tema: "Recuperación de laboratorio", anterior: "Sin tope numérico explícito", nuevo: "Hasta 25% del total" },
  { tema: "Nombre de la nota 2", anterior: "Regular", nuevo: "Aceptable" },
  { tema: "Malla académica IEK", anterior: "Malla 2008", nuevo: "Malla 2008 vigente / Malla 2026 para ingresantes 2026" },
  { tema: "Solapamiento de horario", anterior: "No permitido", nuevo: "Hasta 30 minutos permitido" },
  { tema: "Tope de estudiantes por sección", anterior: "55", nuevo: "50 (ajustable)" },
  { tema: "Anulación de inscripción", anterior: "Antes del 1er parcial + 2 de 4 cuotas", nuevo: "Dentro de las 2 primeras semanas de clases" },
  { tema: "Tribunal examinador", anterior: "2 docentes como mínimo", nuevo: "3 docentes (categoría más alta + 2 más)" },
  { tema: "Duración del periodo lectivo", anterior: "Mínimo 14 semanas", nuevo: "16 semanas fijas" },
  { tema: "Suspensión de clases en parciales", anterior: "Sí, 2 semanas por parcial", nuevo: "No — sin suspensión, en 3 etapas" },
  { tema: "Reprobar 3 veces", anterior: "Debe recursar", nuevo: "Igual, sin cambios" },
  { tema: "Redondeo", anterior: "Fracción ≥0,5 sube", nuevo: "Igual, sin cambios" },
];
