# LearnFloo + Mailchimp

New members land in your Mailchimp audience with a tag for your space (and one for paying members).

## What it does

Members are added to your **Mailchimp audience** with the tag `learnfloo:<space>`, and paying members get
`learnfloo:<space>:paid` too. They enter as *transactional* contacts: they are in your audience, but they are not
subscribed to marketing e-mails until they opt in through a Mailchimp form (GDPR-friendly default; change
`status_if_new` to `subscribed` only if your LearnFloo sign-up collects that consent).

## LearnFloo events

- `member.joined`
- `membership.started`

## You need

- A Mailchimp **API key** (Profile → Extras → API keys); its suffix (`us21`…) is your data center.
- Your **audience id** (Audience → Settings → Audience name and defaults).

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
2. **Mailchimp → Add/Update a list member** (status *transactional*), then **Mailchimp → Add/Remove member tags**
   with `learnfloo:{{space.slug}}`.

## Zapier

1. **Webhooks by Zapier → Catch Hook**.
2. **Mailchimp → Add/Update Subscriber** (double opt-in on), then **Mailchimp → Add Subscriber to Tag**
   with `learnfloo:` + `space__slug`.

## Node.js

```bash
LEARNFLOO_WEBHOOK_SECRET=… MAILCHIMP_API_KEY=… MAILCHIMP_LIST_ID=… node node/index.mjs
```

The server listens on `PORT` (3000 by default); put it behind HTTPS (LearnFloo only calls `https://` addresses).

---

LearnFloo has no app in the n8n, Make or Zapier catalogs: these recipes use LearnFloo's webhooks and API. API reference: <https://api.learnfloo.com/docs> · webhook events: `GET /webhooks/events`.
