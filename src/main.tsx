import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

const ASSET_RELOAD_KEY = "iek-asset-reload-at";

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  const lastReload = Number(sessionStorage.getItem(ASSET_RELOAD_KEY) || 0);
  if (Date.now() - lastReload < 30_000) return;
  sessionStorage.setItem(ASSET_RELOAD_KEY, String(Date.now()));
  window.location.reload();
});

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", async () => {
    const registration = await navigator.serviceWorker.register("/sw.js");
    await registration.update();
  });
}

const router = getRouter();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
