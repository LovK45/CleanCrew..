const CONFIG = {
  APP_NAME: "CleanCrew Empire™",
  MODE: "live",
  OFFER_TYPE: "downloadable-package-email",
  APPS_SCRIPT_URL: "REPLACE_WITH_GOOGLE_APPS_SCRIPT_WEB_APP_URL",
  CONTACT_EMAIL: "tha.doll.house@icloud.com",
  AUTOMATIC_EMAIL_DELIVERY: true,
  STRIPE_LINKS: {
    starter: "REPLACE_WITH_STRIPE_STARTER_LINK",
    pro: "REPLACE_WITH_STRIPE_PRO_LINK",
    elite: "REPLACE_WITH_STRIPE_ELITE_LINK",
    business: "REPLACE_WITH_STRIPE_BUSINESS_LINK",
    sponsor: "REPLACE_WITH_STRIPE_SPONSOR_LINK",
    reseller: "https://buy.stripe.com/aFa6oG2OJg4R4HPa5t4c800"
  }
};
window.CONFIG = CONFIG;
const STAFF_WORKFLOW = {
  roles:["owner","admin","staff","client","affiliate"],
  payModes:["Hourly","Per Home","Per Job","Team Split"],
  affiliateDiscountEnabled:true
};
