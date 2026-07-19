# Administración del catálogo GBA

El easter egg lee el catálogo público desde `public/roms/catalog.json`. Los archivos `.gba` y sus portadas se guardan en `public/roms/`.

## Flujo recomendado

1. Confirmá en la web oficial del proyecto o del autor que la licencia permite redistribuir la ROM.
2. Guardá el enlace de esa autorización; se mostrará como `licenseUrl`.
3. Subí la ROM y, opcionalmente, una portada a `public/roms/`.
4. Agregá la ficha correspondiente a `public/roms/catalog.json`.
5. Ejecutá `npm run check` y publicá el cambio.

La página valida que cada ficha incluya autor, licencia, fuente y rutas locales. Una entrada inválida no se muestra. Las ROMs del catálogo sí son archivos públicos y descargables; solo deben usarse obras que permitan ese tipo de distribución.

Las copias privadas o comerciales deben seguir abriéndose con el selector **Cargar mi ROM**. Esos archivos se procesan localmente y nunca se suben al proyecto.
