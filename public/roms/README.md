# Catálogo de ROMs GBA

Esta carpeta es para ROMs homebrew, de dominio público o con una licencia que permita expresamente su redistribución.

## Agregar un juego

1. Copiá el archivo con un nombre simple, por ejemplo `mi-juego.gba`, dentro de `public/roms/`.
2. Opcionalmente agregá una portada `mi-juego.webp` en la misma carpeta.
3. Editá `catalog.json` y agregá una entrada dentro de `games`:

```json
{
  "id": "mi-juego",
  "title": "Mi juego",
  "description": "Descripción breve para el catálogo.",
  "author": "Nombre del autor o estudio",
  "license": "Nombre exacto de la licencia",
  "licenseUrl": "https://sitio-del-autor.example/licencia",
  "sourceUrl": "https://sitio-oficial.example/mi-juego",
  "rom": "/roms/mi-juego.gba",
  "cover": "/roms/mi-juego.webp"
}
```

`cover` es opcional. No agregues ROMs comerciales, abandonware sin permiso explícito ni archivos cuya licencia no autorice redistribución.
