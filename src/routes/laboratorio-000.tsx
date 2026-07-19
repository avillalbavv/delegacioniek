import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, Gamepad2, LoaderCircle, RotateCcw, ShieldCheck, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/laboratorio-000")({ component: SecretGbaLab });

const EMULATOR_DATA_URL = "https://cdn.emulatorjs.org/stable/data/";
const MAX_ROM_BYTES = 32 * 1024 * 1024;
const MIN_ROM_BYTES = 192;

type Notice = { kind: "error" | "success" | "info"; text: string };
type RomSession = { gameId: string; title: string; url: string };

declare global {
  interface Window {
    EJS_player?: string;
    EJS_gameName?: string;
    EJS_gameUrl?: string;
    EJS_core?: string;
    EJS_pathtodata?: string;
    EJS_startOnLoaded?: boolean;
    EJS_language?: string;
    EJS_gameID?: string;
    EJS_color?: string;
    EJS_askBeforeExit?: boolean;
    EJS_disableAutoUnload?: boolean;
    EJS_ready?: () => void;
    EJS_onGameStart?: () => void;
    EJS_emulator?: unknown;
  }
}

function readAscii(bytes: Uint8Array, start: number, end: number) {
  return new TextDecoder("ascii").decode(bytes.subarray(start, end)).replace(/\0/g, "").trim();
}

function SecretGbaLab() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [session, setSession] = useState<RomSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>({
    kind: "info",
    text: "Elegí una copia legal en formato .gba. El archivo permanece únicamente en tu dispositivo.",
  });

  useEffect(() => {
    if (!session) return;

    window.EJS_player = "#gba-emulator";
    window.EJS_gameName = session.title;
    window.EJS_gameUrl = session.url;
    window.EJS_core = "gba";
    window.EJS_pathtodata = EMULATOR_DATA_URL;
    window.EJS_startOnLoaded = true;
    window.EJS_language = "es";
    window.EJS_gameID = session.gameId;
    window.EJS_color = "#ef4444";
    window.EJS_askBeforeExit = false;
    window.EJS_disableAutoUnload = false;
    window.EJS_ready = () =>
      setNotice({ kind: "info", text: "Núcleo mGBA listo. Iniciando el cartucho…" });
    window.EJS_onGameStart = () => {
      setBusy(false);
      setNotice({ kind: "success", text: "Cartucho iniciado correctamente." });
    };

    const script = document.createElement("script");
    script.src = `${EMULATOR_DATA_URL}loader.js`;
    script.async = true;
    script.dataset.gbaEasterEgg = "true";
    script.onerror = () => {
      setBusy(false);
      setNotice({
        kind: "error",
        text: "No se pudo descargar el núcleo del emulador. Revisá tu conexión e intentá de nuevo.",
      });
    };
    document.body.appendChild(script);

    return () => {
      script.remove();
      URL.revokeObjectURL(session.url);
      delete window.EJS_ready;
      delete window.EJS_onGameStart;
    };
  }, [session]);

  async function handleRom(file: File | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".gba")) {
      setNotice({ kind: "error", text: "El archivo debe tener extensión .gba." });
      return;
    }
    if (file.size < MIN_ROM_BYTES || file.size > MAX_ROM_BYTES) {
      setNotice({ kind: "error", text: "La ROM no parece válida o supera el máximo de 32 MB." });
      return;
    }

    setBusy(true);
    try {
      const header = new Uint8Array(await file.slice(0, MIN_ROM_BYTES).arrayBuffer());
      const title = readAscii(header, 0xa0, 0xac) || "Cartucho GBA";
      const code = readAscii(header, 0xac, 0xb0) || file.name;
      setSession({
        title,
        gameId: `iek-gba-${code.toLowerCase()}`,
        url: URL.createObjectURL(file),
      });
      setNotice({ kind: "info", text: "Cargando el núcleo mGBA y preparando el cartucho…" });
    } catch {
      setBusy(false);
      setNotice({ kind: "error", text: "No se pudo leer esta ROM. Probá con otra copia." });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#090b12] text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_15%,rgba(239,68,68,0.16),transparent_30%),radial-gradient(circle_at_85%_75%,rgba(59,130,246,0.12),transparent_32%),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:auto,auto,32px_32px,32px_32px]" />
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <a
            href="/"
            aria-label="Volver a la plataforma"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300 transition hover:border-red-400/35 hover:bg-red-400/10 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" /> Salir
          </a>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-red-300/75">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]" />
            Laboratorio 000
          </div>
        </header>

        <section className="mt-6 grid flex-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-300/70">
                Señal recuperada
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-5xl">
                Módulo portátil <span className="text-red-400">GBA</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
                Un rincón secreto para descansar entre parciales. Compatible con copias legales de
                juegos de Game Boy Advance, incluido Pokémon Rojo Fuego.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#111521] p-3 shadow-[0_30px_100px_-30px_rgba(239,68,68,0.35)] sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
                    {session?.title ?? "Esperando cartucho"}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-widest text-slate-500">
                    {busy ? "Inicializando" : session ? "mGBA activo" : "Sin cartucho"}
                  </p>
                </div>
                {session && (
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-white"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Cambiar cartucho
                  </button>
                )}
              </div>

              <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-white/10 bg-black sm:min-h-[440px]">
                {session ? (
                  <div id="gba-emulator" className="h-full min-h-[280px] w-full sm:min-h-[440px]" />
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={busy}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-300 transition hover:bg-white/[0.03] hover:text-white"
                  >
                    {busy ? (
                      <LoaderCircle className="h-10 w-10 animate-spin text-red-400" />
                    ) : (
                      <Upload className="h-10 w-10 text-red-400" />
                    )}
                    <span className="text-sm font-semibold">Insertar cartucho .gba</span>
                    <span className="max-w-xs px-4 text-center text-xs text-slate-500">
                      Se procesa localmente y no se sube a la plataforma
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-8">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                <Gamepad2 className="h-4 w-4 text-red-400" /> Cartucho
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".gba,application/octet-stream"
                className="sr-only"
                onChange={(event) => handleRom(event.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => (session ? window.location.reload() : fileInputRef.current?.click())}
                disabled={busy}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-3 text-sm font-bold text-red-200 transition hover:border-red-300/45 hover:bg-red-400/15 disabled:opacity-50"
              >
                {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {session ? "Cambiar cartucho" : "Cargar archivo .gba"}
              </button>
              <p
                role="status"
                className={`mt-3 rounded-lg border px-3 py-2 text-xs leading-relaxed ${
                  notice.kind === "error"
                    ? "border-red-400/20 bg-red-400/8 text-red-200"
                    : notice.kind === "success"
                      ? "border-emerald-400/20 bg-emerald-400/8 text-emerald-200"
                      : "border-white/8 bg-black/10 text-slate-400"
                }`}
              >
                {notice.text}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Privacidad local
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                La ROM se abre mediante una URL temporal del navegador. No se envía a Cloudflare,
                Supabase ni a ningún servidor del proyecto.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-xs leading-relaxed text-slate-500">
              <p className="font-bold text-slate-300">Controles y partidas</p>
              <p className="mt-2">
                El reproductor incluye teclado, mando, controles táctiles, sonido, pantalla completa
                y guardados locales desde su propia barra de herramientas.
              </p>
            </div>
          </aside>
        </section>

        <p className="mt-8 text-center text-[10px] leading-relaxed text-slate-600">
          Emulador sin juegos ni firmware propietario. Pokémon y Game Boy Advance son marcas de sus
          respectivos titulares. Usá únicamente copias obtenidas legalmente.
        </p>
      </main>
    </div>
  );
}
