import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TradeGraph - Global Trade Intelligence Platform',
  description: 'Discover counterparties, validate risk, and execute trade workflows with real shipment data.',
};

/**
 * Root Layout
 *
 * Wraps the entire application with:
 * - React Query provider for data fetching
 * - Auth provider (to be added)
 * - Theme provider (for white-label support)
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
