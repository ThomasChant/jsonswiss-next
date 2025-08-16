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

  async redirects() {
    return [
      {
        source: '/terms.html',
        destination: '/terms',
        permanent: true, // 301重定向
      },
      {
        source: '/privacy.html', 
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/generator.html',
        destination: '/schema/generator',
        permanent: true,
      },
      {
        source: '/generator',
        destination: '/schema/generator',
        permanent: true,
      },
      {
        source: '/schema-generator.html',
        destination: '/schema/generator', 
        permanent: true,
      },
      {
        source: '/schema-generator',
        destination: '/schema/generator', 
        permanent: true,
      },
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/docs.html',
        destination: '/', // 或其他合适的页面
        permanent: true,
      },
      {
        source: '/changelog.html',
        destination: '/', // 如果没有changelog页面，重定向到首页
        permanent: true,
      },
      {
        source: '/changelog',
        destination: '/', // 如果没有changelog页面，重定向到首页
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
