import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'KnowFlow AI - Company Knowledge Assistant & RAG Platform',
  description: 'Turn your company knowledge into an AI assistant that gives instant, accurate answers with source citations.',
  openGraph: {
    title: 'KnowFlow AI - Company Knowledge Assistant',
    description: 'Turn your company knowledge into an AI assistant that gives instant, accurate answers with source citations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KnowFlow AI',
    description: 'Turn your company knowledge into an AI assistant with citations.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
