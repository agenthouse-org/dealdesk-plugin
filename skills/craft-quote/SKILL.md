---
name: craft-quote
description: Guide the user to craft an excellent classic DealDesk quote. Use when they want a new classic quote draft, to clone a past quote, or to refine line items — not only portfolio-evaluated pricing.
---

# Craft an excellent classic quote

Tools: `dealdesk.list_companies`, `dealdesk.get_company`, `dealdesk.create_company`, `dealdesk.list_contacts`, `dealdesk.get_contact`, `dealdesk.create_contact`, `dealdesk.list_quotes`, `dealdesk.get_quote`, `dealdesk.get_quote_summary`, `dealdesk.create_quote`, `dealdesk.clone_quote`, `dealdesk.replace_quote_items`, `dealdesk.patch_quote`, `dealdesk.portfolio_summary`, `dealdesk.portfolio_evaluate`, `dealdesk.discover`, `dealdesk.list_portfolio_articles`, `dealdesk.get_portfolio_article`, `dealdesk.create_quote_from_configuration`, `dealdesk.update_quote_from_configuration`, `dealdesk.create_quote_share`, `dealdesk.render_quote_pdf`

## Conversation (classic-first)

1. Confirm **company** and **contact** (search/create in the Customer Directory).
2. Ask what the quote is **about** (title / intent).
3. Always ask: scan past quotes and suggest a clone, copy a quote they like, or **create fresh**?
4. Consult the **published portfolio** for recommended articles; confirm what belongs in the quote.
5. Ask whether positions should be in **groups**, and propose how to separate them (family, category, or custom). Confirm single vs multi selection, included vs optional, and `quantityEditable` where useful.
6. Create with `create_quote` or `clone_quote`. Refine with `replace_quote_items` (add/edit/remove positions, regroup).
7. Use CPQ `create_quote_from_configuration` / `update_quote_from_configuration` only when the user wants portfolio-evaluated pricing. Pass `quoteLayout` for presentation.
8. Offer share link / PDF when ready. Never delete through MCP.

Do not invent prices for CPQ lines client-side. Classic/open positions may carry explicit `unitPrice`.
