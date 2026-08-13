'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMobileMenu } from '@/hooks/useMobileMenu';
import type { NavLink as NavLinkType } from '@/types';

const navLinks: NavLinkType[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Products', href: '/products' },
  { label: 'Our Works', href: '/works' },
  { label: 'Contact Us', href: '/contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isOpen, toggle, close } = useMobileMenu();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) close();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [close]);

  const isActive = (link: NavLinkType) => pathname === link.href;

  return (
    <header
      id="site-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? 'glass-solid border-b border-gray-200/60 shadow-[0_1px_20px_rgba(0,0,0,0.04)]'
        : 'bg-transparent'
        }`}
    >
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 md:px-10 h-[80px]">
        {/* Logo */}
        <Link href="/" className="group flex items-center z-10 transition-all duration-300 hover:opacity-80">
          <Image
            src="/images/larsva-logo.png"
            alt="Larsva"
            width={180}
            height={60}
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href} className="relative">
              <Link
                href={link.href}
                className={`font-display font-medium text-[0.9rem] px-5 py-2.5 rounded-lg transition-all duration-300 inline-flex items-center gap-1.5 ${isActive(link)
                  ? scrolled
                    ? 'text-[var(--color-accent)] bg-[var(--color-accent-light)]'
                    : 'text-white bg-white/10'
                  : scrolled
                    ? 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-gray-100/60'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <Link
          href="/contact"
          className="hidden md:inline-flex items-center px-7 py-3 rounded-lg gradient-teal text-white font-display font-semibold text-[0.9rem] tracking-wide transition-all duration-400 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,194,168,0.3)]"
        >
          Request Consultation
        </Link>

        {/* Mobile Hamburger */}
        <button
          id="mobile-toggle"
          className="flex md:hidden flex-col gap-[6px] p-2 z-50"
          onClick={toggle}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <span
            className={`w-6 h-[2px] rounded-sm transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[8px] bg-white' : scrolled ? 'bg-[var(--color-text-primary)]' : 'bg-white'
              }`}
          />
          <span
            className={`w-6 h-[2px] rounded-sm transition-all duration-300 ${isOpen ? 'opacity-0 bg-white' : scrolled ? 'bg-[var(--color-text-primary)]' : 'bg-white'
              }`}
          />
          <span
            className={`w-6 h-[2px] rounded-sm transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[8px] bg-white' : scrolled ? 'bg-[var(--color-text-primary)]' : 'bg-white'
              }`}
          />
        </button>
      </nav>

      {/* Mobile Drawer */}
      <div
        id="mobile-drawer"
        className={`mobile-drawer ${isOpen ? 'open' : ''}`}
        aria-hidden={!isOpen}
      >
        <ul className="flex flex-col items-center gap-2 w-full">
          {navLinks.map((link) => (
            <li key={link.href} className="w-full flex flex-col items-center">
              <Link
                href={link.href}
                className={`font-display font-semibold text-xl p-4 transition-colors duration-300 ${isActive(link) ? 'text-[var(--color-accent)]' : 'text-white/80 hover:text-white'
                  }`}
                onClick={close}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/contact"
          className="mt-6 px-10 py-4 rounded-xl gradient-teal text-white font-display font-semibold text-lg transition-all duration-400 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,194,168,0.3)]"
          onClick={close}
        >
          Request Consultation
        </Link>
      </div>
    </header>
  );
}
