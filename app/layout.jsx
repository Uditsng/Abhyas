
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Mock Test Series App',
  description: 'Prepare for exams like SSC, UPSC, NEET, etc.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Navbar/>
      <body className="bg-gray-50 text-gray-900">
        {children}
        <Footer/>
      </body>
    </html>
  );
}
