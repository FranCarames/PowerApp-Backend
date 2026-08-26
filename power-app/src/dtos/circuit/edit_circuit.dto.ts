import { CreateCircuitDto } from './create_circuit.dto';

// Mismo body que el alta: la edicion pisa la cabecera y la lista completa de ejercicios.
// Se declara como clase propia y no como alias para que Swagger muestre un schema con
// nombre distinto y para dejar lugar a que los dos bodies diverjan
export class EditCircuitDto extends CreateCircuitDto {}
