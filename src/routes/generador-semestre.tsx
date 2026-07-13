import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/generador-semestre")({
  beforeLoad: () => {
    throw redirect({ to: "/poliplanner" });
  },
});
