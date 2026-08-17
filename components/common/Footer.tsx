import Link from 'next/link';
import Image from 'next/image';

const footerLinks = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Our Works', href: '/works' },
    { label: 'Contact Us', href: '/contact' },
  ],
  products: [
    { label: 'All Products', href: '/products' },
    { label: 'Smart Crop', href: '/products/smart-crop' },
    { label: 'Image Reducer', href: '/products/image-reducer' },
    { label: 'Image Converter', href: '/products/image-converter' },
    { label: 'PDF to Images', href: '/products/pdf-to-images' },
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
              <Image
                src="/images/larsva-logo.png"
                alt="Larsva"
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed text-white/40 mb-6">
              Helping ambitious working professionals and aspiring founders validate startup ideas, build MVPs, and launch professionally.
            </p>
            <a
              href="mailto:info@larsva.com"
              className="text-sm text-[var(--color-accent)] hover:underline font-medium"
            >
              info@larsva.com
            </a>
          </div>

          <div className="flex gap-12 md:gap-16 flex-wrap">
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
              <h4 className="overline text-white/30 mb-5">Products</h4>
              <ul className="flex flex-col gap-3">
                {footerLinks.products.map((link) => (
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
                    href="mailto:info@larsva.com"
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
                <li>
                  <a
                    href="https://www.linkedin.com/company/larsva-opc/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/50 hover:text-white transition-colors duration-300"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/larsva_official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/50 hover:text-white transition-colors duration-300"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/@Larsva"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/50 hover:text-white transition-colors duration-300"
                  >
                    YouTube
                  </a>
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
