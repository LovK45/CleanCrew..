# CleanCrew Empire — Downloadable Product Launch Setup

This build is configured for a one-time downloadable-product offer. Buyers are not purchasing hosted account access in this launch model.

## External values still required
1. Google Apps Script deployed Web App URL ending in `/exec`.
2. Stripe secret key stored only in Apps Script Script Properties.
3. A random `STRIPE_WEBHOOK_KEY` stored in Script Properties and appended to the webhook URL as `?webhook_key=...`.
4. Six Stripe Payment Links.
5. Six Google Drive file IDs for the final buyer ZIPs.
6. Recommended: six Stripe Price IDs.
7. Production domain / Hostinger DNS + SSL.

## Google Sheet
Use `CleanCrew-Empire-Google-Sheets-Backend.xlsx` included with the buyer packages, upload it to Google Drive, and open/convert it in Google Sheets. The Apps Script also creates any missing backend tabs automatically through `ensureSheets_()` when `doGet()` or `doPost()` runs.

## Apps Script
Paste/deploy `APPS-SCRIPT-Code.gs` as a Web App. Do not put Stripe secret keys in `config.js` or any browser-side file.

## Stripe webhook events
Select:
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded` (if delayed methods are enabled)
- `checkout.session.async_payment_failed` (recommended for failure logging)
- `checkout.session.expired` (recommended for abandoned/expired checkout logging)

## Success URL
Configure each Stripe Payment Link to return to:
`https://YOURDOMAIN.com/success.html?session_id={CHECKOUT_SESSION_ID}`

## Cancel URL
Use:
`https://YOURDOMAIN.com/cancel.html`

## Final test
Test all six packages in Stripe test mode and confirm the exact matching ZIP arrives, `DELIVERY_LOG` gets one row, `SALES` gets one row, and failed/canceled payments do not deliver files.
