---
name: dealdesk-log-card-activity
description: Add internal notes or log email and other status updates on a DealDesk card timeline. Use for inbound or outbound email, comments, tasks, calls, and meetings. Never store email as a card note.
---

# Add notes and log email / status updates on a card

Tools: `dealdesk.get_card`, `dealdesk.add_card_note`, `dealdesk.patch_card_note`, `dealdesk.list_status_updates`, `dealdesk.create_status_update`, `dealdesk.patch_status_update`, `dealdesk.log_email`

## Notes

Use `dealdesk.add_card_note` for internal structured notes (title + body) on a desk card. Edit with `dealdesk.patch_card_note`. Delete is not available through MCP.

## Email (required path)

Log inbound or outbound email with `dealdesk.log_email`:

- `direction`: `incoming` or `outgoing`
- `from` / `to` / `subject` / `text`
- `cardId` of the desk card

This creates a status-update **touchpoint** (`email_incoming` / `email_outgoing`) on the card timeline — the same surface the DealDesk UI uses. The server persists structured `from` and `to` fields (and a compatible `participants` string `from → to`). Prefer `dealdesk.log_email` over a generic touchpoint so those fields are set correctly.

**Never** put email logs into `add_card_note`.

## Other status updates

Use `dealdesk.create_status_update` for:

- `type: comment` — timeline comment (`body` required)
- `type: task` — task (`title` required; optional due date / assignee)
- `type: touchpoint` — `phone_call`, `meeting`, `email_incoming`, `email_outgoing`, or `misc` (for email, prefer `dealdesk.log_email` so `from` / `to` are persisted)

List existing timeline entries with `dealdesk.list_status_updates` (`entityType: desk-card` + `cardId` / `entityId`).

Update an existing entry with `dealdesk.patch_status_update` (comment body, task status/fields, or touchpoint fields including `from` / `to`). Prefer listing first for `statusUpdateId` and `updatedAt`.
