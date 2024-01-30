import { PartialType } from '@nestjs/mapped-types'
import { CreateClienteDto } from './create-cliente.dto'
import { IsBoolean, IsOptional, IsUrl } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateClienteDto extends PartialType(CreateClienteDto) {
  @ApiProperty({
    example: '64857416T',
    description: 'Dni del cliente',
  })
  @IsOptional()
  dni?: string
  @ApiProperty({
    example: 'Rodrigo',
    description: 'El nombre del cliente',
    minLength: 1,
  })
  @IsOptional()
  nombre?: string
  @ApiProperty({
    example: 'Lopez',
    description: 'El apellido del cliente',
    minLength: 1,
  })
  @IsOptional()
  apellido?: string
  @ApiProperty({
    example: 25,
    description: 'La edad del cliente',
    minimum: 1,
  })
  @IsOptional()
  edad?: number
  @ApiProperty({
    example: '123456789',
    description: 'Número de teléfono del cliente',
    minLength: 9,
    maxLength: 15,
  })
  @IsOptional()
  telefono?: string
  @ApiProperty({
    example: 'https://via.placeholder.com/150',
    description: 'Imagen del cliente',
    minLength: 1,
  })
  @IsUrl()
  @IsOptional()
  imagen?: string
  @ApiProperty({
    example: true,
    description: 'Indica si el cliente ha sido eliminado',
  })
  @IsOptional()
  @IsBoolean({ message: 'deleted tiene que ser un boolean' })
  deleted?: boolean
}
