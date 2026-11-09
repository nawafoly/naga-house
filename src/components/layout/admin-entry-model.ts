/**
 * Public pages keep their login entry. Protected admin pages can point back to
 * the dashboard without checking D1 on every public page request.
 * Authorization is still enforced by the /admin routes themselves.
 */
export function adminEntryForPath(pathname: string | null, mobile: boolean) {
  const isAdminRoute = pathname === "/admin" || pathname?.startsWith("/admin/");
  const showDashboard = Boolean(isAdminRoute && pathname !== "/admin/login");

  return {
    href: showDashboard ? "/admin" : "/admin/login",
    label: showDashboard ? (mobile ? "لوحة" : "لوحة التحكم") : mobile ? "دخول" : "تسجيل الدخول",
    ariaLabel: showDashboard ? "لوحة التحكم" : "تسجيل الدخول إلى الإدارة",
  };
}
