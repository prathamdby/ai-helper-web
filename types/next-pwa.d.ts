declare module "next-pwa" {
  import type { NextConfig } from "next";

  interface PWAOptions {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    scope?: string;
    sw?: string;
    runtimeCaching?: any[];
    publicExcludes?: string[];
    buildExcludes?: string[] | RegExp[];
    fallbacks?: {
      [key: string]: string;
    };
  }

  function withPWA(
    options?: PWAOptions
  ): (nextConfig: NextConfig) => NextConfig;

  export = withPWA;
}
