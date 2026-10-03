# Install DealDesk — instructions for AI agents

You are helping a **human** install the agenthouse **DealDesk** plugin so their assistant can call DealDesk tools.

Read this file end to end before editing their machine. Do not invent URLs, package names, or permission strings.

| | |
| --- | --- |
| Plugin repo | https://github.com/agenthouse-org/dealdesk-plugin |
| npm (when published) | `@agenthouse-org/dealdesk-plugin` |
| Remote MCP URL | `https://api.agenthouse.org/mcp/dealdesk` |
| Product | [agenthouse.org](https://agenthouse.org) |

**Brand:** write **agenthouse** and **DealDesk** as product names (agenthouse lowercase).

---

## Customer data responsibility (tell the human)

Before completing Connect or creating an API key, tell the user clearly:

> DealDesk tools can return customer and deal data to this AI host and to any other tools in the same conversation. **You** are responsible for which hosts, models, and tools you authorize and for lawful handling of that data.

Do not skip this warning. Prefer pointing them at the Connect consent screen or the API-key form in agenthouse, which also show it.

---

## Goal

DealDesk tools are available in the user’s host, authenticated to **their** project, and a simple list-cards prompt succeeds.

Tools always run on agenthouse MCP (`POST /mcp/dealdesk`). The plugin adds skills, install packaging, and (where supported) slash commands. Do not tell the user that “plugin” replaces MCP — the plugin **uses** MCP.

---

## Before you start — ask only what you need

1. **Which host?** ChatGPT (web/desktop Work), Claude.ai, Claude Code, Cursor, Claude Desktop, Codex, or other.
2. Do they already have an **agenthouse** account with **DealDesk** on a tenant?
3. Prefer **Connect / OAuth** (cloud hosts) or a **project API key** (local stdio hosts)?

Do **not** ask them to paste a full API key into chat if avoidable. Prefer: they create the key in the UI and paste it into the host’s secret/env field themselves. If they paste a key in chat, warn them to rotate it after setup.

---

## Decision tree

```
Cloud host with Connect/OAuth (ChatGPT, Claude.ai, many remote MCP UIs)
  → Path A — Remote MCP URL

Local / stdio host (Cursor MCP settings, Claude Desktop, Codex stdio, npx)
  → Path B — Local bridge + project API key

Host plugin marketplace already lists “DealDesk” / agenthouse
  → Path C — Install from marketplace, then complete Connect or API key as the host prompts
```

If unsure, detect from context (e.g. Cursor → Path B; ChatGPT Work plugins → Path A or C).

---

## Path A — Remote MCP (Connect / OAuth)

1. Tell the user to open their host’s **connector / MCP / plugin** settings.
2. Add a remote server / custom connector:

   | Setting | Value |
   | --- | --- |
   | URL | `https://api.agenthouse.org/mcp/dealdesk` |
   | Auth | OAuth / Connect |

3. Complete sign-in on agenthouse, pick the **project (tenant)**, grant DealDesk access (`dealdesk:read` / `write` / `access` as offered).
4. Confirm tools appear (card list/create, or at least `dealdesk.list_cards`).
5. Run **Verify** below.

Do not configure `npx` or API keys for Path A unless the host requires a fallback.

---

## Path B — Local stdio bridge (API key)

### Prerequisites

- Node.js **20+** on the machine that runs the host.
- Project API key from agenthouse **Access management → API keys**.
- Key permissions: at least `dealdesk:read`; for writes use `dealdesk:access` (or write as documented in their workspace).
- They know their **project id** (tenant id).

### Cursor

1. Open **Cursor Settings → MCP**.
2. Add (or merge) this server — they fill in secrets themselves:

```json
{
  "mcpServers": {
    "dealdesk": {
      "command": "npx",
      "args": ["-y", "github:agenthouse-org/dealdesk-plugin"],
      "env": {
        "AGENTHOUSE_API_URL": "https://api.agenthouse.org",
        "AGENTHOUSE_API_KEY": "ahk_YOUR_PROJECT_API_KEY",
        "AGENTHOUSE_PROJECT_ID": "YOUR_TENANT_ID"
      }
    }
  }
}
```

3. Save, reload MCP / window if prompted.
4. Run **Verify**.

### Claude Desktop

Same `mcpServers.dealdesk` block in `claude_desktop_config.json`, then restart Claude Desktop.

### Codex / other stdio hosts

Same command, args, and env vars as Cursor.

### Environment variables

| Variable | Required | Meaning |
| --- | --- | --- |
| `AGENTHOUSE_API_KEY` | Yes | Project API key (`ahk_…` in production; `local_…` only against a local API) |
| `AGENTHOUSE_PROJECT_ID` | Recommended | Default tenant when a tool omits `projectId` |
| `AGENTHOUSE_API_URL` | No | Default `https://api.agenthouse.org` |

For a **local** agenthouse API, set `AGENTHOUSE_API_URL` to that base URL (no trailing slash) and use a `local_…` key if that is what their environment issues.

---

## Path C — Host marketplace / plugin install

When the host can install from a marketplace or this Git repo:

1. Install / enable the **DealDesk** plugin from agenthouse (repo: `agenthouse-org/dealdesk-plugin`).
2. Complete whatever Connect or API-key prompt the host shows (same credentials rules as A/B).
3. Run **Verify**.

Exact marketplace UI labels differ by host. Prefer the host’s documented plugin install flow; fall back to Path A or B if listing is unavailable.

---

## Verify

Ask the user to run a prompt like:

> List open DealDesk cards for my project.

Success: tools run and return cards or an empty list without auth errors.

Also useful:

> What DealDesk tools do you have?

Expect names such as `dealdesk.list_cards`, `dealdesk.create_card`, `dealdesk.log_email` (exact list depends on server version and discovery).

---

## After install — correct usage (brief)

- **Card description** → `dealdesk.patch_card` / `create_card` with `description` (not unstructured “notes” as the main body).
- **Card company/contact** → `companyId` / `contactId` on `create_card` or `patch_card` (`null` clears).
- **Internal note** → `dealdesk.add_card_note`.
- **Log email** → `dealdesk.log_email` (status-update touchpoint). **Never** store email as a card note.
- **Soft-close** → update stage; delete tools are not offered.
- Prefer shipped skills / slash commands in this repo when the host loads them (`skills/`, `commands/`).

---

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Unauthorized / invalid token | Wrong key, revoked key, or `ahk_` key aimed at a local API (or the reverse). Renew Connect or create a new key. |
| Forbidden / DealDesk denied | Key or OAuth grant missing `dealdesk:read` / write / access for that project. |
| Wrong project / empty data | `AGENTHOUSE_PROJECT_ID` or Connect project picker does not match the tenant they expect. |
| `npx` / Node errors | Node 20+ installed; network allows GitHub/`npx`. |
| Tools missing | Reload MCP; confirm remote URL is exactly `https://api.agenthouse.org/mcp/dealdesk`. |
| Email “saved” as a note | Re-teach: use `dealdesk.log_email`, not `add_card_note`. |

---

## What you must not do

- Do not commit API keys, tokens, or tenant secrets into git, screenshots, or shared docs.
- Do not point production hosts at internal AgentHouse repo paths or localhost unless the user explicitly asked for a local API.
- Do not claim delete is available through DealDesk MCP/plugin tools.
- Do not invent a second MCP URL or package name.

---

## Human-readable install

For a shorter human overview, see [README.md](./README.md). Contributor notes: [AGENTS.md](./AGENTS.md).
