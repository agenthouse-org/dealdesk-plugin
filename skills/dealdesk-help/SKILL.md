---
name: dealdesk-help
description: Explain DealDesk capabilities, slash commands, and hard limits. Use when the user asks for help or what they can do with the plugin. Call dealdesk.list_skills before answering when MCP is available.
---

# DealDesk help

Help the user use DealDesk. Prefer live discovery over memory.

## First steps

1. Call `dealdesk.list_projects` and tell the user which `authorizedProjectIds` the token covers. Do not assume the singular `projectId` when more than one id is listed.
2. Call `dealdesk.list_skills` and summarize the returned skills in plain language.
3. If important tools are missing from the current tool list, call `dealdesk.discover` (omit `domain` for the domain list, or pass a domain such as `desk`, `quotes`, `portfolio`, `directory`, `export`, or `portfolio-authoring`).
4. Then answer with the command map below and the live skill list.

If MCP is not connected yet, still explain the command map and say which auth path to use.

## Slash commands

| Command | What it does |
| --- | --- |
| `/dealdesk-help` | This overview |
| `/dealdesk-create-card` | Create or update a desk card (including company/contact link) |
| `/dealdesk-log-card-activity` | Log inbound or outbound email on a card timeline |
| `/dealdesk-craft-quote` | Craft or refine a classic quote (clone or fresh draft) |
| `/dealdesk-quote-from-portfolio` | Evaluate a configuration and create a quote from the portfolio |
| `/dealdesk-evaluate-configuration` | Evaluate a configuration without creating a quote |
| `/dealdesk-directory-activity` | Company/contact commercial summary and notes |
| `/dealdesk-find-or-create-customer` | Find or create a company or contact |
| `/dealdesk-share-quote` | Quote status and customer share links (classic + rich) |
| `/dealdesk-export-analysis` | Bounded Deal Intelligence export |
| `/dealdesk-publish-portfolio` | Preview then confirm portfolio publish |

Hosts may prefix commands with the plugin name (for example `/dealdesk:dealdesk-help`).

## Status updates and email

- Email: use `dealdesk.log_email` (or `/dealdesk-log-card-activity`). Never put email in `add_card_note`.
- Other timeline work: use `dealdesk.create_status_update` for `comment`, `task`, and touchpoints (`phone_call`, `meeting`, `email_incoming`, `email_outgoing`, `misc`).
- Read the timeline with `dealdesk.list_status_updates`. Update with `dealdesk.patch_status_update`.
- Structured desk notes: `dealdesk.add_card_note` / `dealdesk.patch_card_note`.

## Quotes and shares

- Status and acceptance: `dealdesk.get_quote` (also returns existing shares).
- Line items without enrichment: `dealdesk.get_quote_summary`.
- Customer links: `create_quote_share` → `classicUrl` (standard) and `experienceUrl` (rich experience). Soft-close with `patch_quote_share` `isOpen=false`.

## Hard limits

- Delete is not available through MCP. Soft-close cards by changing stage; soft-close shares with `isOpen=false`.
- Portfolio publish needs preview, then `portfolio_publish` with `confirm=true`.
- Do not invent prices. Prefer portfolio evaluation and published revision ids.
- Prefer `/dealdesk-export-analysis` over paging through large lists forever.
- Skill-gated tools need `dealdesk.discover` with the matching domain first (for example `orders`, `portfolio`, `portfolio-authoring`).
- Remind the user that DealDesk tool results may disclose customer data to the AI host and other tools in the conversation, and that they remain responsible for that data.

## Auth

- Sign-in is OAuth. The user signs in on the agenthouse page, chooses one or more projects, and grants DealDesk access. When several projects are authorized, pass `projectId` on scoped tools.
- Remote URL: `https://api.agenthouse.org/mcp/dealdesk` (ChatGPT, Claude, Codex, Cursor).
- The Cursor plugin and the local connector open that same page. An API key is only for automation that cannot open a browser (`AGENTHOUSE_API_KEY`, and `AGENTHOUSE_PROJECT_ID` when the account has more than one project).
