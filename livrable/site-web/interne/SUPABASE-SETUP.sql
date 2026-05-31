-- ════════════════════════════════════════════════════════════════
--  ROAD SPIRIT — Mise en place Supabase (à coller UNE fois)
--  Dashboard Supabase → SQL Editor → coller TOUT → bouton "Run".
--  Crée la table des produits, le stockage des photos et les droits.
--  Réexécutable sans risque (idempotent).
-- ════════════════════════════════════════════════════════════════

-- 1) Extension pour générer les identifiants
create extension if not exists pgcrypto;

-- 2) Table des produits ------------------------------------------------
create table if not exists public.produits (
  id            uuid primary key default gen_random_uuid(),
  nom           text not null,
  type          text default 'equipement',   -- 'moto' ou 'equipement'
  categorie     text,
  description   text,
  prix          numeric,                      -- prix de vente affiché (TTC)
  prix_original numeric,                       -- prix barré éventuel
  remise        int  default 0,               -- % de remise (négatif)
  stock         int  default 0,
  disponible    boolean default true,
  ref_g8        text,
  image_url     text,
  slug          text,
  url           text,
  stripe_link   text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 2bis) Si la table existait déjà, on ajoute les colonnes manquantes
alter table public.produits add column if not exists type          text default 'equipement';
alter table public.produits add column if not exists categorie     text;
alter table public.produits add column if not exists description   text;
alter table public.produits add column if not exists prix          numeric;
alter table public.produits add column if not exists prix_original numeric;
alter table public.produits add column if not exists remise        int default 0;
alter table public.produits add column if not exists stock         int default 0;
alter table public.produits add column if not exists disponible    boolean default true;
alter table public.produits add column if not exists ref_g8        text;
alter table public.produits add column if not exists image_url     text;
alter table public.produits add column if not exists slug          text;
alter table public.produits add column if not exists url           text;
alter table public.produits add column if not exists stripe_link   text;

-- 3) Sécurité : lecture publique, écriture réservée aux comptes connectés
alter table public.produits enable row level security;

drop policy if exists "produits lecture publique" on public.produits;
create policy "produits lecture publique"
  on public.produits for select using (true);

drop policy if exists "produits ecriture connectes" on public.produits;
create policy "produits ecriture connectes"
  on public.produits for all to authenticated
  using (true) with check (true);

-- 4) Stockage des photos (bucket public "produits") -------------------
insert into storage.buckets (id, name, public)
values ('produits', 'produits', true)
on conflict (id) do update set public = true;

drop policy if exists "photos lecture publique" on storage.objects;
create policy "photos lecture publique"
  on storage.objects for select
  using (bucket_id = 'produits');

drop policy if exists "photos envoi connectes" on storage.objects;
create policy "photos envoi connectes"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'produits');

drop policy if exists "photos modif connectes" on storage.objects;
create policy "photos modif connectes"
  on storage.objects for update to authenticated
  using (bucket_id = 'produits');

drop policy if exists "photos suppr connectes" on storage.objects;
create policy "photos suppr connectes"
  on storage.objects for delete to authenticated
  using (bucket_id = 'produits');

-- ✅ Terminé. Lance ensuite SUPABASE-IMPORT-PRODUITS.sql pour charger
--    les 150 produits existants.
