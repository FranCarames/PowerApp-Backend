import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CircuitTypeRefDto } from '../circuit_type/circuit_type_ref.dto';

// La respuesta de POST /routine/circuit/set-active/:id. Hasta BE-44 devolvia la entidad; se arma a
// mano para no exponer circuit_type_id suelto ni la relacion (plan de BE-44, 3.7 y 3.9.2)
export class CircuitResponseDto {

    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiProperty({ example: 'Entrada en calor - Tren superior' })
    name!: string;

    @ApiPropertyOptional({ example: 'Movilidad de hombro y activación de manguito', nullable: true, type: String })
    description?: string | null;

    @ApiProperty({ type: CircuitTypeRefDto, description: 'El tipo del circuito. Puede estar dado de baja (active: false): el circuito lo conserva' })
    circuit_type!: CircuitTypeRefDto;

    @ApiProperty({ example: true })
    active!: boolean;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;
}
