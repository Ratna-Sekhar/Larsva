import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import ScrollReveal from '@/components/common/ScrollReveal';
import type { CaseStudy } from '@/types';

export const metadata: Metadata = {
  title: 'Our Works — Portfolio & Case Studies',
  description: 'Explore startup validation projects, MVP development case studies, and launch support work by Larsva. See how we help founders go from idea to launch.',
  keywords: ['Startup Portfolio', 'MVP Case Studies', 'Startup Validation Projects'],
  openGraph: {
    title: 'Our Works — Larsva Portfolio & Case Studies',
    description: 'See how Larsva helps founders validate ideas, build MVPs, and launch startups.',
  },
};

const categories = [
  {
    id: 'validation-projects',
    title: 'Startup Validation Projects',
    description: 'Ideas we helped founders validate before they invested.',
  },
  {
    id: 'mvp-projects',
    title: 'MVP Development Projects',
    description: 'Products we built from validated ideas to launch-ready MVPs.',
  },
  {
    id: 'launch-projects',
    title: 'Launch Support Projects',
    description: 'Startups we helped prepare for growth and customer acquisition.',
  },
];

const caseStudies: CaseStudy[] = [
  {
    id: 'manapgrent',
    title: 'Mana PG Rent',
    category: 'mvp',
    problem: 'Finding and managing PG accommodations was fragmented across multiple platforms with no unified experience for tenants or landlords.',
    approach: 'Built a seamless web platform with property listings, search filters, and a management dashboard. Focused on mobile-first design and fast load times.',
    outcome: 'Launched a fully functional PG rental platform that streamlined the discovery and booking process for both tenants and property owners.',
    tags: ['Web App', 'Real Estate', 'MVP'],
    image: '/images/manapgrent.png',
    url: 'https://manapgrent.in/',
  },
  {
    id: 'bschoolofai',
    title: 'B School of AI',
    category: 'mvp',
    problem: 'Aspiring AI professionals lacked a structured, accessible platform for learning business applications of artificial intelligence.',
    approach: 'Designed and developed an educational platform with course modules, resource libraries, and a modern learning experience. Optimized for engagement and retention.',
    outcome: 'Created a comprehensive EdTech platform that empowers the next generation with cutting-edge AI education and career resources.',
    tags: ['EdTech', 'AI', 'Platform'],
    image: '/images/bschoolofai.png',
    url: 'https://bschoolofai.com',
  },
  {
    id: 'flycastles',
    title: 'Fly Castles',
    category: 'mvp',
    problem: 'Existing travel booking platforms lacked premium design quality and failed to deliver the aspirational experience that luxury travelers expect.',
    approach: 'Crafted a premium travel and accommodation booking experience with stunning visual design, fluid interactions, and an intuitive booking flow.',
    outcome: 'Delivered a visually premium travel platform that elevated the booking experience and positioned the brand in the luxury travel segment.',
    tags: ['Travel', 'Booking', 'Premium'],
    image: '/images/flycastles.png',
    url: 'https://flycastles.com',
  },
  // Placeholder validation project
  {
    id: 'validation-1',
    title: 'HealthTech Validation',
    category: 'validation',
    problem: 'A working professional had three healthcare-related startup ideas but lacked clarity on which had the best market potential.',
    approach: 'Conducted comprehensive market analysis, competitor mapping, TAM/SAM/SOM sizing, and customer interviews for all three ideas.',
    outcome: 'Identified the strongest opportunity with a clear Go recommendation. Founder proceeded to MVP development with validated confidence.',
    tags: ['HealthTech', 'Validation', 'Market Analysis'],
  },
  // Placeholder launch project
  {
    id: 'launch-1',
    title: 'SaaS Launch Preparation',
    category: 'launch',
    problem: 'A founder had a working MVP but zero online presence — no LinkedIn page, no SEO, no content strategy for launch.',
    approach: 'Set up professional social profiles, implemented SEO fundamentals, created launch content calendar, and developed a hiring plan.',
    outcome: 'Founder launched with a professional online presence, organic traffic foundations, and a clear growth roadmap.',
    tags: ['SaaS', 'Launch', 'SEO'],
  },
];

export default function WorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-24 px-6 md:px-10 gradient-hero relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[radial-gradient(circle,rgba(0,194,168,0.06),transparent_70%)] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[radial-gradient(circle,rgba(0,194,168,0.04),transparent_70%)] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-[800px] text-center relative z-10">
          <span className="overline text-[var(--color-accent)] mb-5 block">Portfolio</span>
          <h1 className="font-heading font-bold text-[clamp(2.5rem,5vw,4rem)] tracking-tight leading-tight mb-6 text-white">
            Our Works<span className="gradient-text">.</span>
          </h1>
          <div className="section-divider mx-auto mb-6" />
          <p className="text-lg text-white/45 max-w-[600px] mx-auto leading-relaxed">
            Real projects. Real founders. Real results. Here&apos;s how we&apos;ve helped founders go from idea to launch.
          </p>
        </div>
      </section>

      {/* Case Studies by Category */}
      {categories.map((category, catIndex) => {
        const categoryMap: Record<string, CaseStudy['category']> = {
          'validation-projects': 'validation',
          'mvp-projects': 'mvp',
          'launch-projects': 'launch',
        };
        const filteredStudies = caseStudies.filter(
          (study) => study.category === categoryMap[category.id]
        );

        return (
          <section
            key={category.id}
            id={category.id}
            className={`py-20 md:py-24 px-6 md:px-10 ${
              catIndex % 2 === 0 ? 'bg-white' : 'bg-[var(--color-bg-primary)]'
            } ${catIndex === 0 ? 'grid-pattern' : ''}`}
          >
            <div className="mx-auto max-w-[1100px]">
              <ScrollReveal>
                <div className="mb-12">
                  <span className="overline text-[var(--color-accent)] mb-3 block">
                    {category.id.replace('-projects', '').replace('-', ' ')}
                  </span>
                  <h2 className="font-heading font-bold text-2xl tracking-tight mb-2">
                    {category.title}
                  </h2>
                  <p className="text-[var(--color-text-secondary)]">{category.description}</p>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudies.map((study, i) => (
                  <ScrollReveal key={study.id} delay={i * 100}>
                    <div className="group h-full flex flex-col bg-white rounded-2xl border border-gray-100 hover:border-[var(--color-accent)]/20 shadow-sm hover:shadow-[0_16px_48px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                      {/* Top accent bar */}
                      {study.image ? (
                        <div className="relative w-full h-48 overflow-hidden">
                          <Image
                            src={study.image}
                            alt={`${study.title} screenshot`}
                            fill
                            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="h-1.5 w-full gradient-teal" />
                      )}

                      <div className="p-7 flex flex-col flex-grow">
                        {/* Tags */}
                        <div className="flex gap-2 mb-4 flex-wrap">
                          {study.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] tracking-wider uppercase"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <h3 className="font-heading font-bold text-xl mb-4 text-gray-900">
                          {study.title}
                        </h3>

                        {/* Problem / Approach / Outcome */}
                        <div className="flex flex-col gap-4 flex-grow">
                          <div>
                            <h4 className="font-display font-semibold text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                              Problem
                            </h4>
                            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                              {study.problem}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-display font-semibold text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                              Approach
                            </h4>
                            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                              {study.approach}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-display font-semibold text-xs text-[var(--color-accent)] uppercase tracking-wider mb-1">
                              Outcome
                            </h4>
                            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed font-medium">
                              {study.outcome}
                            </p>
                          </div>
                        </div>

                        {study.url && (
                          <a
                            href={study.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 inline-flex items-center gap-2 text-sm font-display font-semibold text-[var(--color-accent)] hover:gap-3 transition-all duration-300"
                          >
                            Visit Project
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Coming Soon */}
      <section className="py-20 md:py-24 px-6 md:px-10 bg-[var(--color-bg-dark)] grid-pattern-dark">
        <div className="mx-auto max-w-[800px] text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-dot" />
              <span className="text-sm text-white/60 font-display font-medium">Coming Soon</span>
            </div>
            <h2 className="font-heading font-bold text-2xl tracking-tight mb-4 text-white">
              More Startups Launching Through Larsva
            </h2>
            <p className="text-white/40 leading-relaxed mb-8 max-w-[480px] mx-auto">
              We&apos;re currently working with founders on exciting new ventures. Case studies will be added as projects launch.
            </p>
            <Link href="/contact" className="btn-primary inline-flex">
              Request Founder Consultation
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
