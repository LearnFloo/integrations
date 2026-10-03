import { serveWebhooks } from '../../../shared/learnfloo.mjs'

// LEARNFLOO_WEBHOOK_SECRET, SLACK_WEBHOOK_URL
serveWebhooks({
  events: ['member.joined', 'membership.started', 'live.question.created', 'support.ticket.created'],
  async handle({ event, data, space }) {
    const who = data.user?.name ?? 'Someone'
    const text = {
      'member.joined': `:wave: ${who} joined *${space.slug}*`,
      'membership.started': `:moneybag: ${who} paid ${(data.membership?.amountCents ?? 0) / 100} ${(data.membership?.currency ?? '').toUpperCase()} to join *${space.slug}*`,
      'live.question.created': `:raising_hand: Question in “${data.session?.title}”: ${data.question?.text}`,
      'support.ticket.created': `:ticket: Ticket #${data.ticket?.number}: ${data.ticket?.subject}`,
    }[event]
    const res = await fetch(process.env.SLACK_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
    if (!res.ok) throw new Error(`Slack ${res.status}`)
  },
})
