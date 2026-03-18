// Supabase Edge Function (Deno)
// Marks a subscriber as unsubscribed by email (dev-friendly).
// For production, prefer a signed token per user_id to avoid abuse.

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  })
}

function requireEnv(name: string): string {
  const v = Deno.env.get(name)
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

async function fetchJson(url: string, init: RequestInit) {
  const res = await fetch(url, init)
  const text = await res.text()
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`)
  return text ? JSON.parse(text) : null
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url)
    const email = (url.searchParams.get("email") ?? "").trim().toLowerCase()
    if (!email) return json({ error: "email is required" }, 400)

    const supabaseUrl = requireEnv("SUPABASE_URL")
    const serviceRole = requireEnv("SUPABASE_SERVICE_ROLE_KEY")
    const headers = {
      apikey: serviceRole,
      authorization: `Bearer ${serviceRole}`,
      "content-type": "application/json",
    }

    const now = new Date().toISOString()
    await fetchJson(`${supabaseUrl}/rest/v1/newsletter_subscribers?email=eq.${encodeURIComponent(email)}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ unsubscribed_at: now }),
    })

    return json({ ok: true })
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})

