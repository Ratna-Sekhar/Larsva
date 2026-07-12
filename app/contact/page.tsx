import type { Metadata } from 'next';
import ConsultationForm from '@/components/forms/ConsultationForm';
import ScrollReveal from '@/components/common/ScrollReveal';

export const metadata: Metadata = {
  title: 'Contact Us — Request a Founder Consultation',
  description: 'Request a founder consultation with Larsva. Share your startup idea and we\'ll contact you within 24 hours to discuss validation, MVP development, or launch support.',
  keywords: ['Contact Larsva', 'Startup Consultation India', 'Founder Advisory Contact'],
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Larsva — Let\'s Build Something Meaningful',
    description: 'Share your startup idea. We\'ll help you validate it, build your MVP, and launch professionally.',
  },
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="gradient-hero pt-36 pb-20 px-6 md:px-10 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[50%] bg-[radial-gradient(circle,rgba(0,194,168,0.06),transparent_70%)] rounded-full pointer-events-none" />
        <div className="mx-auto max-w-[800px] text-center relative z-10">
          <span className="overline text-[var(--color-accent)] mb-5 block">Contact Us</span>
          <h1 className="font-heading font-bold text-[clamp(2.5rem,5vw,4rem)] tracking-tight leading-tight mb-6 text-white">
            Let&apos;s Build Something{' '}
            <span className="gradient-text">Meaningful</span>
          </h1>
          <div className="section-divider mx-auto mb-6" />
          <p className="text-lg text-white/45 max-w-[520px] mx-auto leading-relaxed">
            Share your startup idea. We&apos;ll help you validate it, build your MVP, and launch professionally.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section id="consultation-form" className="py-20 md:py-28 bg-white grid-pattern">
        <div className="mx-auto max-w-[1100px] px-6 md:px-10">
          <div className="flex flex-col md:flex-row gap-16 md:gap-20 items-start">
            {/* Left: Info */}
            <div className="flex-1 max-w-[420px]">
              <ScrollReveal>
                <h2 className="font-heading font-bold text-2xl tracking-tight mb-6">
                  Request a Founder Consultation
                </h2>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-10">
                  Tell us about your startup idea and we&apos;ll reach out within 24 hours to discuss how we can help you move forward.
                </p>

                <div className="flex flex-col gap-7">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[var(--color-accent-light)] flex items-center justify-center flex-shrink-0 text-[var(--color-accent)]">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M3 5L10 11L17 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-sm mb-1">Email</h3>
                      <a href="mailto:satya@larsva.com" className="text-sm text-[var(--color-accent)] hover:underline">
                        satya@larsva.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[var(--color-accent-light)] flex items-center justify-center flex-shrink-0 text-[var(--color-accent)]">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M2 3h5l2 5-3 2a11 11 0 005 5l2-3 5 2v5a2 2 0 01-2 2A18 18 0 012 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-sm mb-1">Phone</h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">Available upon request</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[var(--color-accent-light)] flex items-center justify-center flex-shrink-0 text-[var(--color-accent)]">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M10 6V10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-sm mb-1">Response Time</h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">Within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[var(--color-accent-light)] flex items-center justify-center flex-shrink-0 text-[var(--color-accent)]">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 2L13 8L20 9L15 14L16 20L10 17L4 20L5 14L0 9L7 8L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-sm mb-1">Confidential</h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        Your startup idea is kept completely confidential.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right: Form */}
            <div className="flex-1 w-full">
              <ScrollReveal delay={150}>
                <div className="bg-white rounded-2xl p-8 md:p-10 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                  <ConsultationForm />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
