export const NICHES = [
  {
    slug: 'real-estate',
    type: 'REAL_ESTATE',
    label: 'Real Estate',
    defaultStages: ['New Lead', 'Contacted', 'Showing Scheduled', 'Offer Made', 'Closed Won', 'Closed Lost'],
  },
  {
    slug: 'dental-med-spa',
    type: 'DENTAL_MED_SPA',
    label: 'Dental & Med Spa',
    defaultStages: ['New Inquiry', 'Consultation Scheduled', 'Consultation Completed', 'Treatment Plan Sent', 'Booked', 'Lost'],
  },
  {
    slug: 'coaching',
    type: 'COACHING',
    label: 'Coaches & Consultants',
    defaultStages: ['New Lead', 'Discovery Call Booked', 'Discovery Call Completed', 'Proposal Sent', 'Enrolled', 'Not a Fit'],
  },
  {
    slug: 'ecommerce',
    type: 'ECOMMERCE',
    label: 'E-commerce',
    defaultStages: ['New Lead', 'Quote Requested', 'Quote Sent', 'Negotiating', 'Won', 'Lost'],
  },
  {
    slug: 'agency',
    type: 'AGENCY',
    label: 'Marketing Agency',
    defaultStages: ['New Lead', 'Discovery Call', 'Proposal Sent', 'Contract Sent', 'Client Won', 'Lost'],
  },
  {
    slug: 'fitness',
    type: 'FITNESS',
    label: 'Fitness & Gyms',
    defaultStages: ['New Lead', 'Trial Booked', 'Trial Completed', 'Membership Offered', 'Member', 'Lost'],
  },
  {
    slug: 'home-services',
    type: 'HOME_SERVICES',
    label: 'Home Services',
    defaultStages: ['New Lead', 'Estimate Scheduled', 'Estimate Sent', 'Job Scheduled', 'Completed', 'Lost'],
  },
] as const;

export function getNicheBySlug(slug: string) {
  return NICHES.find((n) => n.slug === slug);
}