import { PartialType } from '@nestjs/mapped-types'
import { CreateRestauranteDto } from './create-restaurante.dto'
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'

export class UpdateRestauranteDto extends PartialType(CreateRestauranteDto) {
  @IsString({ message: 'El nombre debe ser un string' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  nombre?: string

  @IsString({ message: 'La calle debe ser un string' })
  @IsNotEmpty({ message: 'La calle no puede estar vacía' })
  calle?: string

  @IsString({ message: 'La localidad debe ser un string' })
  @IsNotEmpty({ message: 'La localidad no puede estar vacía' })
  localidad?: string

  @IsPositive({ message: 'La capacidad debe ser un número positivo' })
  @IsNotEmpty({ message: 'La capacidad no puede estar vacía' })
  @IsOptional()
  capacidad?: number

  @IsBoolean({ message: 'El borrado debe ser un booleano' })
  @IsOptional()
  borrado?: boolean
}
