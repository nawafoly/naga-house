"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type FieldErrors = Record<string, string>;

const inputClass = "mt-2 w-full rounded-lg border border-[#69816e] bg-[#222222] px-4 py-3 text-[#f8eedb] outline-offset-2 focus:outline-[#ed8b52]";
const labelClass = "block text-sm font-semibold";

function FieldError({ field, errors }: { field: string; errors: FieldErrors }) {
  return errors[field] ? <span role="alert" className="mt-1 block text-sm text-[#ffc5a4]">{errors[field]}</span> : null;
}

/** Client-side enhancement: server still verifies all permissions and all form fields. */
export function DraftEventForm() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [summary, setSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    const body = new URLSearchParams();
    for (const [key, value] of new FormData(form)) {
      if (typeof value === "string") body.set(key, value);
    }
    setSubmitting(true);
    setSummary("");
    setFieldErrors({});
    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: body.toString(),
      });
      if (response.headers.get("content-type")?.includes("application/json")) {
        const payload: { ok?: boolean; redirect?: string; code?: string; fields?: FieldErrors } = await response.json();
        if (response.ok && payload.ok && payload.redirect?.startsWith("/admin/events")) {
          window.location.assign(payload.redirect);
          return;
        }
        const errors = payload.fields ?? {};
        setFieldErrors(errors);
        setSummary(payload.code === "duplicate"
          ? "هذا المعرّف مستخدم بالفعل. عدّله ثم أعد الحفظ."
          : payload.code === "server"
            ? "تعذر الحفظ في قاعدة البيانات. لم يتم مسح المدخلات، ويمكن المحاولة بعد التحقق من D1."
            : "لم يتم الحفظ. صحّح الحقول الموضحة أدناه ثم أعد المحاولة؛ بياناتك لا تزال موجودة.");
        const firstField = Object.keys(errors)[0];
        if (firstField) (form.elements.namedItem(firstField) as HTMLElement | null)?.focus();
      } else {
        setSummary(response.status === 401
          ? "انتهت جلسة الإدارة. افتح /admin/login وسجّل الدخول، ثم أعد تعبئة النموذج بعد عودتك."
          : "لم تكتمل العملية. لم تمسح المدخلات. تأكد من تشغيل الخادم واتصالك به.");
      }
    } catch {
      setSummary("تعذر الاتصال بالخادم. بياناتك ما زالت موجودة، ويمكن إعادة المحاولة بعد تشغيل الخادم.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
        <form method="post" action="/api/admin/events" onSubmit={(event) => { void handleSubmit(event); }} className="grid gap-6 rounded-2xl border border-[#69816e] bg-[#324b36] p-6 sm:p-8">
          {summary && <div role="alert" aria-live="assertive" className="rounded-xl border border-[#ed8b52] bg-[#613c32] p-4 text-sm">{summary}</div>}
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>اسم الفعالية بالعربية *
              <input className={inputClass} name="titleAr" maxLength={160} minLength={2} required placeholder="مثل: حفلة موسيقية في جدة" />
<FieldError field="titleAr" errors={fieldErrors} />
            </label>
            <label className={labelClass}>الاسم بالإنجليزية (اختياري)
              <input className={inputClass} name="titleEn" maxLength={160} dir="ltr" />
<FieldError field="titleEn" errors={fieldErrors} />
            </label>
          </div>
          <label className={labelClass}>المعرّف في الرابط (بالإنجليزية) *
            <input className={inputClass} name="slug" maxLength={120} minLength={3} required dir="ltr" placeholder="jeddah-music-night-2026" pattern="[a-z0-9]+(-[a-z0-9]+)*" />
<FieldError field="slug" errors={fieldErrors} />
          </label>
          <label className={labelClass}>وصف الفعالية (اختياري)
            <textarea className={inputClass} rows={4} maxLength={5000} name="descriptionAr" />
<FieldError field="descriptionAr" errors={fieldErrors} />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>التصنيف *
              <select className={inputClass} name="category" defaultValue="music" required>
                <option value="music">موسيقى</option>
                <option value="theater">مسرح</option>
                <option value="sports">رياضة</option>
                <option value="family">عائلة</option>
                <option value="dining">مطاعم وتجارب</option>
                <option value="entertainment">ترفيه</option>
              </select>
<FieldError field="category" errors={fieldErrors} />
            </label>
            <label className={labelClass}>الموقع داخل جدة *
              <input className={inputClass} name="venue" maxLength={160} required placeholder="اسم المسرح أو القاعة" />
<FieldError field="venue" errors={fieldErrors} />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>وقت البداية (بتوقيت السعودية)
              <input className={inputClass} type="datetime-local" name="startAt" />
<FieldError field="startAt" errors={fieldErrors} />
            </label>
            <label className={labelClass}>وصف الموعد (بديل للتاريخ)
              <input className={inputClass} name="scheduleLabel" maxLength={160} placeholder="قريبًا / موعد يعلن لاحقًا" />
<FieldError field="scheduleLabel" errors={fieldErrors} />
            </label>
          </div>
          <p className="text-xs text-[#f8eedb]/75">يجب إدخال تاريخ البداية أو وصف الموعد على الأقل. المدينة مضبوطة على جدة.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>السعر يبدأ من (ريال، اختياري)
              <input className={inputClass} name="amountFrom" type="number" min="0" max="999999" step="0.01" />
<FieldError field="amountFrom" errors={fieldErrors} />
            </label>
            <label className={labelClass}>منصة التذاكر الرسمية *
              <select className={inputClass} name="ticketProvider" required defaultValue="webook">
                <option value="webook">WeBook</option>
                <option value="ticketmx">TicketMX</option>
                <option value="platinumlist">Platinumlist</option>
                <option value="nofomo">NOFOMO</option>
              </select>
<FieldError field="ticketProvider" errors={fieldErrors} />
            </label>
          </div>
          <label className={labelClass}>رابط صفحة التذاكر الرسمية للفعالية *
            <input className={inputClass} name="ticketUrl" type="url" required dir="ltr" maxLength={2048} placeholder="https://webook.com/..." />
<FieldError field="ticketUrl" errors={fieldErrors} />
          </label>
          <label className={labelClass}>رابط صورة الفعالية من Unsplash *
            <input className={inputClass} name="imageUrl" type="url" required dir="ltr" maxLength={2048} placeholder="https://images.unsplash.com/..." />
<FieldError field="imageUrl" errors={fieldErrors} />
          </label>
          <div className="flex flex-wrap gap-4">
            <button type="submit" disabled={submitting} className="rounded-lg bg-[#ed8b52] px-6 py-3 font-bold text-[#222222]">{submitting ? "جارٍ الحفظ..." : "حفظ كمسودة"}</button>
            <Link href="/admin/events" className="rounded-lg border border-[#69816e] px-6 py-3">إلغاء</Link>
          </div>
        </form>
  );
}
