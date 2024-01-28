import { Injectable } from '@nestjs/common'
import { Posicion } from '../../posiciones/entities/posicion.entity'
import { Trabajador } from '../entities/trabajadores.entity'
import { CreateTrabajadorDto } from '../dto/create-trabajador.dto'
import { UpdateTrabajadorDto } from '../dto/update-trabajador.dto'

@Injectable()
export class TrabajadorMapper {
  createToTrabajador(dto: CreateTrabajadorDto, posicion: Posicion): Trabajador {
    dto.nombre = dto.nombre.trim()
    dto.apellido = dto.apellido.trim()

    return {
      ...new Trabajador(),
      ...dto,
      posicion,
    }
  }
  updateToTrabajador(
    original: Trabajador,
    dto: UpdateTrabajadorDto,
    posicion?: Posicion,
  ): Trabajador {
    dto.nombre = dto.nombre.trim()
    dto.apellido = dto.apellido.trim()

    return {
      ...original,
      ...dto,
      posicion: posicion ? posicion : original.posicion,
      id: original.id,
    }
  }
}
