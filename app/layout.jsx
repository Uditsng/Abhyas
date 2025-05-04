
import './globals.css';

export const metadata = {
  title: 'Mock Test Series App',
  description: 'Prepare for exams like SSC, UPSC, NEET, etc.',
};

import Providers from '@/components/Providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
