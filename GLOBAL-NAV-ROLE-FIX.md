# Global Navigation + Role Access Fix

Added:
- Global navigation on every page
- Top-right Login button
- Top-right Demo button
- Demo selector for Owner, Admin, Cleaner/Staff, Client, and Affiliate
- Open Dashboard routes based on selected role
- Footer email contact area: support@email.com
- Schedule access restriction: owner only by default
- Owner delegation controls to allow admin or staff schedule access
- Schedule permission handling in browser demo mode
- Added Apps Script tabs for SCHEDULE_PERMISSIONS, ROLE_ACCESS, and CONTACT_MESSAGES

Important behavior:
- Owner can view monthly schedule automatically.
- Admin/staff cannot view schedule unless owner delegates schedule access.
- Client/affiliate cannot view monthly schedule.
- Dashboard view is based on selected role.
