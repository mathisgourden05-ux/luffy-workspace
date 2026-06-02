-- ════════════════════════════════════════════════════════════════
--  ROAD SPIRIT — Gestion d'équipe (3 rôles + sécurité)
--  À coller dans Supabase → SQL Editor → Run. Idempotent, sans danger.
--  Met en place : rôles admin / vendeur / atelier, colonne actif,
--  email sur profiles, et 3 fonctions sécurisées appelées par l'app
--  (changer un rôle, activer/désactiver) — réservées aux admins.
-- ════════════════════════════════════════════════════════════════

-- 1) Colonnes profiles -----------------------------------------------
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists actif boolean default true;
alter table public.profiles alter column role set default 'vendeur';

-- Anciennes valeurs 'staff' (ou nulles) → 'vendeur'
update public.profiles set role = 'vendeur' where role is null or role = 'staff';

-- Rôles autorisés : admin / vendeur / atelier
alter table public.profiles drop constraint if exists profiles_role_chk;
alter table public.profiles add constraint profiles_role_chk
  check (role in ('admin','vendeur','atelier'));

-- Récupère l'email depuis les comptes existants
update public.profiles p
  set email = u.email
  from auth.users u
  where u.id = p.id and (p.email is null or p.email = '');

-- 2) Trigger : nouveau compte → profil (email + rôle depuis metadata) -
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, prenom, nom, email, role, actif)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'prenom',''),
    coalesce(new.raw_user_meta_data->>'nom',''),
    new.email,
    coalesce(new.raw_user_meta_data->>'role','vendeur'),
    true
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- 3) Test « est admin ? » SANS récursion -----------------------------
--    SECURITY DEFINER → s'exécute avec des droits qui ignorent la RLS,
--    donc lire profiles ici ne re-déclenche pas les policies (pas de boucle).
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- 4) Changer le rôle d'un membre (admin uniquement) ------------------
create or replace function public.admin_set_role(target uuid, new_role text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux administrateurs'; end if;
  if new_role not in ('admin','vendeur','atelier') then raise exception 'Rôle invalide'; end if;
  update public.profiles set role = new_role where id = target;
end $$;

-- 5) Activer / désactiver un membre (admin uniquement) ---------------
create or replace function public.admin_set_active(target uuid, active boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux administrateurs'; end if;
  update public.profiles set actif = active where id = target;
end $$;

-- Autoriser l'app (utilisateurs connectés) à appeler ces fonctions
grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_set_role(uuid, text) to authenticated;
grant execute on function public.admin_set_active(uuid, boolean) to authenticated;

-- 6) S'assurer que Mathis est admin ----------------------------------
update public.profiles set role = 'admin'
  where email = 'mathisgourden05@gmail.com';

-- ✅ Terminé. La CRÉATION de comptes employés se fait via la fonction
--    serveur « create-employee » (voir GUIDE-EQUIPE.md) — impossible à
--    faire côté navigateur sans faille de sécurité.
