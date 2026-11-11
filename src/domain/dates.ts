/** Local-date helpers. Date keys are YYYY-MM-DD in the device's local timezone. */
export type DateKey = string;

const pad = (n: number) => String(n).padStart(2, '0');

export function dateKey(d: Date | number): DateKey {
  const x = typeof d === 'number' ? new Date(d) : d;
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
}

export function parseKey(k: DateKey): Date {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(k: DateKey, n: number): DateKey {
  const d = parseKey(k);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

/** Monday of the week containing k. */
export function weekStart(k: DateKey): DateKey {
  const d = parseKey(k);
  const dow = (d.getDay() + 6) % 7; // Mon=0 .. Sun=6
  return addDays(k, -dow);
}

export function daysBetween(a: DateKey, b: DateKey): number {
  const da = parseKey(a);
  const db = parseKey(b);
  return Math.round((Date.UTC(db.getFullYear(), db.getMonth(), db.getDate()) - Date.UTC(da.getFullYear(), da.getMonth(), da.getDate())) / 86400000);
}
