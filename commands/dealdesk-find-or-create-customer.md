---
name: dealdesk-find-or-create-customer
description: Find a DealDesk company or contact, and create one only when no match exists.
---

# Find or create a customer

Follow the `dealdesk-find-or-create-customer` skill.

1. Search with `dealdesk.list_companies` or `dealdesk.list_contacts`.
2. Create only when no suitable match exists.
3. Companies use `legalName` (or `name`). Contacts use `displayName` (or `name`). Leave `externalId` empty unless the user supplied one.
