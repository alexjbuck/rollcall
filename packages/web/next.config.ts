import type { NextConfig } from "next";
import withPWA from "next-pwa";

const withPwa = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {};

export default withPwa(nextConfig);
