import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // External packages for server components (moved from experimental in Next.js 15)
  serverExternalPackages: ['framer-motion'],
  
  // Enable CSS-in-JS for dynamic animations
  compiler: {
    styledComponents: true,
  },
  
  // Ensure proper client-side rendering for animations
  reactStrictMode: true,
  
  // Optimize for better animation performance
  poweredByHeader: false,
  
  // Development optimizations to prevent build manifest issues
  experimental: {
    // Optimize webpack compilation
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  },
};

export default nextConfig;
