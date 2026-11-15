---
name: dealdesk-create-card
description: Create or update a DealDesk desk card, or respond to requests to delete or close one. Never delete a card or replace a deletion request with closing without the user's explicit agreement.
---

# Create or update a desk card

Tools: `dealdesk.create_card`, `dealdesk.patch_card`, `dealdesk.get_card`, `dealdesk.list_cards`, `dealdesk.list_desk_stages`, `dealdesk.list_desk_users`, `dealdesk.list_card_activity`, `dealdesk.list_relationships`, `dealdesk.create_relationship`

Create a card or update title, stage, description, owner, priority, Customer Directory links, deal estimates, and quote deal-value override.

## Deletion and closing

For safety, deletion is unavailable through DealDesk MCP and must be done manually in DealDesk. When asked to delete a card, explain this and offer closing the card as a separate option. Closing retains the record and changes its stage; it is not deletion. Ask whether the user wants to close it, and wait for an explicit yes before making any change. Do not call `patch_card`, `patch_case`, or any other write tool as a substitute for deletion without that agreement. If the user explicitly requests closing the card, proceed with the normal stage-update workflow, using a stage returned by `list_desk_stages`.

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

`create_card` / `patch_card` with `companyId` / `contactId` (or `null` to clear). Clearing company also clears contact. Company/contact changes also sync a linked local case and quote customer link. When the user identifies the contact as affiliated with the selected company, also make sure a directory relationship exists: search `list_relationships` by both IDs and create it with `create_relationship` if missing. The card link alone does not create that relationship.

For a linked draft quote, assignment also populates its company/contact details for the quote context and document template. Clearing the customer clears those draft details. Non-draft quote details remain unchanged.

## History

`dealdesk.list_card_activity` returns stage/owner/account/note/quote/order/share milestones (not the comment/email timeline — that is status updates).

Do **not** use notes to log customer email. Use `dealdesk-log-card-activity` (`dealdesk.log_email`).
