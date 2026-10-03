# Duplicate Cleanup

This build uses one global navigation system (`global-nav-role.js`). The local top navigation and dashboard sidebar injection were removed from `app.js` to prevent stacked/duplicate navigation.

Removed redundant pages:
- `dashboard.html` — duplicate role/dashboard router; use `role-login.html` and the global Dashboard action.
- `pages.html` — unused generic page with no unique workflow.

Specialized pages such as `expense-tracker.html` vs `expenses.html`, `profit-dashboard.html` vs `profit.html`, and role dashboards vs management modules were retained because they contain different tools/workflows rather than duplicate content.

Branding is centralized in `brand-studio.html` + `branding.js`.
