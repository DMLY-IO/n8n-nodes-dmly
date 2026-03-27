# n8n-nodes-dmly

This is an n8n community node that lets you integrate [DMLY](https://dmly.io) with your n8n workflows.

[DMLY](https://dmly.io) is an AI-powered business messaging platform for WhatsApp, Messenger, Instagram, Telegram, and website chat.

[n8n](https://n8n.io/) is a workflow automation platform.

## Installation

### Automatic - from n8n UI (recommended)

1. Go to **Settings** -> **Community Nodes** in your n8n instance.
2. Click **Install**.
3. Enter `n8n-nodes-dmly` as the package name.
4. Click **Install**.

### Manual - command line

Install in your custom nodes folder:

```bash
mkdir -p ~/.n8n/custom
cd ~/.n8n/custom
npm init -y
npm install n8n-nodes-dmly
```

Restart n8n after installation.

## Included nodes

- **DMLY** (action node)
- **DMLY Trigger** (trigger node)

## Supported resources and operations

### Account
- Get Info

### Contacts
- Create
- Get
- Get Many
- Update
- Delete
- Add Tags
- Remove Tags
- Assign Chat

### Contact Tags
- Create
- Get
- Get Many
- Delete

### Staff
- Get
- Get Many

### Workspaces
- Get
- Get Many

### Segments
- Create
- Get
- Get Many
- Delete

### Broadcasts
- Create
- Get
- Get Many
- Update
- Delete
- Get Logs

### Webhooks
- Create
- Get
- Get Many
- Update
- Delete

### WhatsApp Templates
- Create
- Get
- Get Many

### Messages
- Get by Contact
- Send (multi-channel)

Message send coverage includes:

- WhatsApp: text, media, template, catalog, product, product list, interactive list, interactive buttons, interactive CTA URL
- Telegram: text, media, template
- Instagram: text, media, template
- Messenger: text, media, template
- Website chat: text, media, template

## Trigger events

The **DMLY Trigger** node auto-registers a webhook in DMLY and supports:

- Incoming/Outgoing WhatsApp messages
- Incoming/Outgoing Instagram messages
- Incoming/Outgoing Messenger messages
- Incoming/Outgoing Telegram messages
- Incoming/Outgoing website messages
- Contact created
- Contact tag added
- Contact tag removed

## Credentials setup

Create **DMLY API** credentials in n8n:

- **Base URL**: `https://api.dmly.io/rest`
- **API Key**: your DMLY REST API key

You can generate API keys in DMLY under:

- **Integrations -> REST API**

## Notes

- For complex operations, the node exposes a **Payload (JSON)** field so you can pass full API body objects.
- For WhatsApp send operations, the node normalizes both `recipient` and `recepient` key variants for compatibility.

## Quick payload examples

Use these in the corresponding **Payload (JSON)** fields in the DMLY node.

### Contact -> Create (`contactPayload`)

```json
{
  "name": "John Doe",
  "phoneNumber": "+15551234567",
  "notes": "Created from n8n",
  "tags": ["Lead", "VIP"],
  "workspace": {
    "id": "YOUR_WORKSPACE_ID"
  }
}
```

### Segment -> Create (`segmentPayload`)

```json
{
  "name": "VIP Leads",
  "type": "contact",
  "criteria": {
    "workspaces": [
      {
        "id": "YOUR_WORKSPACE_ID"
      }
    ],
    "tags": ["VIP"],
    "exclusionTags": ["unsubscribe"],
    "contactStage": "Lead"
  },
  "workspace": {
    "id": "YOUR_WORKSPACE_ID"
  }
}
```

### Broadcast -> Create (`broadcastPayload`)

```json
{
  "name": "Promo Broadcast",
  "type": "contact",
  "segments": [
    {
      "id": "YOUR_SEGMENT_ID"
    }
  ],
  "template": {
    "name": "your_template_name",
    "language": "en"
  },
  "bodyTextParameters": ["{{contact.name}}"],
  "workspace": {
    "id": "YOUR_WORKSPACE_ID"
  }
}
```

### Message -> WhatsApp Text (`messagePayload`)

```json
{
  "contact": {
    "id": "YOUR_CONTACT_ID"
  },
  "workspace": {
    "id": "YOUR_WORKSPACE_ID"
  },
  "textMessage": "Hello from n8n"
}
```

### Message -> WhatsApp Template to phone (`messagePayload`)

```json
{
  "recipient": {
    "phoneNumber": "+15551234567",
    "name": "John Doe"
  },
  "workspace": {
    "id": "YOUR_WORKSPACE_ID"
  },
  "template": {
    "name": "your_template_name",
    "language": "en"
  },
  "bodyTextParameters": ["John Doe"],
  "buttonUrlParameters": []
}
```

### WhatsApp Template -> Create (`whatsappTemplatePayload`)

```json
{
  "template": {
    "category": "UTILITY",
    "language": "en",
    "name": "order_update_template",
    "components": [
      {
        "type": "BODY",
        "text": "Hello {{1}}, your order {{2}} is ready."
      }
    ]
  },
  "workspace": {
    "id": "YOUR_WORKSPACE_ID"
  }
}
```

## Development

```bash
npm install
npm run build
npm run lint
```

## API and docs

- REST API collection: https://help.dmly.io/en/collections/22-rest-api-reference
- Webhooks guide: https://help.dmly.io/en/articles/89-webhooks-all-you-need-to-know
- Support: https://help.dmly.io

## License

MIT
