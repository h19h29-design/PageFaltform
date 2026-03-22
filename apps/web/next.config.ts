import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ysplan/modules-core", "@ysplan/tenant", "@ysplan/ui"]
};

export default nextConfig;

