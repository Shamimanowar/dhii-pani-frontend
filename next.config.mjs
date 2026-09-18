import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {};

// Makes Cloudflare bindings/vars available during `next dev` (no-op in prod).
initOpenNextCloudflareForDev();

export default nextConfig;
