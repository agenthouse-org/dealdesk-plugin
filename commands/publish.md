---
name: publish
description: Preview a DealDesk portfolio publish, then confirm only when blockers are clear.
---

# Publish the portfolio

Follow the `publish-portfolio` skill.

1. Call `dealdesk.discover` with domain `portfolio-authoring` if publish tools are not listed yet.
2. Call `dealdesk.initialize_portfolio_draft` only when no draft exists.
3. Call `dealdesk.portfolio_publish_preview` and show blockers.
4. Call `dealdesk.portfolio_publish` with `confirm=true` only when blockers are clear and the user has confirmed. Never publish without that flag.
