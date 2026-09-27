export type AffiliateOffer = {
  id: string;
  category: string;
  name: string;
  price: string;
  description: string;
  url: string;
};

// Add new entries here as you pick up more affiliate programs — each one
// just needs a category (used to group them), name, price, description,
// and your real referral URL.
export const AFFILIATE_OFFERS: AffiliateOffer[] = [
  {
    id: 'ghl-starter',
    category: 'GoHighLevel Agency',
    name: 'GHL Starter Plan',
    price: '$97/month',
    description: 'Run your own agency on GoHighLevel — up to 3 sub-accounts.',
    url: 'https://www.gohighlevel.com/?fp_ref=snbx',
  },
  {
    id: 'ghl-unlimited',
    category: 'GoHighLevel Agency',
    name: 'GHL Unlimited Plan',
    price: '$297/month',
    description: 'Unlimited sub-accounts, white-label options, and more automation.',
    url: 'https://www.gohighlevel.com/?fp_ref=snbx',
  },
  {
    id: 'ghl-pro',
    category: 'GoHighLevel Agency',
    name: 'GHL SaaS Pro Plan',
    price: '$497/month',
    description: 'Full white-label SaaS mode — resell GoHighLevel under your own brand.',
    url: 'https://www.gohighlevel.com/protrial-page?fp_ref=snbx',
  },
  {
    id: 'ghl-certified-admin',
    category: 'Certifications',
    name: 'GHL Certified Admin Exam',
    price: '$97/month',
    description: 'Get officially certified as a GoHighLevel administrator.',
    url: 'https://www.gohighlevel.com/certifications?fp_ref=ghl-sandbox47',
  },
];