# DealDesk skills

These notes describe common workflows the DealDesk MCP connector supports. Hosts load each workflow from `skills/<name>/SKILL.md`. Slash commands in `commands/` start the same workflows. Your AI host may also load live skill descriptions from the agenthouse DealDesk server (`dealdesk.list_skills`).

## Guidelines

- Prefer update and soft-close over delete. Delete is not offered through MCP.
- Prefer the export skill for analysis instead of paging through large lists endlessly.
- For portfolio publish, always review the preview and confirm before publishing.
- Skill-gated tools need `dealdesk.discover` with the matching domain first. The server remembers that unlock for the API key or OAuth user.
- **Notes vs email:** use `dealdesk.add_card_note` for internal notes. Log inbound/outbound email with `dealdesk.log_email` (status-update touchpoint). Never store emails as card notes.

## Shipped skills

| Skill | Slash command | Purpose |
| --- | --- | --- |
| [dealdesk-help](./dealdesk-help/SKILL.md) | `/dealdesk-help` | Overview of capabilities; agent calls `list_skills` / `discover` |
| [dealdesk-create-card](./dealdesk-create-card/SKILL.md) | `/dealdesk-create-card` | Create or update a desk card |
| [dealdesk-log-card-activity](./dealdesk-log-card-activity/SKILL.md) | `/dealdesk-log-card-activity` | Notes, comments, tasks, and email touchpoints |
| [dealdesk-craft-quote](./dealdesk-craft-quote/SKILL.md) | `/dealdesk-craft-quote` | Craft or refine a classic quote |
| [dealdesk-quote-from-portfolio](./dealdesk-quote-from-portfolio/SKILL.md) | `/dealdesk-quote-from-portfolio` | Evaluate and create a quote from the published portfolio |
| [dealdesk-evaluate-configuration](./dealdesk-evaluate-configuration/SKILL.md) | `/dealdesk-evaluate-configuration` | Side-effect free CPQ evaluation |
| [dealdesk-directory-activity](./dealdesk-directory-activity/SKILL.md) | `/dealdesk-directory-activity` | Company/contact notes and commercial summary |
| [dealdesk-find-or-create-customer](./dealdesk-find-or-create-customer/SKILL.md) | `/dealdesk-find-or-create-customer` | Directory company/contact lookup and create |
| [dealdesk-share-quote](./dealdesk-share-quote/SKILL.md) | `/dealdesk-share-quote` | Quote status and customer share links (classic + rich) |
| [dealdesk-manage-cases](./dealdesk-manage-cases/SKILL.md) | — | Local DealDesk cases |
| [dealdesk-manage-orders](./dealdesk-manage-orders/SKILL.md) | — | Orders (discover `orders`) |
| [dealdesk-portfolio-browse](./dealdesk-portfolio-browse/SKILL.md) | — | Portfolio articles/revisions (discover `portfolio`) |
| [dealdesk-export-analysis](./dealdesk-export-analysis/SKILL.md) | `/dealdesk-export-analysis` | Bounded Deal Intelligence export |
| [dealdesk-publish-portfolio](./dealdesk-publish-portfolio/SKILL.md) | `/dealdesk-publish-portfolio` | Preview then confirm portfolio publish |
