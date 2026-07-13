-- IEK Connect Hub: administración, contenido académico, auditoría y herramientas personales.
-- Esta migración es aditiva: no elimina ni modifica los datos de la migración inicial.

create type public.app_role as enum ('superadmin', 'admin', 'editor', 'viewer', 'student');
create type public.content_status as enum ('draft', 'review', 'scheduled', 'published', 'archived');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'student',
  assigned_by uuid references auth.users(id),
  assigned_at timestamptz not null default now(),
  revoked_at timestamptz,
  is_active boolean not null default true,
  note text,
  unique (user_id)
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  old_value jsonb,
  new_value jsonb,
  result text not null default 'success',
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.admin_notices (
  id uuid primary key default gen_random_uuid(), title text not null, summary text not null,
  content text, category text not null default 'comunicado', priority text not null default 'informativo',
  image_url text, attachments jsonb not null default '[]', links jsonb not null default '[]',
  publish_at timestamptz, expires_at timestamptz, status public.content_status not null default 'draft',
  audience jsonb not null default '{"type":"all"}', source text, responsible text,
  created_by uuid not null references auth.users(id), updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.academic_events (
  id uuid primary key default gen_random_uuid(), title text not null, description text,
  category text not null, starts_at timestamptz not null, ends_at timestamptz,
  recurrence jsonb, status public.content_status not null default 'draft', audience jsonb not null default '{"type":"all"}',
  source text, verified_at timestamptz, created_by uuid not null references auth.users(id),
  updated_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.exam_schedules (
  id uuid primary key default gen_random_uuid(), subject_id text, subject_name text not null, section text,
  exam_at timestamptz not null, room text, campus text, exam_type text, call_number integer,
  status text not null default 'confirmed', source text, observation text, verified_at timestamptz,
  previous_value jsonb, changed_at timestamptz, created_by uuid not null references auth.users(id),
  updated_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.academic_resources (
  id uuid primary key default gen_random_uuid(), title text not null, description text, category text not null,
  url text not null, subject_id text, status public.content_status not null default 'draft', source text,
  created_by uuid not null references auth.users(id), updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.data_reports (
  id uuid primary key default gen_random_uuid(), reporter_id uuid not null references auth.users(id),
  category text not null, entity_type text not null, entity_id text, description text not null,
  status text not null default 'new', response text, assigned_to uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  stable_key text not null, type text not null, title text not null, message text not null,
  priority text not null default 'low', action_url text, related_entity jsonb, read_at timestamptz,
  created_at timestamptz not null default now(), expires_at timestamptz, unique(user_id, stable_key)
);

create table public.study_plans (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text, subject_name text not null, title text not null, deadline timestamptz not null,
  target_grade numeric, priority text not null default 'medium', topics jsonb not null default '[]',
  preferences jsonb not null default '{}', status text not null default 'active',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(), plan_id uuid not null references public.study_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, topic text not null,
  starts_at timestamptz not null, duration_minutes integer not null check(duration_minutes between 15 and 480),
  status text not null default 'pending', progress integer not null default 0 check(progress between 0 and 100),
  notes text, difficulty integer check(difficulty between 1 and 5), simulation_result numeric,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.semester_archives (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  period_key text not null, snapshot jsonb not null, archived_at timestamptz not null default now(),
  unique(user_id, period_key)
);

create or replace function public.current_app_role(target_user uuid default auth.uid()) returns public.app_role
language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.user_roles where user_id = target_user and is_active and revoked_at is null), 'student'::public.app_role);
$$;

create or replace function public.has_admin_permission(minimum public.app_role) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare current_role public.app_role := public.current_app_role();
begin
  if minimum = 'viewer' then return current_role in ('viewer','editor','admin','superadmin'); end if;
  if minimum = 'editor' then return current_role in ('editor','admin','superadmin'); end if;
  if minimum = 'admin' then return current_role in ('admin','superadmin'); end if;
  return current_role = 'superadmin';
end $$;

create or replace function public.assign_user_role(target_user uuid, new_role public.app_role, internal_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if public.current_app_role() <> 'superadmin' then raise exception 'Insufficient permission'; end if;
  if target_user = auth.uid() and new_role <> 'superadmin' then raise exception 'A superadmin cannot demote itself'; end if;
  insert into public.user_roles(user_id, role, assigned_by, note) values(target_user, new_role, auth.uid(), internal_note)
  on conflict(user_id) do update set role=excluded.role, assigned_by=auth.uid(), assigned_at=now(), revoked_at=null, is_active=true, note=excluded.note;
  insert into public.audit_log(actor_id,action,entity_type,entity_id,new_value) values(auth.uid(),'role.assign','user',target_user::text,jsonb_build_object('role',new_role,'note',internal_note));
end $$;

create or replace function public.revoke_user_role(target_user uuid, internal_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if public.current_app_role() <> 'superadmin' then raise exception 'Insufficient permission'; end if;
  if target_user = auth.uid() then raise exception 'A superadmin cannot revoke itself'; end if;
  update public.user_roles set is_active=false, revoked_at=now(), note=internal_note where user_id=target_user;
  insert into public.audit_log(actor_id,action,entity_type,entity_id,new_value) values(auth.uid(),'role.revoke','user',target_user::text,jsonb_build_object('note',internal_note));
end $$;

create or replace function public.audit_admin_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare entity_id text; action_name text;
begin
  entity_id := coalesce((case when tg_op='DELETE' then old.id else new.id end)::text, '');
  action_name := lower(tg_table_name) || '.' || lower(tg_op);
  insert into public.audit_log(actor_id, action, entity_type, entity_id, old_value, new_value, result)
  values(auth.uid(), action_name, tg_table_name, entity_id,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) else null end, 'success');
  return case when tg_op='DELETE' then old else new end;
end $$;

create trigger audit_admin_notices after insert or update or delete on public.admin_notices for each row execute function public.audit_admin_change();
create trigger audit_academic_events after insert or update or delete on public.academic_events for each row execute function public.audit_admin_change();
create trigger audit_exam_schedules after insert or update or delete on public.exam_schedules for each row execute function public.audit_admin_change();
create trigger audit_academic_resources after insert or update or delete on public.academic_resources for each row execute function public.audit_admin_change();

-- Búsqueda administrativa segura: no expone auth.users al navegador ni a roles no autorizados.
create or replace function public.search_registered_users(search_term text default '', result_limit integer default 30)
returns table(user_id uuid, email text, display_name text, role public.app_role, is_active boolean, assigned_at timestamptz)
language sql stable security definer set search_path = public, auth as $$
  select u.id, u.email::text, p.display_name, public.current_app_role(u.id), coalesce(r.is_active,true), r.assigned_at
  from auth.users u left join public.profiles p on p.id=u.id left join public.user_roles r on r.user_id=u.id
  where public.current_app_role()='superadmin'
    and (coalesce(search_term,'')='' or u.email ilike '%'||search_term||'%' or coalesce(p.display_name,'') ilike '%'||search_term||'%' or u.id::text=search_term)
  order by coalesce(p.display_name,u.email) limit least(result_limit,100);
$$;

alter table public.user_roles enable row level security; alter table public.audit_log enable row level security;
alter table public.admin_notices enable row level security; alter table public.academic_events enable row level security;
alter table public.exam_schedules enable row level security; alter table public.academic_resources enable row level security;
alter table public.data_reports enable row level security; alter table public.notifications enable row level security;
alter table public.study_plans enable row level security; alter table public.study_sessions enable row level security;
alter table public.semester_archives enable row level security;

create policy roles_read_own_or_admin on public.user_roles for select to authenticated using(user_id=auth.uid() or public.has_admin_permission('admin'));
create policy audit_admin_read on public.audit_log for select to authenticated using(public.has_admin_permission('admin'));
create policy notices_public_read on public.admin_notices for select to authenticated using(status='published' or public.has_admin_permission('viewer'));
create policy notices_editor_write on public.admin_notices for all to authenticated using(public.has_admin_permission('editor')) with check(public.has_admin_permission('editor'));
create policy events_public_read on public.academic_events for select to authenticated using(status='published' or public.has_admin_permission('viewer'));
create policy events_editor_write on public.academic_events for all to authenticated using(public.has_admin_permission('editor')) with check(public.has_admin_permission('editor'));
create policy exams_public_read on public.exam_schedules for select to authenticated using(true);
create policy exams_admin_write on public.exam_schedules for all to authenticated using(public.has_admin_permission('admin')) with check(public.has_admin_permission('admin'));
create policy resources_public_read on public.academic_resources for select to authenticated using(status='published' or public.has_admin_permission('viewer'));
create policy resources_editor_write on public.academic_resources for all to authenticated using(public.has_admin_permission('editor')) with check(public.has_admin_permission('editor'));
create policy reports_own_read on public.data_reports for select to authenticated using(reporter_id=auth.uid() or public.has_admin_permission('viewer'));
create policy reports_create on public.data_reports for insert to authenticated with check(reporter_id=auth.uid());
create policy reports_admin_update on public.data_reports for update to authenticated using(public.has_admin_permission('editor')) with check(public.has_admin_permission('editor'));
create policy notifications_own on public.notifications for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy study_plans_own on public.study_plans for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy study_sessions_own on public.study_sessions for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy archives_own on public.semester_archives for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());

grant execute on function public.current_app_role(uuid) to authenticated;
grant execute on function public.assign_user_role(uuid,public.app_role,text) to authenticated;
grant execute on function public.revoke_user_role(uuid,text) to authenticated;
grant execute on function public.search_registered_users(text,integer) to authenticated;
grant select,insert,update,delete on public.user_roles, public.admin_notices, public.academic_events, public.exam_schedules, public.academic_resources, public.data_reports, public.notifications, public.study_plans, public.study_sessions, public.semester_archives to authenticated;
grant select on public.audit_log to authenticated;

-- Crear el primer superadministrador una sola vez, reemplazando el correo:
-- insert into public.user_roles(user_id,role,assigned_by)
-- select id,'superadmin',id from auth.users where lower(email)=lower('delegacion@ejemplo.com')
-- on conflict(user_id) do update set role='superadmin',is_active=true,revoked_at=null;
