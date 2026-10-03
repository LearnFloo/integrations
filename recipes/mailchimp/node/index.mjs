import { createHash } from 'node:crypto'
import { serveWebhooks, splitName } from '../../../shared/learnfloo.mjs'

// LEARNFLOO_WEBHOOK_SECRET, MAILCHIMP_API_KEY (ends with -us21…), MAILCHIMP_LIST_ID
const key = process.env.MAILCHIMP_API_KEY
const dc = key.split('-')[1]
const auth = `Basic ${Buffer.from(`any:${key}`).toString('base64')}`
const call = async (method, url, body) => {
  const res = await fetch(url, { method, headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`Mailchimp ${res.status}: ${await res.text()}`)
}

serveWebhooks({
  events: ['member.joined', 'membership.started'],
  async handle({ event, data, space }) {
    const u = data.user ?? {}
    if (!u.email) return
    const hash = createHash('md5').update(u.email.toLowerCase()).digest('hex')
    const base = `https://${dc}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members/${hash}`
    const { first, last } = splitName(u.name)
    await call('PUT', base, { email_address: u.email, status_if_new: 'transactional', merge_fields: { FNAME: first, LNAME: last } })
    const tags = [{ name: `learnfloo:${space.slug}`, status: 'active' }]
    if (event === 'membership.started') tags.push({ name: `learnfloo:${space.slug}:paid`, status: 'active' })
    await call('POST', `${base}/tags`, { tags })
  },
})
