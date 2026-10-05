# Install DealDesk — instructions for AI agents

You are helping a **human** install the agenthouse **DealDesk** plugin so their assistant can call DealDesk tools.

Read this file end to end before editing their machine. Do not invent URLs, package names, or permission strings.

| | |
| --- | --- |
| Plugin repo | https://github.com/agenthouse-org/dealdesk-plugin |
| npm | `dealdesk-plugin` |
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

OAuth is the path for every interactive host. Do **not** ask them to create or paste an API key unless they are setting up automation that cannot open a browser. If they paste a key in chat, warn them to rotate it after setup.

---

## Decision tree

```
Interactive host (ChatGPT, Claude, Codex, Cursor, Claude Desktop)
  → OAuth. Path A when the host can add a remote URL. Path B when it needs a local command.
    The Cursor plugin is Path B: install it, and the connector opens the sign-in page.

Host plugin marketplace already lists “DealDesk” / agenthouse
  → Path C — Install from marketplace, then complete the agenthouse sign-in page

Host can install a plugin ZIP (ChatGPT upload, or a local plugin folder)
  → Path E — Download dealdesk-plugin-x.y.z.zip from GitHub Releases, then Connect

Automation that cannot open a browser (CI)
  → Path D — API key
```

If unsure, use OAuth. Do not start with an API key.

---

## Path A — Remote MCP (Connect / OAuth)

1. Tell the user to open their host’s **connector / MCP / plugin** settings.
2. Add a remote server / custom connector:

   | Setting | Value |
   | --- | --- |
   | URL | `https://api.agenthouse.org/mcp/dealdesk` |
   | Auth | OAuth / Connect |

3. Complete sign-in on agenthouse, select **one or more DealDesk projects**, grant DealDesk access (`dealdesk:read` / `write` / `access` as offered). If several projects are authorized, later tool calls must pass `projectId`.
4. Confirm tools appear (card list/create, or at least `dealdesk.list_cards`).
5. Run **Verify** below.

Do not configure `npx` or API keys for Path A unless the host cannot complete Connect. On Cursor, prefer the DealDesk plugin (Path B): it opens the sign-in page itself. A remote URL is enough only when that Cursor window actually opens the Connect page.

---

## Path B — Local connector (OAuth)

Use this when the host runs a local command (Cursor plugin, Claude Desktop, `npx`) and should still sign in through the browser.

### Prerequisites

- Node.js **20+** on the machine that runs the host.
- A browser the user can sign in with.

### Cursor plugin

Install the DealDesk plugin. It starts the local connector, which opens the agenthouse sign-in page. The user signs in, selects one or more projects, and grants access. Do not ask for an API key. Ask for a project id only after they authorize several projects and a tool call needs `projectId`.

### Manual local command

```json
{
  "mcpServers": {
    "dealdesk": {
      "command": "npx",
      "args": ["-y", "dealdesk-plugin"]
    }
  }
}
```

Claude Desktop uses that same block in `claude_desktop_config.json`, then restart Claude Desktop.

On first launch the connector opens the Connect page and stores the sign-in for this computer. Later launches reuse it. Run **Verify** after they finish the page.

---

## Path D — API key (automation only)

Use this only when no browser can open (CI, a headless worker).

- Project API key from agenthouse **Access management → API keys**.
- Key permissions: at least `dealdesk:read`; for writes use `dealdesk:access`.
- `AGENTHOUSE_PROJECT_ID` when the account has more than one project.

They fill in secrets in the host’s env field. Do not ask them to paste the key into chat.

```json
{
  "mcpServers": {
    "dealdesk": {
      "command": "npx",
      "args": ["-y", "dealdesk-plugin"],
      "env": {
        "AGENTHOUSE_API_URL": "https://api.agenthouse.org",
        "AGENTHOUSE_API_KEY": "ahk_YOUR_PROJECT_API_KEY",
        "AGENTHOUSE_PROJECT_ID": "YOUR_TENANT_ID"
      }
    }
  }
}
```

| Variable | Required | Meaning |
| --- | --- | --- |
| `AGENTHOUSE_API_KEY` | Yes, on this path | Project API key (`ahk_…` in production; `local_…` only against a local API) |
| `AGENTHOUSE_PROJECT_ID` | When several projects exist | Tenant when a tool omits `projectId` |
| `AGENTHOUSE_API_URL` | No | Default `https://api.agenthouse.org` |

For a **local** agenthouse API, set `AGENTHOUSE_API_URL` to that base URL (no trailing slash) and use a `local_…` key if that is what their environment issues.

---

## Path C — Host marketplace / plugin install

When the host can install from a marketplace or this Git repo:

1. Install / enable the **DealDesk** plugin from agenthouse (repo: `agenthouse-org/dealdesk-plugin`).
2. Complete the agenthouse sign-in page (same Connect flow as Path A and Path B). Use Path D only when the host cannot open a browser.
3. Run **Verify**.

Exact marketplace UI labels differ by host. Prefer the host’s documented plugin install flow; fall back to Path A or B if listing is unavailable.

---

## Path E — Plugin ZIP

Use this when the host installs a plugin package. The same ZIP is for ChatGPT, Claude, Cursor, and Codex. It is not a zip of the git repository.

1. Download `dealdesk-plugin-x.y.z.zip` from the latest release: https://github.com/agenthouse-org/dealdesk-plugin/releases
2. ChatGPT: **Plugins → Upload plugin**. Other hosts: install that ZIP, or unpack it and install the plugin folder, using the host’s plugin flow.
3. Complete Connect on agenthouse for `https://api.agenthouse.org/mcp/dealdesk`.
4. Run **Verify**.

Publishing a GitHub Release tagged `vX.Y.Z` publishes `dealdesk-plugin` to npm and attaches that ZIP. Do not invent a local zip from the working tree unless you just ran `npm run package:zip` and are handing them `dist/dealdesk-plugin-x.y.z.zip`. Local command installs use `npx -y dealdesk-plugin`.

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
| Sign-in page did not open | The connector logs the page address. Ask them to open it, finish Connect, then retry. On Cursor, prefer the DealDesk plugin (it opens the page itself) over a remote URL whose browser redirect never appears. |
| DealDesk is installed but missing from the tool list | The sign-in page is still open, or Connect was not finished. There is no status file to edit. Finish the agenthouse page in the browser; tools show up after that. A user-wide install works in any window, including the home window. |
| Unauthorized / invalid token | Saved sign-in expired, or an API key was revoked or aimed at the wrong API. Sign in again, or replace the key. |
| Forbidden / DealDesk denied | OAuth grant or API key is missing DealDesk access for that project. |
| Wrong project / empty data | The project chosen on the Connect page, or `AGENTHOUSE_PROJECT_ID`, is a different tenant. |
| `npx` / Node errors | Node 20+ installed; network allows the npm registry. The package name is `dealdesk-plugin`. |
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
