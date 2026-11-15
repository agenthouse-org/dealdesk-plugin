---
name: dealdesk-quote-from-portfolio
description: Evaluate a configuration and create a DealDesk quote from the published portfolio. Use when the user wants a quote, not a price invented in chat.
---

# Quote from published portfolio

Tools: `dealdesk.portfolio_summary`, `dealdesk.portfolio_evaluate`, `dealdesk.create_quote_from_configuration`, `dealdesk.update_quote_from_configuration`, `dealdesk.list_relationships`, `dealdesk.create_relationship`

1. Optionally call `portfolio_summary` to confirm a published revision exists.
2. Confirm the quote's company and contact. If the user confirms their affiliation, check for an active relationship with `list_relationships` and create one if missing.
3. Call `portfolio_evaluate` with the configuration (side-effect free).
4. Call `create_quote_from_configuration` or `update_quote_from_configuration` with the published `portfolioRevisionId`, `priceBookRevisionId`, and the same configuration.

Do not invent prices client-side. Prefer the published revision ids returned by the API.

