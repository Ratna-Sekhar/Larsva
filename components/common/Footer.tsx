import Link from 'next/link';

const footerLinks = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Our Works', href: '/works' },
    { label: 'Contact Us', href: '/contact' },
  ],
  resources: [
    { label: 'The Open Orbit', href: '/#open-orbit' },
    { label: 'Startup Validation', href: '/services#validation' },
    { label: 'MVP Development', href: '/services#mvp' },
  ],
};

export default function Footer() {
  return (
    <footer id="site-footer" className="bg-[var(--color-bg-dark)] text-white/60 pt-20 pb-10">
      <div className="container-wide">
        {/* Top */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div className="max-w-[360px]">
            <Link href="/" className="flex items-center mb-5">
              <span className="font-heading font-bold text-2xl tracking-tight">
                <span className="gradient-text">L</span>
                <span className="text-white">arsva</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-white/40 mb-6">
              Helping ambitious working professionals and aspiring founders validate startup ideas, build MVPs, and launch professionally.
            </p>
            <a
              href="mailto:satya@larsva.com"
              className="text-sm text-[var(--color-accent)] hover:underline font-medium"
            >
              satya@larsva.com
            </a>
          </div>

          <div className="flex gap-16 md:gap-20">
            <div>
              <h4 className="overline text-white/30 mb-5">Company</h4>
              <ul className="flex flex-col gap-3">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="overline text-white/30 mb-5">Resources</h4>
              <ul className="flex flex-col gap-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="overline text-white/30 mb-5">Connect</h4>
              <ul className="flex flex-col gap-3">
                <li>
                  <a
                    href="mailto:satya@larsva.com"
                    className="text-sm text-white/50 hover:text-white transition-colors duration-300"
                  >
                    Email Us
                  </a>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-white/50 hover:text-white transition-colors duration-300">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/6 mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-white/25 gap-3">
          <p>&copy; {new Date().getFullYear()} Larsva. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
