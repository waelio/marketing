import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@waelio/shared'],
  dir: './src',
};

export default nextConfig;
