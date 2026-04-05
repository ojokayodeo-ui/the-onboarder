/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  // Required for Railway containers; also works fine on Netlify (ignored there)
  output: "standalone",
};

export default nextConfig;
