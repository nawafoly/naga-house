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
