export type TimeZone = string;

/**
 * Parsea una fecha de forma flexible y la normaliza a UTC.
 * Soporta:
 * - ISO 8601 con o sin zona
 * - Formato latino (DD/MM/YYYY)
 * - Timestamp
 */
export function parseDate(value: any): Date | null {
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  // Intento 1: ISO o formato reconocido por Date
  let date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Intento 2: DD/MM/YYYY o DD-MM-YYYY
  const latinMatch = trimmed.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
  );

  if (latinMatch) {
    const [, day, month, year, hour = '0', minute = '0', second = '0'] =
      latinMatch;

    // Creamos la fecha en la zona horaria indicada usando formato ISO local
    const isoLocal = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;
    date = new Date(isoLocal);

    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

/**
 * Obtiene la fecha actual en una zona horaria específica (solo día, sin hora)
 */
export function getTodayInTimeZone(timeZone: TimeZone = 'UTC'): Date {
  const now = new Date();

  // Usamos Intl para obtener año/mes/día en la zona deseada
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(now);
  const year = Number(parts.find((p) => p.type === 'year')?.value);
  const month = Number(parts.find((p) => p.type === 'month')?.value);
  const day = Number(parts.find((p) => p.type === 'day')?.value);

  // Creamos la fecha en UTC representando ese día
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Compara solo la parte de fecha (ignora horas) en una zona horaria
 */
export function compareDatesOnly(
  dateA: Date,
  dateB: Date,
  timeZone: TimeZone = 'UTC',
): number {
  const toDateOnly = (date: Date): number => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const parts = formatter.formatToParts(date);
    const year = Number(parts.find((p) => p.type === 'year')?.value);
    const month = Number(parts.find((p) => p.type === 'month')?.value);
    const day = Number(parts.find((p) => p.type === 'day')?.value);

    return Date.UTC(year, month - 1, day);
  };

  return toDateOnly(dateA) - toDateOnly(dateB);
}
