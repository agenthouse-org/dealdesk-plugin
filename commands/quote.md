---
name: quote
description: Create a DealDesk quote from the published portfolio after a side-effect free evaluation.
---

# Quote from the published portfolio

Follow the `quote-from-portfolio` skill.

1. Confirm a published revision with `dealdesk.portfolio_summary` when needed.
2. Evaluate with `dealdesk.portfolio_evaluate`. Do not invent prices.
3. Create or update with `dealdesk.create_quote_from_configuration` / `dealdesk.update_quote_from_configuration` using the published revision ids and the same configuration.
