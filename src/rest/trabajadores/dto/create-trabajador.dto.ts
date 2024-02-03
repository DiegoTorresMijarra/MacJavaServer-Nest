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
import { LocaleConfigModule } from '../../../config/locale-config/locale-config.module'

export class CreateTrabajadorDto {
  @IsNotEmpty({ message: 'El DNI no debe estar vacio' })
  @IsIdentityCard(LocaleConfigModule.LOCALE_ID_CARD, {
    message: 'El DNI debe ser un DNI valido',
  })
  dni: string

  @IsNotEmpty({ message: 'El nombre no debe estar vacio' })
  @IsString({ message: 'El nombre debe ser un string' })
  @Matches(/\S+/g) //que no tenga espacios en blanco
  nombre: string

  @IsNotEmpty({ message: 'El nombre no debe estar vacio' })
  @IsString({ message: 'El nombre debe ser un string' })
  @Matches(/\S+/g) //que no tenga espacios en blanco
  apellido: string

  @IsNotEmpty({ message: 'La edad no puede estar vacia' })
  @IsInt({ message: 'La edad debe ser un numero entero' })
  @Min(16, { message: 'Los tarbajadores deben ser mayores de 16 años' })
  edad: number

  @IsNotEmpty({ message: 'El telefono no debe estar vacio' })
  @IsMobilePhone(
    LocaleConfigModule.LOCALE_MOBILE,
    {},
    { message: 'El telefono debe ser un telefono movil valido' },
  )
  telefono: string

  @IsNotEmpty({ message: 'La posicion no puede estar vacia' })
  @IsEnum(PosicionesValidas, {
    message: 'La posicion debe ser una valida, nota: es keysensitive',
  })
  posicionNombre: string
}
