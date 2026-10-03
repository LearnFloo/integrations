# LearnFloo + Brevo

New members are added to a Brevo list, and removed from it when they leave the space.

## What it does

Members of your space are kept in a **Brevo list**: added (or updated) when they join, removed when they
leave or are removed. Send them Brevo campaigns and automations without exporting anything.

## LearnFloo events

- `member.joined`
- `member.left`
- `member.removed`

## You need

- A Brevo **API key** (Brevo → SMTP & API → API keys).
- The id of the Brevo list to fill (Contacts → Lists).

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

1. **Webhooks → Custom webhook**, address pasted in LearnFloo.
2. Router on `event`: `member.joined` → **Brevo → Create/Update a contact** (email, FIRSTNAME, list);
   `member.left` / `member.removed` → **Brevo → Remove a contact from a list**.

## Zapier

1. **Webhooks by Zapier → Catch Hook**.
2. **Paths** on `event`: joined → **Brevo → Add or Update Contact** (list = yours);
   left / removed → **Brevo → Remove Contact from List**.

## Node.js

```bash
BREVO_API_KEY=… BREVO_LIST_ID=… LEARNFLOO_WEBHOOK_SECRET=… node node/index.mjs
```

The server listens on `PORT` (3000 by default); put it behind HTTPS (LearnFloo only calls `https://` addresses).

---

LearnFloo has no app in the n8n, Make or Zapier catalogs: these recipes use LearnFloo's webhooks and API. API reference: <https://api.learnfloo.com/docs> · webhook events: `GET /webhooks/events`.
