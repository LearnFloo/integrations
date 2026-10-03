import { serveWebhooks } from '../../../shared/learnfloo.mjs'

// LEARNFLOO_WEBHOOK_SECRET, NOTION_TOKEN, NOTION_DATABASE_ID
serveWebhooks({
  events: ['member.joined', 'event.registration.created', 'live.registration.created'],
  async handle({ event, data, createdAt }) {
    const u = data.user ?? data.registration?.user ?? {}
    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.NOTION_TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DATABASE_ID },
        properties: {
          Name: { title: [{ text: { content: u.name || u.email || 'Unknown' } }] },
          Email: { email: u.email ?? null },
          Type: { select: { name: event } },
          About: { rich_text: [{ text: { content: data.session?.title ?? data.event?.title ?? 'Member' } }] },
          Date: { date: { start: createdAt } },
        },
      }),
    })
    if (!res.ok) throw new Error(`Notion ${res.status}: ${await res.text()}`)
  },
})
