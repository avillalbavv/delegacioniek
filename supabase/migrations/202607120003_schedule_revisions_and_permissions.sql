-- Versionado de horarios y ajuste fino de permisos editoriales.
create table if not exists public.schedule_revisions (
  id uuid primary key default gen_random_uuid(),
  revision integer generated always as identity,
  file_name text not null,
  file_path text not null,
  checksum text not null,
  change_summary text not null,
  affects_all boolean not null default true,
  affected_subject_ids text[] not null default '{}',
  affected_section_ids text[] not null default '{}',
  published_by uuid not null references auth.users(id),
  published_at timestamptz not null default now(),
  is_active boolean not null default true
);
alter table public.schedule_revisions enable row level security;
grant select, insert, update on public.schedule_revisions to authenticated;
create policy schedule_revisions_read on public.schedule_revisions for select to authenticated using (is_active or public.has_admin_permission('viewer'));
create policy schedule_revisions_admin_insert on public.schedule_revisions for insert to authenticated with check (public.has_admin_permission('admin') and published_by=auth.uid());
create policy schedule_revisions_admin_update on public.schedule_revisions for update to authenticated using (public.has_admin_permission('admin')) with check (public.has_admin_permission('admin'));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('schedule-imports','schedule-imports',false,10485760,array['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel','text/csv','application/csv'])
on conflict(id) do update set file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;
create policy schedule_files_admin_insert on storage.objects for insert to authenticated with check (bucket_id='schedule-imports' and public.has_admin_permission('admin'));
create policy schedule_files_admin_read on storage.objects for select to authenticated using (bucket_id='schedule-imports' and public.has_admin_permission('admin'));

drop policy if exists notices_public_read on public.admin_notices;
drop policy if exists notices_editor_write on public.admin_notices;
create policy notices_public_read on public.admin_notices for select to anon, authenticated using (status='published' or public.has_admin_permission('viewer'));
create policy notices_editor_insert on public.admin_notices for insert to authenticated with check (public.has_admin_permission('admin') or (public.has_admin_permission('editor') and status in ('draft','review')));
create policy notices_editor_update on public.admin_notices for update to authenticated using (public.has_admin_permission('editor')) with check (public.has_admin_permission('admin') or (public.has_admin_permission('editor') and status in ('draft','review')));
create policy notices_admin_delete on public.admin_notices for delete to authenticated using (public.has_admin_permission('admin'));

drop policy if exists events_editor_write on public.academic_events;
create policy events_editor_insert on public.academic_events for insert to authenticated with check (public.has_admin_permission('admin') or (public.has_admin_permission('editor') and status in ('draft','review')));
create policy events_editor_update on public.academic_events for update to authenticated using (public.has_admin_permission('editor')) with check (public.has_admin_permission('admin') or (public.has_admin_permission('editor') and status in ('draft','review')));
create policy events_admin_delete on public.academic_events for delete to authenticated using (public.has_admin_permission('admin'));

drop policy if exists resources_editor_write on public.academic_resources;
create policy resources_editor_insert on public.academic_resources for insert to authenticated with check (public.has_admin_permission('admin') or (public.has_admin_permission('editor') and status in ('draft','review')));
create policy resources_editor_update on public.academic_resources for update to authenticated using (public.has_admin_permission('editor')) with check (public.has_admin_permission('admin') or (public.has_admin_permission('editor') and status in ('draft','review')));
create policy resources_admin_delete on public.academic_resources for delete to authenticated using (public.has_admin_permission('admin'));
create trigger audit_schedule_revisions after insert or update or delete on public.schedule_revisions for each row execute function public.audit_admin_change();
