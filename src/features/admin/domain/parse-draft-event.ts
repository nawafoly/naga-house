/** Parse and validate a D1-only draft. Never create a published event here. */
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

export type DraftField =
  | "slug" | "titleAr" | "titleEn" | "descriptionAr" | "imageUrl"
  | "category" | "venue" | "startAt" | "scheduleLabel" | "amountFrom"
  | "ticketProvider" | "ticketUrl";
export type DraftFieldErrors = Partial<Record<DraftField, string>>;
export type DraftEventValidation =
  | { value: DraftEventInput; errors: DraftFieldErrors }
  | { value: null; errors: DraftFieldErrors };

const CATEGORIES = new Set(["music", "theater", "sports", "family", "dining", "entertainment"]);
const PROVIDERS = new Set(["webook", "ticketmx", "platinumlist", "nofomo"]);

/** Distinguish missing/empty from malformed or oversized form values. */
function read(form: FormData, key: DraftField, limit: number): string | null {
  const value = form.get(key);
  if (value === null) return "";
  return typeof value === "string" && value.length <= limit ? value.trim() : null;
}

function safeImageUrl(raw: string): boolean {
  if (!raw || raw.length > 2048) return false;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && url.hostname === "images.unsplash.com" &&
      !url.username && !url.password && url.port === "";
  } catch { return false; }
}

function localSaudiDate(raw: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) return null;
  const parsed = new Date(`${raw}:00+03:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  const verify = new Date(parsed.getTime() + 3 * 60 * 60 * 1000);
  if (verify.toISOString().slice(0, 16) !== raw) return null;
  return parsed.toISOString();
}

/** Field-level messages contain no submitted values, secrets, SQL or user data. */
export function validateDraftEventForm(form: FormData): DraftEventValidation {
  const errors: DraftFieldErrors = {};
  const slug = read(form, "slug", 120);
  const titleAr = read(form, "titleAr", 160);
  const titleEn = read(form, "titleEn", 160);
  const descriptionAr = read(form, "descriptionAr", 5000);
  const imageUrl = read(form, "imageUrl", 2048);
  const category = read(form, "category", 32);
  const venue = read(form, "venue", 160);
  const timeInput = read(form, "startAt", 32);
  const scheduleLabel = read(form, "scheduleLabel", 160);
  const amountInput = read(form, "amountFrom", 16);
  const provider = read(form, "ticketProvider", 32);
  const ticketUrl = read(form, "ticketUrl", 2048);

  if (!titleAr || titleAr.length < 2) errors.titleAr = "أدخل اسم الفعالية بالعربية (حرفين على الأقل).";
  if (titleEn === null) errors.titleEn = "الاسم الإنجليزي يتجاوز 160 حرفًا.";
  if (!slug || slug.length < 3 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.slug = "استخدم حروفًا إنجليزية صغيرة وأرقامًا وشرطات فقط، بطول 3–120 حرفًا.";
  }
  if (descriptionAr === null) errors.descriptionAr = "الوصف طويل جدًا (الحد 5000 حرف).";
  if (!category || !CATEGORIES.has(category)) errors.category = "اختر تصنيفًا صحيحًا.";
  if (!venue) errors.venue = "أدخل موقعًا داخل جدة.";
  if (!imageUrl || !safeImageUrl(imageUrl)) {
    errors.imageUrl = "الرابط يجب أن يبدأ بـ https://images.unsplash.com/ ومن دون اسم مستخدم أو منفذ.";
  }
  if (!provider || !PROVIDERS.has(provider)) errors.ticketProvider = "اختر منصة التذاكر من القائمة.";
  if (!ticketUrl || !/^https:\/\//i.test(ticketUrl)) errors.ticketUrl = "أدخل رابط صفحة التذاكر ويجب أن يبدأ بـ https://";

  const startAt = timeInput ? localSaudiDate(timeInput) : null;
  if (timeInput === null || (timeInput && !startAt)) errors.startAt = "وقت البداية غير صالح. استخدم تاريخًا ووقتًا صحيحين بتوقيت السعودية.";
  if (scheduleLabel === null) errors.scheduleLabel = "وصف الموعد يتجاوز 160 حرفًا.";
  if (!timeInput && !scheduleLabel) errors.scheduleLabel = "أدخل وصف موعد مثل «يحدد لاحقًا» أو اختر وقت البداية.";

  let amountFrom: number | null = null;
  if (amountInput === null || (amountInput !== "" && !/^(?:0|[1-9]\d{0,5})(?:\.\d{1,2})?$/.test(amountInput))) {
    errors.amountFrom = "أدخل سعرًا من 0 إلى 999999 بحد أقصى منزلتين عشريتين، أو اتركه فارغًا.";
  } else if (amountInput) {
    amountFrom = Number(amountInput);
    if (!Number.isFinite(amountFrom) || amountFrom > 999999) errors.amountFrom = "السعر غير صالح.";
  }

  if (Object.keys(errors).length !== 0) return { value: null, errors };
  // All nullable values were validated above; the assertions are constrained to that result.
  return {
    value: {
      slug: slug!, titleAr: titleAr!, titleEn: titleEn || null,
      descriptionAr: descriptionAr || null, imageUrl: imageUrl!, category: category!,
      venue: venue!, startAt, scheduleLabel: scheduleLabel || null,
      amountFrom, ticketProvider: provider as DraftEventInput["ticketProvider"],
      ticketUrl: ticketUrl!,
    },
    errors,
  };
}

/** Kept for existing callers and tests. */
export function parseDraftEventForm(form: FormData): DraftEventInput | null {
  return validateDraftEventForm(form).value;
}
