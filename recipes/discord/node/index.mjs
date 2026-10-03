import { serveWebhooks } from '../../../shared/learnfloo.mjs'

// LEARNFLOO_WEBHOOK_SECRET, DISCORD_WEBHOOK_URL, APP_URL (default https://app.learnfloo.com)
const app = process.env.APP_URL ?? 'https://app.learnfloo.com'
serveWebhooks({
  events: ['member.joined', 'live.session.started', 'live.replay.ready', 'course.published'],
  async handle({ event, data, space }) {
    const content = {
      'member.joined': `👋 Welcome ${data.user?.name ?? ''}!`,
      'live.session.started': `🔴 **${data.session?.title}** is live now: ${app}/${space.slug}/live/${data.session?.id}`,
      'live.replay.ready': `🎬 The replay of **${data.session?.title}** is online: ${app}/${space.slug}/live/${data.session?.id}`,
      'course.published': `📚 New course: **${data.course?.title}** ${app}${data.course?.url ?? ''}`,
    }[event]
    const res = await fetch(process.env.DISCORD_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) })
    if (!res.ok) throw new Error(`Discord ${res.status}`)
  },
})
