import { serveWebhooks, splitName } from '../../../shared/learnfloo.mjs'

// LEARNFLOO_WEBHOOK_SECRET, HUBSPOT_TOKEN
serveWebhooks({
  events: ['member.joined', 'membership.started', 'membership.cancelled'],
  async handle({ event, data, space }) {
    const u = data.user ?? {}
    if (!u.email) return
    const { first, last } = splitName(u.name)
    const status = event === 'membership.started' ? 'paid' : event === 'membership.cancelled' ? 'ended' : 'free'
    const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: [{ id: u.email, idProperty: 'email', properties: { email: u.email, firstname: first, lastname: last, learnfloo_space: space.slug, learnfloo_membership: status } }] }),
    })
    if (!res.ok) throw new Error(`HubSpot ${res.status}: ${await res.text()}`)
  },
})
