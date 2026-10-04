---
name: dealdesk-publish-portfolio
description: Preview a DealDesk portfolio publish and confirm only when blockers are clear. Use when the user asks to publish the portfolio. Never publish without confirm=true.
---

# Publish portfolio (preview + confirm)

Tools: `dealdesk.discover`, `dealdesk.initialize_portfolio_draft`, `dealdesk.portfolio_publish_preview`, `dealdesk.portfolio_publish`

1. Unlock portfolio-authoring tools with `dealdesk.discover` and domain `portfolio-authoring` if needed.
2. Call `initialize_portfolio_draft` only when no draft exists.
3. Call `portfolio_publish_preview` and review blockers.
4. Call `portfolio_publish` only with `confirm=true` when blockers are clear.


Never publish without the explicit confirm flag. Confirm must work from a plain tools/call (no widget required).
