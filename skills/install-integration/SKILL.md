---
name: install-integration
description: Set up one of the LearnFloo integration recipes (HubSpot, Brevo, Mailchimp, Google Sheets, Slack, Discord, Notion, Calendly) for the user's space — reads the recipe, creates the LearnFloo webhook, checks with a test event. Use when the user asks to connect LearnFloo to one of these tools, or to "sync members to …", "post new members in Slack", "send registrations to a sheet".
---

# Install a LearnFloo integration recipe

Recipes: https://github.com/learnfloo/integrations/tree/main/recipes (one folder per tool; `catalog.json` lists them).

## Steps

1. **Pick the recipe** matching the user's goal from `catalog.json` (fields `slug`, `summary`, `events`, `tools`).
   If none fits, say so and propose the API or MCP route instead; never invent a recipe.
2. **Read its README** (`recipes/<slug>/README.md`): prerequisites, the tool's credentials, and the formats
   (n8n, Make, Zapier, Node.js, Apps Script). Ask the user which format they use; default to n8n for no-code users.
3. **Get the tool's side ready with the user**: the credential or URL the README lists (HubSpot private app token,
   Slack incoming webhook…). The user creates it in their own account; never ask them to paste a password.
4. **Create the LearnFloo webhook** with the MCP server (`create_webhook`) or `POST /webhooks`, URL = the address
   of their workflow or server, events = the recipe's `events`. Give the user the signing secret to store in their
   workflow or server; it is shown only once.
5. **Test**: send a test event (`test_webhook` / `POST /webhooks/:id/test`) and ask the user to confirm it arrived
   in the tool. If it did not, read the delivery log (`list_webhook_deliveries` / `GET /webhooks/:id/deliveries`):
   status code and response tell what to fix.
6. **Report**: what was connected, which events, where to switch it off (Settings → API → Webhooks).

## Rules

- Recipes use LearnFloo webhooks and API; there is no LearnFloo app in the n8n, Make or Zapier catalogs. Say it.
- Respect consent: the Mailchimp recipe adds members as *transactional* contacts; do not switch them to
  `subscribed` unless the user confirms their sign-up collects marketing consent.
- Keys and secrets stay with the user: do not print them back in chat once stored.
