import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsCalendarDay } from './is_calendar_day.decorator';

export class AssignRoutineToUserDto {

    @ApiProperty({ example: 'uuid-1234', description: 'Rutina a asignar. Tiene que estar activa' })
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de rutina debe ser un UUID válido' })
    routine_id!: string;

    @ApiProperty({ example: 'uuid-1234', description: 'Alumno destinatario. Tiene que ser un usuario con rol user y la cuenta abierta' })
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de usuario debe ser un UUID válido' })
    user_id!: string;

    @ApiProperty({ example: '2026-10-20', description: 'Día en que el alumno hace la rutina, en formato YYYY-MM-DD (sin hora). Puede ser pasado o futuro: el servidor no calcula "hoy". Un alumno no puede tener la misma rutina dos veces el mismo día (409)' })
    @IsNotEmpty()
    @IsCalendarDay()
    date!: string;
}
