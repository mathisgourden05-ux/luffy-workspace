-- ════════════════════════════════════════════════════════════════
--  ROAD SPIRIT — Réparation table profiles (récursion RLS)
--  Symptôme : un GET sur profiles renvoie HTTP 500 →
--    "infinite recursion detected in policy for relation profiles"
--  Cause  : une ancienne policy sur profiles se relit elle-même (boucle).
--  Effet  : l'app interne ne voit plus ton rôle → admin masqué, delete KO.
--  À coller dans Supabase → SQL Editor → Run. Idempotent, sans danger.
-- ════════════════════════════════════════════════════════════════

-- 1) Supprimer TOUTES les policies actuelles de profiles
--    (boucle sur leurs noms réels → attrape la fautive quel que soit son nom)
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles', pol.policyname);
  end loop;
end $$;

-- 2) Garder la RLS active
alter table public.profiles enable row level security;

-- 3) Une seule policy de lecture, SANS auto-référence
--    Lecture réservée aux comptes connectés. Le rôle (staff/admin) se gère
--    via le trigger SECURITY DEFINER + le dashboard, jamais côté client
--    (empêche un vendeur de se promouvoir admin tout seul).
create policy "profiles lecture connectes"
  on public.profiles for select to authenticated using (true);

-- ✅ Terminé. Vérif : un GET anonyme sur profiles doit renvoyer [] (plus 500).
--    Et dans l'app interne, ton rôle admin doit réapparaître.
