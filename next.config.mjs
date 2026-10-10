/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Dev-only: 允许通过 127.0.0.1 访问 dev 资源，避免控制台出现 cross-origin 警告
  // （不影响生产行为，也不会放宽任何数据访问权限）。
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  eslint: {
    dirs: ["src", "tests", "prisma"],
  },
};

export default nextConfig;
