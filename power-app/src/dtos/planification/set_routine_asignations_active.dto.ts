import { IsNotEmpty, IsBoolean, IsArray, ArrayNotEmpty, ArrayMaxSize, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetRoutineAsignationsActiveDto {

    @ApiProperty({ example: ['uuid-1234', 'uuid-5678'], description: 'Los ids pueden pertenecer a planificaciones distintas. No se aceptan repetidos' })
    @IsArray()
    @ArrayNotEmpty({ message: 'Hay que enviar al menos una asignación' })
    @ArrayMaxSize(50, { message: 'No se pueden modificar más de 50 asignaciones por vez' })
    @IsUUID('all', { each: true, message: 'Cada ID de asignación debe ser un UUID válido' })
    routine_asignation_ids!: string[];

    @ApiProperty({ example: false, description: 'Al reactivar en lote, cada asignación vuelve a su lugar (su semana y su orden). Si alguna queda fuera de la duración actual de su plan, es un 400 y no se aplica ninguna' })
    @IsNotEmpty()
    @IsBoolean()
    active!: boolean;
}
