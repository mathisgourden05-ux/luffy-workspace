-- ════════════════════════════════════════════════════════════════
--  ROAD SPIRIT — Sécurité de la base (À COLLER UNE FOIS, puis Run)
--  Corrige des points CRITIQUES trouvés à l'audit :
--   • Données clients (commandes/réservations/profils) lisibles par tous → RLS
--   • Table `profiles` (rôles) jamais créée → création + trigger auto
--   • N'importe quel compte connecté pouvait SUPPRIMER le catalogue → delete admin
--  Idempotent et prudent : ne touche qu'aux tables qui existent.
-- ════════════════════════════════════════════════════════════════

-- 1) Table des profils (rôles vendeur/admin) ----------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  prenom     text default '',
  nom        text default '',
  role       text default 'staff',   -- 'staff' ou 'admin'
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- Lecture des profils réservée aux comptes connectés
drop policy if exists "profiles lecture connectes" on public.profiles;
create policy "profiles lecture connectes"
  on public.profiles for select to authenticated using (true);

-- Pas de policy INSERT/UPDATE côté client : le rôle se gère via le trigger
-- ci-dessous et le dashboard Supabase. (Empêche un vendeur de se faire admin.)

-- Création automatique d'un profil à chaque inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Crée le profil des comptes DÉJÀ existants (sinon ils n'en ont pas)
insert into public.profiles (id)
select id from auth.users on conflict (id) do nothing;

-- 2) Catalogue : lecture publique, écriture connectés, SUPPRESSION admin
drop policy if exists "produits ecriture connectes" on public.produits;
drop policy if exists "produits insert connectes" on public.produits;
drop policy if exists "produits update connectes" on public.produits;
drop policy if exists "produits delete admin" on public.produits;
create policy "produits insert connectes"
  on public.produits for insert to authenticated with check (true);
create policy "produits update connectes"
  on public.produits for update to authenticated using (true) with check (true);
create policy "produits delete admin"
  on public.produits for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 3) Données clients : RLS + accès réservé aux connectés -----------
--    (ne s'exécute que si la table existe)
do $$
declare t text;
begin
  foreach t in array array['commandes','commandes_items','reservations'] loop
    if to_regclass('public.'||t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists "%s connectes" on public.%I', t, t);
      execute format('create policy "%s connectes" on public.%I for all to authenticated using (true) with check (true)', t, t);
    end if;
  end loop;
end $$;

-- ✅ Terminé.
-- IMPORTANT : pour te donner le rôle admin (droit de supprimer), exécute ensuite,
-- en remplaçant par TON email :
--   update public.profiles set role='admin'
--   where id = (select id from auth.users where email='mathisgourden05@gmail.com');
