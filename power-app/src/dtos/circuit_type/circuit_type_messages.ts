// El 400 de circuit_type_id cuando no es un UUID, en el cuerpo del alta y la edicion de circuitos y en
// el query de los listados (plan de BE-44, 3.8). Una sola constante para que no diverjan
export const CIRCUIT_TYPE_ID_UUID_ERROR = 'El ID del tipo de circuito debe ser un UUID válido';
