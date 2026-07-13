/**
 * /recursos — Recursos académicos, Guía, enlaces y material de apoyo.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen, Download, ExternalLink, ChevronRight, GraduationCap,
  Compass, HelpCircle, FileText, Network, Map, Lightbulb,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/recursos")({ component: RecursosPage });

const ENLACES = [
  { label: "Sitio oficial IEK · FPUNA", url: "https://www.pol.una.py/carreras/iek/", desc: "Página oficial de la carrera en el sitio de la Facultad Politécnica." },
  { label: "Facultad Politécnica UNA", url: "https://www.pol.una.py/", desc: "Portal principal de la Facultad Politécnica de la UNA." },
  { label: "SGA FPUNA (Sistema de Gestión Académica)", url: "https://www.pol.una.py/", desc: "Sistema de gestión académica para inscripciones y trámites." },
];

const FAQS = [
  {
    q: "¿Cuántos semestres dura la carrera?",
    a: "La carrera tiene una duración de 10 semestres (5 años). Los primeros 4 semestres corresponden al Plan Básico, común para todos los estudiantes. Del 5.° al 10.° semestre se cursa el énfasis elegido.",
  },
  {
    q: "¿Cuándo se elige el énfasis?",
    a: "Generalmente el énfasis se elige al inicio del quinto semestre. Se recomienda informarse con anticipación sobre los requisitos y las diferencias entre cada énfasis.",
  },
  {
    q: "¿Cuáles son los énfasis disponibles?",
    a: "La carrera ofrece cuatro énfasis: Control Industrial, Electrónica Médica, Mecatrónica y Teleprocesamiento de Información.",
  },
  {
    q: "¿Qué son las correlatividades?",
    a: "Las correlatividades son los requisitos previos que debe cumplir un estudiante para poder inscribirse en una determinada materia. El Mapa Interactivo permite visualizarlas de forma gráfica.",
  },
  {
    q: "¿Qué es la extensión universitaria?",
    a: "La extensión universitaria es una actividad obligatoria para la titulación. Se deben completar 30 horas de actividades de extensión reconocidas por la facultad.",
  },
  {
    q: "¿Dónde consulto el calendario académico oficial?",
    a: "El calendario académico oficial se publica en el sitio de la Facultad Politécnica (pol.una.py). También podés usar Planificador IEK y ¿Dónde rindo? para ver fechas de examen por materia.",
  },
  {
    q: "¿Cómo contacto a la Delegación?",
    a: "Podés escribirnos por Instagram (@iek_fpuna), por correo electrónico o mediante el formulario de contacto del sitio.",
  },
  {
    q: "¿Este sitio es oficial de la FPUNA?",
    a: "No. Este sitio es una herramienta estudiantil orientativa creada por la Delegación IEK. No reemplaza los canales oficiales de la Facultad Politécnica ni constituye información académica oficial.",
  },
];

function RecursosPage() {
  return (
    <div className="min-h-screen">
      <SiteNavbar />
      <main>
        {/* Header */}
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
          <div className="mx-auto max-w-6xl px-6">
            <Reveal className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground">Recursos</span>
              </div>
              <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground mb-4">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                Material de apoyo
              </span>
              <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
                Recursos <span className="text-gradient">Académicos</span>
              </h1>
              <p className="mt-5 text-base text-muted-foreground max-w-xl leading-relaxed">
                Guía Académica, información para ingresantes, enlaces institucionales y
                preguntas frecuentes para acompañar tu trayectoria en IEK.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Guía académica */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal className="mb-8">
              <h2 className="text-2xl font-bold sm:text-3xl flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                Guía Académica
              </h2>
            </Reveal>
            <Reveal>
              <div className="glass-strong card-hover rounded-2xl p-8 max-w-2xl">
                <div className="flex items-start gap-5">
                  <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-semibold mb-1">
                      Guía Académica IEK 2024
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      Documento oficial de la malla curricular de Ingeniería en Electrónica.
                      Incluye plan de estudios, correlatividades, requisitos de titulación
                      y reglamentos de la carrera.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href="/guia-academica-iek-2024.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-premium inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                      >
                        <Download className="h-4 w-4" />
                        Descargar Guía Académica
                      </a>
                      <Link
                        to="/mapa"
                        className="btn-premium glass inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-foreground/10"
                      >
                        <Map className="h-4 w-4 text-primary" />
                        Ver mapa interactivo
                      </Link>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground/60">
                      Para descargar la guía oficial, accedé al sitio de la FPUNA.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Para ingresantes */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal className="mb-10">
              <h2 className="text-2xl font-bold sm:text-3xl flex items-center gap-3">
                <Compass className="h-6 w-6 text-primary" />
                Información para ingresantes
              </h2>
            </Reveal>
            <Reveal variant="stagger" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: GraduationCap,
                  title: "Sobre la carrera",
                  items: [
                    "Duración: 10 semestres (5 años)",
                    "Plan Básico común los primeros 4 semestres",
                    "4 énfasis de especialización",
                    "Titulación: Ingeniero/a en Electrónica",
                  ],
                },
                {
                  icon: BookOpen,
                  title: "Primer semestre",
                  items: [
                    "Álgebra",
                    "Cálculo I",
                    "Geometría Analítica y Vectores",
                    "Comunicación Oral y Escrita",
                    "Idioma I",
                    "Informática Aplicada",
                    "Desarrollo del Emprendedorismo",
                  ],
                },
                {
                  icon: Lightbulb,
                  title: "Consejos útiles",
                  items: [
                    "Revisá la guía académica antes de inscribirte",
                    "Consultá las correlatividades de cada materia",
                    "Participá en las actividades de la Delegación",
                    "Usá el Mapa Interactivo para planificar tu cursada",
                    "Consultá con estudiantes de semestres superiores",
                  ],
                },
              ].map(({ icon: Icon, title, items }) => (
                <div key={title} className="glass card-hover rounded-2xl p-6">
                  <Icon className="h-5 w-5 text-primary mb-3" />
                  <h3 className="font-display font-semibold text-lg mb-4">{title}</h3>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Links institucionales */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal className="mb-8">
              <h2 className="text-2xl font-bold sm:text-3xl flex items-center gap-3">
                <Network className="h-6 w-6 text-primary" />
                Enlaces institucionales
              </h2>
            </Reveal>
            <Reveal variant="stagger" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ENLACES.map(({ label, url, desc }) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer"
                  className="glass card-hover group rounded-2xl p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Network className="h-5 w-5 text-primary" />
                    <ExternalLink className="h-4 w-4 text-muted-foreground/40 transition group-hover:text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm leading-snug">{label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  <span className="text-xs text-muted-foreground/50 truncate">{url}</span>
                </a>
              ))}
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs text-muted-foreground mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Preguntas frecuentes
              </div>
              <h2 className="text-3xl font-bold sm:text-4xl flex items-center justify-center gap-3">
                <HelpCircle className="h-7 w-7 text-primary" />
                Preguntas frecuentes
              </h2>
            </Reveal>
            <Reveal className="max-w-3xl mx-auto">
              <div className="glass rounded-2xl overflow-hidden divide-y divide-foreground/8">
                {FAQS.map(({ q, a }, i) => (
                  <details key={i} className="group">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-sm font-medium text-foreground list-none hover:bg-foreground/4 transition-colors">
                      {q}
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-90" />
                    </summary>
                    <div className="px-6 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed">
                      {a}
                    </div>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
