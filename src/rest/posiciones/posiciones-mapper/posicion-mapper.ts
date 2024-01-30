import { Injectable } from '@nestjs/common'
import { CreatePosicionDto } from '../dto/create-posicion.dto'
import { Posicion } from '../entities/posicion.entity'
import { UpdatePosicionDto } from '../dto/update-posicion.dto'

@Injectable()
export class PosicionMapper {
  createToPosicion(dto: CreatePosicionDto): Posicion {
    return {
      ...new Posicion(),
      ...dto,
    }
  }
  updateToPosicion(original: Posicion, dto: UpdatePosicionDto): Posicion {
    return {
      ...original,
      ...dto,
      id: original.id,
      updated_at: new Date(),
    }
  }
}
