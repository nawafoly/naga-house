import { NextRequest, NextResponse } from "next/server";

export function visitorRedirect(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export function visitorFormOriginAllowed(request: NextRequest): boolean {
  return request.headers.get("origin") === new URL(request.url).origin &&
    (request.headers.get("content-type") ?? "").startsWith("application/x-www-form-urlencoded");
}

export async function readVisitorForm(request: NextRequest): Promise<URLSearchParams | null> {
  const stated = Number(request.headers.get("content-length"));
  if (stated > 4096) return null;
  const stream = request.body;
  if (!stream) return null;
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > 4096) { await reader.cancel(); return null; }
      chunks.push(value);
    }
    const combined = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { combined.set(chunk, offset); offset += chunk.length; }
    return new URLSearchParams(new TextDecoder("utf-8", { fatal: true }).decode(combined));
  } catch { return null; } finally { reader.releaseLock(); }
}

export function visitorRequestIp(request: NextRequest): string {
  // Cloudflare injects the authoritative connecting IP. Limit the value to avoid abuse.
  return (request.headers.get("cf-connecting-ip") || "unknown").slice(0, 64);
}
