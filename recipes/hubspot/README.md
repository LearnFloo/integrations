# LearnFloo + HubSpot

Every new member becomes a HubSpot contact tagged with your space; paid memberships update their status.

## What it does

Every person who joins your space becomes (or updates) a **HubSpot contact**, with two properties:
`learnfloo_space` (the space's slug) and `learnfloo_membership` (`free`, `paid` when a paid membership starts,
`ended` when it ends). Build HubSpot lists and workflows on them (welcome sequence, upsell to non-paying members…).

## LearnFloo events

- `member.joined`
- `membership.started`
- `membership.cancelled`

## You need

- A HubSpot **private app** token with the scope `crm.objects.contacts.write`
  (HubSpot → Settings → Integrations → Private apps).
- Two contact properties created in HubSpot: `learnfloo_space` and `learnfloo_membership` (single-line text).

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

1. Scenario: **Webhooks → Custom webhook** (copy its address into LearnFloo).
2. **HTTP → Make a request**: `POST https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert`,
   header `Authorization: Bearer <token>`, JSON body:
   `{"inputs":[{"id":"{{data.user.email}}","idProperty":"email","properties":{"email":"{{data.user.email}}","firstname":"{{data.user.name}}","learnfloo_space":"{{space.slug}}","learnfloo_membership":"free"}}]}`
3. Add a router on `event` if you want `paid` / `ended` for `membership.started` / `membership.cancelled`.

## Zapier

1. Trigger **Webhooks by Zapier → Catch Hook**; paste its URL in LearnFloo.
2. Action **HubSpot → Create or Update Contact**: Email = `data__user__email`, First name = `data__user__name`,
   `learnfloo_space` = `space__slug`.
3. Optional: a **Filter** step on `event` to set `learnfloo_membership`.

## Node.js

```bash
HUBSPOT_TOKEN=… LEARNFLOO_WEBHOOK_SECRET=… node node/index.mjs
```

The server listens on `PORT` (3000 by default); put it behind HTTPS (LearnFloo only calls `https://` addresses).

---

LearnFloo has no app in the n8n, Make or Zapier catalogs: these recipes use LearnFloo's webhooks and API. API reference: <https://api.learnfloo.com/docs> · webhook events: `GET /webhooks/events`.
