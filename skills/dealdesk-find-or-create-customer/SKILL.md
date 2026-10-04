---
name: dealdesk-find-or-create-customer
description: Search the DealDesk customer directory and create a company or contact only when no match exists. Use for company or contact lookup.
---

# Find or create a company / contact

Tools: `dealdesk.list_companies`, `dealdesk.get_company`, `dealdesk.create_company`, `dealdesk.patch_company`, `dealdesk.list_contacts`, `dealdesk.get_contact`, `dealdesk.create_contact`, `dealdesk.patch_contact`

Search the customer directory first. Create only when no suitable match exists. Update with `dealdesk.patch_company` / `dealdesk.patch_contact` using `expectedRevision` from get.

Companies: send `legalName` or `name` (maps to `legalName`). `externalId` is optional and auto-generated as `local-company-<uuid>` when omitted.

Contacts: send `displayName` or `name` (or first/last name). `externalId` is optional and auto-generated as `local-contact-<uuid>` when omitted.
