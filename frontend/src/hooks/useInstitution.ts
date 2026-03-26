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
  fullName: 'Asesorías Educativas para el Desarrollo Regional',
  description: 'Institución educativa en Santander de Quilichao comprometida con la formación integral, ofreciendo programas técnicos en salud y educación básica y media para el progreso regional.',
  contact: {
    email: 'asederquilichao@gmail.com',
    phone: '3136327872 - 3186237156',
    address: {
      street: 'Calle 3 # 10-86',
      city: 'Santander de Quilichao',
      state: 'Cauca',
      zip: '191001',
    },
  },
  socials: {
    twitter: 'https://twitter.com/aseder',
    youtube: 'https://youtube.com/@aseder',
    instagram: 'https://instagram.com/aseder_quilichao',
  },
};

// ... (existing interface)

export function useInstitution() {
  return {
    ...institutionData,
    loading: false,
  };
}
