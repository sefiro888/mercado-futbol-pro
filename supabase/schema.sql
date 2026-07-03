-- ============================================================================
-- Mercado Fútbol Pro — Esquema de base de datos (Supabase / PostgreSQL)
--
-- Cómo usarlo:
--   1. Abre tu proyecto en supabase.com → SQL Editor.
--   2. Pega TODO este archivo y pulsa "Run".
--   3. Luego carga los datos con el seed (ver SUPABASE_SETUP.md):
--        npm run seed
--
-- NOTA SOBRE NOMBRES: las columnas usan camelCase ENTRE COMILLAS ("squadValue",
-- "playerIds", …) a propósito, para que `select('*')` devuelva exactamente la
-- misma forma que los JSON de demo y el frontend no necesite ningún mapeo.
-- En SQL escrito a mano, recuerda citar esas columnas: select "squadValue" ...
--
-- Modelo de datos: refleja src/data/*.json. Los campos anidados (listas y
-- objetos) se guardan como JSONB.
-- ============================================================================

-- Reinicio idempotente (puedes re-ejecutar este archivo sin miedo).
drop table if exists public.transfers cascade;
drop table if exists public.rumours cascade;
drop table if exists public.news cascade;
drop table if exists public.players cascade;
drop table if exists public.clubs cascade;
drop table if exists public.sources cascade;

-- ----------------------------------------------------------------------------
-- sources (medios y su nivel de fiabilidad)
-- ----------------------------------------------------------------------------
create table public.sources (
  id                text primary key,
  name              text not null,
  domain            text,
  url               text,
  country           text,
  type              text,
  "reliabilityLevel" text
);

-- ----------------------------------------------------------------------------
-- clubs
-- ----------------------------------------------------------------------------
create table public.clubs (
  id             text primary key,
  name           text not null,
  slug           text unique not null,
  country        text,
  league         text,
  stadium        text,
  coach          text,
  "squadValue"   numeric,
  "averageAge"   numeric,
  logo           text,
  "primaryColor" text,
  "playerIds"    jsonb default '[]'::jsonb
);

-- ----------------------------------------------------------------------------
-- players
-- ----------------------------------------------------------------------------
create table public.players (
  id                   text primary key,
  name                 text not null,
  slug                 text unique not null,
  "birthDate"          date,
  age                  integer,
  nationality          text,
  position             text,
  "currentClubId"      text references public.clubs(id) on delete set null,
  height               integer,
  "dominantFoot"       text,
  "marketValue"        numeric,
  "contractUntil"      date,
  "shirtNumber"        integer,
  status               text,
  photo                text,
  stats                jsonb default '{}'::jsonb,
  "transferHistory"    jsonb default '[]'::jsonb,
  "marketValueHistory" jsonb default '[]'::jsonb
);

-- ----------------------------------------------------------------------------
-- transfers (operaciones con análisis económico)
-- ----------------------------------------------------------------------------
create table public.transfers (
  id                      text primary key,
  "playerId"              text references public.players(id) on delete cascade,
  "fromClubId"            text references public.clubs(id) on delete set null,
  "toClubId"              text references public.clubs(id) on delete set null,
  "transferFee"           numeric,
  "marketValueAtTransfer" numeric,
  "previousPurchaseFee"   numeric,
  "transferDate"          date,
  status                  text,
  sources                 jsonb default '[]'::jsonb,
  notes                   text
);

-- ----------------------------------------------------------------------------
-- rumours (rumores clasificados por fiabilidad)
-- ----------------------------------------------------------------------------
create table public.rumours (
  id                 text primary key,
  "playerId"         text references public.players(id) on delete cascade,
  "currentClubId"    text references public.clubs(id) on delete set null,
  "interestedClubId" text references public.clubs(id) on delete set null,
  "operationType"    text,
  status             text,
  reliability        text,
  sources            jsonb default '[]'::jsonb,
  summary            text,
  "lastUpdated"      date
);

-- ----------------------------------------------------------------------------
-- news (solo título + resumen propio + fuente + enlace; nunca el cuerpo)
-- ----------------------------------------------------------------------------
create table public.news (
  id                 text primary key,
  title              text not null,
  slug               text,
  summary            text,
  "sourceName"       text,
  "sourceUrl"        text,
  "publishedAt"      date,
  category           text,
  "relatedPlayerIds" jsonb default '[]'::jsonb,
  "relatedClubIds"   jsonb default '[]'::jsonb,
  reliability        text,
  image              text
);

-- Índices útiles para las consultas más frecuentes.
create index if not exists idx_players_club  on public.players ("currentClubId");
create index if not exists idx_transfers_player on public.transfers ("playerId");
create index if not exists idx_rumours_player on public.rumours ("playerId");
create index if not exists idx_news_published on public.news ("publishedAt" desc);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
--
-- Lectura PÚBLICA (la web usa la anon key). Escritura DENEGADA desde el cliente:
-- al no crear políticas de insert/update/delete, nadie puede escribir con la
-- anon key. La carga de datos (seed) y el cron usan la service_role, que ignora
-- RLS y SOLO debe usarse en el servidor / scripts locales, nunca en el frontend.
-- ============================================================================
alter table public.sources   enable row level security;
alter table public.clubs     enable row level security;
alter table public.players   enable row level security;
alter table public.transfers enable row level security;
alter table public.rumours   enable row level security;
alter table public.news      enable row level security;

create policy "public read sources"   on public.sources   for select using (true);
create policy "public read clubs"      on public.clubs     for select using (true);
create policy "public read players"    on public.players   for select using (true);
create policy "public read transfers"  on public.transfers for select using (true);
create policy "public read rumours"    on public.rumours   for select using (true);
create policy "public read news"       on public.news      for select using (true);
