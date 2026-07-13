/**
 * /manual-de-bichos — Manual de Nuevos Ingresantes
 *
 * Sección nueva. Por ahora sin contenido (BICHOS = [] en src/data/bichos.ts):
 * la estructura, el diseño, la navegación, el buscador y los filtros por
 * categoría ya están armados para que, cuando se cargue contenido real,
 * funcione sin tener que tocar este componente.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bug, Search, ChevronRight, Sparkles } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { BICHOS, CATEGORIA_LABEL, CATEGORIA_COLOR, type BichoCategoria } from "@/data/bichos";

export const Route = createFileRoute("/manual-de-bichos")({ component: ManualBichosPage });

const CATEGORIAS = Object.keys(CATEGORIA_LABEL) as BichoCategoria[];

function ManualBichosPage() {
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState<BichoCategoria | "todas">("todas");

  const resultados = useMemo(() => {
    const q = query.toLowerCase().trim();
    return BICHOS.filter(b => {
      const matchQ = !q || b.titulo.toLowerCase().includes(q) || b.resumen.toLowerCase().includes(q);
      const matchCat = categoria === "todas" || b.categoria === categoria;
      return matchQ && matchCat;
    });
  }, [query, categoria]);

  return (
    <div className="min-h-screen">
      <SiteNavbar />
      <main>
        <section className="relative overflow-hidden pt-16 pb-12 sm:pt-24">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
          <div className="mx-auto max-w-6xl px-6">
            <Reveal className="max-w-3xl">
              <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Link to="/" className="transition-colors hover:text-foreground">Inicio</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground">Manual de Nuevos Ingresantes</span>
              </div>
              <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
                Manual de <span className="text-gradient">Nuevos Ingresantes</span>
              </h1>
              <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                Guías y tips prácticos sobre las materias y trámites más complicados de la carrera,
                escritos por estudiantes para estudiantes.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="pb-24">
          <div className="mx-auto max-w-5xl px-6">
            {/* ── BUSCADOR + FILTROS ── */}
            <Reveal>
              <div className="mb-8 space-y-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Buscar por materia o tema…"
                    aria-label="Buscar en el Manual de Nuevos Ingresantes"
                    className="w-full rounded-2xl border border-border bg-card py-4 pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground transition focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCategoria("todas")}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      categoria === "todas" ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Todas
                  </button>
                  {CATEGORIAS.map(c => (
                    <button
                      key={c}
                      onClick={() => setCategoria(c)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                        categoria === c ? "text-white" : "border border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                      style={categoria === c ? { background: CATEGORIA_COLOR[c] } : undefined}
                    >
                      {CATEGORIA_LABEL[c]}
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* ── CONTENIDO ── */}
            {resultados.length > 0 ? (
              <div className="grid gap-4 stagger is-visible sm:grid-cols-2 lg:grid-cols-3">
                {resultados.map(b => (
                  <article key={b.id} className="card-hover rounded-2xl border border-border bg-card p-5">
                    <span
                      className="mb-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ background: `${CATEGORIA_COLOR[b.categoria]}20`, color: CATEGORIA_COLOR[b.categoria] }}
                    >
                      {CATEGORIA_LABEL[b.categoria]}
                    </span>
                    <h3 className="font-display font-semibold text-foreground">{b.titulo}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{b.resumen}</p>
                    {b.materiaRelacionada && (
                      <p className="mt-3 text-xs text-muted-foreground/70">Relacionado: {b.materiaRelacionada}</p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <Reveal>
                <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border px-6 py-20 text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                    <Bug className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="flex items-center justify-center gap-1.5 text-base font-medium text-foreground">
                      <Sparkles className="h-4 w-4 text-primary" /> Muy pronto
                    </p>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                      Todavía no cargamos contenido acá, pero la sección ya está lista. Pronto vas a
                      encontrar guías sobre las materias y trámites más complicados de la carrera.
                    </p>
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
