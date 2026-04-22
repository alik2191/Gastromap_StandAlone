/**
 * Vercel Serverless Function — KG Enrich Webhook
 * POST /api/kg/enrich-webhook
 *
 * Called by Supabase Database Webhook on locations INSERT/UPDATE.
 * Checks if trigger fields changed → calls OpenRouter → updates kg_* fields in Supabase.
 *
 * Trigger fields: title, description, category, tags, what_to_try, ai_keywords, kg_cuisines
 *
 * Required env vars (Vercel):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   OPENROUTER_API_KEY
 *   KG_WEBHOOK_SECRET   (any string you choose, set same in Supabase webhook header)
 */

const TRIGGER_FIELDS = [
  'title', 'description', 'category', 'tags',
  'what_to_try', 'ai_keywords', 'kg_cuisines'
]

const MODELS = [
  'openai/gpt-oss-120b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'openai/gpt-oss-20b:free',
]

// ── helpers ────────────────────────────────────────────────────────────────

function buildContext(loc) {
  const parts = [`Name: "${loc.title}"`]
  if (loc.description)  parts.push(`Description: ${String(loc.description).slice(0, 200)}`)
  if (loc.category)     parts.push(`Category: ${loc.category}`)
  if (Array.isArray(loc.kg_cuisines)  && loc.kg_cuisines.length)  parts.push(`Cuisine: ${loc.kg_cuisines.join(', ')}`)
  if (Array.isArray(loc.tags)         && loc.tags.length)         parts.push(`Tags: ${loc.tags.join(', ')}`)
  if (Array.isArray(loc.what_to_try)  && loc.what_to_try.length)  parts.push(`What to try: ${loc.what_to_try.join(', ')}`)
  if (loc.ai_keywords) {
    const kw = Array.isArray(loc.ai_keywords)
      ? loc.ai_keywords.slice(0, 15).join(', ')
      : String(loc.ai_keywords).slice(0, 200)
    parts.push(`Keywords: ${kw}`)
  }
  return parts.join(' | ')
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function callAI(loc, openrouterKey) {
  const context = buildContext(loc)
  const prompt = `You are a food data enricher for a restaurant discovery app.

Given this venue context, return ONLY a JSON object with these fields:
- kg_dishes: array of 4-6 SPECIFIC dish or drink names this place serves or is famous for
- kg_ingredients: array of 5-8 key ingredients used in their food
- kg_allergens: array of allergens present (from: gluten, dairy, nuts, eggs, soy, shellfish, fish, sesame)
- kg_cuisines: array of 1-3 cuisine style strings

Rules:
- kg_dishes: be specific. "Tonkotsu ramen" not "ramen". "Almond croissant" not "pastry".
- If it's a bar/cafe with minimal food, list signature DRINKS prominently
- Use "what to try" hints as strong signals for dishes
- Return ONLY valid JSON, no markdown, no comments

Venue context: ${context}`

  for (const model of MODELS) {
    try {
      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://gastromap.app',
          'X-Title': 'GastroMap KG Webhook Enrich',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(28000),
      })

      if (!resp.ok) {
        console.warn(`[kg-enrich] model ${model} returned ${resp.status}`)
        await sleep(1500)
        continue
      }

      const data = await resp.json()
      let content = (data.choices?.[0]?.message?.content ?? '').trim()

      // Strip markdown fences if present
      const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (fenceMatch) content = fenceMatch[1].trim()

      const parsed = JSON.parse(content)
      console.log(`[kg-enrich] success model=${model} dishes=${parsed.kg_dishes?.length ?? 0}`)
      return parsed
    } catch (err) {
      console.warn(`[kg-enrich] model ${model} failed: ${err.message}`)
      await sleep(1500)
    }
  }
  return null
}

async function updateLocationKG(id, payload, supabaseUrl, serviceKey) {
  const resp = await fetch(`${supabaseUrl}/rest/v1/locations?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(payload),
  })
  return resp.status
}

// ── main handler ───────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // Only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify webhook secret
  const webhookSecret = process.env.KG_WEBHOOK_SECRET ?? ''
  const providedSecret =
    req.headers['x-webhook-secret'] ??
    (req.headers['authorization'] ?? '').replace(/^Bearer\s+/i, '').trim()

  if (webhookSecret && providedSecret !== webhookSecret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabaseUrl   = (process.env.SUPABASE_URL ?? '').replace(/\/$/, '')
  const serviceKey    = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  const openrouterKey = process.env.OPENROUTER_API_KEY ?? ''

  if (!supabaseUrl || !serviceKey || !openrouterKey) {
    return res.status(500).json({ error: 'Missing required env vars' })
  }

  // Supabase DB Webhook payload: { type, table, schema, record, old_record }
  const body      = req.body ?? {}
  const record    = body.record    ?? null
  const oldRecord = body.old_record ?? null
  const eventType = body.type      ?? 'UPDATE'

  if (!record?.id) {
    return res.status(200).json({ skipped: 'no record id in payload' })
  }

  const locationId    = String(record.id)
  const locationTitle = String(record.title ?? '')

  console.log(`[kg-enrich] event=${eventType} id=${locationId} title="${locationTitle}"`)

  // Decide whether to enrich
  let shouldEnrich = false

  if (eventType === 'INSERT') {
    shouldEnrich = true
  } else if (eventType === 'UPDATE' && oldRecord) {
    shouldEnrich = TRIGGER_FIELDS.some(field => {
      return JSON.stringify(record[field] ?? null) !== JSON.stringify(oldRecord[field] ?? null)
    })
  } else {
    // Manual / direct call — always run
    shouldEnrich = true
  }

  if (!shouldEnrich) {
    console.log(`[kg-enrich] skipped — no trigger fields changed for "${locationTitle}"`)
    return res.status(200).json({ skipped: true, reason: 'no relevant fields changed', location_id: locationId })
  }

  // Run AI enrichment
  const aiData = await callAI(record, openrouterKey)
  if (!aiData) {
    return res.status(500).json({ error: 'All AI models failed', location_id: locationId })
  }

  const update = {
    kg_dishes:      aiData.kg_dishes      ?? [],
    kg_ingredients: aiData.kg_ingredients ?? [],
    kg_allergens:   aiData.kg_allergens   ?? [],
    kg_enriched_at: new Date().toISOString(),
  }

  // Only overwrite cuisines if currently empty
  if (Array.isArray(aiData.kg_cuisines) && aiData.kg_cuisines.length && !record.kg_cuisines?.length) {
    update.kg_cuisines = aiData.kg_cuisines
  }

  const status = await updateLocationKG(locationId, update, supabaseUrl, serviceKey)
  console.log(`[kg-enrich] updated "${locationTitle}" supabase_status=${status}`)

  return res.status(200).json({
    ok: true,
    location_id:    locationId,
    location_title: locationTitle,
    enriched: {
      kg_dishes:      update.kg_dishes,
      kg_ingredients: update.kg_ingredients,
      kg_allergens:   update.kg_allergens,
      kg_cuisines:    update.kg_cuisines ?? 'unchanged',
    },
    supabase_status: status,
  })
}
