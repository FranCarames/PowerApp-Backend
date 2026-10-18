import { registerDecorator, ValidationOptions } from 'class-validator';

const DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

// Un dia sin hora ("2026-10-20"), que ademas exista en el calendario. @IsDateString() no
// alcanza: acepta tambien fecha con hora y zona ("2026-10-20T23:30:00-03:00"), y las fechas
// de la rutina individual son dias, no instantes. El ano 0000 se rechaza porque Postgres lo
// declara fuera de rango y saldria un 500
export function isCalendarDay(value: unknown): boolean {
    if (typeof value !== 'string') {
        return false;
    }

    const match = DAY_PATTERN.exec(value);

    if (!match) {
        return false;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (year < 1) {
        return false;
    }

    // setUTCFullYear y no Date.UTC: el constructor trata los anos 0..99 como 1900..1999.
    // Se arma el dia y se compara: si el calendario lo corrio (30 de febrero → 2 de marzo),
    // el dia no existe
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);

    return date.getUTCFullYear() === year
        && date.getUTCMonth() === month - 1
        && date.getUTCDate() === day;
}

export function IsCalendarDay(validationOptions?: ValidationOptions) {
    return (object: object, propertyName: string) => {
        registerDecorator({
            name: 'isCalendarDay',
            target: object.constructor,
            propertyName,
            options: {
                message: 'La fecha debe ser un día válido en formato YYYY-MM-DD (por ejemplo, 2026-10-20)',
                ...validationOptions,
            },
            validator: {
                validate: (value: unknown) => isCalendarDay(value),
            },
        });
    };
}
