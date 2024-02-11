import { ApiProperty } from '@nestjs/swagger'
import { PosicionesValidas } from '../../posiciones/entities/posicion.entity'

export class ResponseTrabajadorDto {
  @ApiProperty({
    example: 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9',
    description: 'ID del trabajador',
  })
  id: string
  @ApiProperty({
    example: '53718369Y',
    description: 'Dni del trabajador',
  })
  dni: string
  @ApiProperty({
    example: 'Rodrigo',
    description: 'El nombre del trabajador',
  })
  nombre: string
  @ApiProperty({
    example: 'Lopez',
    description: 'El apellido del trabajador',
  })
  apellido: string
  @ApiProperty({
    example: 25,
    description: 'La edad del trabajador',
  })
  edad: number
  @ApiProperty({
    example: '629384748',
    description: 'Número de teléfono del trabajador',
  })
  telefono: string
  @ApiProperty({
    example: Date.now(),
    description: 'Fecha de creación del trabajador',
  })
  created_at: Date
  @ApiProperty({
    example: Date.now(),
    description: 'Fecha de actualizacion del trabajador',
  })
  updated_at: Date
  @ApiProperty({
    example: 'Boolean del estado del trabajador',
    description: 'Estado del trabajador',
  })
  deleted: boolean
  @ApiProperty({
    example: 'MANAGER',
    description: 'Nombre de la categoria del trabajador',
  })
  posicion: string
}
