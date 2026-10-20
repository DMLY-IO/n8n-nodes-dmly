# n8n-nodes-dmly

This is an n8n community node. It lets you use [DMLY](https://dmly.io) in your n8n workflows.

DMLY is a WhatsApp-first customer communication and business platform: messaging across WhatsApp, Instagram, Messenger, Telegram, SMS and Live Chat, plus a CRM, appointments and classes, an offerings catalogue, invoicing, payments and gift cards, broadcasts and automations.

This node talks to DMLY's public REST API (`/api/v1`) and its signed webhooks.

[Installation](#installation) · [Credentials](#credentials) · [Operations](#operations) · [Trigger](#trigger) · [Upgrading from 0.x](#upgrading-from-0x) · [Resources](#resources)

## Installation

Follow the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

In n8n go to **Settings → Community Nodes → Install** and enter `n8n-nodes-dmly`.

## Credentials

1. In DMLY, open **Salesbot → Integrations** and click the **API** tile, then **Generate** a key (or run `php artisan dmly:api-key create` on the server). Copy the `dmly_…` key; it is shown only once. Each key is scoped to a single workspace.
2. In n8n create **DMLY API** credentials:
   - **Base URL** defaults to `https://dash.dmly.io/api/v1`. Change it only for a self-hosted, agency or white-label instance (it must end in `/api/v1`).
   - **API Key** is the `dmly_…` key.
3. Click **Test**. It calls `GET /account` to confirm the key works.

## Operations

The **DMLY** node covers the following resources. All list operations support **Return All** (auto-pagination) or a **Limit**, plus filters.

| Resource | Operations |
| --- | --- |
| **Account** | Get |
| **Contact** | Get Many, Get, Create, Update, Delete, Add Tags, Remove Tags, Add Note, Set Pipeline Stage, Set Lifecycle Stage, Export Data *(GDPR ZIP, needs `privacy:read`)* |
| **Tag** | Get Many, Get, Create, Update, Delete |
| **Segment** | Get Many, Get, Create, Update, Delete, Get Contacts |
| **Channel** | Get Many, Get *(read-only)* |
| **Conversation** | Get Many, Get Messages |
| **Message** | Send *(text, image, video, audio, file, or WhatsApp template including header)* |
| **Broadcast** | Get Many, Get, Create, Update, Delete, Approve, Send, Get Recipients |
| **Automation** | Get Many, Get, Activate, Pause |
| **Appointment** | Get Many, Get, Book, Reschedule, Cancel, Update Status, Get Slots |
| **Service** | Get Many, Get, Create, Update, Delete |
| **Service Category** | Get Many, Get, Create, Update, Delete |
| **Staff** | Get Many, Get, Create, Update, Delete, Get Availability |
| **Time Off** | Add, Delete |
| **Class Session** | Get Many, Get, Create *(single or recurring)*, Update, Delete *(one occurrence or the rest of a series)* |
| **Class Participant** | Get Many, Book, Cancel |
| **Product** | Get Many, Get, Create, Update, Delete |
| **Plan** | Get Many, Get, Create, Update, Delete |
| **Invoice** | Get Many, Get, Create, Send, Record Payment, Void |
| **Order** | Get Many, Get, Create, Confirm, Cancel |
| **Payment** | Get Many, Get, Create, Create Payment Link, Refund |
| **Coupon** | Get Many, Get, Create, Update, Delete |
| **Gift Card** | Get Many, Get, Create *(sell or issue complimentary)*, Redeem |
| **Subscription** | Get Many, Get, Create, Change Plan, Pause, Resume, Cancel |
| **Media** | Get Many, Get, Upload *(from an input binary field)*, Delete |

IDs are the public UUIDs returned by the API.

## Trigger

The **DMLY Trigger** node starts a workflow when DMLY sends a webhook. Pick one or more events (loaded live from your workspace) such as `contact.created`, `message.received`, `booking.created`, `invoice.paid`, `order.paid`, `payment.succeeded`, `subscription.renewed`, `lead.created` and many more. New events DMLY adds show up in the list automatically.

DMLY allows **one webhook subscription per workspace**, so the trigger offers two registration modes:

- **Automatic** (default): while the workflow is active, the node registers its own URL, subscribed events and a signing secret with DMLY, and removes them when you deactivate. If another consumer (or the dashboard webhook) already owns the workspace's subscription, the node tells you instead of clobbering it. Requires n8n to be reachable at a **public HTTPS URL** (DMLY rejects private and localhost hosts).
- **Manual**: the node only listens. You point DMLY at the node's Production URL yourself (**Salesbot → Integrations → Webhooks**) and paste the `whsec_` signing secret into the node. Use this when the dashboard should own the webhook, when fanning one endpoint out to several workflows, or for local development behind a tunnel.

Every delivery is verified against its `X-Dmly-Signature` header (HMAC-SHA256 of the raw body), filtered to the events you selected, and de-duplicated on `X-Dmly-Delivery` so a retried delivery doesn't run your workflow twice. The legacy `X-Salesbot-*` headers are still accepted as a fallback. Turn verification off only for testing.

## Upgrading from 0.x

Version **1.0.0 is a full rewrite** for the current DMLY app and is **not backward compatible** with 0.x workflows, which targeted a retired backend:

- New base URL (`…/api/v1`) and API key format (`dmly_…`, minted under Integrations → API).
- Keys are workspace-scoped, so the old `Workspace` resource and per-request `workspaceId` are gone.
- Sending is now a single **Message → Send** operation (not per-channel endpoints).
- Webhooks are a single per-workspace subscription; the trigger manages it automatically.

After upgrading, re-create your DMLY credentials with a new key and rebuild affected nodes.

## Resources

- [DMLY API reference](https://docs.dmly.io/api-reference/introduction)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)

## Version history

- **1.1.0**: Brought up to date with the current DMLY API.
  - **Trigger:** verifies `X-Dmly-Signature` and reads `X-Dmly-Event` (with `X-Salesbot-*` fallback), and skips duplicate deliveries by `X-Dmly-Delivery`. Upgrade before DMLY stops sending the legacy headers.
  - **New resource:** Gift Card (list, get, sell or issue, redeem against an invoice).
  - **Payment:** new Create Payment Link operation; `external_reference` on Create and as a list filter.
  - **Class Session:** create recurring classes (frequency + count), filter by recurrence, and update or delete a whole series.
  - **Message:** `header` for WhatsApp templates approved with a header (previously these sends failed).
  - **Contact:** marketing consent fields on Create, and a new Export Data operation (ZIP).
  - **Fix:** Media → Upload now sends the file as multipart form data from an input binary field (previously uploads failed).
- **1.0.1**: Added the MIT license and the provenance release workflow.
- **1.0.0**: Rewritten for the DMLY `/api/v1` REST API: 24 resources, ~120 operations, and a signed-webhook trigger with automatic subscription management.

## License

[MIT](LICENSE.md)
