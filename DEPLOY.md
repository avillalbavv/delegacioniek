# Guía de Despliegue — IEK Connect Hub (Cloudflare Pages)

Este proyecto es una **SPA (Single Page Application)** configurada para **Cloudflare Pages**.

## Opción A: Despliegue manual (drag & drop)

### 1. Instalar dependencias
```bash
bun install
```

### 2. Compilar el proyecto
```bash
bun run build
```
Esto genera la carpeta `dist/` con todos los archivos estáticos.

### 3. Subir a Cloudflare Pages
- Ve a https://pages.cloudflare.com
- Crea un nuevo proyecto → **"Upload assets"** (subida directa)
- Arrastrá la carpeta `dist/` completa

---

## Opción B: CI/CD automático con GitHub Actions (recomendado)

### 1. Obtener credenciales de Cloudflare
- Ve a https://dash.cloudflare.com/profile/api-tokens
- Crea un token con permiso **Cloudflare Pages: Edit**
- Copia tu **Account ID** desde el panel principal de Cloudflare

### 2. Crear el proyecto en Cloudflare Pages
- Ve a Workers & Pages → Create → Pages → Connect to Git
  **O** crea un proyecto vacío con el nombre `iek-connect-hub`

### 3. Agregar secretos en GitHub
Ve a tu repo → Settings → Secrets and variables → Actions → New repository secret:

| Nombre                   | Valor                          |
|--------------------------|--------------------------------|
| `CLOUDFLARE_API_TOKEN`   | El token de API que creaste    |
| `CLOUDFLARE_ACCOUNT_ID`  | Tu Account ID de Cloudflare    |

### 4. Hacer push a `main`
Cada push a la rama `main` desplegará automáticamente.

---

## Configuración de build en Cloudflare Pages (si conectás el repo directo)

| Campo             | Valor         |
|-------------------|---------------|
| Build command     | `bun run build` |
| Build output dir  | `dist`        |
| Node version      | 20            |

---

## Por qué ya no hay error 404

El error ocurría porque el proyecto original usaba **TanStack Start con SSR** pensado para Cloudflare **Workers**, no para Pages. Se realizaron estos cambios:

1. `vite.config.ts` — reemplazado: ya no usa `@lovable.dev/vite-tanstack-config` (que forzaba SSR), ahora usa Vite puro con React
2. `src/main.tsx` — creado: entry point del SPA que monta React en `#root`
3. `index.html` — creado: HTML base con todos los meta tags
4. `src/routes/__root.tsx` — simplificado: eliminados `HeadContent`, `Scripts` y `shellComponent` (APIs de SSR)
5. `public/_redirects` — creado: redirige todas las rutas a `index.html` (necesario para el routing del SPA)
6. `wrangler.jsonc`, `src/server.ts`, `src/start.ts` — eliminados: eran exclusivos del Worker SSR
7. `package.json` — actualizado: eliminadas dependencias SSR (`@cloudflare/vite-plugin`, `@tanstack/react-start`, `@lovable.dev/vite-tanstack-config`)
8. `.github/workflows/deploy.yml` — actualizado: usa `cloudflare/pages-action` en vez de `wrangler-action`
