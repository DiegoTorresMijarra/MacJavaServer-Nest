import { Restaurante } from '../entities/restaurante.entity'
import { CreateRestauranteDto } from '../dto/create-restaurante.dto'
import { plainToClass } from 'class-transformer'
import { UpdateRestauranteDto } from '../dto/update-restaurante.dto'

export class RestaurantesMapper {
  createDtoToEntity(dto: CreateRestauranteDto): Restaurante {
    const restaurante: Restaurante = {
      ...new Restaurante(),
      ...dto,
    }
    restaurante.nombre = restaurante.nombre.toLowerCase()
    restaurante.calle = restaurante.calle.toLowerCase()
    restaurante.localidad = restaurante.localidad.toLowerCase()

    return restaurante
  }

  createDtoToEntity2(dto: CreateRestauranteDto): Restaurante {
    const restau: Restaurante = plainToClass(Restaurante, dto)
    restau.creadoEn = new Date()
    restau.actualizadoEn = new Date()
    restau.nombre = restau.nombre.toLowerCase()
    restau.calle = restau.calle.toLowerCase()
    restau.localidad = restau.localidad.toLowerCase()

    return restau
  }

  updateDtoToEntity(
    dto: UpdateRestauranteDto,
    restaurante: Restaurante,
  ): Restaurante {
    const restauranteNuevo: Restaurante = {
      ...restaurante,
      ...dto,
    }
    restauranteNuevo.nombre = restauranteNuevo.nombre.toLowerCase()
    restauranteNuevo.calle = restauranteNuevo.calle.toLowerCase()
    restauranteNuevo.localidad = restauranteNuevo.localidad.toLowerCase()
    restauranteNuevo.actualizadoEn = new Date()
    return restauranteNuevo
  }
}
