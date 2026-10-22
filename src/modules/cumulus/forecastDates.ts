/* Pure helpers for the relation: forecast_date = run_date + lead_time.
 * All dates are 'yyyy-mm-dd' strings handled in UTC. */

export const HOURS_PER_DAY = 24;
export const NUM_LEAD_SLOTS = 46;
export const MAX_LEAD_HOURS = NUM_LEAD_SLOTS * HOURS_PER_DAY;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_HOUR = 60 * 60 * 1000;

export const isDateString = (value: string | null): value is string =>
  value !== null && DATE_PATTERN.test(value);

const toMs = (date: string) => new Date(`${date}T00:00:00Z`).getTime();

export const addHours = (date: string, hours: number): string =>
  new Date(toMs(date) + hours * MS_PER_HOUR).toISOString().slice(0, 10);

export const hoursBetween = (from: string, to: string): number =>
  Math.round((toMs(to) - toMs(from)) / MS_PER_HOUR);

// eg "0024h" or "024h" -> 24
export const parseLeadHours = (entry: string | null): number | null => {
  const hours = entry ? parseInt(entry, 10) : NaN;
  return Number.isNaN(hours) ? null : hours;
};

// eg 24 -> "0024h"
export const formatLeadEntry = (hours: number): string =>
  hours.toString().padStart(4, '0') + 'h';

// An N-day accumulation only exists from lead time N*24h
export const minLeadHours = (accumDays: number | null): number =>
  Math.min(Math.max(accumDays ?? 1, 1), NUM_LEAD_SLOTS) * HOURS_PER_DAY;

export const clampLeadHours = (
  hours: number,
  accumDays: number | null,
): number => Math.min(MAX_LEAD_HOURS, Math.max(minLeadHours(accumDays), hours));

/* Chooses a run date from `available` for the given forecast date: the newest
 * date that gives exactly that forecast date, otherwise the one whose
 * (clamped) forecast date is nearest, preferring newer on ties. */
export const pickRunDate = (
  available: string[],
  forecastDate: string,
  accumDays: number | null,
): string | null => {
  let best: string | null = null;
  let bestDiff = Infinity;
  available.forEach((runDate) => {
    const lead = clampLeadHours(hoursBetween(runDate, forecastDate), accumDays);
    const diff = Math.abs(hoursBetween(forecastDate, addHours(runDate, lead)));
    if (diff < bestDiff || (diff === bestDiff && best && runDate > best)) {
      best = runDate;
      bestDiff = diff;
    }
  });
  return best;
};
