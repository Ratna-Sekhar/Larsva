import Link from 'next/link';
import ScrollReveal from '@/components/common/ScrollReveal';

export const metadata = {
  title: 'Offer Letter Verification | Larsva',
  description: 'Verify candidate offer letters before you hire. AI-assisted assessment of document consistency, suspicious signals, and employer details.',
};

export default function OfferLetterVerificationLanding() {
  return (
    <div className="bg-[var(--color-bg-dark)] min-h-screen pt-24 text-white font-body">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 grid-pattern-dark pointer-events-none opacity-50" />
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(0,194,168,0.08),transparent_60%)] rounded-full pointer-events-none" />
        
        <div className="container-wide relative z-10 text-center max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-xs font-display text-[var(--color-accent)] uppercase tracking-wider mb-6">
              Built for HR teams, recruiters and employers
            </span>
            <h1 className="font-heading font-bold text-4xl md:text-6xl lg:text-7xl leading-tight mb-8">
              Verify candidate offer letters <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">before you hire.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
              Upload an offer letter and get an AI-assisted assessment of document consistency, suspicious signals, employer details, compensation structure, formatting anomalies, and other indicators that may require HR review.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/products/offer-letter-verification/auth/signup" className="btn-primary w-full sm:w-auto px-8 py-4 text-lg justify-center">
                Verify an Offer Letter
                <svg className="btn-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/products/offer-letter-verification/auth/signin" className="btn-outline-light w-full sm:w-auto px-8 py-4 text-lg justify-center">
                Sign In
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/40">
              Documents are analyzed for verification and are not permanently stored.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-white text-[var(--color-bg-dark)]">
        <div className="container-wide px-6">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-heading font-bold text-3xl md:text-5xl mb-6">
                Before you hire, verify what you're looking at.
              </h2>
              <p className="text-lg text-gray-600">
                Recruiters increasingly receive candidate documents that may contain inconsistencies. Our tool helps you identify potential red flags quickly.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {problemCards.map((card, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 h-full hover:border-teal-200 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-6 text-teal-600">
                    {card.icon}
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-3">{card.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{card.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 relative overflow-hidden">
        <div className="container-wide px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-heading font-bold text-3xl md:text-5xl text-white mb-6">How it works</h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div className="relative p-8 rounded-2xl bg-white/5 border border-white/10 h-full flex flex-col items-center text-center">
                  <div className="text-[var(--color-accent)] font-display font-bold text-6xl mb-6 opacity-80">
                    {step.num}
                  </div>
                  <h3 className="font-heading font-semibold text-2xl text-white mb-4">{step.title}</h3>
                  <p className="text-white/60 leading-relaxed">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[var(--color-accent)] text-white text-center">
        <div className="container-wide px-6">
          <ScrollReveal>
            <h2 className="font-heading font-bold text-3xl md:text-5xl mb-8">Ready to streamline your verification process?</h2>
            <Link href="/products/offer-letter-verification/auth/signup" className="inline-flex items-center gap-2 bg-white text-[var(--color-accent)] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors">
              Start Verifying Now
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

const problemCards = [
  {
    title: 'Compensation',
    description: 'Identify unusual or inconsistent salary structures where components do not reconcile with the total.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
  },
  {
    title: 'Employer Details',
    description: 'Check consistency of company names, addresses, domains and contact information.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
  },
  {
    title: 'Dates & Timeline',
    description: 'Identify contradictory joining dates, offer dates or validity periods.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
  },
  {
    title: 'Document Consistency',
    description: 'Analyze formatting, terminology and internal consistency across different sections.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
  },
  {
    title: 'Suspicious Signals',
    description: 'Highlight unusual patterns that may warrant manual verification.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
  },
  {
    title: 'HR Review',
    description: 'Turn the findings into a clear recruiter-friendly assessment with recommended next steps.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  }
];

const steps = [
  { num: '01', title: 'Upload', desc: "Upload the candidate's offer letter as a PDF." },
  { num: '02', title: 'Analyze', desc: "The document is analyzed for consistency, suspicious signals and verification indicators." },
  { num: '03', title: 'Review', desc: "Receive a clear risk assessment with explanations and recommended next steps." },
];
