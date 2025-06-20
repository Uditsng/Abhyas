import Footer from '@/components/Footer';

export default function UserLayout({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}