import {
  IsIdentityCard,
  IsInt,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { LocaleConfigModule } from '../../../config/locale-config/locale-config.module'

export class CreateClienteDto {
  @ApiProperty({
    example: '53718369Y',
    description: 'Dni del cliente',
  })
  @IsIdentityCard(LocaleConfigModule.LOCALE_ID_CARD, {
    message: 'El dni tiene que ser valido',
  })
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
    example: '629384748',
    description: 'Número de teléfono del cliente',
    minLength: 9,
    maxLength: 15,
  })
  @IsMobilePhone(
    LocaleConfigModule.LOCALE_MOBILE,
    {},
    { message: 'El telefono debe ser un telefono movil valido' },
  )
  telefono: string
}
