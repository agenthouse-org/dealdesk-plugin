---
name: directory-activity
description: Read a company or contact commercial summary and add or patch structured directory notes.
---

# Directory notes and commercial summary

Follow the `directory-activity` skill.

1. Resolve the company or contact.
2. Call `dealdesk.get_company_commercial_summary` or `dealdesk.get_contact_commercial_summary` before advising on pipeline.
3. Add or patch notes with title and body. Never store email as a directory note; never delete notes through MCP.
