import { QueryFailedError } from 'typeorm';

// Reconoce un error de Postgres por su codigo (23505 = unico, 23503 = clave foranea). constraint es
// opcional: sirve para no confundir el que importa con cualquier otro. Nacio en routine/ (BE-11) y se
// comparte desde que muscles/ tambien traduce el 23503 (BE-24, BE-25)
export function isDatabaseError(error: unknown, code: string, constraint?: string): boolean {
    if (!(error instanceof QueryFailedError)) {
        return false;
    }

    const driverError: { code?: string; constraint?: string } | undefined = error.driverError;

    return driverError?.code === code && (!constraint || driverError.constraint === constraint);
}
