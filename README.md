# DealDesk plugin for agenthouse

Install **DealDesk** in ChatGPT, Claude, Cursor, or Codex — create and update desk cards, log email and status updates, work with quotes and the product portfolio, look up customers, and export for analysis.

Brought to you by [agenthouse](https://agenthouse.org).

This repository is the **DealDesk plugin**: marketplace-oriented packaging (skills + install docs) with a local stdio bridge. Tools run over the agenthouse **MCP** endpoint (`POST /mcp/dealdesk`). Host marketplaces (ChatGPT/Codex Plugins, Claude plugins, Cursor plugins) can list this package while the remote MCP URL remains the shared runtime.

## For AI agents

If you are an AI assistant helping someone install DealDesk, follow **[install-for-agents.md](./install-for-agents.md)** (decision tree, host-specific steps, verify, troubleshooting). Do not improvise package names or MCP URLs.

## What you can do

- Create and update desk cards, including notes and stage changes  
- Log inbound/outbound email and other status updates on a card timeline  
- Evaluate configurations and create quotes from your published portfolio  
- Find or create companies and contacts, and read their notes and commercial summaries  
- Craft classic quotes, customer share links, local cases, and orders from accepted quotes  
- Export Deal Intelligence workbooks for offline analysis  
- Preview and confirm portfolio publish (with an explicit confirmation step)

Destructive delete operations are not available. Soft-close cards by updating their stage instead.

## Customer data responsibility

**Warning:** DealDesk tools can return customer and deal data to the AI host you connect, to that host's model providers, and to any other tools available in the same conversation. By installing or connecting this plugin you acknowledge that **you** are responsible for which hosts, models, and tools you authorize and for lawful handling of that data. agenthouse does not control third-party AI hosts or tools you enable alongside DealDesk.

## Before you start

You need:

1. An **agenthouse** account with DealDesk access to your tenant  
2. Either:
   - **Connect (recommended for ChatGPT / Claude remote):** sign in and grant DealDesk access when prompted, or  
   - **A project API key** (for Cursor, Claude Desktop, Codex, and other local hosts): create one under **Access management → API keys** in the agenthouse workspace. Grant at least `dealdesk:read`, or `dealdesk:access` for full write access.

You also need **Node.js 20+** for the local connector.

## Install

### Option A — Remote MCP (ChatGPT, Claude, and similar)

Add DealDesk as a remote MCP server / connector (or install the plugin from the host marketplace when listed):

| Setting | Value |
| --- | --- |
| MCP URL | `https://api.agenthouse.org/mcp/dealdesk` |
| Authentication | OAuth (Connect) |

When Connect opens, sign in with agenthouse, choose your project (tenant), and grant DealDesk access. Your host will then list DealDesk tools automatically.

### Option B — Local connector (Cursor, Claude Desktop, Codex)

Use this package as a local stdio MCP bridge. It talks securely to agenthouse with your project API key.

#### Cursor

1. Open **Cursor Settings → MCP**  
2. Add a server with the configuration below  
3. Restart MCP / reload the window if prompted  

```json
{
  "mcpServers": {
    "dealdesk": {
      "command": "npx",
      "args": ["-y", "github:agenthouse-org/dealdesk-plugin"],
      "env": {
        "AGENTHOUSE_API_URL": "https://api.agenthouse.org",
        "AGENTHOUSE_API_KEY": "ahk_your_project_api_key",
        "AGENTHOUSE_PROJECT_ID": "YOUR_TENANT_ID"
      }
    }
  }
}
```

#### Claude Desktop

Edit your Claude Desktop MCP config (typically `claude_desktop_config.json`) and add the same `mcpServers.dealdesk` block as above, then restart Claude Desktop.

#### Codex / other stdio hosts

Use the same command, arguments, and environment variables as Cursor.

#### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `AGENTHOUSE_API_KEY` | Yes | Project API key from agenthouse Access management |
| `AGENTHOUSE_PROJECT_ID` | Recommended | Default tenant id when a tool call omits `projectId` |
| `AGENTHOUSE_API_URL` | No | Defaults to `https://api.agenthouse.org` |

Keep your API key private. Do not commit it to git or share it in chat logs.

### Verify the connection

After install, ask your assistant something concrete, for example:

> List open DealDesk cards for my project.

You should see DealDesk tools available (such as listing cards or creating a quote from a configuration). If authentication fails, renew Connect or check that the API key has DealDesk permission for that tenant.

## Skills and slash commands

Guided skills live in [`skills/`](./skills/). Matching slash commands live in [`commands/`](./commands/): `/dealdesk-help`, `/create-card`, `/log-email`, `/craft-quote`, `/quote`, `/evaluate`, `/directory-activity`, `/find-customer`, `/share-quote`, `/export`, `/publish`. Start with `/dealdesk-help` for an overview (the agent should call `dealdesk.list_skills` / `dealdesk.discover`). A host may prefix commands with the plugin name (for example `/dealdesk:log-email`).

## Support

- Product and product docs: [agenthouse.org](https://agenthouse.org)  
- Issues with this plugin: [GitHub Issues](https://github.com/agenthouse-org/dealdesk-plugin/issues)

## License

MIT © agenthouse
