-- Supabase SQL editor / migrations run as postgres, not service_role JWT.
-- Allow trusted backend roles to change profiles.role (bootstrap super_admin, seeds).

create or replace function public.enforce_profile_role_change ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if coalesce(auth.jwt() ->> 'role', '') = 'service_role'
       or coalesce(auth.role(), '') = 'service_role' then
      return new;
    end if;

    -- Dashboard SQL editor, CLI, and migration runner (not end-user JWT sessions)
    if session_user in ('postgres', 'supabase_admin', 'supabase_storage_admin') then
      return new;
    end if;

    if auth.uid() = new.id
       and old.role = 'user'
       and new.role = 'seller' then
      return new;
    end if;

    if public.is_super_admin() then
      return new;
    end if;

    raise exception 'Changing profiles.role requires super_admin privileges';
  end if;

  return new;
end;
$$;
