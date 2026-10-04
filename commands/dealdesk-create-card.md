---
name: dealdesk-create-card
description: Create or update a DealDesk desk card. Soft-close with a stage change. Never delete.
---

# Create or update a desk card

Follow the `dealdesk-create-card` skill.

1. Read the current card with `dealdesk.get_card` when a card id is known; otherwise search with `dealdesk.list_cards`.
2. Create with `dealdesk.create_card` or update with `dealdesk.patch_card`.
3. Put the main body in `description`. Use `deskDescription` only for a desk-local note. Use `dealdesk.add_card_note` for structured notes, not for email.
4. Link Customer Directory with `companyId` / `contactId` on create or patch (`null` clears). Clearing company clears contact. Linked case and quote customers are updated automatically.
5. Soft-close by setting a closed stage. Do not delete.
