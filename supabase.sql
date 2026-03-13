-- ============================================================
-- EXTENSIONES
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLA: profiles
-- Vinculada a auth.users de Supabase (1 a 1)
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text,
  student_code  text,
  phone         text,
  carnet_number text,
  role          text not null default 'student'
                  check (role in ('student', 'admin', 'super_admin')),
  is_blocked    boolean not null default false,
  email         text,
  updated_at    timestamptz,
  created_at    timestamptz not null default now()
);

-- Se crea el perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TABLA: config
-- Configuración global de la app
-- ============================================================
create table public.config (
  key   text primary key,
  value jsonb not null
);

-- Configuración inicial
insert into public.config (key, value) values ('chat_enabled', 'true'::jsonb);

-- ============================================================
-- TABLA: materials
-- Materiales de apoyo y bancos de preguntas
-- ============================================================
create table public.materials (
  id         uuid primary key default uuid_generate_v4(),
  title      text not null,
  type       text not null check (type in ('Material de apoyo', 'Bancos de preguntas')),
  url        text not null,
  year       integer not null check (year between 1 and 5),
  subject    text not null,
  teacher    text,
  partial    text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TABLA: rentals
-- Alquiler de batas
-- ============================================================
create table public.rentals (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  gown_type            text not null check (gown_type in ('quirurgica', 'clinica')),
  status               text not null default 'pending'
                         check (status in ('pending', 'approved', 'rejected', 'returned')),
  expected_return_date timestamptz not null,
  created_at           timestamptz not null default now()
);

-- ============================================================
-- TABLA: study_room_bookings
-- Reservas de sala de estudio
-- ============================================================
create table public.study_room_bookings (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  booking_date date not null,
  start_time   time not null,
  end_time     time not null,
  attendees    jsonb not null default '[]',
  status       text not null default 'confirmed'
                 check (status in ('confirmed', 'cancelled')),
  created_at   timestamptz not null default now()
);

-- ============================================================
-- TABLA: messages
-- Chat global
-- ============================================================
create table public.messages (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  reactions  jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
create index on public.materials (year, subject);
create index on public.materials (title);
create index on public.rentals (user_id, status);
create index on public.study_room_bookings (booking_date, status);
create index on public.study_room_bookings (user_id, status);
create index on public.messages (created_at);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role in ('admin','super_admin')
  );
$$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.profiles           enable row level security;
alter table public.materials          enable row level security;
alter table public.rentals            enable row level security;
alter table public.study_room_bookings enable row level security;

-- profiles: cada usuario ve y edita solo el suyo; admins ven todos
create policy "Usuarios ven su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins ven todos los perfiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Usuarios actualizan su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins actualizan cualquier perfil"
  on public.profiles for update
  using (public.is_admin());

create policy "Insertar perfil propio"
  on public.profiles for insert
  with check (auth.uid() = id);

-- config: lectura pública, escritura solo admins
alter table public.config enable row level security;

create policy "Lectura pública de config"
  on public.config for select
  using (true);

create policy "Admins actualizan config"
  on public.config for update
  using (public.is_admin());

-- materials: lectura pública, escritura solo admins
create policy "Lectura pública de materiales"
  on public.materials for select
  using (true);

create policy "Admins gestionan materiales"
  on public.materials for all
  using (public.is_admin());

-- rentals: usuario ve los suyos, admins ven todos
create policy "Usuarios ven sus rentals"
  on public.rentals for select
  using (auth.uid() = user_id);

create policy "Admins ven todos los rentals"
  on public.rentals for select
  using (public.is_admin());

create policy "Usuarios crean sus rentals"
  on public.rentals for insert
  with check (auth.uid() = user_id);

create policy "Admins actualizan rentals"
  on public.rentals for update
  using (public.is_admin());

-- study_room_bookings: usuario ve las suyas, admins ven todas
create policy "Usuarios ven sus reservas"
  on public.study_room_bookings for select
  using (auth.uid() = user_id);

create policy "Admins ven todas las reservas"
  on public.study_room_bookings for select
  using (public.is_admin());

create policy "Usuarios crean sus reservas"
  on public.study_room_bookings for insert
  with check (auth.uid() = user_id);

create policy "Admins cancelan reservas"
  on public.study_room_bookings for update
  using (public.is_admin());

-- ============================================================
-- HABILITAR REALTIME
-- ============================================================
begin;
  -- Eliminar si ya existe la publicación
  drop publication if exists supabase_realtime;
  
  -- Crear la publicación para las tablas necesarias
  create publication supabase_realtime for table 
    public.messages, 
    public.config;
commit;
