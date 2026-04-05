/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  // Produces a self-contained .next/standalone bundle — ideal for Railway containers
  output: "standalone",
};

export default nextConfig;
