const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  images:{
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Ensure Next.js doesn't interfere with Tailwind's dark mode
  webpack: (config) => {
    return config;
  }
};

export default nextConfig;
