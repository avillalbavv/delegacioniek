import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/privacidad")({ component: PrivacyPage });

function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <SiteNavbar />
      <main className="relative mx-auto max-w-4xl px-6 py-14 sm:py-20">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-35" />
        <Reveal className="relative">
          <nav className="mb-6 flex gap-2 text-sm text-muted-foreground">
            <Link to="/">Inicio</Link>
            <span>›</span>
            <span className="text-foreground">Privacidad</span>
          </nav>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
            Política de <span className="text-gradient">Privacidad</span>
          </h1>
          <p className="mt-5 text-muted-foreground">Última actualización: 12 de julio de 2026.</p>
        </Reveal>
        <div className="relative mt-10 space-y-8 text-sm leading-7 text-muted-foreground sm:text-base">
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Qué información utiliza la plataforma
            </h2>
            <p className="mt-2">
              La plataforma puede procesar datos de cuenta, preferencias académicas, materias,
              horarios, notas, asistencia y planes de estudio que el propio estudiante registra. No
              se deben cargar datos sensibles de terceros.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Almacenamiento y sincronización
            </h2>
            <p className="mt-2">
              Los datos académicos pueden conservarse localmente en el dispositivo y, cuando el
              usuario inicia sesión y habilita la configuración correspondiente, sincronizarse con
              Supabase. El acceso está protegido mediante autenticación y políticas de seguridad por
              usuario.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">Finalidad</h2>
            <p className="mt-2">
              La información se utiliza únicamente para ofrecer las herramientas académicas,
              conservar preferencias, sincronizar dispositivos y mostrar alertas personalizadas. No
              se comercializan los datos personales.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Control del estudiante
            </h2>
            <p className="mt-2">
              Desde Mi cuenta se pueden exportar o eliminar los datos académicos sincronizados y
              solicitar la eliminación de la cuenta. Algunos respaldos técnicos pueden conservarse
              temporalmente para resolver conflictos de sincronización.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">Contacto</h2>
            <p className="mt-2">
              Para consultas relacionadas con privacidad, escribí a{" "}
              <a className="text-primary hover:underline" href="mailto:delegacioniek@gmail.com">
                delegacioniek@gmail.com
              </a>
              .
            </p>
          </section>
          <p className="rounded-xl border border-border bg-foreground/5 p-4 text-xs">
            Este texto describe el funcionamiento actual de la plataforma y debe revisarse antes de
            una publicación institucional definitiva.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
