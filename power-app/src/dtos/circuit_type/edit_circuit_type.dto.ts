import { CreateCircuitTypeDto } from './create_circuit_type.dto';

// Mismo body que el alta, con las mismas reglas: la edicion pisa los dos campos, asi que sin
// description (o vacia) la descripcion queda en null. No cambia active: para eso esta set-active.
// Clase propia y no alias, como EditCircuitDto, para que Swagger muestre un schema con su nombre
export class EditCircuitTypeDto extends CreateCircuitTypeDto {}
