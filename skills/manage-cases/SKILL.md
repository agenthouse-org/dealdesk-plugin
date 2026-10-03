---
name: manage-cases
description: List, create, and update DealDesk cases. Use for local sales/request cases. Not Salesforce Opportunity search.
---

# Manage DealDesk cases

Tools: `dealdesk.list_cases`, `dealdesk.get_case`, `dealdesk.create_case`, `dealdesk.patch_case`

Create or update local DealDesk cases (title, stage, description, company/contact/quote links, estimates). Soft-close via stage when appropriate. Do not call disconnected Salesforce Opportunity search endpoints.
