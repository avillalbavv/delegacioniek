const RECOVERY_CACHE_PREFIX = "iek-";

/**
 * Elimina solamente archivos temporales de la PWA. Los horarios, notas,
 * asistencia, sesión y demás datos académicos permanecen en localStorage.
 */
export async function refreshApplicationFiles(): Promise<void> {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
    if ("caches" in window) {
      const keys = await window.caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(RECOVERY_CACHE_PREFIX))
          .map((key) => window.caches.delete(key)),
      );
    }
  } finally {
    window.location.reload();
  }
}
