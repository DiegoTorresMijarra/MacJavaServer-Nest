import { PartialType } from '@nestjs/mapped-types'
import { CreatePosicionDto } from './create-posicion.dto'

export class UpdatePosicionDto extends PartialType(CreatePosicionDto) {
  nombre?: string
  salario?: number
}
