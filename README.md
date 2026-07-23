# n8n-nodes-dmly

This is an n8n community node. It lets you use [DMLY](https://dmly.io) in your n8n workflows.

DMLY is a WhatsApp-first customer communication and business platform — messaging across WhatsApp, Instagram, Messenger, Telegram, SMS and Live Chat, plus a CRM, appointments and classes, an offerings catalogue, invoicing and payments, broadcasts and automations.

This node talks to DMLY's public REST API (`/api/v1`) and its signed webhooks.

[Installation](#installation) · [Credentials](#credentials) · [Operations](#operations) · [Trigger](#trigger) · [Upgrading from 0.x](#upgrading-from-0x) · [Resources](#resources)

## Installation

Follow the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

In n8n go to **Settings → Community Nodes → Install** and enter `n8n-nodes-dmly`.

## Credentials

1. In DMLY, open **Salesbot → Integrations** and click the **API** tile, then **Generate** a key (or run `php artisan dmly:api-key create` on the server). Copy the `dmly_…` key — it is shown only once. Each key is scoped to a single workspace.
2. In n8n create **DMLY API** credentials:
   - **Base URL** — defaults to `https://dash.dmly.io/api/v1`. Change it only for a self-hosted / agency / white-label instance (it must end in `/api/v1`).
   - **API Key** — the `dmly_…` key.
3. Click **Test** — it calls `GET /account` to confirm the key works.

## Operations

The **DMLY** node covers the following resources. All list operations support **Return All** (auto-pagination) or a **Limit**, plus filters.

| Resource | Operations |
| --- | --- |
| **Account** | Get |
| **Contact** | Get Many, Get, Create, Update, Delete, Add Tags, Remove Tags, Add Note, Set Pipeline Stage, Set Lifecycle Stage |
| **Tag** | Get Many, Get, Create, Update, Delete |
| **Segment** | Get Many, Get, Create, Update, Delete, Get Contacts |
| **Channel** | Get Many, Get *(read-only)* |
| **Conversation** | Get Many, Get Messages |
| **Message** | Send *(text / image / video / audio / file / WhatsApp template)* |
| **Broadcast** | Get Many, Get, Create, Update, Delete, Approve, Send, Get Recipients |
| **Automation** | Get Many, Get, Activate, Pause |
| **Appointment** | Get Many, Get, Book, Reschedule, Cancel, Update Status, Get Slots |
| **Service** | Get Many, Get, Create, Update, Delete |
| **Service Category** | Get Many, Get, Create, Update, Delete |
| **Staff** | Get Many, Get, Create, Update, Delete, Get Availability |
| **Time Off** | Add, Delete |
| **Class Session** | Get Many, Get, Create, Update, Delete |
| **Class Participant** | Get Many, Book, Cancel |
| **Product** | Get Many, Get, Create, Update, Delete |
| **Plan** | Get Many, Get, Create, Update, Delete |
| **Invoice** | Get Many, Get, Create, Send, Record Payment, Void |
| **Order** | Get Many, Get, Create, Confirm, Cancel |
| **Payment** | Get Many, Get, Create, Refund |
| **Coupon** | Get Many, Get, Create, Update, Delete |
| **Subscription** | Get Many, Get, Create, Change Plan, Pause, Resume, Cancel |
| **Media** | Get Many, Get, Upload, Delete |

IDs are the public UUIDs returned by the API.

## Trigger

The **DMLY Trigger** node starts a workflow when DMLY sends a webhook. Pick one or more events (loaded live from your workspace) such as `contact.created`, `message.received`, `booking.created`, `invoice.paid`, `order.paid`, `payment.succeeded`, `subscription.renewed` and many more.

DMLY allows **one webhook subscription per workspace**, so the trigger offers two registration modes:

- **Automatic** (default) — while the workflow is active, the node registers its own URL, subscribed events and a signing secret with DMLY, and removes them when you deactivate. If another consumer (or the dashboard webhook) already owns the workspace's subscription, the node tells you instead of clobbering it. Requires n8n to be reachable at a **public HTTPS URL** (DMLY rejects private/localhost hosts).
- **Manual** — the node only listens; you point DMLY at the node's Production URL yourself (**Salesbot → Integrations → Webhooks**) and paste the `whsec_` signing secret into the node. Use this when the dashboard should own the webhook, when fanning one endpoint out to several workflows, or for local development behind a tunnel.

Every delivery is verified against its `X-Salesbot-Signature` (HMAC-SHA256) and, in Manual mode, filtered to the events you selected. Turn verification off only for testing.

## Upgrading from 0.x

Version **1.0.0 is a full rewrite** for the current DMLY app and is **not backward compatible** with 0.x workflows, which targeted a retired backend:

- New base URL (`…/api/v1`) and API key format (`dmly_…`, minted under Integrations → API).
- Keys are workspace-scoped — the old `Workspace` resource and per-request `workspaceId` are gone.
- Sending is now a single **Message → Send** operation (not per-channel endpoints).
- Webhooks are a single per-workspace subscription; the trigger manages it automatically.

After upgrading, re-create your DMLY credentials with a new key and rebuild affected nodes.

## Resources

- [DMLY API reference](https://docs.dmly.io/api-reference/introduction)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)

## Version history

- **1.0.0** — Rewritten for the DMLY `/api/v1` REST API: 24 resources, ~120 operations, and a signed-webhook trigger with automatic subscription management.

## License

[MIT](LICENSE.md)
