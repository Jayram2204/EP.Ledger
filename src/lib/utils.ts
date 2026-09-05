import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates an array of date strings in 'YYYY-MM-DD' format between a start and end date (inclusive).
 */
export function generateDateRange(startDate: string | Date, endDate: string | Date): string[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Reset time portions to ensure accurate day calculation using UTC to avoid timezone shifts
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(0, 0, 0, 0);

  const dates: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    const yyyy = current.getUTCFullYear();
    const mm = String(current.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(current.getUTCDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

/**
 * Merges a sparse array of entry records into a dense array of dates.
 * Dates without entries will receive a placeholder { entry_date, isBlank: true }.
 */
export function mergeEntriesWithDates<T extends { entry_date: string }>(
  dates: string[], 
  entries: T[]
): Array<T | { entry_date: string, isBlank: true }> {
  // Map for O(1) lookup
  const entryMap = new Map<string, T>();
  for (const entry of entries) {
    entryMap.set(entry.entry_date, entry);
  }

  return dates.map(date => {
    const entry = entryMap.get(date);
    if (entry) {
      return entry;
    }
    return { entry_date: date, isBlank: true };
  });
}
