import { PartialType } from '@nestjs/mapped-types'
import { CreateTrabajadorDto } from './create-trabajador.dto'
import { ApiProperty } from '@nestjs/swagger'
import { PosicionesValidas } from '../../posiciones/entities/posicion.entity'

export class UpdateTrabajadorDto extends PartialType(CreateTrabajadorDto) {
  @ApiProperty({
    example: '53718369Y',
    description: 'Dni del trabajador',
  })
  dni?: string
  @ApiProperty({
    example: 'Rodrigo',
    description: 'El nombre del trabajador',
  })
  nombre?: string
  @ApiProperty({
    example: 'Lopez',
    description: 'El apellido del trabajador',
  })
  apellidos?: string
  @ApiProperty({
    example: 25,
    description: 'La edad del trabajador',
  })
  edad?: number
  @ApiProperty({
    example: '629384748',
    description: 'Número de teléfono del trabajador',
  })
  telefono?: string
  @ApiProperty({
    example: 'COCINERO',
    description: 'Nombre de la categoria del trabajador',
  })
  posicionNombre?: string
}
