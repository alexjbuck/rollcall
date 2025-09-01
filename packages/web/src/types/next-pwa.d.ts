declare module "next-pwa" {
  import { NextConfig } from "next";

  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    runtimeCaching?: Array<{
      urlPattern: RegExp | string;
      handler: string;
      options?: {
        cacheName?: string;
        expiration?: {
          maxEntries?: number;
          maxAgeSeconds?: number;
        };
        cacheableResponse?: {
          statuses: number[];
        };
      };
    }>;
    buildExcludes?: Array<string | RegExp>;
    fallbacks?: Record<string, string>;
    skipWaiting?: boolean;
    dynamicStartUrl?: boolean;
    reloadOnOnline?: boolean;
    swcMinify?: boolean;
    workboxOptions?: Record<string, unknown>;
  }

  function withPWA(config?: PWAConfig): (config: NextConfig) => NextConfig;

  export default withPWA;
}
