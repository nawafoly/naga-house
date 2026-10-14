import type { TicketProvider } from "./event";

export interface TicketLink {
  provider: TicketProvider;
  url: string;
}

const trustedProviderDomains: Partial<
  Record<TicketProvider, readonly string[]>
> = {
  webook: ["webook.com"],
  ticketmx: ["ticketmx.com"],
  platinumlist: ["platinumlist.net"],
  nofomo: ["nofomo.com"],
};

function matchesTrustedDomain(
  hostname: string,
  trustedDomain: string
): boolean {
  const normalizedHostname =
    hostname.toLowerCase();

  const normalizedTrustedDomain =
    trustedDomain.toLowerCase();

  return (
    normalizedHostname === normalizedTrustedDomain ||
    normalizedHostname.endsWith(
      `.${normalizedTrustedDomain}`
    )
  );
}

export function isExternalTicketProvider(
  provider: TicketProvider
): boolean {
  return provider !== "direct";
}

export function isSpecificTicketUrl(
  url: string
): boolean {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "https:") {
      return false;
    }

    if (
      parsedUrl.username.length > 0 ||
      parsedUrl.password.length > 0
    ) {
      return false;
    }

    const pathSegments = parsedUrl.pathname
      .split("/")
      .map((segment) => segment.trim())
      .filter(Boolean)
      .filter(
        (segment) =>
          segment !== "ar" &&
          segment !== "en"
      );

    return pathSegments.length > 0;
  } catch {
    return false;
  }
}

export function isTrustedTicketUrl(
  provider: TicketProvider,
  url: string
): boolean {
  if (!isSpecificTicketUrl(url)) {
    return false;
  }

  if (provider === "direct") {
    return true;
  }

  if (provider === "other") {
    return false;
  }

  const trustedDomains =
    trustedProviderDomains[provider];

  if (!trustedDomains) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);

    return trustedDomains.some(
      (trustedDomain) =>
        matchesTrustedDomain(
          parsedUrl.hostname,
          trustedDomain
        )
    );
  } catch {
    return false;
  }
}