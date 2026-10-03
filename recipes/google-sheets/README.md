# LearnFloo + Google Sheets

One row per new member, live or event registration, sale or completed course, in a Google Sheet. No middleware.

## What it does

Each LearnFloo event lands as **one row** in a Google Sheet: date, event, name, e-mail, and what it is about
(live, event, course, amount). No n8n, Make or Zapier needed: a short **Apps Script** receives the webhooks itself.

## LearnFloo events

- `member.joined`
- `live.registration.created`
- `event.registration.created`
- `membership.started`
- `course.completed`

## You need

- A Google account and an empty Google Sheet.

## Files

- [`apps-script.gs`](apps-script.gs)
- [`node/index.mjs`](node/index.mjs): minimal Node.js server, no dependency

## Set up (5 minutes)

1. In your sheet: **Extensions → Apps Script**, replace the code with [`apps-script.gs`](apps-script.gs).
2. Change `TOKEN` at the top to a long random string.
3. **Deploy → New deployment → Web app**: *Execute as* me, *Who has access* anyone. Copy the web app URL.
4. In LearnFloo, **Settings → API → Webhooks**: URL = the web app URL + `?token=<your TOKEN>`, tick the events.
5. Send a test event: a row appears.

Apps Script cannot read request headers, so it cannot check LearnFloo's signature: the secret token in the URL
protects the endpoint instead. Keep that URL private.

## Node.js

```bash
CSV_FILE=… LEARNFLOO_WEBHOOK_SECRET=… node node/index.mjs
```

The server listens on `PORT` (3000 by default); put it behind HTTPS (LearnFloo only calls `https://` addresses).

---

LearnFloo has no app in the n8n, Make or Zapier catalogs: these recipes use LearnFloo's webhooks and API. API reference: <https://api.learnfloo.com/docs> · webhook events: `GET /webhooks/events`.
