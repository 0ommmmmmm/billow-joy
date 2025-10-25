-- Create app_role enum for user roles
create type public.app_role as enum ('admin', 'staff');

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone default now(),
  unique (user_id, role)
);

-- Enable RLS on user_roles
alter table public.user_roles enable row level security;

-- Create security definer function to check user roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Create function to auto-assign staff role to new users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'staff');
  return new;
end;
$$;

-- Trigger to auto-assign role on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS policies for user_roles
create policy "Users can view their own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "Admins can view all roles"
  on public.user_roles for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
  on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies for menu_items (staff and admin can manage)
drop policy if exists "Allow authenticated users to view menu items" on public.menu_items;
drop policy if exists "Allow authenticated users to insert menu items" on public.menu_items;
drop policy if exists "Allow authenticated users to update menu items" on public.menu_items;
drop policy if exists "Allow authenticated users to delete menu items" on public.menu_items;

create policy "Staff can view menu items"
  on public.menu_items for select
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'staff'));

create policy "Staff can manage menu items"
  on public.menu_items for all
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'staff'));

-- Update RLS policies for orders
drop policy if exists "Allow authenticated users to view orders" on public.orders;
drop policy if exists "Allow authenticated users to insert orders" on public.orders;
drop policy if exists "Allow authenticated users to update orders" on public.orders;
drop policy if exists "Allow authenticated users to delete orders" on public.orders;

create policy "Staff can view orders"
  on public.orders for select
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'staff'));

create policy "Staff can manage orders"
  on public.orders for all
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'staff'));

-- Update RLS policies for order_items
drop policy if exists "Allow authenticated users to view order_items" on public.order_items;
drop policy if exists "Allow authenticated users to insert order_items" on public.order_items;
drop policy if exists "Allow authenticated users to update order_items" on public.order_items;
drop policy if exists "Allow authenticated users to delete order_items" on public.order_items;

create policy "Staff can view order_items"
  on public.order_items for select
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'staff'));

create policy "Staff can manage order_items"
  on public.order_items for all
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'staff'));

-- Update RLS policies for restaurant_tables
drop policy if exists "Allow authenticated users to view restaurant_tables" on public.restaurant_tables;
drop policy if exists "Allow authenticated users to insert restaurant_tables" on public.restaurant_tables;
drop policy if exists "Allow authenticated users to update restaurant_tables" on public.restaurant_tables;
drop policy if exists "Allow authenticated users to delete restaurant_tables" on public.restaurant_tables;

create policy "Staff can view restaurant_tables"
  on public.restaurant_tables for select
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'staff'));

create policy "Staff can manage restaurant_tables"
  on public.restaurant_tables for all
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'staff'));