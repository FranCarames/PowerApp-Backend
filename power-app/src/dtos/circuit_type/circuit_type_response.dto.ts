import { ApiProperty } from '@nestjs/swagger';

// La forma de un tipo en las cuatro respuestas de /routine/circuit-type/* (plan de BE-44, 3.1)
export class CircuitTypeResponseDto {

    @ApiProperty({ example: '49f793de-7681-5c05-a171-371baa69e9eb' })
    id!: string;

    @ApiProperty({ example: 'Principal' })
    type!: string;

    @ApiProperty({ example: 'El bloque central de la sesión', nullable: true, type: String, description: 'null si no tiene' })
    description!: string | null;

    @ApiProperty({ example: true, description: 'false si está dado de baja: no se ofrece para circuitos nuevos ni para cambiarle el tipo a uno existente' })
    active!: boolean;

    @ApiProperty({ example: 5, description: 'Cantidad de circuitos activos con este tipo. Los dados de baja no suman' })
    circuit_count!: number;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;
}
