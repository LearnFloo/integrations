# LearnFloo integrations

Ready-to-use recipes to connect [LearnFloo](https://www.learnfloo.com) to the tools you already use: CRM,
newsletters, spreadsheets, team chat, scheduling. Each recipe solves **one concrete job** ("every paying member
becomes a HubSpot contact"), and comes as a **n8n workflow to import**, step-by-step guides for **Make** and
**Zapier**, and a **Node.js** server without dependencies.

LearnFloo can be driven entirely by its [REST API](https://api.learnfloo.com/docs), its MCP server and its
webhooks, so anything is possible; these recipes are the common cases, tested every night.

| Recipe | What it does | Formats |
|---|---|---|
| [HubSpot](recipes/hubspot) | New members become contacts tagged with your space; paid memberships update their status | n8n · Make · Zapier · Node |
| [Brevo](recipes/brevo) | Members kept in a Brevo list (added when they join, removed when they leave) | n8n · Make · Zapier · Node |
| [Mailchimp](recipes/mailchimp) | Members in your audience with a tag per space, and one for paying members | n8n · Make · Zapier · Node |
| [Google Sheets](recipes/google-sheets) | One row per new member, registration, sale or completed course — no middleware | Apps Script · Node |
| [Slack](recipes/slack) | Team alerts: new members, sales, live questions, support tickets | n8n · Make · Zapier · Node |
| [Discord](recipes/discord) | Announcements: new members, lives going on air, replays, new courses | n8n · Make · Zapier · Node |
| [Notion](recipes/notion) | A Notion database of members and registrations | n8n · Make · Zapier · Node |
| [Calendly](recipes/calendly) | Everyone who books a call is invited to your next live, with a tracked link | n8n · Make · Zapier · Node |

## How it works

1. In LearnFloo, **Settings → API → Webhooks**: add the address of your workflow and tick the events of the recipe.
2. Import the recipe (n8n), or follow its Make / Zapier steps, or run its Node.js server.
3. Send a test event from the same LearnFloo page.

LearnFloo signs every webhook ([Standard Webhooks](https://www.standardwebhooks.com)): the Node.js recipes check
the signature with the secret shown when you create the webhook (`whsec_…`), see [`shared/learnfloo.mjs`](shared/learnfloo.mjs).
In n8n, the production URL of the webhook node is long and random: keep it private.

**Honest note:** LearnFloo has no app in the n8n, Make or Zapier catalogs yet. These recipes use the generic
"webhook" and "HTTP request" building blocks of each tool with LearnFloo's webhooks and API.

## With an AI assistant

The [`install-integration`](skills/install-integration/SKILL.md) skill lets Claude, Codex or Cursor set up a
recipe for you: it reads the recipe, creates the LearnFloo webhook through the MCP server or the API, and sends a
test event. It ships with the [LearnFloo agent kit](https://github.com/learnfloo/agent-kit).

## Tested every night

[`ci/check.mjs`](ci/check.mjs) runs on every push and every night against a LearnFloo test deployment: every event
and API endpoint a recipe uses must still exist, and every file must parse. A broken recipe does not stay online.
`catalog.json` (built from the `meta.json` files by `ci/build.py`) feeds the integrations pages of
www.learnfloo.com and of the app.

## Contributing

Recipes live in `recipes/<tool>/`: `meta.json` (name, category, events, endpoints, summary in English, French and
Spanish), `README.md`, `n8n.src.json` (source of the generated `n8n.json`: run `python3 ci/build.py`) and
`node/index.mjs`. Issues and pull requests are welcome.

MIT licence.
