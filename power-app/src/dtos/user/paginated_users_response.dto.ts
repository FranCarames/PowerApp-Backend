import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../entities/user.entity';

export class PaginatedUsersResponseDto {

    @ApiProperty({ type: [User] })
    data!: User[];

    @ApiProperty({ example: 42, description: 'Total de usuarios que matchean el filtro (sin paginar)' })
    total!: number;

    @ApiProperty({ example: 1, description: 'Página actual' })
    page!: number;

    @ApiProperty({ example: 20, description: 'Resultados por página' })
    limit!: number;

    @ApiProperty({ example: 3, description: 'Cantidad total de páginas' })
    totalPages!: number;
}
