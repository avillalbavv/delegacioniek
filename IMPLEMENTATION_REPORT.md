# IEK Connect Hub — consolidación técnica 2026-07-12

## Diagnóstico

- Base: React 19, TypeScript estricto, Vite, TanStack Router, Tailwind 4 y componentes Radix reutilizables.
- Autenticación: Supabase Auth con sesión persistente. La sincronización automática ya existía y se activa después del login y ante cambios locales.
- Persistencia: `user-state.ts` centraliza las herramientas principales, pero algunas pantallas antiguas todavía leen directamente de `localStorage`.
- Supabase: la migración inicial aislaba correctamente el estado por usuario. El rol heredado en `profiles` no era suficiente para un panel administrativo completo.
- Datos académicos: horario, secciones, exámenes, mallas, correlativas, calendario y asistencia poseen fuentes reutilizables. No se agregaron datos oficiales ficticios.
- Riesgos conservados: la oferta 2026 no contiene dificultad de materias ni todos los docentes/aulas; esos campos se muestran como pendientes cuando faltan.

## Cambios integrados

- Mi Semestre (motor interno del Radar Académico) con reglas separadas de la interfaz, prioridades accesibles, fuentes e IDs estables.
- Asistente de generación integrado dentro de Planificador IEK; usa secciones reales, produce cuatro estrategias y confirma antes de aplicar.
- Planificador de estudio con distribución, repaso, simulacro, avance y reprogramación.
- Centro de notificaciones deduplicado y buscador global `Ctrl + K`.
- PWA instalable y caché de último contenido visitado.
- Panel `/admin` protegido por sesión/rol, con avisos, usuarios/permisos y auditoría.
- Nueva migración aditiva con `user_roles`, RLS, RPC seguras, contenido administrativo, reportes, notificaciones, planes y semestres archivados.
- `.env.example` sin valores de una instalación concreta.

## Orden de despliegue

1. Respaldar la base de Supabase y el proyecto publicado.
2. Ejecutar las dos migraciones SQL en orden.
3. Crear el primer superadministrador con la instrucción de `SUPABASE_SETUP.md`.
4. Configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env.local` y en Cloudflare Pages.
5. Ejecutar pruebas y build; publicar primero en Preview.
6. Verificar login, sincronización y permisos con cuentas separadas de estudiante, editor, admin y superadmin.

## Pendientes que requieren información oficial

- Catálogo definitivo de aulas, cambios históricos y responsables de verificación.
- Fuentes/archivos de recursos administrativos y Manual de Ingresantes.
- Dificultad estimada de materias (no se infiere automáticamente).
- Reglas institucionales adicionales para restricciones de carga y casos especiales de correlatividad.
- Importación CSV/Excel, exportación PDF/calendario y comparación histórica avanzada quedan preparadas por el modelo de datos, pero no se publicaron como botones simulados.

## Seguridad

- Nunca incluir `service_role` en variables `VITE_*`.
- Los controles visuales no reemplazan RLS: `assign_user_role` y `revoke_user_role` verifican superadministrador en la base.
- Un superadministrador no puede revocarse o degradarse a sí mismo desde las RPC.
- Un rol revocado deja de validar en `current_app_role` de inmediato.
