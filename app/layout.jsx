import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'Mock Test Series App',
  description: 'Prepare for exams like SSC, UPSC, NEET, etc.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
