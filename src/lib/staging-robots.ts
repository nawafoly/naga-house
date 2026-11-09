const stagingHostname = "naga-house-staging.nagahouse3.workers.dev";

/** Only the separate QA worker should opt out of search indexing. */
export function stagingRobotsHeader(hostname: string): string | null {
  return hostname.trim().toLowerCase().replace(/\.$/, "") === stagingHostname
    ? "noindex, nofollow"
    : null;
}
