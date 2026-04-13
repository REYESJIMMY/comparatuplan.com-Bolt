-- ═══════════════════════════════════════════════════════════════════
-- Sprint 2 — Auth & Perfil  |  ComparaTuPlan.com
-- Ejecutar en: Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Tabla perfiles (extiende auth.users) ──────────────────────
create table if not exists public.perfiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  nombre          text,
  telefono        text,
  ciudad          text,
  estrato         smallint,
  avatar_tipo     text,          -- gamer | familia | teletrabajo | nomada
  mbps_necesarios integer,
  tipo_plan_rec   text,          -- internet | movil | tv | paquete
  acepta_habeas   boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 2. Favoritos ─────────────────────────────────────────────────
create table if not exists public.favoritos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  id_crc     text not null,
  operador   text,
  nombre     text,
  precio     numeric,
  tipo       text,
  created_at timestamptz default now(),
  unique (user_id, id_crc)
);

-- ── 3. Historial de búsquedas / análisis ─────────────────────────
create table if not exists public.historial_busquedas (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  avatar_tipo     text,
  dispositivos    jsonb,
  mbps_base       integer,
  mbps_rec        integer,
  tipo_plan_rec   text,
  planes_vistos   jsonb,          -- array de id_crc recomendados
  created_at      timestamptz default now()
);

-- ── 4. Suscripciones de alerta de precio ─────────────────────────
-- (la tabla ya puede existir del Sprint 1, alter safe)
create table if not exists public.suscripciones_precio (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete set null,
  plan_id    text,               -- id_crc
  telefono   text,
  email      text,
  activa     boolean default true,
  created_at timestamptz default now(),
  unique (user_id, plan_id)
);

-- ── 5. Trigger: auto-crear perfil al registrarse ─────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre, telefono)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 6. Trigger: updated_at automático en perfiles ────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_perfiles_updated_at on public.perfiles;
create trigger set_perfiles_updated_at
  before update on public.perfiles
  for each row execute procedure public.set_updated_at();

-- ── 7. RLS — Row Level Security ───────────────────────────────────
alter table public.perfiles              enable row level security;
alter table public.favoritos             enable row level security;
alter table public.historial_busquedas   enable row level security;
alter table public.suscripciones_precio  enable row level security;

-- Perfiles: solo el propio usuario
create policy "perfil_select" on public.perfiles for select using (auth.uid() = id);
create policy "perfil_insert" on public.perfiles for insert with check (auth.uid() = id);
create policy "perfil_update" on public.perfiles for update using (auth.uid() = id);

-- Favoritos: solo el propio usuario
create policy "fav_select" on public.favoritos for select using (auth.uid() = user_id);
create policy "fav_insert" on public.favoritos for insert with check (auth.uid() = user_id);
create policy "fav_delete" on public.favoritos for delete using (auth.uid() = user_id);

-- Historial: solo el propio usuario
create policy "hist_select" on public.historial_busquedas for select using (auth.uid() = user_id);
create policy "hist_insert" on public.historial_busquedas for insert with check (auth.uid() = user_id);
create policy "hist_delete" on public.historial_busquedas for delete using (auth.uid() = user_id);

-- Suscripciones: solo el propio usuario
create policy "sub_select" on public.suscripciones_precio for select using (auth.uid() = user_id or user_id is null);
create policy "sub_insert" on public.suscripciones_precio for insert with check (auth.uid() = user_id or user_id is null);
create policy "sub_update" on public.suscripciones_precio for update using (auth.uid() = user_id);
create policy "sub_delete" on public.suscripciones_precio for delete using (auth.uid() = user_id);

-- ── 8. Índices de performance ─────────────────────────────────────
create index if not exists idx_favoritos_user    on public.favoritos(user_id);
create index if not exists idx_historial_user    on public.historial_busquedas(user_id);
create index if not exists idx_subs_user         on public.suscripciones_precio(user_id);
create index if not exists idx_historial_fecha   on public.historial_busquedas(created_at desc);
