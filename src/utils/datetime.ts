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

// Get the start and end dates of the current year
export function getCurrentYearRange(): { start: string; end: string } {
  const year = DateTime.now().year;
  return {
    start: DateTime.fromObject({ year, month: 1, day: 1 }).toFormat(DATETIME_FORMATS.DATE),
    end: DateTime.fromObject({ year, month: 12, day: 31 }).toFormat(DATETIME_FORMATS.DATE),
  };
}

// Get all days in the current year (Jan 1 – Dec 31)
export function getCurrentYearDays(): string[] {
  const year = DateTime.now().year;
  const start = DateTime.fromObject({ year, month: 1, day: 1 });
  const end = DateTime.fromObject({ year, month: 12, day: 31 });
  const days: string[] = [];
  let current = start;
  while (current <= end) {
    days.push(current.toFormat(DATETIME_FORMATS.DATE));
    current = current.plus({ days: 1 });
  }
  return days;
}

// Get past N days as array of date strings
export function getPastDays(count: number): string[] {
  const days: string[] = [];
  const now = DateTime.now().setLocale("en");
  
  for (let i = count - 1; i >= 0; i--) {
    days.push(now.minus({ days: i }).toFormat(DATETIME_FORMATS.DATE));
  }
  
  return days;
}

// Get date N days ago
export function getDaysAgo(days: number): string {
  return DateTime.now().setLocale("en").minus({ days }).toFormat(DATETIME_FORMATS.DATE);
}

// Get the week number of the year for a given date
export function getWeekNumber(date: string): number {
  return DateTime.fromISO(date).weekNumber;
}

// Get day of week (0 = Sunday, 6 = Saturday, matching JS convention)
export function getDayOfWeek(date: string): number {
  return DateTime.fromISO(date).weekday % 7; // Luxon uses 1-7 (Mon-Sun), convert to 0-6
}

// Format date for display in heatmap tooltip
export function formatHeatmapDate(date: string): string {
  return DateTime.fromISO(date).toFormat("ccc, LLL d, yyyy");
}
