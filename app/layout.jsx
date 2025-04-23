
import './globals.css';

export const metadata = {
  title: 'Mock Test Series App',
  description: 'Prepare for exams like SSC, UPSC, NEET, etc.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
