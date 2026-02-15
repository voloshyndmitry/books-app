import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'My Books - Mnogoknig Favorites',
  description: 'View your favorite books from mnogoknig.com',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <span className="text-xl font-bold text-gray-800">
                My Mnogoknig Books
              </span>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
