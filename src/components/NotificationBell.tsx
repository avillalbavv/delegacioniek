import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { loadNotifications, markNotificationRead } from "@/lib/notification-service";
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(() => loadNotifications());
  const unread = items.filter((n) => !n.readAt).length;
  function read(id: string) {
    markNotificationRead(id);
    setItems(loadNotifications());
  }
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`${unread} notificaciones sin leer`}
        className="relative rounded-md p-2 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-[120] mt-3 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-popover p-3 shadow-2xl">
          <h2 className="px-2 py-1 font-semibold">Notificaciones</h2>
          <div className="mt-2 max-h-96 space-y-2 overflow-auto">
            {items.slice(0, 10).map((n) => (
              <article
                key={n.id}
                className={`rounded-xl border p-3 text-sm ${n.readAt ? "border-border opacity-70" : "border-primary/30 bg-primary/5"}`}
              >
                <a href={n.actionUrl || "#"} className="font-medium">
                  {n.title}
                </a>
                <p className="mt-1 text-xs text-muted-foreground">{n.message}</p>
                {!n.readAt && (
                  <button
                    onClick={() => read(n.id)}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary"
                  >
                    <Check className="h-3 w-3" />
                    Marcar leída
                  </button>
                )}
              </article>
            ))}
            {!items.length && (
              <p className="p-5 text-center text-sm text-muted-foreground">
                No hay notificaciones nuevas.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
