// Supabase Edge Function (Deno)
// Sends a "new post" email to all active subscribers via Resend.

type ResendEmailPayload = {
  from: string
  to: string[]
  subject: string
  html: string
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  })
}

function requireEnv(name: string): string {
  const v = Deno.env.get(name)
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

async function resendSend(apiKey: string, payload: ResendEmailPayload) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`Resend error: ${res.status} ${JSON.stringify(data)}`)
  }
  return data
}

// Basic HTML template (kept small to avoid spam filters in dev)
function renderEmail(params: {
  title: string
  summary: string
  url: string
  unsubscribeUrl: string
}) {
  const { title, summary, url, unsubscribeUrl } = params
  return `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system; line-height: 1.5;">
    <h2 style="margin:0 0 12px;">${title}</h2>
    <p style="margin:0 0 16px; color:#444;">${summary}</p>
    <p style="margin:0 0 24px;">
      <a href="${url}" style="display:inline-block; background:#a39289; color:white; padding:10px 14px; border-radius:10px; text-decoration:none;">
        Read the post
      </a>
    </p>
    <hr style="border:none; border-top:1px solid #eee; margin:24px 0;" />
    <p style="margin:0; font-size:12px; color:#777;">
      Youth Research Office • <a href="${unsubscribeUrl}" style="color:#777;">Unsubscribe</a>
    </p>
  </div>
  `.trim()
}

// Minimal PostgREST calls (service role required)
async function fetchJson(url: string, headers: Record<string, string>) {
  const res = await fetch(url, { headers })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return text ? JSON.parse(text) : null
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405)

    const { post_id } = (await req.json().catch(() => ({}))) as { post_id?: string }
    if (!post_id) return json({ error: "post_id is required" }, 400)

    const resendKey = requireEnv("RESEND_API_KEY")
    const appUrl = requireEnv("PUBLIC_APP_URL").replace(/\/+$/, "")

    // These are provided by Supabase automatically in Edge Functions
    const supabaseUrl = requireEnv("SUPABASE_URL")
    const serviceRole = requireEnv("SUPABASE_SERVICE_ROLE_KEY")

    const headers = {
      apikey: serviceRole,
      authorization: `Bearer ${serviceRole}`,
      "content-type": "application/json",
    }

    // Fetch post
    const post = await fetchJson(
      `${supabaseUrl}/rest/v1/posts?id=eq.${post_id}&select=id,title,summary,status`,
      headers,
    )
    const row = Array.isArray(post) ? post[0] : null
    if (!row) return json({ error: "Post not found" }, 404)
    if (row.status !== "published") {
      return json({ error: "Post is not published" }, 400)
    }

    // Fetch active subscribers (no unsubscribe)
    const subs = await fetchJson(
      `${supabaseUrl}/rest/v1/newsletter_subscribers?unsubscribed_at=is.null&select=email,user_id`,
      headers,
    )
    const emails = (Array.isArray(subs) ? subs : [])
      .map((s: any) => s.email)
      .filter(Boolean)

    if (emails.length === 0) return json({ ok: true, sent: 0 })

    // Batch to avoid large payloads
    const from = "YRO <onboarding@resend.dev>"
    const subject = `New post: ${row.title}`
    const postUrl = `${appUrl}/post/${row.id}`

    let sent = 0
    const batchSize = 50
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize)
      const payloads = batch.map((email) => {
        const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(email)}`
        const html = renderEmail({
          title: row.title,
          summary: row.summary,
          url: postUrl,
          unsubscribeUrl,
        })
        return { from, to: [email], subject, html }
      })
      // Send individually so each email has its own unsubscribe link.
      for (const p of payloads) {
        await resendSend(resendKey, p)
        sent += 1
      }
    }

    return json({ ok: true, sent })
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})

