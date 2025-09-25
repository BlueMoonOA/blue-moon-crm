/** @type {import("next").NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: false },      // back ON
  typescript: { ignoreBuildErrors: true },    // keep relaxed temporarily
};
export default nextConfig;
