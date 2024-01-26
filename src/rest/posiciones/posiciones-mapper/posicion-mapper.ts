import { Injectable } from '@nestjs/common'
import { CreatePosicionDto } from '../dto/create-posicion.dto'
import { Posicion } from '../entities/posicion.entity'

@Injectable()
export class PosicionMapper {
  static createToDto(dto: CreatePosicionDto): Posicion {
    return {
      ...new Posicion(),
      ...dto,
    }
  }
  static updateToDto(original: Posicion, dto: CreatePosicionDto): Posicion {
    const posicion: Posicion = {
      ...original,
      ...dto,
    }
    posicion.updatedAt = new Date()
    return posicion
  }
}
