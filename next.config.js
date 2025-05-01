const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  images:{
    unoptimized: process.env.NODE_ENV === 'development',
  }
};

export default nextConfig;
