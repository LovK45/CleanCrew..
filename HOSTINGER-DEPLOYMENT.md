# Hostinger Deployment Map

Upload the public website files in this ZIP to `public_html/`. Keep Stripe secrets, webhook keys, and Drive IDs in Google Apps Script Script Properties only. `APPS-SCRIPT-Code.gs` is source/setup material and does not need to be public. Buyer ZIP files should remain private in Google Drive and must not be uploaded into `public_html`.

After SSL is active, `.htaccess` forces HTTPS and uses `404.html` for missing pages.
