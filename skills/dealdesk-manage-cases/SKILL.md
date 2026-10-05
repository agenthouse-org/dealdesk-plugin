---
name: dealdesk-manage-cases
description: List, create, and update DealDesk cases. Use for local sales/request cases. Not Salesforce Opportunity search. Do not use create_case to set estimates on an existing desk card — use patch_card instead.
---

# Manage DealDesk cases

Tools: `dealdesk.list_cases`, `dealdesk.get_case`, `dealdesk.create_case`, `dealdesk.patch_case`, `dealdesk.list_desk_stages`, `dealdesk.list_desk_users`

Create or update local DealDesk cases (title, stage, description, company/contact/quote links, estimates, ownerUserId). Resolve stages with `dealdesk.list_desk_stages` and owners with `dealdesk.list_desk_users`. Soft-close via stage when appropriate. Do not call disconnected Salesforce Opportunity search endpoints.

## Stages (discrete column ids)

Same board column ids as desk cards. Call `dealdesk.list_desk_stages` and pass a returned `columnId`. Never slugify UI labels into stage strings.

## Estimates on cases

`create_case` / `patch_case` accept:

- `estimatedValue`
- `estimatedValueCurrency` (ISO 4217, e.g. `EUR`)
- `estimatedValuePeriod` — `one_time` | `month` | `year` (labels the amount; does not convert it)
- `probabilityPercent` (0–100)

These round-trip on get/list. Use `year` for per-year / ARR. Do not invent synonyms (`annual`, `yearly`, `monthly`).

## Desk cards vs cases

Creating a case also creates a desk card. If the opportunity already appears as a desk card, set value/chance/period with `dealdesk.patch_card` on that card. Do **not** use `create_case` as a substitute for updating a card’s estimates — that duplicates the opportunity on the desk.
