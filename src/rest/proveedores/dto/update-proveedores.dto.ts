import { PartialType } from '@nestjs/mapped-types'
import { CreateProveedoresDto } from './create-proveedores.dto'
import { IsOptional } from 'class-validator'
import { Producto } from '../../productos/entities/producto.entity'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateProveedoresDto extends PartialType(CreateProveedoresDto) {
  @IsOptional()
  @ApiProperty({
    example: 'WayuRetamar',
    description: 'Nombre del proveedor',
    minLength: 3,
    maxLength: 30,
    required: false,
  })
  nombre?: string

  @IsOptional()
  @ApiProperty({
    example: 'Carnes',
    description: 'Tipo de  producto que provee',
    minLength: 3,
    maxLength: 30,
    required: false,
  })
  tipo?: string

  @IsOptional()
  @ApiProperty({
    example: '690143372',
    description: 'Telefono del proveedor',
    required: false,
  })
  telefono?: string

  @IsOptional()
  @ApiProperty({
    example: false,
    description: 'Si el proveedor esta activo',
    required: false,
  })
  deleted?: boolean
}
