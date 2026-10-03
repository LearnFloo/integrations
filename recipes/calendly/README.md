# LearnFloo + Calendly

Everyone who books a call with you is invited to your next live, with a tracked link.

## What it does

People who book a call with you are invited to your **next live** before the call: they get a personal
e-mail with the live's guest link, tagged `utm_source=calendly`, so the live report shows how many came from
bookings (LearnFloo → the live → report → *Where registrants came from*).

The Node.js version is fully automatic: it asks the LearnFloo API for the next scheduled live, reuses (or
creates once) its guest link named "Calendly", and sends the e-mail. The n8n version uses a link you paste.

## LearnFloo events

- `live.registration.created`

LearnFloo API endpoints used: `GET /live/sessions`, `GET /live/sessions/:id/invites`, `POST /live/sessions/:id/invites`

## You need

- A Calendly plan with webhooks (Standard and up) and a **personal access token**.
- An e-mail sending API (Resend, Postmark, Brevo…) or your n8n e-mail node.
- Node.js version: a LearnFloo **API key** with full access (Settings → API).

## Files

- [`n8n.json`](n8n.json): workflow to import in n8n (Workflows → Import from file)
- [`node/index.mjs`](node/index.mjs): minimal Node.js server, no dependency

## Set up

1. Create the Calendly webhook subscription (once), pointing to your workflow or server:

   ```bash
   curl -X POST https://api.calendly.com/webhook_subscriptions \
     -H "Authorization: Bearer $CALENDLY_TOKEN" -H "Content-Type: application/json" \
     -d '{"url":"<your webhook URL>","events":["invitee.created"],"organization":"<your organization URI>","scope":"organization"}'
   ```
   (`GET https://api.calendly.com/users/me` gives your organization URI.)
2. n8n: import [`n8n.json`](n8n.json), set `LIVE_LINK` and the e-mail API in the code node.
   Node.js: set the variables below and run `node node/index.mjs`.
3. Book a test slot: the e-mail arrives, and the registration shows up in the live with the `calendly` origin.

## Make

1. **Calendly → Watch events** (Invitee created).
2. **E-mail → Send an e-mail** (or your e-mail app) to `email`, with your live's guest link
   + `?utm_source=calendly&utm_medium=booking`.

## Zapier

1. **Calendly → Invitee Created**.
2. **Email by Zapier** (or Gmail) to the invitee, with your live's guest link + `?utm_source=calendly&utm_medium=booking`.

## Node.js

```bash
MAIL_FROM=… RESEND_API_KEY=… node node/index.mjs
```

The server listens on `PORT` (3000 by default); put it behind HTTPS (LearnFloo only calls `https://` addresses).

---

LearnFloo has no app in the n8n, Make or Zapier catalogs: these recipes use LearnFloo's webhooks and API. API reference: <https://api.learnfloo.com/docs> · webhook events: `GET /webhooks/events`.
