---
name: dealdesk-share-quote
description: Inspect DealDesk quote status and create or update customer share links. Use when the user asks for a quote link, share URL, rich experience link, or quote acceptance status.
---

# Quote status and share links

Tools: `dealdesk.list_quotes`, `dealdesk.get_quote`, `dealdesk.get_quote_summary`, `dealdesk.list_quote_shares`, `dealdesk.create_quote_share`, `dealdesk.patch_quote_share`

1. Resolve the quote with `list_quotes` / `get_quote`.
2. `get_quote` returns `status`, `acceptanceSummary`, `analytics`, and current `shares`.
3. Create a link with `create_quote_share`. Use:
   - `classicUrl` / `classicPath` for the standard customer share
   - `experienceUrl` / `experiencePath` for the rich experience Desk
4. Soft-close a link with `patch_quote_share` and `isOpen=false`. Do not delete shares through MCP.
5. Prefer `get_quote_summary` when you need stored line items without enrichment.
