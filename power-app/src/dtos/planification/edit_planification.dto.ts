import { CreatePlanificationDto } from './create_planification.dto';

// Mismo body que el alta: la edicion pisa la cabecera entera, asi que un opcional omitido
// BORRA el valor que hubiera (mismo contrato que EditRoutineDto con coach_note).
// Se declara como clase propia y no como alias para que Swagger muestre un schema con
// nombre distinto y para dejar lugar a que los dos bodies diverjan
export class EditPlanificationDto extends CreatePlanificationDto {}
