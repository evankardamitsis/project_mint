-- Roles hierarchy: user < seller < admin < super_admin (replaces buyer enum value)

alter table public.profiles
  add column if not exists seller_profile_completed boolean not null default false;

alter table public.profiles
  add column if not exists invited_by uuid references public.profiles (id) on delete set null;

alter table public.profiles
  add column if not exists invited_at timestamptz;

drop trigger if exists profiles_enforce_role_change on public.profiles;

alter table public.profiles
  alter column role drop default;

alter table public.profiles
  alter column role type text using (
    case role::text
      when 'buyer' then 'user'
      else role::text
    end
  );

alter table public.profiles
  alter column role set default 'user';

alter table public.profiles
  alter column role set not null;

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'seller', 'admin', 'super_admin'));

drop type if exists public.user_role;

create index if not exists profiles_role_idx on public.profiles (role);

create or replace function public.is_super_admin ()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'super_admin'
  );
$$;

create or replace function public.is_admin ()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
  );
$$;

revoke all on function public.is_super_admin () from public;
grant execute on function public.is_super_admin () to anon, authenticated, service_role;

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

create trigger profiles_enforce_role_change
before update of role on public.profiles
for each row
when (old.role is distinct from new.role)
execute procedure public.enforce_profile_role_change ();

create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user ();
