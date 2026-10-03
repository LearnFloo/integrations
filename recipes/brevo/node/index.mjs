import { serveWebhooks, splitName } from '../../../shared/learnfloo.mjs'

// LEARNFLOO_WEBHOOK_SECRET, BREVO_API_KEY, BREVO_LIST_ID
const list = Number(process.env.BREVO_LIST_ID)
const brevo = async (path, body) => {
  const res = await fetch(`https://api.brevo.com/v3${path}`, { method: 'POST', headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!res.ok && res.status !== 400) throw new Error(`Brevo ${res.status}: ${await res.text()}`)
}

serveWebhooks({
  events: ['member.joined', 'member.left', 'member.removed'],
  async handle({ event, data }) {
    const u = data.user ?? {}
    if (!u.email) return
    if (event === 'member.joined') {
      const { first, last } = splitName(u.name)
      await brevo('/contacts', { email: u.email, attributes: { FIRSTNAME: first, LASTNAME: last }, listIds: [list], updateEnabled: true })
    } else {
      await brevo(`/contacts/lists/${list}/contacts/remove`, { emails: [u.email] })
    }
  },
})
