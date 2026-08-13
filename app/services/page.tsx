'use client';

import { useState } from 'react';
import Link from 'next/link';
import ScrollReveal from '@/components/common/ScrollReveal';

const stages = [
  {
    number: '01',
    label: 'I Have an Idea',
    journey: 'Idea → Launch',
    positioning: 'You bring the idea. We help turn it into something real.',
    services: [
      'Idea validation',
      'Business & product strategy',
      'MVP planning',
      'Website development',
      'App development',
      'Product development',
      'End-to-end execution',
    ],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="10" r="6" />
        <path d="M11 16v3a3 3 0 006 0v-3" />
        <path d="M14 22v3" />
        <line x1="10" y1="25" x2="18" y2="25" />
      </svg>
    ),
  },
  {
    number: '02',
    label: "I'm Building",
    journey: 'Build → Product',
    positioning: "Already building? Let's help you build faster and better.",
    services: [
      'Websites',
      'Web applications',
      'Mobile applications',
      'SaaS products',
      'AI-powered products',
      'Product enhancements',
      'API & third-party integrations',
    ],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6L3 14L8 22" />
        <path d="M20 6L25 14L20 22" />
        <path d="M16 3L12 25" />
      </svg>
    ),
  },
  {
    number: '03',
    label: "I'm Going to Market",
    journey: 'Product → Customers',
    positioning: "Your product is ready. Now let's get it in front of the right people.",
    services: [
      'Go-to-market strategy',
      'Marketing strategy',
      'Social media',
      'Content strategy',
      'Branding',
      'Lead generation',
      'Customer acquisition',
    ],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 25L5 16L8 13L12 17V3H16V17L20 13L23 16L14 25Z" />
      </svg>
    ),
  },
  {
    number: '04',
    label: "I'm Already Established",
    journey: 'Established → Scale',
    positioning: "Already running a business? Let's build what comes next.",
    services: [
      'New product development',
      'Existing product enhancement',
      'AI implementation',
      'Business process automation',
      'WhatsApp integrations',
      'Chatbots',
      'AI agents',
      'Hiring & talent support',
      'Technology consulting',
    ],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22L10 16L14 20L24 6" />
        <path d="M18 6H24V12" />
      </svg>
    ),
  },
];

const processSteps = [
  { title: 'Understand', description: 'We understand your idea, business and goals.' },
  { title: 'Plan', description: 'We identify what needs to happen next.' },
  { title: 'Build', description: 'We turn the plan into a working product or solution.' },
  { title: 'Scale', description: 'We help improve, automate, market and grow.' },
];

export default function ServicesPage() {
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  return (
    <>
      {/* Hero */}
      <section className="gradient-hero pt-36 pb-28 px-6 md:px-10 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-[radial-gradient(circle,rgba(0,194,168,0.08),transparent_70%)] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-[radial-gradient(circle,rgba(0,194,168,0.05),transparent_70%)] rounded-full pointer-events-none" />
        <div className="absolute inset-0 grid-pattern-dark pointer-events-none" />

        <div className="relative z-10 max-w-[800px] mx-auto text-center flex flex-col items-center">
          <div className="animate-fade-in-down inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 font-display font-medium text-sm text-white/70 mb-8">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse-dot" />
            Services
          </div>

          <h1 className="animate-fade-in-up delay-100 font-heading font-bold text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.08] tracking-[-0.02em] text-white mb-6">
            Where are you in{' '}
            <span className="gradient-text">your journey?</span>
          </h1>

          <p className="animate-fade-in-up delay-200 text-lg md:text-xl text-white/50 max-w-[600px] leading-relaxed mb-10">
            Tell us where you are. We&apos;ll help you figure out what&apos;s next.
          </p>

          <div className="animate-fade-in-up delay-300">
            <Link href="/contact" className="btn-primary text-[1.05rem] py-[18px] px-10">
              Start a Conversation
              <svg className="btn-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {/* Journey path visualization */}
          <div className="animate-fade-in-up delay-500 w-full max-w-[540px] mt-16">
            <svg viewBox="0 0 540 50" fill="none" className="w-full h-auto">
              {/* Connection lines */}
              <line x1="68" y1="25" x2="202" y2="25" stroke="url(#svc-line-grad)" strokeWidth="1.5" />
              <line x1="202" y1="25" x2="338" y2="25" stroke="url(#svc-line-grad)" strokeWidth="1.5" />
              <line x1="338" y1="25" x2="472" y2="25" stroke="url(#svc-line-grad)" strokeWidth="1.5" />

              {/* Nodes */}
              <circle cx="68" cy="25" r="6" fill="#00C2A8" fillOpacity="0.25" />
              <circle cx="68" cy="25" r="3" fill="#00C2A8" />
              <text x="68" y="46" textAnchor="middle" fill="white" fillOpacity="0.4" fontSize="9" fontFamily="var(--font-display)" fontWeight="600">IDEA</text>

              <circle cx="202" cy="25" r="6" fill="#00C2A8" fillOpacity="0.25" />
              <circle cx="202" cy="25" r="3" fill="#00C2A8" />
              <text x="202" y="46" textAnchor="middle" fill="white" fillOpacity="0.4" fontSize="9" fontFamily="var(--font-display)" fontWeight="600">BUILD</text>

              <circle cx="338" cy="25" r="6" fill="#00C2A8" fillOpacity="0.25" />
              <circle cx="338" cy="25" r="3" fill="#00C2A8" />
              <text x="338" y="46" textAnchor="middle" fill="white" fillOpacity="0.4" fontSize="9" fontFamily="var(--font-display)" fontWeight="600">MARKET</text>

              <circle cx="472" cy="25" r="8" fill="#00C2A8" fillOpacity="0.35" />
              <circle cx="472" cy="25" r="4" fill="#00C2A8" />
              <text x="472" y="46" textAnchor="middle" fill="white" fillOpacity="0.4" fontSize="9" fontFamily="var(--font-display)" fontWeight="600">SCALE</text>

              <defs>
                <linearGradient id="svc-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00C2A8" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#00C2A8" stopOpacity="0.6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </section>

      {/* Intro text */}
      <section className="py-16 md:py-20 bg-white px-6 md:px-10">
        <div className="mx-auto max-w-[720px] text-center">
          <ScrollReveal>
            <p className="text-lg md:text-xl text-[var(--color-text-secondary)] leading-relaxed">
              Whether you&apos;re starting with an idea, building your product, going to market, or scaling an established business — we&apos;re here to help you move forward.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* The Four Stages */}
      <section className="py-16 md:py-24 bg-[var(--color-bg-primary)] grid-pattern px-6 md:px-10">
        <div className="mx-auto max-w-[1100px]">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="overline text-[var(--color-accent)] mb-4 block">Your Journey</span>
              <h2 className="font-heading font-bold text-[clamp(2rem,4vw,3rem)] tracking-tight mb-4 text-[var(--color-text-primary)]">
                Find Your Stage
              </h2>
              <div className="section-divider mx-auto" />
            </div>
          </ScrollReveal>

          {/* Stage Cards with connected timeline */}
          <div className="relative">
            {/* Horizontal connector — desktop */}
            <div className="hidden lg:block absolute top-[52px] left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-[var(--color-accent)]/10 via-[var(--color-accent)]/25 to-[var(--color-accent)]/10 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {stages.map((stage, i) => (
                <ScrollReveal key={stage.number} delay={i * 100}>
                  <div
                    className={`group relative rounded-2xl border transition-all duration-500 cursor-pointer overflow-hidden ${
                      expandedStage === i
                        ? 'bg-[var(--color-bg-dark)] border-[var(--color-accent)]/30 shadow-[0_20px_60px_rgba(0,194,168,0.12)]'
                        : 'bg-white border-gray-100 hover:border-[var(--color-accent)]/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]'
                    }`}
                    onClick={() => setExpandedStage(expandedStage === i ? null : i)}
                  >
                    {/* Stage number dot */}
                    <div className="flex flex-col items-center pt-8 pb-6 px-6">
                      <div className={`w-[72px] h-[72px] rounded-full flex items-center justify-center mb-5 transition-all duration-500 ${
                        expandedStage === i
                          ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                          : 'bg-[var(--color-accent-light)] text-[var(--color-accent)] group-hover:bg-[var(--color-accent)]/10'
                      }`}>
                        {stage.icon}
                      </div>

                      <span className={`overline mb-2 transition-colors duration-300 ${
                        expandedStage === i ? 'text-[var(--color-accent)]' : 'text-[var(--color-accent)]'
                      }`}>
                        Stage {stage.number}
                      </span>

                      <h3 className={`font-heading font-bold text-lg tracking-tight text-center mb-1.5 transition-colors duration-300 ${
                        expandedStage === i ? 'text-white' : 'text-[var(--color-text-primary)]'
                      }`}>
                        {stage.label}
                      </h3>

                      <span className={`text-xs font-display font-semibold tracking-wider transition-colors duration-300 ${
                        expandedStage === i ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'
                      }`}>
                        {stage.journey}
                      </span>
                    </div>

                    {/* Expanded content */}
                    <div className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
                      expandedStage === i ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="px-6 pb-7">
                        <div className="h-px bg-white/10 mb-5" />

                        <p className="text-sm text-white/50 leading-relaxed mb-5 italic">
                          {stage.positioning}
                        </p>

                        <ul className="flex flex-col gap-2 mb-6">
                          {stage.services.map((service) => (
                            <li key={service} className="flex items-center gap-2.5 text-sm text-white/70">
                              <svg className="flex-shrink-0 text-[var(--color-accent)]" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M3 7L5.5 9.5L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              {service}
                            </li>
                          ))}
                        </ul>

                        <Link
                          href="/contact"
                          className="inline-flex items-center gap-2 text-sm font-display font-semibold text-[var(--color-accent)] hover:gap-3 transition-all duration-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Explore
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Link>
                      </div>
                    </div>

                    {/* Expand hint when collapsed */}
                    {expandedStage !== i && (
                      <div className="px-6 pb-5 pt-0">
                        <p className="text-xs text-[var(--color-text-muted)] text-center font-display">
                          Click to explore →
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Not Sure Section */}
      <section className="py-20 md:py-28 bg-white px-6 md:px-10">
        <div className="mx-auto max-w-[640px] text-center">
          <ScrollReveal>
            <div className="p-10 md:p-14 rounded-3xl bg-[var(--color-bg-primary)] border border-gray-100">
              <div className="w-14 h-14 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center mx-auto mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9 9a3 3 0 015.12 1c0 2-3.12 2-3.12 4" />
                  <circle cx="12" cy="18" r="0.5" fill="var(--color-accent)" />
                </svg>
              </div>

              <h2 className="font-heading font-bold text-2xl md:text-3xl tracking-tight mb-4 text-[var(--color-text-primary)]">
                Not sure which stage you&apos;re in?
              </h2>

              <p className="text-[var(--color-text-secondary)] leading-relaxed mb-8">
                Tell us what you&apos;re trying to build. We&apos;ll figure out the rest.
              </p>

              <Link href="/contact" className="btn-primary py-4 px-8 rounded-xl">
                Talk to Larsva
                <svg className="btn-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How We Help */}
      <section className="py-20 md:py-28 bg-[var(--color-bg-dark)] grid-pattern-dark relative overflow-hidden px-6 md:px-10">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[50%] bg-[radial-gradient(circle,rgba(0,194,168,0.06),transparent_70%)] rounded-full pointer-events-none" />

        <div className="container-wide relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="overline text-[var(--color-accent)] mb-4 block">How We Help</span>
              <h2 className="font-heading font-bold text-[clamp(2rem,4vw,2.5rem)] tracking-tight mb-4 text-white">
                Understand <span className="gradient-text">→</span> Plan <span className="gradient-text">→</span> Build <span className="gradient-text">→</span> Scale
              </h2>
              <div className="section-divider mx-auto" />
            </div>
          </ScrollReveal>

          <div className="relative">
            {/* Horizontal connector — desktop */}
            <div className="hidden md:block absolute top-[48px] left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-[var(--color-accent)]/15 via-[var(--color-accent)]/30 to-[var(--color-accent)]/15" />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
              {processSteps.map((step, i) => (
                <ScrollReveal key={step.title} delay={i * 120}>
                  <div className="relative flex flex-col items-center text-center">
                    <div className="relative z-10 w-24 h-24 rounded-full bg-[var(--color-bg-dark-card)] border border-white/8 flex items-center justify-center mb-6 transition-all duration-500 hover:border-[var(--color-accent)]/25 hover:shadow-[0_0_40px_rgba(0,194,168,0.08)]">
                      <span className="font-heading font-bold text-xl text-[var(--color-accent)]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-lg text-white mb-2 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-white/40 text-sm leading-relaxed max-w-[240px]">
                      {step.description}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 bg-white px-6 md:px-10 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[50%] bg-[radial-gradient(circle,rgba(0,194,168,0.04),transparent_70%)] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-[660px] text-center relative z-10">
          <ScrollReveal>
            <h2 className="font-heading font-bold text-[clamp(1.8rem,4vw,2.8rem)] tracking-tight mb-4 text-[var(--color-text-primary)] leading-tight">
              You don&apos;t need everything figured out.
            </h2>
            <h3 className="font-heading font-semibold text-xl md:text-2xl tracking-tight mb-6 text-[var(--color-text-secondary)]">
              You just need to know what you&apos;re trying to build.
            </h3>

            <p className="text-[var(--color-text-muted)] text-lg leading-relaxed mb-10">
              Let&apos;s figure out the next step together.
            </p>

            <Link href="/contact" className="btn-primary text-lg py-5 px-10 rounded-xl">
              Start a Conversation
              <svg className="btn-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
