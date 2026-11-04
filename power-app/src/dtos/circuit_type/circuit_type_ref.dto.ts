import { ApiProperty } from '@nestjs/swagger';

// El tipo dentro de cada circuito, en toda respuesta que trae un circuito (plan de BE-44, 3.7). El
// id va aca adentro: ninguna respuesta trae circuit_type_id suelto
export class CircuitTypeRefDto {

    @ApiProperty({ example: '49f793de-7681-5c05-a171-371baa69e9eb' })
    id!: string;

    @ApiProperty({ example: 'Principal' })
    type!: string;

    @ApiProperty({ example: true, description: 'false si el Admin lo dio de baja: el circuito lo conserva, pero no se puede elegir para otro' })
    active!: boolean;
}
