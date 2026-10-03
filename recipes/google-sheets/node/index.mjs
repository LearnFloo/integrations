import { appendFile } from 'node:fs/promises'
import { serveWebhooks } from '../../../shared/learnfloo.mjs'

// LEARNFLOO_WEBHOOK_SECRET. Variant without Google: appends a CSV line per event (open it in any spreadsheet).
serveWebhooks({
  events: ['member.joined', 'live.registration.created', 'event.registration.created', 'membership.started', 'course.completed'],
  async handle({ event, data, space, createdAt }) {
    const user = data.user ?? data.registration?.user ?? {}
    const about = data.session?.title ?? data.event?.title ?? data.course?.title ?? (data.membership ? `${data.membership.amountCents / 100} ${data.membership.currency}` : '')
    const cells = [createdAt, event, space.slug, user.name ?? '', user.email ?? '', about].map((v) => `"${String(v).replace(/"/g, '""')}"`)
    await appendFile(process.env.CSV_FILE ?? 'learnfloo.csv', cells.join(',') + '\n')
  },
})
