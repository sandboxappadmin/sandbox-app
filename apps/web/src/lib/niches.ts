export const NICHES = [
  { slug: 'real-estate', type: 'REAL_ESTATE', label: 'Real Estate' },
  { slug: 'dental-med-spa', type: 'DENTAL_MED_SPA', label: 'Dental & Med Spa' },
  { slug: 'coaching', type: 'COACHING', label: 'Coaches & Consultants' },
  { slug: 'ecommerce', type: 'ECOMMERCE', label: 'E-commerce' },
  { slug: 'agency', type: 'AGENCY', label: 'Marketing Agency' },
  { slug: 'fitness', type: 'FITNESS', label: 'Fitness & Gyms' },
  { slug: 'home-services', type: 'HOME_SERVICES', label: 'Home Services' },
] as const;

export function getNicheBySlug(slug: string) {
    return NICHES.find((n) => n.slug === slug);
}