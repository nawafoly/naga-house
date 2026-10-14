import type { TicketProvider } from "./event";

export interface TicketLink {
  provider: TicketProvider;
  url: string;
}

export function isExternalTicketProvider(
  provider: TicketProvider
): boolean {
  return provider !== "direct";
}

export function isSpecificTicketUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.protocol !== "https:" &&
      parsedUrl.protocol !== "http:"
    ) {
      return false;
    }

    const pathSegments = parsedUrl.pathname
      .split("/")
      .map((segment) => segment.trim())
      .filter(Boolean)
      .filter((segment) => segment !== "ar" && segment !== "en");

    return pathSegments.length > 0;
  } catch {
    return false;
  }
}