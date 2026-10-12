/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  async redirects() {
    return [
      // Short link for LinkedIn / CV / QR: honchar.dev/subutai. Temporary (307) on
      // purpose, so browsers do not cache it forever if the target ever moves.
      // Keep the destination in sync with lib/links.ts (this file cannot import TS).
      { source: '/subutai', destination: 'https://subutai.honchar.dev/', permanent: false },
    ];
  },
};

export default nextConfig;
