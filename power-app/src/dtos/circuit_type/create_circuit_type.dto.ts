import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// El ValidationPipe pasa el body por class-transformer antes de validar, asi que los largos y el
// "no vacio" se controlan sobre el texto ya recortado: «  » es un nombre vacio, y 50 caracteres
// con espacios en los bordes pasan (CU-A-25, regla 1)
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// Una descripcion vacia o de espacios es lo mismo que no mandarla: queda undefined y el service
// guarda NULL
const trimOrUndefined = ({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
        return value;
    }

    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
};

export class CreateCircuitTypeDto {

    @ApiProperty({ example: 'Principal', maxLength: 50, description: 'Nombre del tipo. Se guarda recortado y tiene que tener de 1 a 50 caracteres ya recortado. Único sin distinguir mayúsculas ni espacios de los bordes, contra los tipos activos y los dados de baja' })
    @Transform(trim)
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    type!: string;

    @ApiPropertyOptional({ example: 'El bloque central de la sesión', maxLength: 100, description: 'Opcional. Se guarda recortada, hasta 100 caracteres. Vacía o con solo espacios es lo mismo que no mandarla: queda en null' })
    @Transform(trimOrUndefined)
    @IsOptional()
    @IsString()
    @MaxLength(100)
    description?: string;
}
