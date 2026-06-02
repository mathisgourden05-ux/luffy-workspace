// ════════════════════════════════════════════════════════════════
//  ROAD SPIRIT — Fonction serveur : créer un compte employé
//  Pourquoi côté serveur ? Créer un compte exige la clé "service_role"
//  (toute-puissante) qui ne doit JAMAIS être dans le navigateur.
//  Ici elle reste secrète (variable d'environnement Supabase).
//
//  Sécurité : on vérifie d'abord que l'appelant est un ADMIN connecté
//  avant de créer quoi que ce soit.
//
//  Déploiement : voir interne/GUIDE-EQUIPE.md
// ════════════════════════════════════════════════════════════════
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// On répond toujours en 200 avec { ok } ou { error } : ainsi l'app lit
// le message d'erreur directement, sans gérer de codes HTTP côté client.
function json(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // 1) Vérifier que l'appelant est un admin connecté
    const authHeader = req.headers.get('Authorization') ?? ''
    const asUser = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: uErr } = await asUser.auth.getUser()
    if (uErr || !user) return json({ error: 'Non authentifié' })

    const { data: prof } = await asUser
      .from('profiles').select('role').eq('id', user.id).single()
    if (prof?.role !== 'admin') return json({ error: 'Réservé aux administrateurs' })

    // 2) Lire les infos du nouvel employé
    const { prenom = '', nom = '', email, role = 'vendeur', password } = await req.json()
    if (!email || !password) return json({ error: 'Email et mot de passe requis' })
    if (!['admin', 'vendeur', 'atelier'].includes(role)) return json({ error: 'Rôle invalide' })

    // 3) Créer le compte (clé service_role, jamais exposée au navigateur)
    const admin = createClient(url, serviceKey)
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // le compte est utilisable tout de suite
      user_metadata: { prenom, nom, role },
    })
    if (cErr) return json({ error: cErr.message })

    // 4) Garantir le profil (le trigger le crée déjà, on confirme les valeurs)
    await admin.from('profiles')
      .update({ prenom, nom, email, role, actif: true })
      .eq('id', created.user!.id)

    return json({ ok: true, id: created.user!.id })
  } catch (e) {
    return json({ error: (e as Error)?.message ?? String(e) })
  }
})
