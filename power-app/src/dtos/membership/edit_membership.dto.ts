import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsNumber,
  Min,
  IsPositive,
  IsInt,
} from 'class-validator';

export class EditMembershipDto {
    
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name!: string;

    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    @Min(1)
    duration!: number;

    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @Min(0.01)
    price!: number;
}