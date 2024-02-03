import { IsEnum, IsNotEmpty, Min } from 'class-validator'
import { PosicionesValidas } from '../entities/posicion.entity'
import { ApiProperty } from '@nestjs/swagger'

export class CreatePosicionDto {
  @ApiProperty({
    description: 'Nombre de la posicion',
    example: 'OTROS',
  })
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  @IsEnum(PosicionesValidas, { message: 'El nombre debe ser uno valido' })
  nombre: string

  @ApiProperty({
    description: 'Salario de la posicion',
    type: Number,
    example: 1000,
    minimum: 1000, //todo: revisar
  })
  @IsNotEmpty({ message: 'El salario no puede estar vacio' })
  @Min(1000, { message: 'El salario debe ser mayor a 1000€' })
  salario: number
}
