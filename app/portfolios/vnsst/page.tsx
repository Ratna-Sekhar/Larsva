import type { Metadata } from 'next';
import Image from 'next/image';
import './portfolio.css';

export const metadata: Metadata = {
  title: 'V.N.S. Satya Teja — CTO at Larsva',
  description:
    'Portfolio of V.N.S. Satya Teja — CTO at Larsva. Half a decade of experience building software products and working in AI at Goldman Sachs, Deloitte, and more.',
  openGraph: {
    title: 'V.N.S. Satya Teja — CTO at Larsva',
    description:
      'Portfolio of V.N.S. Satya Teja — CTO at Larsva. Half a decade of experience building software products and working in AI.',
  },
};

export default function VNSSTPortfolioPage() {
  return (
    <>
      {/* Hide site-wide Navbar and Footer on portfolio page */}
      <style>{`
        nav, #site-footer { display: none !important; }
      `}</style>

      <div className="portfolio-page">
        {/* ===== Animated Background ===== */}
        <div className="portfolio-bg">
          <div className="portfolio-bg-orb portfolio-bg-orb--1" />
          <div className="portfolio-bg-orb portfolio-bg-orb--2" />
          <div className="portfolio-bg-orb portfolio-bg-orb--3" />
          <div className="portfolio-bg-grid" />
        </div>

        {/* ===== Hero Section ===== */}
        <section className="portfolio-hero">
          <div className="portfolio-hero-inner">
            {/* Photo */}
            <div className="portfolio-photo-wrap">
              <div className="portfolio-photo-ring" />
              <div className="portfolio-photo-glow" />
              <Image
                src="/images/vnsst-photo.jpg"
                alt="V.N.S. Satya Teja"
                width={280}
                height={280}
                className="portfolio-photo"
                priority
              />
              {/* Status badge */}
              <div className="portfolio-status-badge">
                <span className="portfolio-status-dot" />
                Available for collaborations
              </div>
            </div>

            {/* Info */}
            <div className="portfolio-hero-info">
              <div className="portfolio-overline">PORTFOLIO</div>
              <h1 className="portfolio-name">
                V.N.S.{' '}
                <span className="portfolio-name-accent">Satya Teja</span>
              </h1>
              <p className="portfolio-designation">
                <span className="portfolio-designation-icon">⚡</span>
                Chief Technology Officer at{' '}
                <a
                  href="https://larsva.com"
                  className="portfolio-larsva-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Larsva
                </a>
              </p>
              <p className="portfolio-tagline">
                Building the future with code, strategy &amp; relentless
                curiosity.
              </p>

              {/* CTA buttons */}
              <div className="portfolio-cta-row">
                <a href="mailto:vnsst123@gmail.com" className="portfolio-btn-primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  Get in Touch
                </a>
                <a
                  href="https://www.instagram.com/vnsst_1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portfolio-btn-outline"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Stats Bar ===== */}
        <section className="portfolio-stats">
          <div className="portfolio-stats-inner">
            <div className="portfolio-stat">
              <span className="portfolio-stat-number">5+</span>
              <span className="portfolio-stat-label">Years Experience</span>
            </div>
            <div className="portfolio-stat-divider" />
            <div className="portfolio-stat">
              <span className="portfolio-stat-number">AI</span>
              <span className="portfolio-stat-label">Core Expertise</span>
            </div>
            <div className="portfolio-stat-divider" />
            <div className="portfolio-stat">
              <span className="portfolio-stat-number">CTO</span>
              <span className="portfolio-stat-label">Current Role</span>
            </div>
            <div className="portfolio-stat-divider" />
            <div className="portfolio-stat">
              <span className="portfolio-stat-number">♞</span>
              <span className="portfolio-stat-label">Rated Chess Player</span>
            </div>
          </div>
        </section>

        {/* ===== About Section ===== */}
        <section className="portfolio-section">
          <div className="portfolio-section-inner">
            <div className="portfolio-section-label">
              <span className="portfolio-section-label-dot" />
              About Me
            </div>
            <div className="portfolio-about-grid">
              <div className="portfolio-about-card portfolio-about-card--main">
                <div className="portfolio-about-card-icon">🚀</div>
                <h3>Experience &amp; Background</h3>
                <p>
                  Half a decade of experience building software products and
                  working in AI at prestigious firms like{' '}
                  <strong>Goldman Sachs</strong>,{' '}
                  <strong>Deloitte</strong>, and more. Passionate about
                  transforming complex problems into elegant, scalable
                  solutions.
                </p>
              </div>
              <div className="portfolio-about-card">
                <div className="portfolio-about-card-icon">♟️</div>
                <h3>Fun Fact</h3>
                <p>
                  Internationally rated Chess player — bringing the same
                  strategic thinking and calculated precision from the
                  chessboard to software architecture and business decisions.
                </p>
              </div>
              <div className="portfolio-about-card">
                <div className="portfolio-about-card-icon">🎯</div>
                <h3>What I Do at Larsva</h3>
                <p>
                  As CTO, I lead the technical vision — from product architecture
                  and AI integrations to building tools that empower founders
                  and professionals worldwide.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Experience Timeline ===== */}
        <section className="portfolio-section portfolio-section--dark">
          <div className="portfolio-section-inner">
            <div className="portfolio-section-label portfolio-section-label--light">
              <span className="portfolio-section-label-dot" />
              Career Journey
            </div>
            <div className="portfolio-timeline">
              <div className="portfolio-timeline-item">
                <div className="portfolio-timeline-marker">
                  <div className="portfolio-timeline-marker-dot" />
                  <div className="portfolio-timeline-marker-line" />
                </div>
                <div className="portfolio-timeline-content">
                  <span className="portfolio-timeline-badge">Current</span>
                  <h4>Chief Technology Officer</h4>
                  <p className="portfolio-timeline-company">Larsva</p>
                  <p className="portfolio-timeline-desc">
                    Leading technology strategy, product development, and AI
                    innovation. Building tools and platforms for aspiring
                    founders.
                  </p>
                </div>
              </div>
              <div className="portfolio-timeline-item">
                <div className="portfolio-timeline-marker">
                  <div className="portfolio-timeline-marker-dot" />
                  <div className="portfolio-timeline-marker-line" />
                </div>
                <div className="portfolio-timeline-content">
                  <h4>Software Engineering &amp; AI</h4>
                  <p className="portfolio-timeline-company">Goldman Sachs</p>
                  <p className="portfolio-timeline-desc">
                    Worked on cutting-edge software products and AI solutions at
                    one of the world&apos;s premier financial institutions.
                  </p>
                </div>
              </div>
              <div className="portfolio-timeline-item">
                <div className="portfolio-timeline-marker">
                  <div className="portfolio-timeline-marker-dot" />
                </div>
                <div className="portfolio-timeline-content">
                  <h4>Technology Consulting</h4>
                  <p className="portfolio-timeline-company">Deloitte</p>
                  <p className="portfolio-timeline-desc">
                    Delivered enterprise-scale technology consulting, building
                    innovative software solutions for global clients.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Contact Section ===== */}
        <section className="portfolio-section portfolio-contact-section">
          <div className="portfolio-section-inner">
            <div className="portfolio-section-label">
              <span className="portfolio-section-label-dot" />
              Get in Touch
            </div>
            <div className="portfolio-contact-grid">
              <a href="mailto:vnsst123@gmail.com" className="portfolio-contact-card">
                <div className="portfolio-contact-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <span className="portfolio-contact-label">Email</span>
                <span className="portfolio-contact-value">vnsst123@gmail.com</span>
              </a>
              <a href="tel:+919133804790" className="portfolio-contact-card">
                <div className="portfolio-contact-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <span className="portfolio-contact-label">Phone</span>
                <span className="portfolio-contact-value">+91 91338 04790</span>
              </a>
              <a
                href="https://www.instagram.com/vnsst_1/"
                target="_blank"
                rel="noopener noreferrer"
                className="portfolio-contact-card"
              >
                <div className="portfolio-contact-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </div>
                <span className="portfolio-contact-label">Instagram</span>
                <span className="portfolio-contact-value">@vnsst_1</span>
              </a>
              <a
                href="https://larsva.com"
                target="_blank"
                rel="noopener noreferrer"
                className="portfolio-contact-card"
              >
                <div className="portfolio-contact-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
                <span className="portfolio-contact-label">Website</span>
                <span className="portfolio-contact-value">larsva.com</span>
              </a>
            </div>
          </div>
        </section>

        {/* ===== Footer ===== */}
        <footer className="portfolio-footer">
          <p>
            &copy; {new Date().getFullYear()} V.N.S. Satya Teja · Built with ♥
            at{' '}
            <a
              href="https://larsva.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Larsva
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}
