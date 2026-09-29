import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DocForensics — PDF Metadata Analyzer',
  description:
    'Upload a PDF to extract detailed metadata for forensic analysis — authorship, timestamps, security flags, file integrity hashes, and more. Free tool by Larsva.',
  keywords: [
    'PDF Metadata Analyzer',
    'DocForensics',
    'PDF Forensic Analysis',
    'PDF Security Check',
    'Larsva Tools',
  ],
  alternates: {
    canonical: '/products/doc-forensics',
  },
  openGraph: {
    title: 'DocForensics — PDF Metadata Analyzer by Larsva',
    description:
      'Extract detailed PDF metadata including authorship, timestamps, security flags, and file integrity hashes.',
  },
};

export default function DocForensicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
