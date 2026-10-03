import { createServer } from 'node:http'
import { learnfloo } from '../../../shared/learnfloo.mjs'

// LEARNFLOO_API_KEY (full), RESEND_API_KEY, MAIL_FROM. Calendly signs its webhooks with
// Calendly-Webhook-Signature (signing key set when creating the subscription): check it in production.
async function nextLiveLink() {
  const { sessions } = await learnfloo('GET', '/live/sessions?status=scheduled')
  const next = sessions.sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt))[0]
  if (!next) return null
  // One reusable link per live (20 active links at most per live): the one named "Calendly"
  const { invites } = await learnfloo('GET', `/live/sessions/${next.id}/invites`)
  const existing = invites.find((i) => i.label === 'Calendly' && i.active)
  const invite = existing ?? (await learnfloo('POST', `/live/sessions/${next.id}/invites`, { role: 'viewer', label: 'Calendly' })).invite
  return { title: next.title, url: `${invite.url}?utm_source=calendly&utm_medium=booking` }
}

createServer((req, res) => {
  let raw = ''
  req.on('data', (c) => (raw += c))
  req.on('end', async () => {
    try {
      const msg = JSON.parse(raw)
      const p = msg.payload ?? {}
      if (msg.event === 'invitee.created' && p.email) {
        const live = await nextLiveLink()
        if (live) {
          const r = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: process.env.MAIL_FROM, to: p.email, subject: `Join my next live: ${live.title}`, text: `Hi ${p.first_name ?? p.name ?? ''},\n\nThanks for booking a call. Before we talk, join my next live: ${live.url}\n` }),
          })
          if (!r.ok) throw new Error(`Resend ${r.status}`)
        }
      }
      res.writeHead(200).end('ok')
    } catch (err) {
      console.error(err)
      res.writeHead(500).end('error')
    }
  })
}).listen(Number(process.env.PORT ?? 3000))
