import {
  IsInt,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Min,
} from 'class-validator'

export class CreateClienteDto {
  @IsString({ message: 'El dni debe ser un string' })
  @IsNotEmpty({ message: 'El dni no puede estar vacío' })
  dni: string
  @IsString({ message: 'El nombre debe ser un string' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  nombre: string
  @IsString({ message: 'El apellido debe ser un string' })
  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  apellido: string
  @IsInt({ message: 'La edad debe ser un número entero' })
  @Min(0, { message: 'La edad no puede ser un número negativo' })
  edad: number
  @IsPhoneNumber('ES', { message: 'Número de teléfono inválido' })
  telefono: string
  @IsUrl()
  @IsNotEmpty({ message: 'La imagen no puede estar vacía' })
  imagen: string
}
