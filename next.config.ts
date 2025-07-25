import createNextIntlPlugin from 'next-intl/plugin';
import type {NextConfig} from 'next';
 
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'api.producthunt.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);