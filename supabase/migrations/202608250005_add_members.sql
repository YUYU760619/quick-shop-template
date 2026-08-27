-- GOOD STUFF member profiles and order ownership.
create table if not exists public.member_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  phone text not null default '',
  default_delivery text not null default '宅配'
    check (default_delivery in ('宅配', '7-ELEVEN 店到店', '全家店到店')),
  default_address text not null default '',
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders add column if not exists member_id uuid references auth.users(id) on delete set null;
create index if not exists orders_member_created_idx on public.orders(member_id, created_at desc);

create or replace function public.create_member_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.member_profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_member_profile_after_signup on auth.users;
create trigger create_member_profile_after_signup
after insert on auth.users
for each row execute function public.create_member_profile();

-- Backfill profiles for accounts that already existed before this migration.
insert into public.member_profiles (id, email, full_name, role)
select id, coalesce(email, ''), coalesce(raw_user_meta_data->>'full_name', ''), 'admin'
from auth.users
on conflict (id) do nothing;

-- Point the order relationship at member_profiles so the admin API can include
-- a member's orders in the same safe query.
alter table public.orders drop constraint if exists orders_member_id_fkey;
alter table public.orders add constraint orders_member_id_fkey
foreign key (member_id) references public.member_profiles(id) on delete set null;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.member_profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.member_profiles enable row level security;

drop policy if exists "members read own profile" on public.member_profiles;
create policy "members read own profile" on public.member_profiles
for select to authenticated using (id = auth.uid() or public.is_admin());

drop policy if exists "members update own profile" on public.member_profiles;
create policy "members update own profile" on public.member_profiles
for update to authenticated using (id = auth.uid() and role = 'member')
with check (id = auth.uid() and role = 'member');

drop policy if exists "admins update profiles" on public.member_profiles;
create policy "admins update profiles" on public.member_profiles
for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- A signed-in customer can only read orders belonging to that account.
drop policy if exists "members read own orders" on public.orders;
create policy "members read own orders" on public.orders
for select to authenticated using (member_id = auth.uid());

drop policy if exists "authenticated users manage orders" on public.orders;
drop policy if exists "admins manage orders" on public.orders;
create policy "admins manage orders" on public.orders
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "members read own order items" on public.order_items;
create policy "members read own order items" on public.order_items
for select to authenticated using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.member_id = auth.uid())
);

drop policy if exists "authenticated users manage order items" on public.order_items;
drop policy if exists "admins manage order items" on public.order_items;
create policy "admins manage order items" on public.order_items
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Replace the old "any signed-in user" management rules with admin-only rules.
drop policy if exists "Authenticated users can insert product variants" on public.product_variants;
drop policy if exists "Authenticated users can update product variants" on public.product_variants;
drop policy if exists "Authenticated users can delete product variants" on public.product_variants;
drop policy if exists "admins manage product variants" on public.product_variants;
create policy "admins manage product variants" on public.product_variants
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "authenticated manage product images" on public.product_images;
drop policy if exists "admins manage product images" on public.product_images;
create policy "admins manage product images" on public.product_images
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Orders made while signed in are automatically connected to the member.
create or replace function public.attach_order_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then new.member_id := auth.uid(); end if;
  return new;
end;
$$;

drop trigger if exists attach_order_member_before_insert on public.orders;
create trigger attach_order_member_before_insert
before insert on public.orders
for each row execute function public.attach_order_member();
