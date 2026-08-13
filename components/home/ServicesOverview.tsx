import Link from 'next/link';
import ScrollReveal from '@/components/common/ScrollReveal';

const stages = [
  {
    number: '01',
    label: 'I Have an Idea',
    journey: 'Idea → Launch',
    description: 'Validate your idea, plan your MVP, and build it into something real.',
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
    description: 'Websites, apps, SaaS, AI products — we help you build faster and better.',
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
    label: 'Going to Market',
    journey: 'Product → Customers',
    description: 'Strategy, marketing, branding, and lead generation to reach the right people.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 25L5 16L8 13L12 17V3H16V17L20 13L23 16L14 25Z" />
      </svg>
    ),
  },
  {
    number: '04',
    label: 'Already Established',
    journey: 'Established → Scale',
    description: "AI, automation, new products, and hiring support to grow what you've built.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22L10 16L14 20L24 6" />
        <path d="M18 6H24V12" />
      </svg>
    ),
  },
];

export default function ServicesOverview() {
  return (
    <section className="py-24 md:py-32 bg-white grid-pattern">
      <div className="container-wide">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="overline text-[var(--color-accent)] mb-4 block">Our Services</span>
            <h2 className="font-heading font-bold text-[clamp(2rem,4vw,3rem)] tracking-tight mb-4 text-[var(--color-text-primary)]">
              We Help at Every Stage
            </h2>
            <div className="section-divider mx-auto mb-6" />
            <p className="text-lg text-[var(--color-text-secondary)] max-w-[560px] mx-auto leading-relaxed">
              Whether you&apos;re starting with an idea or scaling a business — we meet you where you are.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stages.map((stage, i) => (
            <ScrollReveal key={stage.number} delay={i * 100}>
              <div className="group relative h-full bg-white rounded-2xl p-7 border border-gray-100 hover:border-[var(--color-accent)]/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(0,0,0,0.06)] flex flex-col">
                <div className="w-14 h-14 rounded-xl bg-[var(--color-accent-light)] text-[var(--color-accent)] flex items-center justify-center mb-5 transition-all duration-400 group-hover:bg-[var(--color-accent)] group-hover:text-white group-hover:scale-105">
                  {stage.icon}
                </div>

                <span className="overline text-[var(--color-accent)] mb-1.5 block">Stage {stage.number}</span>
                <h3 className="font-heading font-bold text-lg tracking-tight mb-1">{stage.label}</h3>
                <span className="text-xs font-display font-semibold text-[var(--color-text-muted)] tracking-wider mb-4">{stage.journey}</span>

                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6 flex-grow">
                  {stage.description}
                </p>

                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 font-display font-semibold text-sm text-[var(--color-accent)] hover:gap-3 transition-all duration-300"
                >
                  Explore
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
