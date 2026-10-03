# LearnFloo + Discord

Announce new members, lives going on air, replays and new courses in a Discord channel.

## What it does

If your community also lives on Discord, keep it in sync with LearnFloo: welcome messages, a ping when a live
goes on air (with the link), the replay when it is ready, and new courses.

Not included: giving Discord roles to LearnFloo members. It needs a Discord bot and a way to match accounts;
ask us if you need it.

## LearnFloo events

- `member.joined`
- `live.session.started`
- `live.replay.ready`
- `course.published`

## You need

- A Discord channel **webhook** URL (channel settings → Integrations → Webhooks).

## Files

- [`n8n.json`](n8n.json): workflow to import in n8n (Workflows → Import from file)
- [`node/index.mjs`](node/index.mjs): minimal Node.js server, no dependency

## Connect LearnFloo

1. In LearnFloo, open **Settings → API → Webhooks** and add a webhook with the URL of your workflow
   (n8n: the *Production URL* of the first node; Node.js: the address of your server).
2. Tick the events listed above, save, and copy the **signing secret** (`whsec_…`).
3. Send a test event from the same page: it should appear in your tool within seconds.

## n8n

1. Import [`n8n.json`](n8n.json).
2. Create the credential described in the *Read me* note and select it in the last node; fill the constants of the code node.
3. Activate the workflow and use its production URL in LearnFloo.

## Make

1. **Webhooks → Custom webhook**.
2. **Discord → Create a message** (or **HTTP → Make a request** to the channel webhook) with a text per `event`.

## Zapier

1. **Webhooks by Zapier → Catch Hook**.
2. **Discord → Send Channel Message**, Paths on `event` for one text each.

## Node.js

```bash
APP_URL=… DISCORD_WEBHOOK_URL=… LEARNFLOO_WEBHOOK_SECRET=… node node/index.mjs
```

The server listens on `PORT` (3000 by default); put it behind HTTPS (LearnFloo only calls `https://` addresses).

---

LearnFloo has no app in the n8n, Make or Zapier catalogs: these recipes use LearnFloo's webhooks and API. API reference: <https://api.learnfloo.com/docs> · webhook events: `GET /webhooks/events`.
