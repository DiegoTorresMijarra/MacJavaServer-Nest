import { Injectable } from '@nestjs/common'
import { Posicion } from '../../posiciones/entities/posicion.entity'
import { Trabajador } from '../entities/trabajadores.entity'
import { CreateTrabajadorDto } from '../dto/create-trabajador.dto'
import { UpdateTrabajadorDto } from '../dto/update-trabajador.dto'
import { ResponseTrabajadorDto } from '../dto/response-trabajador.dto'

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
    return {
      ...original,
      ...dto,
      nombre: dto.nombre ? dto.nombre.trim() : original.nombre, //tb podria ponerlo en mayusculas...
      apellido: dto.apellido ? dto.apellido.trim() : original.apellido,
      posicion: posicion || original.posicion,
      updated_at: new Date(),
      id: original.id,
    }
  }
  trabajadorToResponse(trabajador: Trabajador): ResponseTrabajadorDto {
    return {
      ...new ResponseTrabajadorDto(),
      ...trabajador,
      posicion: trabajador.posicion.nombre,
    }
  }
}
