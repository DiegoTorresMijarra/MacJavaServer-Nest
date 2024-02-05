import {
  ArrayNotEmpty,
  IsArray,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  NotContains,
} from 'class-validator'
import { Producto } from '../../productos/entities/producto.entity'
import { LocaleConfigModule } from '../../../config/locale-config/locale-config.module'

export class CreateProveedoresDto {
  @IsNotEmpty({ message: 'El nombre del proveedor no puede estar vacio' })
  @IsString({ message: 'El nombre debe ser una cadena de caracteres' })
  @Length(3, 30, { message: 'El nombre debe tener entre 3 y 30 caracteres' })
  @NotContains(' ', {
    message: 'El nombre no puede contener espacios en blanco',
  })
  nombre: string
  @IsNotEmpty({ message: 'El tipo de producto no puede estar vacio' })
  @IsString({ message: 'El tipo debe ser una cadena de caracteres' })
  @Length(3, 30, { message: 'El tipo debe tener entre 3 y 30 caracteres' })
  @NotContains(' ', {
    message: 'El tipo no puede contener espacios en blanco',
  })
  tipo: string
  @IsNotEmpty({ message: 'El telefono del proveedor no puede estar vacio' })
  @IsMobilePhone(
    LocaleConfigModule.LOCALE_MOBILE,
    {},
    { message: 'El telefono debe ser un telefono movil valido' },
  )
  tlf: string
}
