import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';
import { QueryProvider } from '@/components/ui/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hockey Hub',
  description: 'NHL stats, contracts, trades & lineup builder',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <QueryProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-950 text-white">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
