'use client';

import { useState, type FormEvent } from 'react';
import ScrollReveal from '@/components/common/ScrollReveal';
import { submitOpenOrbitWaitlist } from '@/app/actions/submitConsultation';

const features = [
  'Startup workshops',
  'Founder meetups',
  'Networking sessions',
  'Startup discussions',
  'Learning opportunities',
];

export default function OpenOrbit() {
  const [formData, setFormData] = useState({ name: '', email: '', linkedin: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitOpenOrbitWaitlist(formData);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      setFormData({ name: '', email: '', linkedin: '' });
    } catch (error) {
      console.error('Waitlist submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="open-orbit" className="py-24 md:py-32 bg-[var(--color-bg-dark)] grid-pattern-dark relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-15%] w-[50%] h-[60%] bg-[radial-gradient(circle,rgba(245,158,11,0.05),transparent_70%)] rounded-full pointer-events-none" />

      <div className="container-wide relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-20 items-start">
          {/* Left: Content */}
          <div className="flex-1">
            <ScrollReveal>
              <span className="overline text-amber-400 mb-4 block">Community</span>
              <h2 className="font-heading font-bold text-[clamp(2rem,4vw,3rem)] tracking-tight mb-4 text-white">
                Introducing{' '}
                <span className="gradient-text-amber">The Open Orbit</span>
              </h2>
              <p className="text-lg text-white/45 leading-relaxed mb-8 max-w-[480px]">
                A community for aspiring founders, startup builders, and early-stage entrepreneurs.
              </p>

              <ul className="flex flex-col gap-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-white/60 text-sm">
                    <svg className="flex-shrink-0 text-amber-400" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3.5 8L6.5 11L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>

          {/* Right: Waitlist Form */}
          <div className="flex-1 w-full max-w-[480px]">
            <ScrollReveal delay={200}>
              <div className="bg-[var(--color-bg-dark-card)] rounded-2xl p-8 border border-white/8">
                <h3 className="font-heading font-bold text-xl text-white mb-2">Join The Open Orbit</h3>
                <p className="text-sm text-white/40 mb-6">Get early access to founder events and resources.</p>

                {submitted ? (
                  <div className="flex items-center gap-3 p-5 rounded-xl bg-amber-400/10 border border-amber-400/20">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <p className="text-amber-400 font-display font-semibold text-sm">
                      You&apos;re on the list! We&apos;ll be in touch soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:border-amber-400/50 focus:outline-none transition-colors"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={isSubmitting}
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:border-amber-400/50 focus:outline-none transition-colors"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isSubmitting}
                    />
                    <input
                      type="url"
                      placeholder="LinkedIn URL (optional)"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:border-amber-400/50 focus:outline-none transition-colors"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      disabled={isSubmitting}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-[var(--color-bg-dark)] font-display font-bold text-sm tracking-wide hover:shadow-[0_8px_24px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 transition-all duration-400 disabled:opacity-70"
                    >
                      {isSubmitting ? 'Joining...' : 'Join The Open Orbit'}
                    </button>
                  </form>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
