// Las cuentas de las semanas del plan (spec del bloque B, §4), sobre dias 'YYYY-MM-DD'. Se hacen
// interpretando el dia en UTC ('2026-10-22T00:00:00Z') y nunca con new Date() local, para que la
// zona horaria del servidor no corra un dia. Funciones puras, sin Nest: las usan E-13 (el fin por
// defecto) y el home del plan (BE-20, desde routine/)

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

// El ultimo dia que entra en el formato YYYY-MM-DD (y en IsCalendarDay)
const LAST_DAY_MS = Date.UTC(9999, 11, 31);

function toUtcMs(day: string): number {
    return Date.parse(`${day}T00:00:00Z`);
}

function fromUtcMs(ms: number): string {
    return new Date(ms).toISOString().slice(0, 10);
}

// El lunes de la semana (de lunes a domingo) que contiene el dia. La semana 1 del plan es la que
// contiene start_date, sea el dia que sea (D16)
export function mondayOf(day: string): string {
    const ms = toUtcMs(day);
    // getUTCDay: 0 = domingo, 1 = lunes ... 6 = sabado. Dias desde el lunes: lunes 0 ... domingo 6
    const daysSinceMonday = (new Date(ms).getUTCDay() + 6) % 7;

    return fromUtcMs(ms - daysSinceMonday * DAY_MS);
}

// El fin por defecto de una asignacion: el domingo de la semana `duration` (D17), o sea el lunes de
// inicio + 7 * duration - 1. Solo para duration >= 1: con 0 la plantilla no tiene duracion fija y el
// fin lo indica el coach. Devuelve null si cae despues del 9999-12-31: es un tope tecnico, como
// INTEGER_MAX en la duracion, para que una duracion absurda no termine en un 500
export function defaultPlanEndDate(startDate: string, duration: number): string | null {
    const endMs = toUtcMs(mondayOf(startDate)) + (7 * duration - 1) * DAY_MS;

    return endMs <= LAST_DAY_MS ? fromUtcMs(endMs) : null;
}

// La semana del plan que contiene el dia: la 1 es la que contiene start_date (D16), y van de lunes a
// domingo. Un dia anterior al lunes de inicio da 0 o menos: el que la usa recorta. El home del plan
// la usa para saber que semanas se pisan con [from, to] y cual es la ultima (la que contiene end_date)
export function planWeekOf(startDate: string, day: string): number {
    return Math.floor((toUtcMs(day) - toUtcMs(mondayOf(startDate))) / WEEK_MS) + 1;
}

// El lunes y el domingo de la semana `week` del plan (spec §4), aunque el plan arranque o termine a
// mitad de semana. El domingo se recorta al 9999-12-31: solo lo toca la semana que contiene ese dia
// (un viernes), cuyo domingo ya no entra en el formato YYYY-MM-DD. Es el mismo tope tecnico que el
// del fin por defecto
export function planWeekBounds(startDate: string, week: number): { week_start: string; week_end: string } {
    const weekStartMs = toUtcMs(mondayOf(startDate)) + (week - 1) * WEEK_MS;

    return {
        week_start: fromUtcMs(weekStartMs),
        week_end: fromUtcMs(Math.min(weekStartMs + 6 * DAY_MS, LAST_DAY_MS)),
    };
}
