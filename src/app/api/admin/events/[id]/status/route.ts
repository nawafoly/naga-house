import { NextRequest, NextResponse } from "next/server";

import { hasAdminPermission } from "@/features/admin/domain/permissions";
import { isTrustedUnsplashImageUrl } from "@/features/admin/domain/parse-draft-event";
import { getAdminDb, getCurrentAdmin } from "@/features/admin/server/auth";
import {
  transitionEventStatus, type TransitionDatabase, type TransitionResult,
} from "@/features/admin/server/transition-event";
import { isTrustedTicketUrl, type TicketProvider } from "@/features/events/domain";

export const dynamic = "force-dynamic";

const statusCodes: Record<Exclude<TransitionResult, "updated">, number> = {
  not_found: 404, conflict: 409, invalid: 422,
};

function outcome(request: NextRequest, result: TransitionResult) {
  const ok = result === "updated";
  const status = result === "updated" ? 200 : statusCodes[result];
  if (request.headers.get("accept")?.includes("application/json")) {
    return NextResponse.json({ ok, code: result }, {
      status, headers: { "Cache-Control": "no-store" },
    });
  }
  const target = ok
    ? "/admin/events?status_changed=1"
    : `/admin/events?status_error=${result}`;
  const response = NextResponse.redirect(new URL(target, request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

/** Owner/admin only. Explicit slug confirmation and optimistic version guard required. */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return new Response("Forbidden", { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !==
      "application/x-www-form-urlencoded") {
    return new Response("Unsupported media type", { status: 415 });
  }
  const size = Number(request.headers.get("content-length"));
  if (Number.isFinite(size) && size > 1024) {
    return new Response("Payload too large", { status: 413 });
  }

  let admin;
  try { admin = await getCurrentAdmin(); }
  catch { return new Response("Admin session unavailable", { status: 503 }); }
  if (!admin) return new Response("Unauthorized", { status: 401 });
  if (!hasAdminPermission(admin.role, "events.publish")) {
    return new Response("Forbidden", { status: 403 });
  }

  let version: FormDataEntryValue | null;
  let confirmSlug: FormDataEntryValue | null;
  let targetStatus: FormDataEntryValue | null;
  try {
    const form = await request.formData();
    version = form.get("version");
    confirmSlug = form.get("confirmSlug");
    targetStatus = form.get("targetStatus");
  } catch { return outcome(request, "invalid"); }

  if (typeof version !== "string" ||
      typeof confirmSlug !== "string" ||
      typeof targetStatus !== "string") return outcome(request, "invalid");

  const { id } = await context.params;
  try {
    return outcome(request, await transitionEventStatus(
      getAdminDb() as unknown as TransitionDatabase,
      admin.id, id, version, confirmSlug, targetStatus,
      {
        ticket: (provider, url) => isTrustedTicketUrl(provider as TicketProvider, url),
        image: isTrustedUnsplashImageUrl,
      },
    ));
  } catch {
    return new Response("Lifecycle change unavailable", {
      status: 503, headers: { "Cache-Control": "no-store" },
    });
  }
}
