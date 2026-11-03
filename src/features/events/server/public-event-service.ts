import { env } from "cloudflare:workers";

import {
  CuratedEventRepository,
  D1PublicEventRepository,
  type PublicD1Database,
} from "@/features/events/data";
import { EventService } from "@/features/events/services";

/**
 * Runtime reads use the DB binding of the current Worker (staging or production).
 * Only local development may fall back to the curated design fixtures.
 * A missing production DB fails closed instead of serving misleading fixtures.
 */
export function getPublicEventService(): EventService {
  const database = (env as unknown as Record<string, unknown>).DB;

  if (
    database &&
    typeof database === "object" &&
    "prepare" in database &&
    typeof database.prepare === "function"
  ) {
    return new EventService(
      new D1PublicEventRepository(database as unknown as PublicD1Database)
    );
  }

  if (process.env.NODE_ENV === "development") {
    return new EventService(new CuratedEventRepository());
  }

  throw new Error("NAGA_PUBLIC_D1_UNAVAILABLE");
}
