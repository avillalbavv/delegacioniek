import assert from "node:assert/strict";
import test from "node:test";
import { parseRomCatalog } from "./rom-catalog.ts";

test("acepta una ROM pública con licencia y fuente", () => {
  const games = parseRomCatalog({
    games: [
      {
        id: "juego-libre",
        title: "Juego libre",
        description: "Demo redistribuible",
        author: "Autora",
        license: "CC BY 4.0",
        licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
        sourceUrl: "https://example.com/juego",
        rom: "/roms/juego-libre.gba",
      },
    ],
  });

  assert.equal(games[0]?.id, "juego-libre");
});

test("rechaza rutas externas o entradas sin licencia", () => {
  assert.throws(() =>
    parseRomCatalog({
      games: [
        {
          id: "juego",
          title: "Juego",
          description: "Sin permiso documentado",
          author: "Autor",
          sourceUrl: "https://example.com/juego",
          rom: "https://example.com/juego.gba",
        },
      ],
    }),
  );
});
