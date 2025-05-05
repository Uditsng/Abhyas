
import './globals.css';

export const metadata = {
  title: 'Mock Test Series App',
  description: 'Prepare for exams like SSC, UPSC, NEET, etc.',
};

import Providers from '@/components/Providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
