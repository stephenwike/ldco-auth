import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Enables cookies to be sent between different subdomains like auth.localhost and profile.localhost
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Access-Control-Allow-Credentials",
          value: "true",
        },
        {
          key: "Access-Control-Allow-Origin",
          value: "https://profile.localhost:44300", // or use "*" for dev, or dynamically detect
        },
        {
          key: "Access-Control-Allow-Methods",
          value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
        },
        {
          key: "Access-Control-Allow-Headers",
          value: "X-CSRF-Token, Authorization, Content-Type",
        },
      ],
    },
  ],
};

export default nextConfig;
