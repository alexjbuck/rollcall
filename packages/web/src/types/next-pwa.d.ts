declare module "next-pwa" {
  import { NextConfig } from "next";

  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    runtimeCaching?: any[];
    buildExcludes?: any[];
    fallbacks?: any;
    skipWaiting?: boolean;
    dynamicStartUrl?: boolean;
    reloadOnOnline?: boolean;
    swcMinify?: boolean;
    workboxOptions?: any;
  }

  function withPWA(config?: PWAConfig): (config: NextConfig) => NextConfig;

  export default withPWA;
}
