// Formato del teléfono (CU-U-01 y CU-U-06, BE-43). Lo comparten el alta (CreateUserDto) y Mi cuenta
// (EditUserDto), así el validador y el `pattern` del Swagger salen de la misma expresión.
// El back no limpia nada: valida lo que llega. La web saca los espacios y guiones del número antes
// de enviarlo, así que un «11 2345-6789» que llegue directo a la API es un 400.

// «+» y de 1 a 4 dígitos: +54, +1, +598
export const PHONE_PREFIX_REGEX = /^\+\d{1,4}$/;
export const PHONE_PREFIX_MESSAGE = 'El código de país debe ser "+" seguido de 1 a 4 dígitos, por ejemplo +54';

// Sólo dígitos. El tope de 20 lo pone @MaxLength en cada DTO
export const PHONE_NUMBER_REGEX = /^\d+$/;
export const PHONE_NUMBER_MESSAGE = 'El teléfono solo puede tener números, sin espacios ni guiones';
