---
name: log-email
description: Log inbound or outbound email on a DealDesk card timeline. Never store email as a card note.
---

# Log email on a card

Follow the `log-card-activity` skill.

1. Resolve the desk card (`dealdesk.list_cards` / `dealdesk.get_card`).
2. Call `dealdesk.log_email` with `direction` (`incoming` or `outgoing`), `from`, `to`, `subject`, `text`, and `cardId`.
3. Do not call `dealdesk.add_card_note` for email. That tool is for internal structured notes only.
4. For a comment, task, call, or meeting, use `dealdesk.create_status_update` instead.
