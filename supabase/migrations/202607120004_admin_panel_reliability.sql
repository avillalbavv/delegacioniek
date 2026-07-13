-- IEK Connect Hub: reparación aditiva de permisos y cargas del panel administrativo.
-- Requiere las migraciones 001, 002 y 003. Es segura para ejecutar más de una vez.

-- Las vistas públicas necesitan privilegio SQL además de la política RLS.
grant select on public.admin_notices, public.academic_events,
  public.exam_schedules, public.academic_resources to anon, authenticated;

-- Los roles administrativos conservan los permisos de escritura; RLS decide qué
-- operaciones puede realizar cada rol.
grant insert, update, delete on public.admin_notices, public.academic_events,
  public.exam_schedules, public.academic_resources to authenticated;
grant select, insert, update on public.schedule_revisions to authenticated;

-- La columna identity de schedule_revisions utiliza esta secuencia al insertar.
grant usage, select on sequence public.schedule_revisions_revision_seq to authenticated;

-- Algunos navegadores entregan CSV como text/plain o sin MIME. El frontend
-- normaliza el tipo, y el bucket también acepta esos casos legítimos.
update storage.buckets
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = array[
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
      'text/plain',
      'application/octet-stream'
    ]
where id = 'schedule-imports';

drop policy if exists schedule_files_admin_insert on storage.objects;
drop policy if exists schedule_files_admin_read on storage.objects;
drop policy if exists schedule_files_admin_delete on storage.objects;

create policy schedule_files_admin_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'schedule-imports'
    and public.has_admin_permission('admin')
  );

create policy schedule_files_admin_read on storage.objects
  for select to authenticated
  using (bucket_id = 'schedule-imports' and public.has_admin_permission('admin'));

create policy schedule_files_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'schedule-imports' and public.has_admin_permission('admin'));

-- Las funciones de permisos no deben quedar expuestas a usuarios anónimos.
revoke execute on function public.current_app_role(uuid) from public, anon;
revoke execute on function public.has_admin_permission(public.app_role) from public, anon;
revoke execute on function public.assign_user_role(uuid, public.app_role, text) from public, anon;
revoke execute on function public.revoke_user_role(uuid, text) from public, anon;
revoke execute on function public.search_registered_users(text, integer) from public, anon;

grant execute on function public.current_app_role(uuid) to authenticated;
grant execute on function public.has_admin_permission(public.app_role) to authenticated;
grant execute on function public.assign_user_role(uuid, public.app_role, text) to authenticated;
grant execute on function public.revoke_user_role(uuid, text) to authenticated;
grant execute on function public.search_registered_users(text, integer) to authenticated;

-- Las políticas públicas no deben depender de una función administrativa.
drop policy if exists notices_public_read on public.admin_notices;
drop policy if exists notices_anon_read on public.admin_notices;
drop policy if exists notices_authenticated_read on public.admin_notices;
create policy notices_anon_read on public.admin_notices
  for select to anon using (status = 'published');
create policy notices_authenticated_read on public.admin_notices
  for select to authenticated
  using (status = 'published' or public.has_admin_permission('viewer'));

drop policy if exists events_public_read on public.academic_events;
drop policy if exists events_anon_read on public.academic_events;
drop policy if exists events_authenticated_read on public.academic_events;
create policy events_anon_read on public.academic_events
  for select to anon using (status = 'published');
create policy events_authenticated_read on public.academic_events
  for select to authenticated
  using (status = 'published' or public.has_admin_permission('viewer'));

drop policy if exists resources_public_read on public.academic_resources;
drop policy if exists resources_anon_read on public.academic_resources;
drop policy if exists resources_authenticated_read on public.academic_resources;
create policy resources_anon_read on public.academic_resources
  for select to anon using (status = 'published');
create policy resources_authenticated_read on public.academic_resources
  for select to authenticated
  using (status = 'published' or public.has_admin_permission('viewer'));
