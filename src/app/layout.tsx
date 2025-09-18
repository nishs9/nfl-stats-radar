import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NFL Stats Radar',
  description: 'Visualize NFL player stats with percentile rankings',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} relative pb-16`}>
        {children}
        <footer className="fixed bottom-0 left-0 right-0 w-full py-4 text-center text-gray-300 shadow-lg" style={{ backgroundColor: 'var(--brand-primary)' }}>
        </footer>
      </body>
    </html>
  );
}
