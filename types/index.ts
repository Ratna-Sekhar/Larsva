export interface NavLink {
  label: string;
  href: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  category: 'validation' | 'mvp' | 'launch';
  problem: string;
  approach: string;
  outcome: string;
  tags: string[];
  image?: string;
  url?: string;
}

export interface ConsultationFormData {
  fullName: string;
  email: string;
  phone: string;
  startupIdea: string;
}
