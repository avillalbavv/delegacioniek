import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bell, CalendarCheck2, CalendarRange, Radar, Sparkles } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import iekLogo from "@/assets/iek-logo.png";

export const Route = createFileRoute("/")({ component: Index });

const PRIMARY_TOOLS = [
  {
    to: "/radar-academico",
    icon: Radar,
    title: "Mi Semestre",
    description: "Clases, exámenes, alertas y próximas acciones en una vista personal.",
    color: "#22d3ee",
  },
  {
    to: "/poliplanner",
    icon: CalendarRange,
    title: "Planificador IEK",
    description: "Armá tu horario manualmente o generá alternativas con el asistente.",
    color: "#818cf8",
  },
  {
    to: "/asistencia",
    icon: CalendarCheck2,
    title: "Asistencia",
    description: "Registrá tus clases y controlá tu habilitación según el reglamento.",
    color: "#34d399",
  },
  {
    to: "/avisos",
    icon: Bell,
    title: "Avisos",
    description: "Consultá novedades, cambios y comunicaciones relevantes de la Delegación.",
    color: "#fbbf24",
  },
] as const;

function Index() {
  return (
    <div className="min-h-screen">
      <SiteNavbar />
      <main>
        <section className="relative overflow-hidden pb-24 pt-16 sm:pb-28 sm:pt-24">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-55" />
          <div className="pointer-events-none absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-6">
            <Reveal className="mx-auto flex max-w-4xl flex-col items-center text-center">
              <img
                src={iekLogo}
                alt="Logo de la Delegación IEK FP-UNA"
                className="h-24 w-24 rounded-full object-cover ring-2 ring-primary/30 shadow-[0_20px_70px_-20px] shadow-primary/60 sm:h-28 sm:w-28"
              />
              <span className="glass mt-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Facultad Politécnica · Universidad
                Nacional de Asunción
              </span>
              <h1 className="mt-7 font-display text-4xl font-bold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
                Delegación Estudiantil
                <span className="mt-2 block text-gradient">Ingeniería en Electrónica</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-xl">
                Información, acompañamiento y herramientas académicas para estudiantes de Ingeniería
                en Electrónica de la FP-UNA.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/radar-academico"
                  className="btn-premium inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Abrir Mi Semestre <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/delegacion"
                  className="btn-premium glass inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
                >
                  Conocer la Delegación
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative pb-24">
          <div className="mx-auto max-w-5xl px-6">
            <Reveal className="mb-8 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Acceso principal
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                Lo que necesitás durante el semestre
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                Las demás secciones siguen disponibles desde Explorar o con el buscador.
              </p>
            </Reveal>
            <Reveal variant="stagger" className="grid gap-4 sm:grid-cols-2">
              {PRIMARY_TOOLS.map(({ to, icon: Icon, title, description, color }) => (
                <Link
                  key={to}
                  to={to}
                  className="glass card-hover group flex min-h-40 items-start gap-4 rounded-2xl p-6"
                >
                  <div
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ring-foreground/10"
                    style={{ background: `${color}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                    <span
                      className="mt-4 inline-flex items-center gap-1 text-xs font-semibold"
                      style={{ color }}
                    >
                      Abrir{" "}
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
