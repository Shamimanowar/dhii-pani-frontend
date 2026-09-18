// Resolved at REQUEST time, not build time.
// - On Cloudflare Workers: from `vars.API_URL` in wrangler.jsonc (or .dev.vars locally).
// - On Docker/Node:      from API_URL or the legacy NEXT_PUBLIC_API_URL env var.
export function getApiBase() {
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://app:8000/v1/core"
  );
}
