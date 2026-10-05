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

You need an **agenthouse** account with DealDesk on your project.

Sign-in is **Connect (OAuth)**. A browser opens the agenthouse page; you sign in, select one or more projects, and grant DealDesk access. There is no API key to copy. If you authorize one project, tools use that project. If you authorize several, pass `projectId` on each tool call.

Use a project API key only for automation that cannot open a browser. Create one under **Access management → API keys** (`dealdesk:read`, or `dealdesk:access` for writes).

The local connector needs **Node.js 20+**.

## Install

### Connect — ChatGPT, Claude, Codex, Cursor

Install **DealDesk** from the host marketplace, or add a remote MCP server:

| Setting | Value |
| --- | --- |
| MCP URL | `https://api.agenthouse.org/mcp/dealdesk` |
| Authentication | OAuth (Connect) |

The Cursor plugin opens that same sign-in page after install. Nothing to paste.

### Plugin package

Each GitHub release attaches `dealdesk-plugin-x.y.z.zip`. That archive is the plugin itself: skills, commands, the local connector, and the ChatGPT, Claude, Cursor, and Codex manifests. It points at the same MCP URL. Sign-in is still Connect. ChatGPT can take this ZIP under **Plugins → Upload plugin**. Other hosts install the same archive, or the `dealdesk-plugin` npm package.

Commit the version in this repo, then publish a GitHub Release tagged `vX.Y.Z` (the tag must match `package.json`, for example `v0.1.0`). The **Publish to npm** workflow publishes `dealdesk-plugin` and attaches that plugin ZIP to the release. A prerelease is published to the npm `next` tag. A manual run of the workflow only checks the package.

On npm, set the trusted publisher for `dealdesk-plugin` to GitHub Actions, repository `agenthouse-org/dealdesk-plugin`, workflow file `publish.yml`, and allow `npm publish`. The package has to exist before that publisher can be saved. No npm token is stored in GitHub.

Directory review in the OpenAI portal also asks for a support URL, test cases, and a demo recording. Those are entered in the portal; they are not inside the ZIP.

### Local connector

Hosts that only accept a local command use this package. On first launch it opens the same Connect page and remembers the sign-in on this computer.

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

Claude Desktop uses the same block in `claude_desktop_config.json`.

### API key (automation only)

```json
{
  "mcpServers": {
    "dealdesk": {
      "command": "npx",
      "args": ["-y", "dealdesk-plugin"],
      "env": {
        "AGENTHOUSE_API_URL": "https://api.agenthouse.org",
        "AGENTHOUSE_API_KEY": "ahk_your_project_api_key",
        "AGENTHOUSE_PROJECT_ID": "YOUR_TENANT_ID"
      }
    }
  }
}
```

| Variable | Required | Description |
| --- | --- | --- |
| `AGENTHOUSE_API_KEY` | For this path | Project API key from agenthouse Access management |
| `AGENTHOUSE_PROJECT_ID` | When you authorize several projects | Tenant id used when a tool call omits `projectId` |
| `AGENTHOUSE_API_URL` | No | Defaults to `https://api.agenthouse.org` |

Keep the API key private. Do not commit it or paste it into chat.

### Verify the connection

After install, ask your assistant something concrete, for example:

> List open DealDesk cards for my project.

You should see DealDesk tools available (such as listing cards or creating a quote from a configuration). If sign-in did not finish, complete the agenthouse page and ask again. For an API key, check that it has DealDesk permission for that project.

## Skills and slash commands

Guided skills live in [`skills/`](./skills/). Matching slash commands live in [`commands/`](./commands/): `/dealdesk-help`, `/dealdesk-create-card`, `/dealdesk-log-card-activity`, `/dealdesk-craft-quote`, `/dealdesk-quote-from-portfolio`, `/dealdesk-evaluate-configuration`, `/dealdesk-directory-activity`, `/dealdesk-find-or-create-customer`, `/dealdesk-share-quote`, `/dealdesk-export-analysis`, `/dealdesk-publish-portfolio`. Start with `/dealdesk-help` for an overview (the agent should call `dealdesk.list_skills` / `dealdesk.discover`). A host may prefix commands with the plugin name (for example `/dealdesk:dealdesk-log-card-activity`).

## Support

- Product and product docs: [agenthouse.org](https://agenthouse.org)  
- Issues with this plugin: [GitHub Issues](https://github.com/agenthouse-org/dealdesk-plugin/issues)

## License

MIT © agenthouse
