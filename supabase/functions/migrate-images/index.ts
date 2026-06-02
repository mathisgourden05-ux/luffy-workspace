// ════════════════════════════════════════════════════════════════
//  ROAD SPIRIT — Migration images → Supabase Storage
//  Lit tous les produits avec une image externe (roadspirit.fr),
//  télécharge chaque photo côté serveur (pas de CORS), l'uploade
//  dans le bucket "produits", puis met à jour la base.
//
//  Sécurité : réservé aux admins connectés.
//  Appel : POST sans body — renvoie { migrated, skipped, errors[] }
// ════════════════════════════════════════════════════════════════
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const ok  = (data: unknown) => new Response(JSON.stringify(data), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
const err = (msg: string)   => new Response(JSON.stringify({ error: msg }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const supabaseUrl  = Deno.env.get('SUPABASE_URL')!
  const serviceKey   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const anonKey      = Deno.env.get('SUPABASE_ANON_KEY')!

  // Vérifie que l'appelant est un admin connecté
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return err('Non authentifié')

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return err('Non authentifié')

  const { data: profile } = await userClient.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return err('Accès refusé — admin uniquement')

  // Client service_role pour lire/écrire sans restriction
  const admin = createClient(supabaseUrl, serviceKey)

  // Récupère tous les produits avec une image externe
  const { data: produits, error: dbErr } = await admin
    .from('produits')
    .select('id, slug, image_url')
    .like('image_url', 'http%')

  if (dbErr) return err('Erreur lecture produits : ' + dbErr.message)
  if (!produits?.length) return ok({ migrated: 0, skipped: 0, errors: [], message: 'Rien à migrer' })

  let migrated = 0
  let skipped  = 0
  const errors: string[] = []

  for (const prod of produits) {
    // Ignore les images déjà dans Supabase Storage
    if (prod.image_url?.includes(supabaseUrl)) { skipped++; continue }
    if (!prod.image_url) { skipped++; continue }

    try {
      // Télécharge l'image côté serveur (pas de CORS)
      const imgRes = await fetch(prod.image_url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(15000),
      })
      if (!imgRes.ok) { errors.push(`${prod.slug}: HTTP ${imgRes.status}`); continue }

      const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
      const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
      const path = `catalogue/${prod.slug}.${ext}`
      const bytes = await imgRes.arrayBuffer()

      // Upload dans le bucket "produits"
      const { error: uploadErr } = await admin.storage
        .from('produits')
        .upload(path, bytes, { contentType, upsert: true })

      if (uploadErr) { errors.push(`${prod.slug}: ${uploadErr.message}`); continue }

      // Récupère l'URL publique
      const { data: { publicUrl } } = admin.storage.from('produits').getPublicUrl(path)

      // Met à jour la base
      const { error: updErr } = await admin
        .from('produits')
        .update({ image_url: publicUrl })
        .eq('id', prod.id)

      if (updErr) { errors.push(`${prod.slug}: update DB ${updErr.message}`); continue }

      migrated++
    } catch (e) {
      errors.push(`${prod.slug}: ${(e as Error).message}`)
    }
  }

  return ok({ migrated, skipped, errors, total: produits.length })
})
