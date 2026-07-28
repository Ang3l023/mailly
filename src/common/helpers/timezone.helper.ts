// src/common/helpers/timezone.helper.ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Zona horaria por defecto de la aplicación.
 * Cámbiala según tu país.
 */
export const APP_TIMEZONE = 'America/Mexico_City';

/**
 * Devuelve un dayjs configurado con la zona horaria de la app
 */
export function appDayjs(date?: string | Date | dayjs.Dayjs) {
  return dayjs(date).tz(APP_TIMEZONE);
}

/**
 * Inicio del día en la zona horaria de la app
 */
export function startOfDay(date: string | Date): Date {
  return appDayjs(date).startOf('day').toDate();
}

/**
 * Final del día en la zona horaria de la app
 */
export function endOfDay(date: string | Date): Date {
  return appDayjs(date).endOf('day').toDate();
}
