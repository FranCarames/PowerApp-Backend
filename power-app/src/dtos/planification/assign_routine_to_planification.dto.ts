import { IsNotEmpty, IsUUID, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignRoutineToPlanificationDto {

    @ApiProperty({ example: 'uuid-1234' })
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de planificación debe ser un UUID válido' })
    planification_id!: string;

    @ApiProperty({ example: 'uuid-1234', description: 'La misma rutina puede asignarse más de una vez a la misma planificación' })
    @IsNotEmpty()
    @IsUUID('all', { message: 'El ID de rutina debe ser un UUID válido' })
    routine_id!: string;

    @ApiPropertyOptional({ example: 1, minimum: 1, description: 'Posición dentro del plan. Si se omite, la asignación va al final. Si se manda una posición ya ocupada se persiste igual: no se desplaza el resto y el order puede quedar duplicado' })
    @IsOptional()
    @IsInt()
    @Min(1)
    order?: number;
}
