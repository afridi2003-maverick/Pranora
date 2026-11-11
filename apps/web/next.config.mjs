/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@pranora/types',
    '@pranora/validation',
    '@pranora/api',
    '@pranora/ui',
    '@pranora/i18n',
  ],
};

export default nextConfig;

