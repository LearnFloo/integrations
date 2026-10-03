# LearnFloo + Slack

A Slack message for each new member, sale, live question or support ticket.

## What it does

Your team sees what happens in the space without opening it: new members, sales, questions asked during a
live (answer them while it is on), support tickets — one message each in the Slack channel of your choice.

## LearnFloo events

- `member.joined`
- `membership.started`
- `live.question.created`
- `support.ticket.created`

## You need

- A Slack **incoming webhook** URL for the channel (Slack → Apps → Incoming Webhooks).

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
2. **Slack → Create a message** in your channel, text built from `event`, `data.user.name`, `data.question.text`…

## Zapier

1. **Webhooks by Zapier → Catch Hook**.
2. **Slack → Send Channel Message**, text from the fields of the hook (Paths on `event` for one text per event).

## Node.js

```bash
LEARNFLOO_WEBHOOK_SECRET=… SLACK_WEBHOOK_URL=… node node/index.mjs
```

The server listens on `PORT` (3000 by default); put it behind HTTPS (LearnFloo only calls `https://` addresses).

---

LearnFloo has no app in the n8n, Make or Zapier catalogs: these recipes use LearnFloo's webhooks and API. API reference: <https://api.learnfloo.com/docs> · webhook events: `GET /webhooks/events`.
