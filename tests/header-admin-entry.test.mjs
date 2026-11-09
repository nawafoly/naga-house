import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { adminEntryForPath } from "../src/components/layout/admin-entry-model.ts";

const header = readFileSync(new URL("../src/components/layout/SiteHeader.tsx", import.meta.url), "utf8");
const login = readFileSync(new URL("../src/app/admin/login/page.tsx", import.meta.url), "utf8");
const adminLink = readFileSync(new URL("../src/components/layout/AdminHeaderLink.tsx", import.meta.url), "utf8");

test("desktop header CTA links to the existing protected admin login", () => {
  assert.match(header, /<AdminHeaderLink\s*\/>/);
  assert.deepEqual(adminEntryForPath("/", false), {
    href: "/admin/login",
    label: "تسجيل الدخول",
    ariaLabel: "تسجيل الدخول إلى الإدارة",
  });
  assert.doesNotMatch(header, /اكتشف الفعاليات/);
  assert.match(login, /getCurrentAdmin\(\)/);
});

test("mobile menu keeps an admin login link without hiding navigation", () => {
  assert.match(header, /aria-label="قائمة الجوال"[\s\S]*?<AdminHeaderLink mobile\s*\/>/);
  assert.match(header, /{navigationItems\.map\(\(item\) => \(/);
  assert.equal(adminEntryForPath("/events", true).label, "دخول");
});

test("protected admin pages show dashboard entry, without another session lookup", () => {
  assert.deepEqual(adminEntryForPath("/admin/events", false), {
    href: "/admin",
    label: "لوحة التحكم",
    ariaLabel: "لوحة التحكم",
  });
  assert.equal(adminEntryForPath("/admin", true).label, "لوحة");
  assert.equal(adminEntryForPath("/admin/login", true).label, "دخول");
  assert.equal(adminEntryForPath("/admin/login", false).href, "/admin/login");
  assert.match(adminLink, /usePathname\(\)/);
  assert.doesNotMatch(adminLink, /getCurrentAdmin|fetch\(/);
  assert.doesNotMatch(header, /getCurrentAdmin|fetch\(/);
});
