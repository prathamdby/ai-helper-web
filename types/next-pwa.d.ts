declare module "next-pwa" {
  import type { NextConfig } from "next";

  type PWAOptions = {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    scope?: string;
    sw?: string;
    runtimeCaching?: Array<Record<string, unknown>>;
    publicExcludes?: string[];
    buildExcludes?: string[] | RegExp[];
    fallbacks?: {
      [key: string]: string;
    };
  };

  function withPWA(
    options?: PWAOptions
  ): (nextConfig: NextConfig) => NextConfig;

  export = withPWA;
}
