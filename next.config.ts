import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ['api.ts', 'api.js'], // This tells Next.js to only treat files ending in .api.ts or .api.js as routes in the pages dir
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
