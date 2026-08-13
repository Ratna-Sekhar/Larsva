import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services — Where Are You in Your Journey?',
  description: 'Larsva helps founders and businesses at every stage — from validating an idea to building products, going to market, and scaling operations. Find your stage and move forward.',
  keywords: [
    'Startup Services India',
    'MVP Development India',
    'Startup Idea Validation',
    'Build MVP for Startup',
    'Go-to-Market Strategy',
    'Business Process Automation',
    'AI Implementation',
  ],
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'Larsva Services — Where Are You in Your Journey?',
    description: 'Whether you have an idea, are building a product, going to market, or scaling — Larsva can help you move forward.',
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
