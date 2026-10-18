// Tope tecnico de duration y week: el maximo de un INTEGER de Postgres. NO es una regla de
// dominio, solo evita el 500 por "integer out of range". Si el producto fija un tope, se baja aca
export const INTEGER_MAX = 2147483647;
