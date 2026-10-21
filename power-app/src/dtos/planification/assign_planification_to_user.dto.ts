import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsCalendarDay } from '../routine/is_calendar_day.decorator';

export class AssignPlanificationToUserDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Planificación (plantilla) a asignar. Tiene que estar activa y tener al menos una rutina vigente' })
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de planificación debe ser un UUID válido' })
    planification_id!: string;

    @ApiProperty({ example: 'uuid-1234', description: 'Alumno destinatario. Tiene que ser un usuario con rol user y la cuenta abierta' })
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de usuario debe ser un UUID válido' })
    user_id!: string;

    @ApiProperty({ example: '2026-10-22', description: 'Día de inicio, en formato YYYY-MM-DD (sin hora). Puede ser pasado o futuro: el servidor no calcula "hoy". La semana 1 del plan es la de lunes a domingo que lo contiene' })
    @IsNotEmpty()
    @IsCalendarDay()
    start_date!: string;

    @ApiPropertyOptional({ example: '2026-11-15', description: 'Día de fin, inclusive (YYYY-MM-DD). Si se omite, es el domingo de la semana duration de la plantilla (en el ejemplo, 4 semanas desde el lunes 19/10). Obligatorio si la plantilla tiene duración 0. No puede ser anterior a start_date (400). Puede ser más corto o más largo que la duración, y no hace falta que sea domingo' })
    @IsOptional()
    @IsCalendarDay()
    end_date?: string;

    @ApiPropertyOptional({ example: 'Foco en técnica', maxLength: 100, description: 'Nota del entrenador para el alumno. Para no dejar nota, se omite: la cadena vacía da 400' })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    coach_note?: string;

    @ApiPropertyOptional({ example: true, default: false, description: 'true para asignarla aunque se pise con otra planificación activa del alumno: las dos conviven. Sin esto, el solapamiento da 409 con las que se pisan' })
    @IsOptional()
    @IsBoolean()
    confirm_overlap?: boolean;
}
