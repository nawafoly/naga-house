import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const header = readFileSync(new URL("../src/components/layout/SiteHeader.tsx", import.meta.url), "utf8");
const login = readFileSync(new URL("../src/app/admin/login/page.tsx", import.meta.url), "utf8");

test("desktop header CTA links to the existing protected admin login", () => {
  assert.match(header, /href="\/admin\/login"[\s\S]*?sm:inline-flex[\s\S]*?تسجيل الدخول/);
  assert.doesNotMatch(header, /اكتشف الفعاليات/);
  assert.match(login, /getCurrentAdmin\(\)/);
});

test("mobile menu keeps an admin login link without hiding navigation", () => {
  assert.match(header, /aria-label="قائمة الجوال"[\s\S]*?href="\/admin\/login"[\s\S]*?دخول/);
  assert.match(header, /{navigationItems\.map\(\(item\) => \(/);
});
