import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center gradient-hero overflow-hidden px-6 md:px-10 pt-[120px] pb-24">
      {/* Ambient glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-[radial-gradient(circle,rgba(0,194,168,0.08),transparent_70%)] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-[radial-gradient(circle,rgba(0,194,168,0.05),transparent_70%)] rounded-full pointer-events-none" />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 grid-pattern-dark pointer-events-none" />

      <div className="relative z-10 max-w-[900px] text-center flex flex-col items-center">
        {/* Badge */}
        <div className="animate-fade-in-down inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 font-display font-medium text-sm text-white/70 mb-8">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse-dot" />
          Startup Studio · Founder Advisory
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-100 font-heading font-bold text-[clamp(2.5rem,6vw,4.8rem)] leading-[1.08] tracking-[-0.02em] text-white mb-6">
          Turn Your Startup Idea Into a{' '}
          <span className="gradient-text">Launch-Ready Business</span>
        </h1>

        {/* Subtext */}
        <p className="animate-fade-in-up delay-200 text-lg md:text-xl text-white/50 max-w-[640px] leading-relaxed mb-10">
          Larsva helps early stage startups and aspiring founders validate startup ideas, build MVPs, and launch professionally — without hiring a full team or taking unnecessary risks.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4 items-center justify-center mb-16 w-full sm:w-auto">
          <Link href="/contact" className="btn-primary w-full sm:w-auto justify-center text-[1.05rem] py-[18px] px-10">
            Request Founder Consultation
            <svg className="btn-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link href="/services" className="btn-outline-light w-full sm:w-auto justify-center py-[18px] px-10">
            Explore Services
          </Link>
        </div>

        {/* Abstract illustration — interconnected nodes */}
        <div className="animate-fade-in-up delay-500 w-full max-w-[600px]">
          <svg viewBox="0 0 600 120" fill="none" className="w-full h-auto opacity-30">
            {/* Connection lines */}
            <line x1="100" y1="60" x2="225" y2="40" stroke="url(#line-grad)" strokeWidth="1" />
            <line x1="225" y1="40" x2="375" y2="60" stroke="url(#line-grad)" strokeWidth="1" />
            <line x1="375" y1="60" x2="500" y2="35" stroke="url(#line-grad)" strokeWidth="1" />
            <line x1="100" y1="60" x2="300" y2="90" stroke="url(#line-grad)" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1="300" y1="90" x2="500" y2="35" stroke="url(#line-grad)" strokeWidth="0.5" strokeDasharray="4 4" />

            {/* Nodes */}
            <circle cx="100" cy="60" r="8" fill="#00C2A8" fillOpacity="0.3" />
            <circle cx="100" cy="60" r="4" fill="#00C2A8" />
            <text x="100" y="88" textAnchor="middle" fill="white" fillOpacity="0.4" fontSize="10" fontFamily="var(--font-display)">Idea</text>

            <circle cx="225" cy="40" r="8" fill="#00C2A8" fillOpacity="0.3" />
            <circle cx="225" cy="40" r="4" fill="#00C2A8" />
            <text x="225" y="68" textAnchor="middle" fill="white" fillOpacity="0.4" fontSize="10" fontFamily="var(--font-display)">Validate</text>

            <circle cx="375" cy="60" r="8" fill="#00C2A8" fillOpacity="0.3" />
            <circle cx="375" cy="60" r="4" fill="#00C2A8" />
            <text x="375" y="88" textAnchor="middle" fill="white" fillOpacity="0.4" fontSize="10" fontFamily="var(--font-display)">Build</text>

            <circle cx="500" cy="35" r="10" fill="#00C2A8" fillOpacity="0.4" />
            <circle cx="500" cy="35" r="5" fill="#00C2A8" />
            <text x="500" y="63" textAnchor="middle" fill="white" fillOpacity="0.4" fontSize="10" fontFamily="var(--font-display)">Launch</text>

            {/* Secondary node */}
            <circle cx="300" cy="90" r="5" fill="#F59E0B" fillOpacity="0.3" />
            <circle cx="300" cy="90" r="2.5" fill="#F59E0B" />

            <defs>
              <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00C2A8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#00C2A8" stopOpacity="0.6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </section>
  );
}
