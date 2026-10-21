// Las cuentas de las semanas del plan (spec del bloque B, §4), sobre dias 'YYYY-MM-DD'. Se hacen
// interpretando el dia en UTC ('2026-10-22T00:00:00Z') y nunca con new Date() local, para que la
// zona horaria del servidor no corra un dia. Funciones puras, sin Nest: el home del plan (BE-20)
// va a necesitar las mismas cuentas

const DAY_MS = 24 * 60 * 60 * 1000;

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
