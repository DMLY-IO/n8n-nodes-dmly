# n8n-nodes-dmly — v1.0.0 rebuild plan

Rebuild the community node against the **current DMLY app**'s public REST API
(`/api/v1`). The existing 0.1.x node targets a retired backend (`api.dmly.io/rest`,
`/v1/...` paths, per-request `workspaceId`, a webhook *collection*, channel-specific
`sendtext`/`sendmedia` endpoints). Almost none of its routing survives; we keep the
project scaffolding and the request harness, and rewrite everything user-facing.

## Target API

- **Base URL:** `https://dash.dmly.io/api/v1` (configurable — self-host / agency / whitelabel).
- **Auth:** workspace API key `dmly_…`, header `x-api-key` (also accepts `Authorization: Bearer`).
  Minted at **Salesbot → Integrations → "API" tile** (or `php artisan dmly:api-key`).
- **The key IS the workspace.** One credential = one workspace. There is **no** `workspace`
  resource and **no** `workspaceId` parameter (multi-workspace management is the separate
  Agency API, `/api/agency/v1`, key `dmly_ag_` — out of scope for this node).
- **Conventions:** list search = `q`; pagination = `per_page` (alias `limit`, max 100);
  lists return `{data, links, meta}` (`meta.current_page`/`last_page`/`total`); single = `{data}`;
  models addressed by **uuid**; create = 201; delete = `{deleted:true}`.
- **Source of truth:** OpenAPI at https://docs.dmly.io/api-reference (`openapi.json`) and the
  app's per-module manifests in `Dmly_app/docs/api/manifest/*.json`.

## Compatibility break (must be documented at release)

0.1.x workflows will not carry over: different base URL, key format, endpoints, params,
message-send shape, and webhook model. Ship as **1.0.0** with a migration note; deprecate 0.x.

## Design decisions (confirmed 2026-07-23)

1. **Trigger = Auto + Manual toggle** against the singleton webhook (see below).
2. **Reuse npm name `n8n-nodes-dmly`, ship `1.0.0`.**
3. **Keep the imperative harness** (`execute()` switch + `dmlyApiRequest`), rewrite the routing
   table. Lower risk than a declarative rewrite, full control over new conventions (uuid, `q`,
   `per_page`, `returnAll` pagination). Trigger stays imperative (required).
4. **Hold release until the full surface is covered** (all tiers below), not a partial ship.

## Credential — `DmlyApi` (Phase 1)

- `baseUrl` default `https://dash.dmly.io/api/v1`; describe self-host/whitelabel override.
- `apiKey` (password); describe minting location.
- `documentationUrl` → `https://docs.dmly.io/api-reference/introduction`.
- `authenticate`: header `x-api-key = {{$credentials.apiKey}}`.
- `test`: `GET {{baseUrl}}/account`.

## Shared harness — `nodes/Dmly/GenericFunctions.ts`

- `dmlyApiRequest`: default baseUrl → `.../api/v1`; endpoints passed **without** `/v1` prefix.
- Add `dmlyApiRequestAllItems` — follow `meta.last_page` (or `links.next`) for `Return All`.
- `normalizeDmlyResponse`: unwrap `{data}` (object or array); keep `items`/`results` fallbacks.
- Drop `normalizeRecipientFields` (old `recepient` misspelling shim) and
  `getWebhookHeadersFromCollection` (old webhook-collection headers — gone).
- Add `verifyDmlySignature(rawBody, header, secret)` for the trigger (HMAC-SHA256).
  ⚠️ Confirm the exact delivery header + scheme from `app/Salesbot/Integrations/Webhooks/WebhookEmitter.php`
  before implementing (agency webhooks use `X-Dmly-Signature`; verify the workspace one matches).

## Action node — `Dmly` (resource → operation → endpoint)

Every list op gets `Return All` (bool) + `Limit`/`per_page` + `q` where supported. IDs are uuids.

**Tier 1 — core CRM + messaging**
- **Account**: Get → `GET /account`.
- **Channel** (read-only, also feeds loadOptions): Get Many → `GET /channels` (`q`,`platform`,`status`); Get → `GET /channels/{id}`.
- **Contact**: Get Many `GET /contacts` (`q`,`lifecycle`,`stage`,`tags`,`status`,`platform`,`has_phone`,`has_email`); Get `GET /contacts/{id}`; Create `POST /contacts`; Update `PUT /contacts/{id}`; Delete `DELETE /contacts/{id}`; Add Tags `POST /contacts/{id}/tags`; Remove Tags `DELETE /contacts/{id}/tags`; Add Note `POST /contacts/{id}/notes`; Set Stage `PUT /contacts/{id}/stage`; Set Lifecycle `PUT /contacts/{id}/lifecycle`.
- **Tag**: Get Many `GET /tags`; Get `GET /tags/{id}`; Create `POST /tags`; Update `PUT /tags/{id}`; Delete `DELETE /tags/{id}`.
- **Conversation**: Get Many `GET /conversations` (`q`,`status`,`unread`,`platform`); Get Messages `GET /conversations/{contactId}/messages`.
- **Message**: Send `POST /messages` (`contact_id`,`type`[text/image/video/audio/file/template],`body`,`kind`,`media`,`template_id`,`parameters`). This is the headline action. Structured fields (not a raw JSON blob) with conditional display by `type`.

**Tier 2 — bookings + commerce** (confirm each from its manifest)
- **Appointment**: list / get / book / reschedule / cancel / set-status / available slots.
- **Service** + **Service Category**, **Staff** (+availability/time-off), **Class** (+participants).
- **Offering**: Products, Plans (list/get).
- **Invoice**: list/get/create/send/void. **Order**: list/get/create. **Payment**: list/get/create. **Coupon**. **Subscription** (+changePlan).

**Tier 3 — automation + growth**
- **Broadcast**: Get Many `GET /broadcasts` (`status`,`channel`); Get `GET /broadcasts/{id}`; Create `POST /broadcasts`; Update `PUT /broadcasts/{id}`; Delete `DELETE /broadcasts/{id}`; Approve `POST /broadcasts/{id}/approve`; Send `POST /broadcasts/{id}/send`; Recipients `GET /broadcasts/{id}/recipients` (`status`).
- **Automation**: list / activate / pause.
- **Segment**: list / get / (apply).
- **Media**: upload.

**Dropped vs 0.1.x:** `workspace` resource (key is workspace-scoped); per-request `workspaceId`;
`whatsappTemplate` CRUD (WA templates are managed in the dashboard; sending references a
`template_id` uuid — revisit if a templates list endpoint is added); channel-specific send
endpoints (now one `POST /messages`); `assign-chat` (use conversation assignment if/when exposed).

## Trigger node — `DmlyTrigger` (singleton webhook)

The workspace webhook is a **singleton**: `GET/PUT/DELETE /api/v1/webhooks` (no id) +
`GET /api/v1/webhooks/events` (grouped catalogue of dotted topics: `contact.*`, `message.*`,
`conversation.*`, `appointment.*`, `class.*`, `invoice.*`, `order.*`, `payment.*`,
`subscription.*`, offering/credit, store, automation, broadcast).

- **Events**: `multiOptions` populated via `loadOptions` → `GET /webhooks/events` (flatten groups).
- **Registration mode** (dropdown):
  - **Auto** (default): `create()` → `PUT /webhooks {url: <n8n prod webhook url>, events, channel, secret}`
    (generate + store a `whsec_` secret in workflow static data so we can verify);
    `checkExists()` → `GET /webhooks`, compare stored endpoint to this node's URL;
    `delete()` → `DELETE /webhooks`. Guard: if `GET` shows a **different** endpoint already
    owns the subscription, throw a clear "another consumer owns this workspace's webhook" error
    (singleton — one owner). Reject non-https / localhost URLs (app SSRF-rejects them anyway).
  - **Manual**: skip registration; show this node's webhook URL in a notice so the user points
    DMLY at it themselves (dashboard or one PUT). Required for local dev (needs a public tunnel).
- **`channel`** option (default `all`) — scopes message-lifecycle events.
- **Signature verification**: verify HMAC on every delivery; reject invalid (unless "verify" is
  turned off). Seed sample output from `WebhookTopics.php` demo payloads for good DX.
- Output the parsed event `body` (not the old `{body,headers,query}` envelope) — optionally expose headers.

## Phases

1. **Credential + harness** — rewrite `DmlyApi` (test `/account`) + `GenericFunctions` (baseUrl, `returnAll`, unwrap). `npm i && npm run lint && npm run build` green.
2. **Trigger node** — singleton Auto/Manual, events loadOptions, signature verify.
3. **Action Tier 1** — Account, Channel, Contact, Tag, Conversation, Message(send).
4. **Action Tiers 2 & 3** — bookings, finance, offerings, broadcasts, automations, segments, media (drive from manifests/OpenAPI).
5. **Docs + examples** — README rewrite, 2–3 example workflows, migration notes; update help.dmly.io article 144.
6. **Release** — bump `package.json` to `1.0.0` + new description/keywords, `npm publish`, deprecate 0.x; optional n8n verified-community-node submission.

## Testing

- Local **n8n** + local `Dmly_app` (`/api/v1`), key via `dmly:api-key`.
- Auto-register needs a public https URL (SSRF guard) → use a tunnel or deployed n8n; Manual mode for pure-local.
- `eslint-plugin-n8n-nodes-base` in CI; smoke-test each write path.
