import { ApiProperty } from '@nestjs/swagger';

/** El ejercicio de un RM, recortado a lo que hace falta para mostrarlo y agruparlo. */
export class UserRmExerciseRefDto {

    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiProperty({ example: 'Sentadilla' })
    name!: string;
}

/** El dueño de un RM, recortado a su nombre. */
export class UserRmUserRefDto {

    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiProperty({ example: 'Juan' })
    first_name!: string;

    @ApiProperty({ example: 'Pérez' })
    last_name!: string;
}

/**
 * Un RM tal como lo devuelven todos los endpoints de `user_rm` (lecturas, alta y edición):
 * sus columnas, con las FK, más el ejercicio y el usuario anidados.
 */
export class UserRmDetailDto {

    @ApiProperty({ example: 'uuid-1234' })
    id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    user_id!: string;

    @ApiProperty({ example: 'uuid-1234' })
    exercise_id!: string;

    @ApiProperty({ example: 100.5 })
    weight!: number;

    @ApiProperty({ example: 5 })
    reps!: number;

    @ApiProperty({ type: String, format: 'date', example: '2024-01-15', description: 'Día calendario, sin hora' })
    date!: string;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;

    @ApiProperty({ type: UserRmExerciseRefDto })
    exercise!: UserRmExerciseRefDto;

    @ApiProperty({ type: UserRmUserRefDto })
    user!: UserRmUserRefDto;
}
