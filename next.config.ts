import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "192.168.1.92",
    "192.168.1.51",
    "localhost",
    "192.168.1.36",
  ],
};

export default nextConfig;
