---
name: share-quote
description: Get a DealDesk quote status or customer share links (classic and rich experience). Soft-close with isOpen=false.
---

# Quote status and share links

Follow the `share-quote` skill.

1. Call `dealdesk.get_quote` for status, acceptance, and existing shares.
2. Call `dealdesk.create_quote_share` when a new customer link is needed.
3. Prefer `classicUrl` for the standard share and `experienceUrl` for the rich experience Desk.
4. Soft-close with `dealdesk.patch_quote_share` and `isOpen=false`. Never delete shares through MCP.
