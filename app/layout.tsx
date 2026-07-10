import type { Metadata } from 'next';
import { Space_Grotesk, Inter, Outfit } from 'next/font/google';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://larsva.com'),
  title: {
    default: 'Larsva — Turn Your Startup Idea into a Launch-Ready Business',
    template: '%s | Larsva',
  },
  description:
    'Larsva helps ambitious working professionals and aspiring founders validate startup ideas, build MVPs, and launch professionally without hiring a full team.',
  keywords: [
    'Startup Validation Services India',
    'Startup Consulting India',
    'MVP Development India',
    'Startup Idea Validation',
    'Build MVP for Startup',
    'Founder Advisory Services',
    'Startup Launch Services',
  ],
  authors: [{ name: 'Larsva' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://larsva.com',
    siteName: 'Larsva',
    title: 'Larsva — Turn Your Startup Idea into a Launch-Ready Business',
    description:
      'Larsva helps ambitious working professionals and aspiring founders validate startup ideas, build MVPs, and launch professionally.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Larsva — Turn Your Startup Idea into a Launch-Ready Business',
    description:
      'Validate startup ideas, build MVPs, and launch professionally with Larsva.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${outfit.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Larsva',
              url: 'https://larsva.com',
              logo: 'https://larsva.com/logo.svg',
              description:
                'Larsva helps ambitious working professionals and aspiring founders validate startup ideas, build MVPs, and launch professionally.',
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'satya@larsva.com',
                contactType: 'customer service',
              },
              // TODO: Add your social profile URLs here, e.g.:
              // 'https://linkedin.com/company/larsva',
              // 'https://twitter.com/larsva'
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
