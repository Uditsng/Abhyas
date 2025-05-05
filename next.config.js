const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  images:{
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Removed turbopack from experimental as it's now deprecated in Next.js 15.3.1
  experimental: {
  },
  // Ensure Next.js doesn't interfere with Tailwind's dark mode
  webpack: (config) => {
    return config;
  }
};

export default nextConfig;
