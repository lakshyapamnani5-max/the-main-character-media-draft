/**
 * Safe Date Utilities for TMCM ERP
 * Eliminates timezone / UTC off-by-one errors (e.g. 9th showing as 10th or 8th)
 * Handles multi-year navigation cleanly (2026, 2027, 2028+)
 */

// Format year, month (1-12), day into YYYY-MM-DD in local time
export function formatYYYYMMDD(year: number, month1Based: number, day: number): string {
  const y = String(year).padStart(4, '0');
  const m = String(month1Based).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Get today's date in local YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  return formatYYYYMMDD(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

// Safely parse a date string (YYYY-MM-DD) into a local Date at 12:00:00 (midday)
// to avoid daylight savings or midnight timezone boundary flips
export function parseDateSafe(dateStr?: string | null): Date {
  if (!dateStr) return new Date();
  const clean = dateStr.split('T')[0].trim();
  const parts = clean.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

// Format a date string (e.g. "2026-11-09" or "2027-02-15") for display in Indian format
export function formatDisplayDate(
  dateStr?: string | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateStr) return 'TBD';
  const d = parseDateSafe(dateStr);
  return d.toLocaleDateString('en-IN', options || {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// Format date with day of week (e.g. "Monday, 09 November 2026")
export function formatFullDisplayDate(dateStr?: string | null): string {
  return formatDisplayDate(dateStr, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

// Check if two date strings represent the same day
export function isSameDay(dateStr1?: string | null, dateStr2?: string | null): boolean {
  if (!dateStr1 || !dateStr2) return false;
  return dateStr1.split('T')[0].trim() === dateStr2.split('T')[0].trim();
}

