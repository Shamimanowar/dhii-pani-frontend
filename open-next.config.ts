import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No ISR/SSG caching is used by this app (all pages are SSR + client fetch),
// so no R2/KV incremental cache is needed.
export default defineCloudflareConfig({});
