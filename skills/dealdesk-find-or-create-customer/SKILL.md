---
name: dealdesk-find-or-create-customer
description: Search the DealDesk customer directory and create or update companies, contacts, and their relationships. Use for customer-directory setup and lookup.
---

# Find or create a company, contact, and relationship

Tools: `dealdesk.list_companies`, `dealdesk.get_company`, `dealdesk.create_company`, `dealdesk.patch_company`, `dealdesk.list_contacts`, `dealdesk.get_contact`, `dealdesk.create_contact`, `dealdesk.patch_contact`, `dealdesk.list_relationships`, `dealdesk.get_relationship`, `dealdesk.create_relationship`, `dealdesk.patch_relationship`

Search the customer directory first. Create a company or contact only when no suitable match exists. Update records using their patch tool and `expectedRevision` from get.

When a contact is associated with a company, represent that association with a company-contact relationship. After resolving both records, call `dealdesk.list_relationships` with both IDs and `status=active`; create one with `dealdesk.create_relationship` if none exists. Do not infer an affiliation from a card link alone. A relationship can record `role`, `title`, `primary`, `validFrom`, `validTo`, and typed `customFields`. Update it with `dealdesk.patch_relationship` using its current `expectedRevision`.

There is no hard-delete operation for directory records. To remove an active association, patch its status to `archived`; this is reversible and can be restored with `status=active`. Use `get_relationship` first for its current revision and verify the selected relationship before archiving.

Companies: send `legalName` or `name` (maps to `legalName`). `externalId` is optional and auto-generated as `local-company-<uuid>` when omitted.

Contacts: send `displayName` or `name` (or first/last name). `externalId` is optional and auto-generated as `local-contact-<uuid>` when omitted.

Relationships require existing `companyId` and `contactId`. The relationship type is the fixed `contact-to-account` discriminator; do not try to change it.
