import {
    IsNotEmpty, IsUUID, IsArray, ArrayNotEmpty, ArrayMaxSize, ArrayUnique, IsInt, Min, Max,
    Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { INTEGER_MAX } from './planification_limits';

// Repetir una semana sobre si misma duplicaria su contenido: la semana de origen no puede estar
// entre las destino. Necesita mirar otro campo del body, por eso es una constraint propia
@ValidatorConstraint({ name: 'toWeeksWithoutFromWeek', async: false })
class ToWeeksWithoutFromWeek implements ValidatorConstraintInterface {
    validate(toWeeks: unknown, args: ValidationArguments): boolean {
        const { from_week } = args.object as RepeatPlanificationWeekDto;
        return !Array.isArray(toWeeks) || !toWeeks.includes(from_week);
    }

    defaultMessage(): string {
        return 'Las semanas destino no pueden incluir la semana de origen';
    }
}

export class RepeatPlanificationWeekDto {

    @ApiProperty({ example: 'uuid-1234' })
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de planificación debe ser un UUID válido' })
    planification_id!: string;

    @ApiProperty({ example: 1, minimum: 1, maximum: INTEGER_MAX, description: 'Semana de origen: se copian sus rutinas vigentes, en su orden. Tiene que tener al menos una (400). Si la planificación tiene duración mayor que 0, no puede superarla (400)' })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(INTEGER_MAX)
    from_week!: number;

    @ApiProperty({ type: [Number], example: [2, 3], minItems: 1, maxItems: 50, uniqueItems: true, description: 'Semanas destino, distintas entre sí y distintas de from_week. Las copias se suman al final de cada semana, consecutivas, aunque ya tenga rutinas. Si la planificación tiene duración mayor que 0, ninguna puede superarla (400)' })
    @IsArray()
    @ArrayNotEmpty({ message: 'Hay que enviar al menos una semana destino' })
    @ArrayMaxSize(50, { message: 'No se pueden repetir más de 50 semanas por vez' })
    @ArrayUnique({ message: 'Las semanas destino no pueden repetirse' })
    @IsInt({ each: true, message: 'Cada semana destino debe ser un entero' })
    @Min(1, { each: true, message: 'Cada semana destino debe ser 1 o más' })
    @Max(INTEGER_MAX, { each: true, message: 'Cada semana destino es demasiado grande' })
    @Validate(ToWeeksWithoutFromWeek)
    to_weeks!: number[];
}
