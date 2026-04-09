import { IsUUID, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class ParameterIdDto {
  @Type(() => String)
  @IsNotEmpty()
  @IsUUID('4', { message: 'El ID debe ser un UUID válido en formato SQL Server' })
  id: string;
}