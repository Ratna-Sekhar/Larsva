import type { Metadata } from 'next';
import Link from 'next/link';
import ScrollReveal from '@/components/common/ScrollReveal';
import OpenOrbit from '@/components/home/OpenOrbit';

export const metadata: Metadata = {
  title: 'About Us — Our Story & Mission',
  description: 'Larsva was created to bridge the gap between great startup ideas and successful execution. Learn about our mission to empower aspiring founders.',
  keywords: ['Startup Consulting India', 'Founder Advisory Services', 'Startup Launch Services'],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Larsva — Helping Founders Move From Idea To Execution',
    description: 'Learn how Larsva helps working professionals validate startup ideas, build MVPs, and launch professionally.',
  },
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="gradient-hero pt-36 pb-24 px-6 md:px-10 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[50%] bg-[radial-gradient(circle,rgba(0,194,168,0.06),transparent_70%)] rounded-full pointer-events-none" />
        <div className="mx-auto max-w-[800px] text-center relative z-10">
          <span className="overline text-[var(--color-accent)] mb-5 block">About Us</span>
          <h1 className="font-heading font-bold text-[clamp(2.5rem,5vw,4rem)] tracking-tight leading-tight mb-6 text-white">
            Helping Founders Move From{' '}
            <span className="gradient-text">Idea To Execution</span>
          </h1>
          <div className="section-divider mx-auto mb-6" />
          <p className="text-lg text-white/45 max-w-[560px] mx-auto leading-relaxed">
            We believe every aspiring founder deserves a structured path from concept to launch.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-20 bg-white">
        <div className="mx-auto max-w-[800px] px-6 md:px-10">
          <ScrollReveal>
            <span className="overline text-[var(--color-accent)] mb-4 block">Our Story</span>
            <h2 className="font-heading font-bold text-3xl tracking-tight mb-8">Why We Exist</h2>
            <div className="flex flex-col gap-6 text-[var(--color-text-secondary)] leading-[1.8]">
              <p>
                Most founders don&apos;t fail because they lack ideas. They fail because they lack
                validation, execution, and structure.
              </p>
              <p>
                We saw ambitious working professionals with brilliant startup ideas but no clear
                path to bring them to life. They were stuck between the security of their jobs and
                the dream of building something meaningful. Many wasted months researching, second-guessing,
                and building features nobody needed.
              </p>
              <p>
                Larsva was created to bridge that gap — to give aspiring founders the structured
                framework, expert guidance, and execution support they need to validate ideas, build
                MVPs, and launch professionally, without quitting their jobs or assembling a full startup team.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>



      {/* Vision & Mission */}
      <section className="py-16 md:py-20 bg-[var(--color-bg-dark)] grid-pattern-dark relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[50%] bg-[radial-gradient(circle,rgba(0,194,168,0.06),transparent_70%)] rounded-full pointer-events-none" />
        <div className="mx-auto max-w-[900px] px-6 md:px-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ScrollReveal>
              <div className="p-8 rounded-2xl bg-[var(--color-bg-dark-card)] border border-white/8 h-full">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/15 text-[var(--color-accent)] flex items-center justify-center mb-5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-xl tracking-tight mb-3 text-white">Our Vision</h3>
                <p className="text-white/45 leading-relaxed">
                  To empower aspiring founders to build successful startups through structured
                  validation and execution.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div className="p-8 rounded-2xl bg-[var(--color-bg-dark-card)] border border-white/8 h-full">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/15 text-[var(--color-accent)] flex items-center justify-center mb-5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-xl tracking-tight mb-3 text-white">Our Mission</h3>
                <p className="text-white/45 leading-relaxed">
                  Reduce startup failure by helping founders make informed decisions before
                  investing significant time and money.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Community */}
      <OpenOrbit />

      {/* CTA */}
      <section className="py-24 bg-[var(--color-bg-dark)] relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-[40%] h-[60%] bg-[radial-gradient(circle,rgba(0,194,168,0.06),transparent_70%)] rounded-full pointer-events-none" />
        <div className="mx-auto max-w-[600px] px-6 md:px-10 text-center relative z-10">
          <h2 className="font-heading font-bold text-3xl tracking-tight mb-5 text-white">
            Ready to start your founder journey?
          </h2>
          <p className="text-white/40 mb-10 leading-relaxed">
            Request a founder consultation and let&apos;s explore your startup idea together.
          </p>
          <Link href="/contact" className="btn-primary text-lg py-4 px-10 rounded-xl">
            Request Founder Consultation
            <svg className="btn-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
