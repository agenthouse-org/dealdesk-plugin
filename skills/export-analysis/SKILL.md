---
name: export-analysis
description: Export DealDesk data for offline analysis with the bounded Deal Intelligence export. Use instead of paging through large card or quote lists.
---

# Export for analysis

Tools: `dealdesk.export_intelligence`

Use `dealdesk.export_intelligence` for a bounded workbook. The result contains `filename` and `relativePath` under `applications/dealdesk/exports`. It does not return a server filesystem path or the file bytes. Do not page `list_cards` or `list_quotes` to build a workbook by hand.

