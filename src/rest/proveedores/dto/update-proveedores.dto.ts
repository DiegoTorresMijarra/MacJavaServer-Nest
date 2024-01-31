import { PartialType } from '@nestjs/mapped-types'
import { CreateProveedoresDto } from './create-proveedores.dto'
import { IsOptional } from 'class-validator'
import { Producto } from '../../productos/entities/producto.entity'

export class UpdateProveedoresDto extends PartialType(CreateProveedoresDto) {
  @IsOptional()
  nombre?: string
  @IsOptional()
  tipo?: string
  @IsOptional()
  tlf?: string
  @IsOptional()
  isActive?: boolean
}
