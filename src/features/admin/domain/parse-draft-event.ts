/** Strict, dependency-free validation for the admin's first D1-only event draft. */
export interface DraftEventInput {
  slug: string;
  titleAr: string;
  titleEn: string | null;
  descriptionAr: string | null;
  imageUrl: string;
  category: string;
  venue: string;
  startAt: string | null;
  scheduleLabel: string | null;
  amountFrom: number | null;
  ticketProvider: "webook" | "ticketmx" | "platinumlist" | "nofomo";
  ticketUrl: string;
}

const CATEGORIES = new Set(["music", "theater", "sports", "family", "dining", "entertainment"]);
const PROVIDERS = new Set(["webook", "ticketmx", "platinumlist", "nofomo"]);

function text(form: FormData, name: string, limit: number): string | null {
  const value = form.get(name);
  if (typeof value !== "string" || value.length > limit) return null;
  return value.trim();
}

function safeImageUrl(raw: string): boolean {
  if (!raw || raw.length > 2048) return false;
  try {
    const url = new URL(raw);
    // First milestone: external Unsplash URLs only. R2 media upload comes later.
    return url.protocol === "https:" && url.hostname === "images.unsplash.com" &&
      !url.username && !url.password && url.port === "";
  } catch {
    return false;
  }
}

function localSaudiDate(raw: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) return null;
  const parsed = new Date(`${raw}:00+03:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  // Reject auto-normalized invalid dates such as February 30.
  const verify = new Date(parsed.getTime() + 3 * 60 * 60 * 1000);
  if (verify.toISOString().slice(0, 16) !== raw) return null;
  return parsed.toISOString();
}

/** Returns null on invalid input; caller must additionally use canonical ticket-domain allowlist. */
export function parseDraftEventForm(form: FormData): DraftEventInput | null {
  const slug = text(form, "slug", 120);
  const titleAr = text(form, "titleAr", 160);
  const titleEn = text(form, "titleEn", 160);
  const descriptionAr = text(form, "descriptionAr", 5000);
  const imageUrl = text(form, "imageUrl", 2048);
  const category = text(form, "category", 32);
  const venue = text(form, "venue", 160);
  const timeInput = text(form, "startAt", 32);
  const scheduleLabel = text(form, "scheduleLabel", 160);
  const amountInput = text(form, "amountFrom", 16);
  const provider = text(form, "ticketProvider", 32);
  const ticketUrl = text(form, "ticketUrl", 2048);

  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length < 3 ||
      !titleAr || titleAr.length < 2 || titleEn === null || descriptionAr === null ||
      !imageUrl || !safeImageUrl(imageUrl) || !category || !CATEGORIES.has(category) ||
      !venue || !timeInput && !scheduleLabel || timeInput === null || scheduleLabel === null ||
      amountInput === null || !provider || !PROVIDERS.has(provider) || !ticketUrl) {
    return null;
  }
  const startAt = timeInput ? localSaudiDate(timeInput) : null;
  if (timeInput && !startAt) return null;
  if (!/^https:\/\//i.test(ticketUrl) || ticketUrl.length > 2048) return null;

  let amountFrom: number | null = null;
  if (amountInput) {
    if (!/^(?:0|[1-9]\d{0,5})(?:\.\d{1,2})?$/.test(amountInput)) return null;
    amountFrom = Number(amountInput);
    if (!Number.isFinite(amountFrom) || amountFrom > 999999) return null;
  }

  return {
    slug,
    titleAr,
    titleEn: titleEn || null,
    descriptionAr: descriptionAr || null,
    imageUrl,
    category,
    venue,
    startAt,
    scheduleLabel: scheduleLabel || null,
    amountFrom,
    ticketProvider: provider as DraftEventInput["ticketProvider"],
    ticketUrl,
  };
}
