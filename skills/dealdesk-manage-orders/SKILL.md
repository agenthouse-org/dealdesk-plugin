---
name: dealdesk-manage-orders
description: Work with DealDesk orders. Discover domain orders first, then list/get/create from quote/patch. Never delete orders through MCP.
---

# Manage orders

Tools: `dealdesk.discover`, `dealdesk.list_orders`, `dealdesk.get_order`, `dealdesk.create_order_from_quote`, `dealdesk.patch_order`

1. Call `dealdesk.discover` with domain `orders` if order tools are not listed.
2. Create from a quote with `create_order_from_quote`.
3. Patch metadata only. Delete is not available through MCP.
