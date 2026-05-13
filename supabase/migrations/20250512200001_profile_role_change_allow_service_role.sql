-- Demo seeds and other trusted server jobs use the Supabase service role JWT.
-- RLS is bypassed for service_role, but BEFORE UPDATE triggers still run.
-- is_admin() is false for service_role (no auth.uid() profile), so role updates failed.
-- Allow role changes when the JWT role is service_role (same trust boundary as RLS bypass).

create or replace function public.enforce_profile_role_change ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and not public.is_admin()
     and not (
       coalesce(auth.jwt() ->> 'role', '') = 'service_role'
       or coalesce(auth.role(), '') = 'service_role'
     ) then
    raise exception 'Changing profiles.role requires admin privileges';
  end if;
  return new;
end;
$$;
