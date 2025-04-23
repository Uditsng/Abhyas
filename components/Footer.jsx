export default function Footer() {
    return (
      <footer className="bg-gray-100 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">© {new Date().getFullYear()} Mock Test App. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            <a href="#" className="text-blue-600 hover:underline">Contact Us</a>
          </div>
        </div>
      </footer>
    );
  }