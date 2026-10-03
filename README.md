# CleanCrew Empire — White-Label Build

This version includes the Brand Studio for business-name, logo, color, contact, and photo rebranding; a single global navigation system; duplicate-router cleanup; one-time pricing; marketplace; role dashboards; and the existing cleaning-business workflows from the source build.

Open `brand-studio.html` to rebrand the platform in-browser. Replace Stripe links and the Apps Script URL in `config.js` for production payments/backend.

# CleanCrew Empire

A complete GitHub Pages + Google Sheets + Stripe Payment Links SaaS starter for housecleaning businesses.

## What it does
- Premium landing page and live demo
- Login/register flow
- Owner, cleaner, affiliate, sponsor, business, and admin dashboards
- Services, bookings, invoices, payments, gallery, reviews, clients, quotes
- Expenses, profit, wallet, withdrawals, analytics
- Staff hiring, cleaner dashboard, routes, inventory, checklists
- Ads, boosted services, affiliate referral tracking, sponsor tools
- Google Sheets + Apps Script backend switch

## Launch
1. Upload all files to a GitHub repo.
2. Open `config.js` and replace Apps Script URL and Stripe Payment Links.
3. Create the Google Sheet tabs listed in `SETUP.md` or run the Apps Script setup function.
4. Publish the Apps Script as a Web App.
5. Turn on GitHub Pages.

The app works immediately in demo mode with browser localStorage until your Apps Script URL is replaced.


## Staff Workflow Upgrade
Includes owner/admin/staff/client/affiliate dashboards, cleaner assignments, clock-in/out, staff pay, monthly schedules, home checklists, notes, reviews, and affiliate discounts.


## Global Navigation + Role Access Fix
Every page now has global navigation. Login and Demo are top-right. Demo lets buyers choose a user type. Open Dashboard routes to the selected role. Schedule is owner-only unless delegated by owner. Footer includes contact email for questions: support@email.com.
