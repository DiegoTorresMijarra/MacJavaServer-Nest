import { ApiProperty } from '@nestjs/swagger'

export class ResponseCliente {
  @ApiProperty({
    example: 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9',
    description: 'ID del cliente',
  })
  id: string
  @ApiProperty({
    example: '64857416T',
    description: 'Dni del cliente',
  })
  dni: string
  @ApiProperty({
    example: 'Rodrigo',
    description: 'El nombre del cliente',
    minLength: 1,
  })
  nombre: string
  @ApiProperty({
    example: 'Lopez',
    description: 'El apellido del cliente',
    minLength: 1,
  })
  apellido: string
  @ApiProperty({
    example: 25,
    description: 'La edad del cliente',
    minimum: 1,
  })
  edad: number
  @ApiProperty({
    example: '123456789',
    description: 'Número de teléfono del cliente',
    minLength: 9,
    maxLength: 15,
  })
  telefono: string
  @ApiProperty({
    example: 'https://via.placeholder.com/150',
    description: 'Imagen del cliente',
    minLength: 1,
  })
  imagen: string
  @ApiProperty({
    example: true,
    description: 'Indica si el cliente ha sido eliminado',
  })
  deleted: boolean
  @ApiProperty({
    example: '2023-09-01T12:34:56Z',
    description: 'Fecha y hora de creación del cliente',
  })
  created_at: Date
  @ApiProperty({
    example: '2023-09-02T10:20:30Z',
    description: 'Fecha y hora de actualización del cliente',
  })
  updated_at: Date
}
