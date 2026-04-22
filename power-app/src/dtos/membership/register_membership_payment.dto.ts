import {
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterMembershipPaymentDto {
    
    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('4', { message: 'El ID debe ser un UUID válido en formato PostgreSQL' })
    user_id!: string;

    @Type(() => String)
    @IsNotEmpty()
    @IsUUID('4', { message: 'El ID debe ser un UUID válido en formato PostgreSQL' })
    membership_id!: string;
}