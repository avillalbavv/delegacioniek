/**
 * /reglamento-2026 — Nuevo Reglamento Académico 2026
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronRight,
  ScrollText,
  ArrowRight,
  ArrowLeft,
  Info,
  CheckCircle2,
  Calculator,
  CalendarCheck2,
  CalendarRange,
  ExternalLink,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import {
  CAMBIOS,
  NO_CAMBIA,
  COMPARADOR,
  VIGENCIA_DESDE,
  APROBADO_CD,
  ELEVADO_CSU,
} from "@/data/reglamento-2026";

export const Route = createFileRoute("/reglamento-2026")({ component: Reglamento2026Page });

function Reglamento2026Page() {
  const [tab, setTab] = useState<"cambia" | "no-cambia" | "comparador">("cambia");

  return (
    <div className="min-h-screen">
      <SiteNavbar />
      <main>
        <section className="relative overflow-hidden pt-16 pb-12 sm:pt-24">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
          <div className="mx-auto max-w-6xl px-6">
            <Reveal className="max-w-3xl">
              <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Link to="/" className="transition-colors hover:text-foreground">
                  Inicio
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground">Nuevo Reglamento Académico 2026</span>
              </div>
              <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground mb-4">
                <ScrollText className="h-3.5 w-3.5 text-primary" /> Resolución 25/15/68-00 · Acta
                1223/14/07/2025
              </span>
              <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
                Nuevo Reglamento <span className="text-gradient">Académico 2026</span>
              </h1>
              <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                La FP-UNA aprobó un reglamento académico nuevo que reemplaza al Reglamento General
                de Cátedra de 2016. Acá explicamos, en criollo, qué cambia realmente para vos.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="pb-24">
          <div className="mx-auto max-w-5xl px-6 space-y-12">
            {/* ── ESTADO DE VIGENCIA ── */}
            <Reveal>
              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/8 p-5">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5" />
                  <div className="text-sm text-muted-foreground space-y-1.5">
                    <p>
                      <strong className="text-foreground">¿Cuál es el documento oficial?</strong> El
                      Consejo Directivo de la FP-UNA lo aprobó el {APROBADO_CD} y fue {ELEVADO_CSU}.
                      La FP-UNA lo publica actualmente en su sección oficial de políticas y
                      reglamentos.
                    </p>
                    <p>
                      <strong className="text-foreground">¿Desde cuándo aplica?</strong> El propio
                      texto fija su entrada en vigencia para{" "}
                      <strong className="text-foreground">{VIGENCIA_DESDE}</strong>, y ahí mismo
                      deroga el Reglamento de Cátedra 2016 por completo.
                    </p>
                    <p>
                      <strong className="text-foreground">¿A quiénes afecta?</strong> A todos los
                      estudiantes de carreras de grado de la FP-UNA. El texto no incluye
                      disposiciones transitorias generales para "estudiantes antiguos" — la única
                      distinción por antigüedad de plan de estudios es el límite de asignaturas por
                      periodo.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* ── RESUMEN ── */}
            <Reveal>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">En resumen</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  El cambio más importante es la{" "}
                  <strong className="text-foreground">fórmula de la nota final</strong>: ahora el
                  trabajo de todo el semestre pesa más (60%) que el examen final (40%) — antes era
                  al revés. También se fija por primera vez un{" "}
                  <strong className="text-foreground">porcentaje de asistencia único</strong> para
                  todas las materias (antes lo definía cada cátedra), y se establece que los
                  horarios deben quedar{" "}
                  <strong className="text-foreground">sin superposición</strong>. El resto de las
                  reglas de fondo — el examen final mínimo de 50%, el redondeo, reprobar 3 veces —
                  se mantiene igual.
                </p>
              </div>
            </Reveal>

            {/* ── HERRAMIENTAS ACTUALIZADAS ── */}
            <Reveal>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  to="/calculadora"
                  className="card-hover flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
                >
                  <Calculator className="h-5 w-5 flex-shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">Calculadora de Notas</p>
                    <p className="text-xs text-muted-foreground">
                      Ya usa la fórmula RP = 0,4×EF + 0,6×PEP
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                </Link>
                <Link
                  to="/asistencia"
                  className="card-hover flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
                >
                  <CalendarCheck2 className="h-5 w-5 flex-shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">Calculadora de Asistencia</p>
                    <p className="text-xs text-muted-foreground">
                      Usa el piso reglamentario de 70%
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                </Link>
              </div>
            </Reveal>

            {/* ── TABS ── */}
            <div>
              <Reveal>
                <div className="mb-6 flex flex-wrap gap-2">
                  {[
                    { key: "cambia", label: "¿Qué cambia?" },
                    { key: "no-cambia", label: "¿Qué NO cambia?" },
                    { key: "comparador", label: "Comparador completo" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key as typeof tab)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        tab === t.key
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </Reveal>

              {tab === "cambia" && (
                <div className="grid gap-4 stagger is-visible sm:grid-cols-2">
                  {CAMBIOS.map((c) => (
                    <article
                      key={c.id}
                      className="card-hover rounded-2xl border border-border bg-card p-5"
                    >
                      <h3 className="mb-3 font-display font-semibold text-foreground">{c.tema}</h3>
                      <div className="mb-3 space-y-2">
                        <div className="flex gap-2 text-xs">
                          <span className="flex-shrink-0 rounded-full bg-muted/60 px-2 py-0.5 font-semibold text-muted-foreground flex items-center gap-1">
                            <ArrowLeft className="h-3 w-3" /> Antes
                          </span>
                          <span className="text-muted-foreground">{c.antes}</span>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <span className="flex-shrink-0 rounded-full bg-primary/15 px-2 py-0.5 font-semibold text-primary flex items-center gap-1">
                            <ArrowRight className="h-3 w-3" /> Ahora
                          </span>
                          <span className="text-foreground">{c.ahora}</span>
                        </div>
                      </div>
                      <p className="mb-2 text-xs leading-relaxed text-muted-foreground">
                        {c.explicacion}
                      </p>
                      <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground">
                        <strong>Impacto para vos:</strong> {c.impacto}
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {tab === "no-cambia" && (
                <Reveal>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {NO_CAMBIA.map((texto, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400 mt-0.5" />
                        <span className="text-muted-foreground">{texto}</span>
                      </div>
                    ))}
                  </div>
                </Reveal>
              )}

              {tab === "comparador" && (
                <Reveal>
                  <div className="overflow-hidden rounded-2xl border border-border bg-card overflow-x-auto">
                    <table className="w-full text-sm min-w-[560px]">
                      <thead>
                        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="px-4 py-3 font-medium">Tema</th>
                          <th className="px-4 py-3 font-medium">Reglamento anterior (2016)</th>
                          <th className="px-4 py-3 font-medium">Reglamento 2026</th>
                        </tr>
                      </thead>
                      <tbody>
                        {COMPARADOR.map((f, i) => (
                          <tr key={i} className="border-b border-border/50 last:border-0">
                            <td className="px-4 py-3 font-medium text-foreground">{f.tema}</td>
                            <td className="px-4 py-3 text-muted-foreground">{f.anterior}</td>
                            <td className="px-4 py-3 text-foreground">{f.nuevo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Reveal>
              )}
            </div>

            {/* ── FUENTE ── */}
            <Reveal>
              <a
                href="https://www.pol.una.py/wp-content/uploads/Resol.-25-15-68-00-Reglamento-Academico-de-la-FP-UNA.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
              >
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                Fuente: Resolución 25/15/68-00, Acta 1223/14/07/2025. Ante cualquier duda, prevalece
                el texto oficial.
              </a>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
