-- Mantiene una versión temporal estable para que los cambios publicados generen
-- una notificación nueva sin duplicar la misma publicación en cada consulta.
drop trigger if exists admin_notices_touch_updated_at on public.admin_notices;
create trigger admin_notices_touch_updated_at
before update on public.admin_notices
for each row execute procedure public.touch_updated_at();

drop trigger if exists academic_events_touch_updated_at on public.academic_events;
create trigger academic_events_touch_updated_at
before update on public.academic_events
for each row execute procedure public.touch_updated_at();

notify pgrst, 'reload schema';
