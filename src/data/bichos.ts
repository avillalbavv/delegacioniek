/**
 * bichos.ts — Manual de Nuevos Ingresantes.
 *
 * "Bicho" = materia o trámite particularmente complicado. Esta sección
 * todavía no tiene contenido cargado: la estructura queda lista para que,
 * más adelante, se agregue cada guía como un objeto de este array sin
 * tener que tocar el componente de la página.
 *
 * Para agregar un bicho nuevo: agregar un objeto a BICHOS con al menos
 * id, titulo, categoria y resumen. El resto de los campos son opcionales.
 */

export type BichoCategoria = "materia" | "tramite" | "software" | "hardware" | "otro";

export const CATEGORIA_LABEL: Record<BichoCategoria, string> = {
  materia: "Materia",
  tramite: "Trámite",
  software: "Software",
  hardware: "Hardware",
  otro: "Otro",
};

export const CATEGORIA_COLOR: Record<BichoCategoria, string> = {
  materia: "#3b82f6",
  tramite: "#fb923c",
  software: "#22d3ee",
  hardware: "#a78bfa",
  otro: "#94a3b8",
};

export interface Bicho {
  id: string;
  titulo: string;
  categoria: BichoCategoria;
  materiaRelacionada?: string; // debe coincidir con el nombre exacto en la base de datos de materias
  resumen: string;
  detalle?: string;
  tips?: string[];
  fuente?: string;
}

/* Todavía sin contenido — se completa más adelante. */
export const BICHOS: Bicho[] = [];
