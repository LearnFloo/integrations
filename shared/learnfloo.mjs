// Helpers shared by the Node.js recipes: verify a LearnFloo webhook, call the LearnFloo API.
// No dependency: Node 18+ (global fetch, node:crypto).
import { createHmac, timingSafeEqual } from 'node:crypto'
import { createServer } from 'node:http'

export const API_BASE = process.env.LEARNFLOO_API_BASE ?? 'https://api.learnfloo.com/api/v1'

/**
 * Checks the Standard Webhooks signature LearnFloo sends (webhook-id, webhook-timestamp, webhook-signature)
 * with the endpoint's secret ("whsec_…", shown once when the webhook is created in Settings → API → Webhooks).
 * Refuses messages older than 5 minutes.
 */
export function verifyWebhook(rawBody, headers, secret) {
  const id = headers['webhook-id']
  const timestamp = headers['webhook-timestamp']
  const signatures = headers['webhook-signature']
  if (!id || !timestamp || !signatures || !secret) return false
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false
  // "whsec_…" (Standard Webhooks form) is base64 of the secret; the plain secret works too
  const key = secret.startsWith('whsec_') ? Buffer.from(secret.slice(6), 'base64') : Buffer.from(secret, 'utf8')
  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${rawBody}`).digest('base64')
  return String(signatures)
    .split(' ')
    .some((part) => {
      const [version, sig] = part.split(',')
      if (version !== 'v1' || !sig) return false
      const a = Buffer.from(sig)
      const b = Buffer.from(expected)
      return a.length === b.length && timingSafeEqual(a, b)
    })
}

/** Calls the LearnFloo API with the space's key (LEARNFLOO_API_KEY, "lf_live_…"). */
export async function learnfloo(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${process.env.LEARNFLOO_API_KEY}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`LearnFloo ${method} ${path}: ${res.status} ${data.error ?? ''}`)
  return data
}

/**
 * A tiny HTTP server receiving LearnFloo webhooks: verifies the signature, then hands `{ event, data, space }`
 * to `handle` for the events it subscribes to. Answers 200 right away on success (LearnFloo retries otherwise).
 */
export function serveWebhooks({ events, handle, port = Number(process.env.PORT ?? 3000) }) {
  const secret = process.env.LEARNFLOO_WEBHOOK_SECRET
  createServer((req, res) => {
    if (req.method !== 'POST') return res.writeHead(405).end()
    let raw = ''
    req.on('data', (chunk) => (raw += chunk))
    req.on('end', async () => {
      if (!verifyWebhook(raw, req.headers, secret)) return res.writeHead(401).end('bad signature')
      const message = JSON.parse(raw)
      if (!events.includes(message.event)) return res.writeHead(204).end()
      try {
        await handle(message)
        res.writeHead(200).end('ok')
      } catch (err) {
        console.error(err)
        res.writeHead(500).end('error')
      }
    })
  }).listen(port, () => console.log(`Listening for ${events.join(', ')} on :${port}`))
}

/** Splits "Marie Dupont" into first and last name. */
export function splitName(name = '') {
  const [first, ...rest] = name.trim().split(/\s+/)
  return { first: first ?? '', last: rest.join(' ') }
}
