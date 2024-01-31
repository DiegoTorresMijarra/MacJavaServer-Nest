import { PartialType } from '@nestjs/mapped-types'
import { CreateTrabajadorDto } from './create-trabajador.dto'

export class UpdateTrabajadorDto extends PartialType(CreateTrabajadorDto) {
  dni?: string
  nombre?: string
  apellidos?: string
  edad?: number
  telefono?: string
  posicionNombre?: string
}
