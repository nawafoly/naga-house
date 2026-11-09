/** Keep canonical city values in D1 while displaying Arabic labels in admin. */
export function getAdminCityLabel(city: string): string {
  return city.trim().toLowerCase() === "jeddah" ? "جدة" : city;
}
