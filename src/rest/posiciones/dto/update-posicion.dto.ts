import { PartialType } from '@nestjs/mapped-types'
import { CreatePosicionDto } from './create-posicion.dto'
import { ApiProperty } from '@nestjs/swagger'
import { PosicionesValidas } from '../entities/posicion.entity'

export class UpdatePosicionDto extends PartialType(CreatePosicionDto) {
  @ApiProperty({
    description: 'Nombre de la posicion',
    example: 'OTROS',
  })
  nombre?: string
  @ApiProperty({
    description: 'Salario de la posicion',
    type: Number,
    example: 1000,
    minimum: 1000, //todo: revisar
  })
  salario?: number
}
