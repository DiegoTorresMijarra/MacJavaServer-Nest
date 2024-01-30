import { IsEnum, IsNotEmpty, Min } from 'class-validator'
import { PosicionesValidas } from '../entities/posicion.entity'

export class CreatePosicionDto {
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  @IsEnum(PosicionesValidas, { message: 'El nombre debe ser uno valido' })
  nombre: string

  @IsNotEmpty({ message: 'El salario no puede estar vacio' })
  @Min(1000, { message: 'El salario debe ser mayor a 1000€' })
  salario: number
}
