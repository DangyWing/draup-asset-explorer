import { DateTime } from "luxon";

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: string, locale: string, timeZone: string) {
  if (!date) return "";

  const dateObj = DateTime.fromSQL(date);
  return dateObj.setLocale(locale).setZone(timeZone).toLocaleString();
}

export function formatTime(date: string, locale: string, timeZone: string) {
  if (!date) return "";

  const dateObj = DateTime.fromSQL(date, { setZone: true, zone: "utc" });
  return dateObj.setZone(timeZone).setLocale(locale).toLocaleString(DateTime.TIME_SIMPLE);
}
