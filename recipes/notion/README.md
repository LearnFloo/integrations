# LearnFloo + Notion

A Notion database of members and registrations, kept up to date.

## What it does

A **Notion database** gets one page per new member and per registration to a live or an event, with the
person's name and e-mail, what they registered for and when. Handy for a team CRM or to prepare an event.

## LearnFloo events

- `member.joined`
- `event.registration.created`
- `live.registration.created`

## You need

- A Notion **integration** (notion.so/my-integrations) and its secret; share your database with it.
- A database with the properties `Name` (title), `Email` (email), `Type` (select), `About` (text), `Date` (date).

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
2. **Notion → Create a database item** in your database, mapping name, e-mail, `event`, title and date.

## Zapier

1. **Webhooks by Zapier → Catch Hook**.
2. **Notion → Create Database Item**, mapping the same fields.

## Node.js

```bash
LEARNFLOO_WEBHOOK_SECRET=… NOTION_DATABASE_ID=… NOTION_TOKEN=… node node/index.mjs
```

The server listens on `PORT` (3000 by default); put it behind HTTPS (LearnFloo only calls `https://` addresses).

---

LearnFloo has no app in the n8n, Make or Zapier catalogs: these recipes use LearnFloo's webhooks and API. API reference: <https://api.learnfloo.com/docs> · webhook events: `GET /webhooks/events`.
