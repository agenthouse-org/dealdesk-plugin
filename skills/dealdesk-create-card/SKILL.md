---
name: dealdesk-create-card
description: Create or update a DealDesk desk card (title, stage, description, company/contact). Use when the user wants a new card, a stage change, a description edit, or to link/unlink Customer Directory company and contact. Never delete a card.
---

# Create or update a desk card

Tools: `dealdesk.create_card`, `dealdesk.patch_card`, `dealdesk.get_card`, `dealdesk.list_cards`

Create a card or update title, stage, **description**, and Customer Directory links. Soft-close work by setting an appropriate closed stage rather than deleting.

Use `description` for the main card body text. Use `deskDescription` for a local desk-only description when needed. Use `dealdesk.add_card_note` only for structured notes (title + body), not as a substitute for the card description.

To link a company or contact after create, call `dealdesk.patch_card` with `companyId` and/or `contactId` (Customer Directory ids). Pass `null` to clear. Clearing `companyId` also clears the contact. Resolve ids with directory list/get tools when the user names a customer instead of an id.

When company/contact changes, the server also updates a linked local case and quote customer link (same as the DealDesk UI). You do not need separate `patch_case` or quote-link calls for that follow-up.

Do **not** use notes to log customer email. Use the `dealdesk-log-card-activity` skill (`dealdesk.log_email`).
