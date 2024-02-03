import {
  IsEnum,
  IsIdentityCard,
  IsInt,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  Matches,
  Min,
} from 'class-validator'
import { PosicionesValidas } from '../../posiciones/entities/posicion.entity'
import { ApiProperty } from '@nestjs/swagger'

export class CreateTrabajadorDto {
  @ApiProperty({
    example: '53718369Y',
    description: 'Dni del trabajador',
  })
  @IsNotEmpty({ message: 'El DNI no debe estar vacio' })
  @IsIdentityCard('ES', {
    message: 'El DNI debe ser un DNI valido',
  })
  dni: string

  @ApiProperty({
    example: 'Rodrigo',
    description: 'El nombre del trabajador',
  })
  @IsNotEmpty({ message: 'El nombre no debe estar vacio' })
  @IsString({ message: 'El nombre debe ser un string' })
  @Matches(/\S+/g) //que no tenga espacios en blanco
  nombre: string

  @ApiProperty({
    example: 'Lopez',
    description: 'El apellido del trabajador',
  })
  @IsNotEmpty({ message: 'El nombre no debe estar vacio' })
  @IsString({ message: 'El nombre debe ser un string' })
  @Matches(/\S+/g) //que no tenga espacios en blanco
  apellido: string

  @ApiProperty({
    example: 25,
    description: 'La edad del trabajador',
  })
  @IsNotEmpty({ message: 'La edad no puede estar vacia' })
  @IsInt({ message: 'La edad debe ser un numero entero' })
  @Min(16, { message: 'Los tarbajadores deben ser mayores de 16 años' })
  edad: number

  @ApiProperty({
    example: '629384748',
    description: 'Número de teléfono del trabajador',
  })
  @IsNotEmpty({ message: 'El telefono no debe estar vacio' })
  @IsMobilePhone(
    'es-ES',
    {},
    { message: 'El telefono debe ser un telefono valido' },
  )
  telefono: string

  @ApiProperty({
    example: 'MANAGER',
    description: 'Nombre de la categoria del trabajador',
  })
  @IsNotEmpty({ message: 'La posicion no puede estar vacia' })
  @IsEnum(PosicionesValidas, {
    message: 'La posicion debe ser una valida, nota: es keysensitive',
  })
  posicionNombre: string
}
