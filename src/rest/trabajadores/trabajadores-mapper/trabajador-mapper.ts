import { Injectable } from '@nestjs/common'
import { Posicion } from '../../posiciones/entities/posicion.entity'
import { Trabajador } from '../entities/trabajadores.entity'
import { CreateTrabajadorDto } from '../dto/create-trabajador.dto'

@Injectable()
export class TrabajadorMapper {
  createToTrabajador(dto: CreateTrabajadorDto, posicion: Posicion): Trabajador {
    return {
      ...new Trabajador(),
      ...dto,
      posicion,
    }
  }
  updateToTrabajador(
    original: Trabajador,
    dto: CreateTrabajadorDto,
    posicion?: Posicion,
  ): Trabajador {
    return {
      ...original,
      ...dto,
      posicion: posicion ? posicion : original.posicion,
      id: original.id,
    }
  }
}
