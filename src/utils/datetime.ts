// Date/Time Utility Functions
import { DateTime } from "luxon";

// Date formats
export const DATETIME_FORMATS = {
  DATE: "yyyy-MM-dd",
  DATETIME: "yyyy-MM-dd HH:mm:ss",
  DISPLAY_DATE: "dd.MM.yyyy",
  DISPLAY_DATETIME: "dd.MM.yyyy HH:mm",
  MONTH_YEAR: "MMMM yyyy",
};

// Format date to API format (YYYY-MM-DD)
export function formatDate(date: Date | string): string {
  return DateTime.fromJSDate(typeof date === "string" ? new Date(date) : date)
    .setLocale("en")
    .toFormat(DATETIME_FORMATS.DATE);
}

// Format date for display (DD.MM.YYYY)
export function formatDisplayDate(date: Date | string): string {
  return DateTime.fromJSDate(typeof date === "string" ? new Date(date) : date)
    .setLocale("en")
    .toFormat(DATETIME_FORMATS.DISPLAY_DATE);
}

// Get today's date
export function getToday(): string {
  return DateTime.now().setLocale("en").toFormat(DATETIME_FORMATS.DATE);
}

// Get start and end of current month
export function getCurrentMonthRange(): { start: string; end: string } {
  const now = DateTime.now().setLocale("en");
  return {
    start: now.startOf("month").toFormat(DATETIME_FORMATS.DATE),
    end: now.endOf("month").toFormat(DATETIME_FORMATS.DATE),
  };
}

// Get all days in a month
export function getDaysInMonth(year: number, month: number): string[] {
  const date = DateTime.fromObject({ year, month }).setLocale("en");
  const daysInMonth = date.daysInMonth || 0;
  const days: string[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(
      DateTime.fromObject({ year, month, day })
        .setLocale("en")
        .toFormat(DATETIME_FORMATS.DATE)
    );
  }

  return days;
}

// Check if date is today
export function isToday(date: string): boolean {
  return date === getToday();
}
