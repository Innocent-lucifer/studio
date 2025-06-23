import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  pageExtensions: ['api.ts', 'api.js'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
