---
name: dealdesk-create-card
description: Create or update a DealDesk desk card (title, stage, description, owner, priority, company/contact, deal estimates, quote value override). Use when the user wants a new card, a stage/owner change, estimates, or directory links. Never delete a card.
---

# Create or update a desk card

Tools: `dealdesk.create_card`, `dealdesk.patch_card`, `dealdesk.get_card`, `dealdesk.list_cards`, `dealdesk.list_desk_stages`, `dealdesk.list_desk_users`, `dealdesk.list_card_activity`

Create a card or update title, stage, description, owner, priority, Customer Directory links, deal estimates, and quote deal-value override. Soft-close by setting stage `closed` rather than deleting.

Use `description` for the main card body. Use `deskDescription` for a local desk-only description. Use `dealdesk.add_card_note` only for structured notes, not as a substitute for the card description.

## Stages (discrete column ids)

`stage` is a **board column id**, not a UI label. Call `dealdesk.list_desk_stages` and use a returned `columnId`. Never slugify a German/English label into a stage string (e.g. do **not** send `anfrage-in-bearbeitung`). That creates a ghost column and the card vanishes from the board.

Default board (when the project has not customized columns):

| columnId | EN | DE |
| --- | --- | --- |
| `request` | Open request | Offene Anfrage |
| `request-in-progress` | Request in progress | Anfrage in Bearbeitung |
| `quote-preparation` | Quote in preparation | Angebot in Bearbeitung |
| `quote-sent` | Quote sent | Angebot gesendet |
| `quote-accepted` | Quote accepted | Angebot angenommen |
| `order-processing` | Order processing | Auftrag in Vorbereitung |
| `order-completed` | Order completed | Auftrag abgeschlossen |
| `closed` | Closed | Geschlossen |

Tenants may add column ids — only use ids from `list_desk_stages`.

## Owner and priority

Resolve assignees with `dealdesk.list_desk_users`, then set `ownerUserId` on create/patch. Pass `null` on `patch_card` to clear. Filter with `list_cards` + `ownerUserId`. `priority` is free text (default `normal`).

## Deal value, period, and win chance

Set on the card with `create_card` / `patch_card`:

- `estimatedValue`, `estimatedValueCurrency`, `estimatedValuePeriod` (`one_time` | `month` | `year`), `probabilityPercent`

Use `year` for per-year / ARR. Do not invent synonyms (`annual`, `yearly`, `monthly`).

When the card has a linked local case, the server updates that case (UI parity) and returns `caseId` when present. Do **not** call `create_case` just to set estimates — that creates a second desk item.

## Quote deal-value override

On an unaccepted quote card, `dealValueOverride` + `dealValueOverrideNet` replace quote net on the board/overview (same as the UI). Ignored after accept, decline, or when an order exists. Clear with `dealValueOverrideNet=null`.

## Company / contact

`patch_card` with `companyId` / `contactId` (or `null` to clear). Clearing company also clears contact. Company/contact changes also sync a linked local case and quote customer link.

## History

`dealdesk.list_card_activity` returns stage/owner/account/note/quote/order/share milestones (not the comment/email timeline — that is status updates).

Do **not** use notes to log customer email. Use `dealdesk-log-card-activity` (`dealdesk.log_email`).
