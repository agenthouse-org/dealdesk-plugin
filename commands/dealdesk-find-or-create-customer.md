---
name: dealdesk-find-or-create-customer
description: Find or create DealDesk companies, contacts, and company-contact relationships.
---

# Find or create a customer and connect a contact

Follow the `dealdesk-find-or-create-customer` skill.

1. Search with `dealdesk.list_companies` or `dealdesk.list_contacts`.
2. Create only when no suitable match exists.
3. Companies use `legalName` (or `name`). Contacts use `displayName` (or `name`). Leave `externalId` empty unless the user supplied one.
4. When the contact is affiliated with the company, check `dealdesk.list_relationships` using both IDs and `status=active`; create a missing relationship with `dealdesk.create_relationship`.
5. Update relationships with `dealdesk.patch_relationship` and the current `expectedRevision`. Archive with `status=archived` to reversibly deactivate; hard deletion is not available.
