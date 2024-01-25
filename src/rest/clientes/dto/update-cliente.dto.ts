import { PartialType } from '@nestjs/mapped-types'
import { CreateClienteDto } from './create-cliente.dto'
import { IsBoolean, IsOptional } from 'class-validator'

export class UpdateClienteDto extends PartialType(CreateClienteDto) {
  @IsOptional()
  dni?: string
  @IsOptional()
  nombre?: string
  @IsOptional()
  apellido?: string
  @IsOptional()
  edad?: number
  @IsOptional()
  telefono?: string
  @IsOptional()
  imagen?: string
  @IsOptional()
  @IsBoolean({ message: 'deleted tiene que ser un boolean' })
  deleted?: boolean
}
