import {
  IsIdentityCard,
  IsInt,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Min,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateClienteDto {
  @ApiProperty({
    example: '64857416T',
    description: 'Dni del cliente',
  })
  @IsIdentityCard('ES', { message: 'El dni tiene que ser valido' })
  @IsNotEmpty({ message: 'El dni no puede estar vacío' })
  dni: string
  @ApiProperty({
    example: 'Rodrigo',
    description: 'El nombre del cliente',
    minLength: 1,
  })
  @IsString({ message: 'El nombre debe ser un string' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  nombre: string
  @ApiProperty({
    example: 'Lopez',
    description: 'El apellido del cliente',
    minLength: 1,
  })
  @IsString({ message: 'El apellido debe ser un string' })
  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  apellido: string
  @ApiProperty({
    example: 25,
    description: 'La edad del cliente',
    minimum: 1,
  })
  @IsInt({ message: 'La edad debe ser un número entero' })
  @Min(0, { message: 'La edad no puede ser un número negativo' })
  edad: number
  @ApiProperty({
    example: '123456789',
    description: 'Número de teléfono del cliente',
    minLength: 9,
    maxLength: 15,
  })
  @IsPhoneNumber('ES', { message: 'Número de teléfono inválido' })
  telefono: string
}
