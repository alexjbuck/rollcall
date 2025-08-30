import type { NextConfig } from "next";
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url))
  }
};

export default nextConfig;
