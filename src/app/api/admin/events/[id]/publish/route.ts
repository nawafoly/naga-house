import { NextRequest, NextResponse } from "next/server";

import { hasAdminPermission } from "@/features/admin/domain/permissions";
import { isTrustedUnsplashImageUrl } from "@/features/admin/domain/parse-draft-event";
import { getAdminDb, getCurrentAdmin } from "@/features/admin/server/auth";
import { publishDraftEvent, type PublishResult, type PublishDatabase } from "@/features/admin/server/publish-event";
import { isTrustedTicketUrl, type TicketProvider } from "@/features/events/domain";

export const dynamic = "force-dynamic";

const resultStatus: Record<Exclude<PublishResult, "published">, number> = {
  not_found: 404,
  conflict: 409,
  invalid: 422,
};

function outcome(request: NextRequest, result: PublishResult) {
  const success = result === "published";
  const status = result === "published" ? 200 : resultStatus[result];

  if (request.headers.get("accept")?.includes("application/json")) {
    return NextResponse.json({ ok: success, code: result }, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const target = success
    ? "/admin/events?published=1"
    : `/admin/events?publish_error=${result}`;
  const response = NextResponse.redirect(new URL(target, request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

/** Authenticated owner/admin action; no GET, no automatic publication. */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return new Response("Forbidden", { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/x-www-form-urlencoded") {
    return new Response("Unsupported media type", { status: 415 });
  }
  const size = Number(request.headers.get("content-length"));
  if (Number.isFinite(size) && size > 1000) {
    return new Response("Payload too large", { status: 413 });
  }

  let admin;
  try { admin = await getCurrentAdmin(); }
  catch { return new Response("Admin session unavailable", { status: 503 }); }
  if (!admin) return new Response("Unauthorized", { status: 401 });
  if (!hasAdminPermission(admin.role, "events.publish")) {
    return new Response("Forbidden", { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  let confirmationSlug: string;
  try {
    const value = (await request.formData()).get("confirmSlug");
    if (typeof value !== "string" || value.length > 120) return outcome(request, "invalid");
    confirmationSlug = value;
  } catch {
    return outcome(request, "invalid");
  }

  const { id } = await context.params;
  try {
    const result = await publishDraftEvent(
      getAdminDb() as unknown as PublishDatabase,
      admin.id,
      id,
      confirmationSlug,
      {
        ticket: (provider, url) => isTrustedTicketUrl(provider as TicketProvider, url),
        image: isTrustedUnsplashImageUrl,
      },
    );
    return outcome(request, result);
  } catch {
    return new Response("Publication unavailable", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
