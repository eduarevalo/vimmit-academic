export interface InstitutionData {
  slug: string;
  name: string;
  fullName: string;
  description: string;
  contact: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  socials: {
    twitter: string;
    youtube: string;
    instagram: string;
    facebook?: string;
    linkedin?: string;
  };
}

const institutionData: InstitutionData = {
  slug: 'aseder',
  name: 'Aseder',
  fullName: 'Aseder University',
  description: 'A prestigious university dedicated to the development of the next generation of global leaders, thinkers, and creators.',
  contact: {
    email: 'info@aseder.edu.co',
    phone: '(555) 123-4567',
    address: {
      street: '123 University Ave',
      city: 'City',
      state: 'State',
      zip: '12345',
    },
  },
  socials: {
    twitter: 'https://twitter.com/academia',
    youtube: 'https://youtube.com/academia',
    instagram: 'https://instagram.com/academia',
  },
};

// ... (existing interface)

export function useInstitution() {
  return {
    ...institutionData,
    loading: false,
  };
}
