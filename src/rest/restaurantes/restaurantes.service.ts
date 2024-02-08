import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateRestauranteDto } from './dto/create-restaurante.dto'
import { UpdateRestauranteDto } from './dto/update-restaurante.dto'
import { trabajadoresAnyadidosDto } from './dto/trabajadores-anyadidos.dto'
import { Restaurante } from './entities/restaurante.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RestaurantesMapper } from './mapper/restaurantes.mapper'
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate'
import { hash } from 'typeorm/util/StringUtils'
import {
  Notification,
  NotificationTipo,
} from '../../notifications/models/notificacion.model'
import { Trabajador } from '../trabajadores/entities/trabajadores.entity'
import { MacjavaNotificationsGateway } from '../../notifications/macjava-notifications.gateway'

@Injectable()
export class RestaurantesService {
  logger = new Logger(RestaurantesService.name)

  constructor(
    @InjectRepository(Restaurante)
    private readonly repositorioRestaurante: Repository<Restaurante>,
    private readonly mapper: RestaurantesMapper,
    private readonly notificationGateway: MacjavaNotificationsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll() {
    this.logger.log('Obteniendo todos los restaurantes (Service)')
    return await this.repositorioRestaurante.find()
  }

  async findAllPaginated(paginatedQuery: PaginateQuery) {
    this.logger.log('Buscando todos los restaurantes paginados (Servicio)')
    const cache = await this.cacheManager.get(
      `restaurantes_paginated_${hash(JSON.stringify(paginatedQuery))}`,
    )
    if (cache) {
      return cache
    }
    const resultado = await paginate(
      paginatedQuery,
      this.repositorioRestaurante,
      {
        sortableColumns: ['id', 'nombre', 'localidad', 'capacidad'],
        searchableColumns: ['id', 'nombre', 'localidad', 'capacidad'],
        defaultSortBy: [['id', 'ASC']],
        filterableColumns: {
          nombre: [FilterOperator.EQ, FilterSuffix.NOT],
          localidad: [FilterOperator.EQ, FilterSuffix.NOT],
        },
      },
    )
    await this.cacheManager.set(
      `restaurantes_paginated_${hash(JSON.stringify(paginatedQuery))}`,
      resultado,
      60,
    )
    return resultado
  }

  async findOne(id: number) {
    this.logger.log(`Obteniendo el restaurante con id: ${id} (Service)`)
    const restaurante = await this.existeRestaurantePorId(id)
    if (restaurante) {
      return restaurante
    } else {
      throw new NotFoundException(`Restaurante con id: ${id} no encontrado`)
    }
  }

  //No se puede crear un restaurante que tenga el nombre de uno ya existente
  async create(createRestauranteDto: CreateRestauranteDto) {
    this.logger.log(`Creando un restaurante (Service)`)
    //primero con el primer metodo de dtoAEntidad falta prueba
    const rest = await this.existeRestaurantePorNombre(
      createRestauranteDto.nombre,
    )
    if (rest != false) {
      throw new BadRequestException(
        `Restaurante con nombre: ${createRestauranteDto.nombre} ya existe, ingrese otro nombre`,
      )
    } else {
      const restaurante = this.mapper.createDtoToEntity(createRestauranteDto)
      await this.repositorioRestaurante.save(restaurante)
      await this.invalidarCacheKey('all_restaurantes')
      await this.cacheManager.set(
        `restaurante_${restaurante.id}`,
        restaurante,
        60,
      )
      this.onChange(NotificationTipo.CREATE, restaurante)

      return restaurante
    }
  }

  async update(id: number, updateRestauranteDto: UpdateRestauranteDto) {
    this.logger.log(`Actualizando un restaurante (Service)`)
    const restaurante: Restaurante | false =
      await this.existeRestaurantePorId(id)
    if (restaurante) {
      const restauranteActualizado = this.mapper.updateDtoToEntity(
        updateRestauranteDto,
        restaurante,
      )
      await this.repositorioRestaurante.save(restauranteActualizado)
      await this.invalidarCacheKey('all_restaurantes')
      await this.invalidarCacheKey(`restaurante_${id}`)
      this.onChange(NotificationTipo.UPDATE, restauranteActualizado)

      return restauranteActualizado
    } else {
      throw new NotFoundException(`Restaurante con id: ${id} no encontrado`)
    }
  }

  async findByName(nombre: string) {
    this.logger.log(`Obteniendo el restaurante con nombre: ${nombre} (Service)`)
    const restaurante = await this.existeRestaurantePorNombre(nombre)
    if (restaurante) {
      return restaurante
    } else {
      throw new NotFoundException(
        `Restaurante con nombre: ${nombre} no encontrado`,
      )
    }
  }

  async removeSoft(id: number) {
    this.logger.log(`Eliminando restaurante con id ${id} (Service)`)
    const restaurante = await this.existeRestaurantePorId(id)
    if (restaurante) {
      restaurante.borrado = true
      await this.repositorioRestaurante.save(restaurante)
      await this.invalidarCacheKey('all_restaurantes')
      await this.invalidarCacheKey(`restaurante_${id}`)

      this.onChange(NotificationTipo.UPDATE, restaurante)
    } else {
      throw new NotFoundException(`Restaurante con id: ${id} no encontrado`)
    }
  }

  async existeRestaurantePorId(id: number): Promise<false | Restaurante> {
    const cache: Restaurante = await this.cacheManager.get(`restaurante_${id}`)
    if (cache) {
      return cache
    }
    const restau = await this.repositorioRestaurante.findOneBy({ id })
    if (restau) {
      await this.cacheManager.set(`restaurante_${id}`, restau, 60)
      return restau
    } else {
      return false
    }
  }

  async existeRestaurantePorNombre(
    nombre: string,
  ): Promise<Restaurante | false> {
    const restau = await this.repositorioRestaurante.findOneBy({ nombre })
    if (restau) {
      return restau
    } else {
      return false
    }
  }

  async invalidarCacheKey(keyPattern: string) {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysABorrar = cacheKeys.filter((key) => key.includes(keyPattern))
    const promesas = keysABorrar.map((key) => this.cacheManager.del(key))
    await Promise.all(promesas)
  }

  private onChange(type: NotificationTipo, data: Restaurante) {
    const notification: Notification<Restaurante> = {
      message: `El Restaurante con id ${data.id} ha sido ${type.toLowerCase()}`,
      type: type,
      data: data,
      createdAt: new Date(),
    }

    this.notificationGateway.sendMessage(notification)
  }

  // Metodo añadir trabajadores a un restaurante uno o varios a la vez
  anyadirTrabajadores(trabajadores: trabajadoresAnyadidosDto) {}

  // Metodo eliminar trabajadores de un restaurante uno a uno
}
