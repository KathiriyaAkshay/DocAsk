import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Acme Logistics — Policy Assistant',
  description: 'Internal Q&A over company policy documents with RAG and source citations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
