import type { Metadata } from 'next';
import Link from 'next/link';
import ScrollReveal from '@/components/common/ScrollReveal';

export const metadata: Metadata = {
  title: 'Tools — Powerful Free Tools by Larsva',
  description:
    'A growing suite of intelligent tools built for learners, educators, and professionals. DocForensics, Data Visualizer and more.',
  keywords: [
    'DocForensics',
    'PDF Metadata Analyzer',
    'Larsva Tools',
  ],
  openGraph: {
    title: 'Tools by Larsva — Powerful Free Tools for Professionals',
    description:
      'Fast, free, and beautifully crafted tools for professionals and educators.',
  },
};

const tools = [
  {
    slug: 'doc-forensics',
    title: 'DocForensics',
    description:
      'Upload a PDF to extract detailed metadata for forensic analysis — authorship, timestamps, security flags, file integrity hashes, and more.',
    icon: '🔍',
    iconBg: 'rgba(99, 102, 241, 0.15)',
    status: 'live' as const,
  },
  {
    slug: '',
    title: 'Data Visualizer',
    description:
      'Transform raw CSV or Excel data into stunning, interactive charts and dashboards instantly.',
    icon: '📊',
    iconBg: 'rgba(244, 63, 94, 0.12)',
    status: 'soon' as const,
  },
];

export default function ToolsPage() {
  return (
    <>
      {/* Hero */}
      <section className="gradient-hero pt-36 pb-20 px-6 md:px-10 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[50%] bg-[radial-gradient(circle,rgba(0,194,168,0.06),transparent_70%)] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[40%] bg-[radial-gradient(circle,rgba(0,168,146,0.04),transparent_70%)] rounded-full pointer-events-none" />
        <div className="mx-auto max-w-[900px] text-center relative z-10">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 bg-[rgba(0,194,168,0.1)] border border-[rgba(0,194,168,0.2)] rounded-full px-5 py-1.5 text-sm text-[var(--color-accent)] font-medium mb-8">
              <span className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full animate-pulse-dot" />
              Products by Larsva
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <h1 className="font-heading font-bold text-[clamp(2.5rem,6vw,4.5rem)] tracking-tight leading-[1.1] mb-6 text-white">
              Powerful{' '}
              <span className="gradient-text">Tools</span>
              <br />
              <span className="text-white/90">by Larsva</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="text-lg text-white/45 max-w-[600px] mx-auto leading-relaxed">
              A growing suite of intelligent tools built for learners, educators, and professionals. Fast, free, and beautifully crafted.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20 md:py-28 bg-[var(--color-bg-dark)] px-6 md:px-10 relative">
        <div className="absolute inset-0 grid-pattern-dark pointer-events-none" />
        <div className="mx-auto max-w-[1100px] relative z-10">
          <ScrollReveal>
            <span className="overline text-[var(--color-accent)] mb-4 block">✦ Some of Tools we have built</span>
            <h2 className="font-heading font-bold text-[clamp(1.8rem,3.5vw,2.5rem)] tracking-tight mb-10 text-white">
              What we&apos;ve built for you
            </h2>
          </ScrollReveal>

          <div className="tools-catalog-grid">
            {tools.map((tool, i) => {
              const isComingSoon = tool.status === 'soon';

              const cardContent = (
                <>
                  {!isComingSoon && (
                    <div className="tool-card-arrow">→</div>
                  )}
                  <div
                    className="tool-card-icon"
                    style={{ background: tool.iconBg }}
                  >
                    {tool.icon}
                  </div>
                  <h3>{tool.title}</h3>
                  <p className="tool-card-desc">{tool.description}</p>
                  <span className={`tool-tag ${tool.status === 'live' ? 'live' : 'soon'}`}>
                    {tool.status === 'live' ? '● LIVE' : 'COMING SOON'}
                  </span>
                </>
              );

              return (
                <ScrollReveal key={tool.slug || `coming-${i}`} delay={i * 80}>
                  {isComingSoon ? (
                    <div className="tool-catalog-card disabled">
                      {cardContent}
                    </div>
                  ) : (
                    <Link
                      href={`/products/${tool.slug}`}
                      className="tool-catalog-card"
                    >
                      {cardContent}
                    </Link>
                  )}
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 bg-[var(--color-bg-dark)] relative overflow-hidden border-t border-white/[0.04]">
        <div className="absolute top-[-30%] right-[-10%] w-[40%] h-[60%] bg-[radial-gradient(circle,rgba(0,194,168,0.06),transparent_70%)] rounded-full pointer-events-none" />
        <div className="mx-auto max-w-[600px] px-6 md:px-10 text-center relative z-10">
          <ScrollReveal>
            <h2 className="font-heading font-bold text-3xl tracking-tight mb-5 text-white">
              Have a tool idea?
            </h2>
            <p className="text-white/40 mb-10 leading-relaxed">
              We&apos;re constantly building new tools. If you have a specific need, let us know and we&apos;ll build it.
            </p>
            <Link href="/contact" className="btn-primary text-lg py-4 px-10 rounded-xl">
              Get in Touch
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
