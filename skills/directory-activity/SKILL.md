---
name: directory-activity
description: Read commercial summaries and add or patch notes on a DealDesk company or contact. Use for pipeline context on a customer, not for email logs.
---

# Directory notes and commercial summary

Tools: `dealdesk.get_company`, `dealdesk.get_company_commercial_summary`, `dealdesk.add_company_note`, `dealdesk.patch_company_note`, `dealdesk.get_contact`, `dealdesk.get_contact_commercial_summary`, `dealdesk.add_contact_note`, `dealdesk.patch_contact_note`

1. Resolve the company or contact with `get_company` / `get_contact` when needed.
2. Read `get_company_commercial_summary` or `get_contact_commercial_summary` before advising on pipeline.
3. Add or patch structured notes with title and body (`add_*_note` / `patch_*_note`).

Never store email logs as directory notes. Never delete notes through MCP. For desk-card email, use `dealdesk.log_email` instead.
