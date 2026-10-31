import { OmitType } from '@nestjs/swagger';
import { CreatePlanificationDto } from './create_planification.dto';

// Mismo body que el alta menos weeks: la edicion pisa la cabecera entera, asi que un opcional omitido
// BORRA el valor que hubiera (mismo contrato que EditRoutineDto con coach_note). Las rutinas de un plan
// que ya existe se cambian con sus propios endpoints (CU-E-12), y con weeks el body las ignoraria en
// silencio. OmitType conserva las validaciones del alta.
// Se declara como clase propia y no como alias para que Swagger muestre un schema con
// nombre distinto y para dejar lugar a que los dos bodies diverjan
export class EditPlanificationDto extends OmitType(CreatePlanificationDto, ['weeks'] as const) {}
