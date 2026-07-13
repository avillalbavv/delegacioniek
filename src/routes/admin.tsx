import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  BookOpen,
  CalendarDays,
  FileText,
  GraduationCap,
  Loader2,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/components/AuthProvider";
import {
  assignRole,
  deleteAdminRow,
  listAdminRows,
  listAudit,
  revokeRole,
  saveAdminRow,
  searchUsers,
  type AppRole,
  type RegisteredUser,
} from "@/lib/admin-service";
import { publishScheduleRevision } from "@/lib/schedule-update-service";
export const Route = createFileRoute("/admin")({ component: AdminPage });
type Tab =
  "dashboard" | "notices" | "calendar" | "exams" | "resources" | "schedules" | "users" | "audit";
function AdminPage() {
  const auth = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const allowed = auth.user && auth.role !== "student";
  async function load(next = tab) {
    setBusy(true);
    setMessage("");
    try {
      if (next === "notices") setRows(await listAdminRows("admin_notices"));
      if (next === "calendar") setRows(await listAdminRows("academic_events"));
      if (next === "exams") setRows(await listAdminRows("exam_schedules"));
      if (next === "resources") setRows(await listAdminRows("academic_resources"));
      if (next === "schedules") setRows(await listAdminRows("schedule_revisions"));
      if (next === "users") setUsers(await searchUsers());
      if (next === "audit") setRows(await listAudit());
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudieron cargar los datos");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (allowed) void load(tab);
    // `load` depende del tab actual y solo se ejecuta al cambiar permiso/pestaña.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, allowed]);
  if (auth.loading)
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (!auth.user)
    return (
      <div className="min-h-screen">
        <SiteNavbar />
        <main className="mx-auto max-w-xl px-6 py-24 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-2xl font-bold">Acceso administrativo</h1>
          <p className="mt-2 text-muted-foreground">Iniciá sesión para verificar tus permisos.</p>
          <Link
            to="/cuenta"
            className="mt-5 inline-block rounded-xl bg-primary px-5 py-3 text-primary-foreground"
          >
            Ir a Mi cuenta
          </Link>
        </main>
      </div>
    );
  if (!allowed)
    return (
      <div className="min-h-screen">
        <SiteNavbar />
        <main className="mx-auto max-w-xl px-6 py-24 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-amber-400" />
          <h1 className="mt-4 text-2xl font-bold">Sin permisos administrativos</h1>
          <p className="mt-2 text-muted-foreground">
            La ruta está protegida. Tu cuenta conserva el rol de estudiante.
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  return (
    <div className="min-h-screen">
      <SiteNavbar />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-9 w-9 text-primary" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Rol: {auth.role}
            </p>
            <h1 className="text-3xl font-bold">Panel administrativo</h1>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {(
            [
              { id: "dashboard", label: "Resumen", Icon: Activity },
              { id: "notices", label: "Avisos", Icon: Bell },
              { id: "calendar", label: "Calendario", Icon: CalendarDays },
              { id: "exams", label: "Exámenes", Icon: GraduationCap },
              { id: "resources", label: "Recursos", Icon: BookOpen },
              { id: "schedules", label: "Horarios", Icon: Upload },
              { id: "users", label: "Usuarios y permisos", Icon: Users },
              { id: "audit", label: "Auditoría", Icon: FileText },
            ] as const
          )
            .filter(
              (x) =>
                (x.id !== "users" || auth.role === "superadmin") &&
                (x.id !== "audit" || ["admin", "superadmin"].includes(auth.role)) &&
                (!["exams", "schedules"].includes(x.id) ||
                  ["admin", "superadmin"].includes(auth.role)),
            )
            .map((x) => (
              <button
                key={x.id}
                onClick={() => setTab(x.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm ${tab === x.id ? "bg-primary text-primary-foreground" : "glass"}`}
              >
                <x.Icon className="h-4 w-4" />
                {x.label}
              </button>
            ))}
        </div>
        {message && (
          <p className="mt-4 rounded-xl bg-red-400/10 p-3 text-sm text-red-300">{message}</p>
        )}
        {busy ? (
          <Loader2 className="mx-auto mt-16 animate-spin" />
        ) : (
          <div className="mt-6">
            {tab === "dashboard" && <Dashboard />}
            {tab === "notices" && (
              <Notices rows={rows} role={auth.role} reload={() => load("notices")} />
            )}
            {tab === "calendar" && (
              <CalendarManager
                rows={rows}
                canWrite={auth.role !== "viewer"}
                canDelete={["admin", "superadmin"].includes(auth.role)}
                reload={() => load("calendar")}
              />
            )}
            {tab === "exams" && <ExamManager rows={rows} reload={() => load("exams")} />}
            {tab === "resources" && (
              <ResourceManager
                rows={rows}
                canWrite={auth.role !== "viewer"}
                canDelete={["admin", "superadmin"].includes(auth.role)}
                reload={() => load("resources")}
              />
            )}
            {tab === "schedules" && (
              <ScheduleUpdates rows={rows} reload={() => load("schedules")} />
            )}
            {tab === "users" && auth.role === "superadmin" && (
              <UsersPanel users={users} reload={() => load("users")} />
            )}{" "}
            {tab === "audit" && <Audit rows={rows} />}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
function Dashboard() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { title: "Avisos", text: "Gestioná borradores, programación y publicación.", Icon: Bell },
        {
          title: "Calendario",
          text: "La migración habilita eventos y rangos oficiales.",
          Icon: CalendarDays,
        },
        { title: "Permisos", text: "Validados en Supabase mediante RLS y RPC.", Icon: Users },
        { title: "Auditoría", text: "Las operaciones críticas quedan trazadas.", Icon: Activity },
      ].map((x) => (
        <article key={x.title} className="glass rounded-2xl p-5">
          <x.Icon className="h-5 w-5 text-primary" />
          <h2 className="mt-3 font-semibold">{x.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{x.text}</p>
        </article>
      ))}
    </div>
  );
}
function Notices({
  rows,
  role,
  reload,
}: {
  rows: Record<string, unknown>[];
  role: string;
  reload: () => void;
}) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [priority, setPriority] = useState("informativo");
  async function create(e: React.FormEvent) {
    e.preventDefault();
    await saveAdminRow("admin_notices", {
      title,
      summary,
      category: "comunicado",
      priority,
      status: "draft",
      audience: { type: "all" },
    });
    setTitle("");
    setSummary("");
    reload();
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <form onSubmit={create} className="glass h-fit rounded-2xl p-5">
        <h2 className="font-semibold">Nuevo aviso</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Título"
          className="mt-4 w-full rounded-xl border border-input bg-background p-3"
        />
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          required
          placeholder="Resumen"
          rows={5}
          className="mt-3 w-full rounded-xl border border-input bg-background p-3"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="mt-3 w-full rounded-xl border border-input bg-background p-3"
        >
          <option value="informativo">Informativo</option>
          <option value="importante">Importante</option>
          <option value="urgente">Urgente</option>
        </select>
        <button className="mt-3 w-full rounded-xl bg-primary p-3 text-primary-foreground">
          Guardar borrador
        </button>
      </form>
      <div className="space-y-3">
        {rows.map((r) => (
          <article key={String(r.id)} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold">{String(r.title)}</h3>
              <span className="rounded-full bg-foreground/10 px-2 py-1 text-xs">
                {String(r.status)}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{String(r.summary)}</p>
            {role !== "viewer" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    void saveAdminRow("admin_notices", {
                      ...r,
                      status: role === "editor" ? "review" : "published",
                      publish_at: role === "editor" ? r.publish_at : new Date().toISOString(),
                    }).then(reload)
                  }
                  className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
                >
                  {role === "editor" ? "Enviar a revisión" : "Publicar"}
                </button>
                {["admin", "superadmin"].includes(role) && (
                  <button
                    onClick={() => void deleteAdminRow("admin_notices", String(r.id)).then(reload)}
                    className="rounded-lg border border-red-400/30 px-3 py-2 text-xs text-red-400"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </article>
        ))}
        {!rows.length && (
          <p className="text-muted-foreground">No hay avisos administrativos cargados.</p>
        )}
      </div>
    </div>
  );
}

function CalendarManager({
  rows,
  canWrite,
  canDelete,
  reload,
}: {
  rows: Record<string, unknown>[];
  canWrite: boolean;
  canDelete: boolean;
  reload: () => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  async function create(event: React.FormEvent) {
    event.preventDefault();
    await saveAdminRow("academic_events", {
      title,
      category: "evento-institucional",
      starts_at: new Date(date).toISOString(),
      status: "draft",
      audience: { type: "all" },
    });
    setTitle("");
    setDate("");
    reload();
  }
  return (
    <ManagerLayout
      form={
        canWrite && (
          <form onSubmit={create} className="glass rounded-2xl p-5">
            <h2 className="font-semibold">Nuevo evento</h2>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título"
              className="mt-4 w-full rounded-xl border border-input bg-background p-3"
            />
            <input
              required
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-3 w-full rounded-xl border border-input bg-background p-3"
            />
            <button className="mt-3 w-full rounded-xl bg-primary p-3 text-primary-foreground">
              Guardar borrador
            </button>
          </form>
        )
      }
      rows={rows}
      titleKey="title"
      detailKey="starts_at"
      table="academic_events"
      reload={reload}
      canDelete={canDelete}
    />
  );
}

function ExamManager({ rows, reload }: { rows: Record<string, unknown>[]; reload: () => void }) {
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [room, setRoom] = useState("");
  async function create(event: React.FormEvent) {
    event.preventDefault();
    await saveAdminRow("exam_schedules", {
      subject_name: subject,
      exam_at: new Date(date).toISOString(),
      room: room || null,
      status: "confirmed",
    });
    setSubject("");
    setDate("");
    setRoom("");
    reload();
  }
  return (
    <ManagerLayout
      form={
        <form onSubmit={create} className="glass rounded-2xl p-5">
          <h2 className="font-semibold">Nuevo examen</h2>
          <input
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Materia"
            className="mt-4 w-full rounded-xl border border-input bg-background p-3"
          />
          <input
            required
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-3 w-full rounded-xl border border-input bg-background p-3"
          />
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Aula (opcional)"
            className="mt-3 w-full rounded-xl border border-input bg-background p-3"
          />
          <button className="mt-3 w-full rounded-xl bg-primary p-3 text-primary-foreground">
            Publicar examen
          </button>
        </form>
      }
      rows={rows}
      titleKey="subject_name"
      detailKey="exam_at"
      table="exam_schedules"
      reload={reload}
      canDelete
    />
  );
}

function ResourceManager({
  rows,
  canWrite,
  canDelete,
  reload,
}: {
  rows: Record<string, unknown>[];
  canWrite: boolean;
  canDelete: boolean;
  reload: () => void;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  async function create(event: React.FormEvent) {
    event.preventDefault();
    await saveAdminRow("academic_resources", { title, url, category: "enlace", status: "draft" });
    setTitle("");
    setUrl("");
    reload();
  }
  return (
    <ManagerLayout
      form={
        canWrite && (
          <form onSubmit={create} className="glass rounded-2xl p-5">
            <h2 className="font-semibold">Nuevo recurso</h2>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título"
              className="mt-4 w-full rounded-xl border border-input bg-background p-3"
            />
            <input
              required
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="mt-3 w-full rounded-xl border border-input bg-background p-3"
            />
            <button className="mt-3 w-full rounded-xl bg-primary p-3 text-primary-foreground">
              Guardar recurso
            </button>
          </form>
        )
      }
      rows={rows}
      titleKey="title"
      detailKey="url"
      table="academic_resources"
      reload={reload}
      canDelete={canDelete}
    />
  );
}

function ScheduleUpdates({
  rows,
  reload,
}: {
  rows: Record<string, unknown>[];
  reload: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [sending, setSending] = useState(false);
  async function publish(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;
    setSending(true);
    try {
      await publishScheduleRevision(file, summary);
      setFile(null);
      setSummary("");
      reload();
    } finally {
      setSending(false);
    }
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form onSubmit={publish} className="glass h-fit rounded-2xl p-5">
        <h2 className="font-semibold">Publicar nueva versión</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Subí el Excel o CSV y explicá qué cambió. Al sincronizar, los estudiantes recibirán un
          aviso para revisar sus fechas y secciones.
        </p>
        <input
          required
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mt-4 block w-full text-sm"
        />
        <textarea
          required
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Ej.: cambiaron fechas de parciales y aulas de varias secciones"
          rows={4}
          className="mt-3 w-full rounded-xl border border-input bg-background p-3"
        />
        <button
          disabled={sending}
          className="mt-3 w-full rounded-xl bg-primary p-3 text-primary-foreground disabled:opacity-50"
        >
          {sending ? "Publicando…" : "Publicar actualización"}
        </button>
      </form>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={String(row.id)} className="glass rounded-2xl p-5">
            <div className="flex justify-between gap-3">
              <h3 className="font-semibold">Versión {String(row.revision)}</h3>
              <span className="text-xs text-muted-foreground">
                {new Date(String(row.published_at)).toLocaleString("es-PY")}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{String(row.change_summary)}</p>
            <p className="mt-2 text-xs text-muted-foreground/70">
              Archivo: {String(row.file_name)}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function ManagerLayout({
  form,
  rows,
  titleKey,
  detailKey,
  table,
  reload,
  canDelete,
}: {
  form: React.ReactNode;
  rows: Record<string, unknown>[];
  titleKey: string;
  detailKey: string;
  table: string;
  reload: () => void;
  canDelete: boolean;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div>{form}</div>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={String(row.id)} className="glass rounded-2xl p-5">
            <h3 className="font-semibold">{String(row[titleKey])}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{String(row[detailKey] ?? "")}</p>
            {canDelete && (
              <button
                onClick={() => void deleteAdminRow(table, String(row.id)).then(reload)}
                className="mt-3 text-xs text-red-400"
              >
                Eliminar
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
function UsersPanel({ users, reload }: { users: RegisteredUser[]; reload: () => void }) {
  const [term, setTerm] = useState("");
  const filtered = users.filter((u) =>
    (u.email + " " + (u.display_name || "")).toLowerCase().includes(term.toLowerCase()),
  );
  async function change(u: RegisteredUser, role: AppRole) {
    await assignRole(u.user_id, role, "Asignado desde el panel IEK");
    reload();
  }
  return (
    <div>
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Buscar por nombre o correo"
        className="mb-4 w-full max-w-md rounded-xl border border-input bg-background p-3"
      />
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-foreground/5">
            <tr>
              <th className="p-3">Usuario</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.user_id} className="border-t border-border">
                <td className="p-3">
                  <b>{u.display_name || "Sin nombre"}</b>
                  <span className="block text-xs text-muted-foreground">{u.email}</span>
                </td>
                <td className="p-3">
                  {u.role}
                  {!u.is_active && " · revocado"}
                </td>
                <td className="p-3">
                  <select
                    defaultValue={u.role}
                    onChange={(e) => void change(u, e.target.value as AppRole)}
                    className="rounded-lg border border-input bg-background p-2"
                  >
                    <option value="student">Estudiante</option>
                    <option value="viewer">Lector</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Administrador</option>
                    <option value="superadmin">Superadministrador</option>
                  </select>
                  {u.role !== "student" && (
                    <button
                      onClick={() =>
                        void revokeRole(u.user_id, "Revocado desde el panel").then(reload)
                      }
                      className="ml-2 text-xs text-red-400"
                    >
                      Revocar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function Audit({ rows }: { rows: Record<string, unknown>[] }) {
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <article key={String(r.id)} className="glass rounded-xl p-4 text-sm">
          <b>{String(r.action)}</b>
          <span className="ml-2 text-muted-foreground">
            {String(r.entity_type)} · {new Date(String(r.created_at)).toLocaleString("es-PY")}
          </span>
        </article>
      ))}
      {!rows.length && (
        <p className="text-muted-foreground">Todavía no hay actividad administrativa registrada.</p>
      )}
    </div>
  );
}
