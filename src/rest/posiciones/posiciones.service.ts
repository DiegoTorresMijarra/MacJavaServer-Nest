import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreatePosicionDto } from './dto/create-posicion.dto'
import { UpdatePosicionDto } from './dto/update-posicion.dto'
import { Repository } from 'typeorm'
import { Posicion } from './entities/posicion.entity'
import { PosicionMapper } from './posiciones-mapper/posicion-mapper'
import { InjectRepository } from '@nestjs/typeorm'
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate'
import {
  Notification,
  NotificationTipo,
} from '../../notifications/models/notificacion.model'
import { MacjavaNotificationsGateway } from '../../notifications/macjava-notifications.gateway'
@Injectable()
export class PosicionesService {
  logger: Logger = new Logger(PosicionesService.name)
  static readonly CACHE_KEY_FOUND_ALL: string = 'all_posiciones'
  static readonly CACHE_KEY_FOUND: string = 'posicion_'
  static readonly PAGED_DEFAULT_QUERY: PaginateQuery = {
    path: 'https://localhost:3000/posiciones/paginated',
  }
  static readonly CACHE_KEY_PAGINATED_DEFAULT: string =
    'posiciones_paged_default'
  constructor(
    @InjectRepository(Posicion)
    private readonly posicionRepository: Repository<Posicion>,
    private readonly posicionMapper: PosicionMapper,
    private readonly notificationGateway: MacjavaNotificationsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async invalidateCachesCategory(key?: string) {
    this.logger.log('Invalidando cache de las posiciones')
    if (key) {
      await this.cacheManager.del(key)
      this.logger.log(`Invalidando cache de ${key}`)
    }
    await this.cacheManager.del(PosicionesService.CACHE_KEY_FOUND_ALL)
    await this.cacheManager.del(PosicionesService.CACHE_KEY_PAGINATED_DEFAULT)
  }
  async getByCache(
    key: string,
  ): Promise<Posicion | Posicion[] | Paginated<Posicion>> {
    //todo le podria añadir boolean si quiero añadirle los exist
    let res: Posicion | Posicion[] | Paginated<Posicion>
    try {
      res = await this.cacheManager.get(key)
      if (res) {
        this.logger.log(`Cache ${key} hitted`)
      }
    } catch (error) {
      // capturo las cache que me devuelvan un tipo que no esta contemplado
      this.logger.error(`Cache de tipo invalido, causa: ${error.message}`)
    }
    return res
  }
  async findAll() {
    this.logger.log('Buscando todos las posiciones')

    const cache: Posicion[] = <Posicion[]>(
      await this.getByCache(PosicionesService.CACHE_KEY_FOUND_ALL)
    ) // tal vez me de error si le paso el funko... revisar
    if (cache) {
      return cache
    }

    const res = await this.posicionRepository.find()

    await this.cacheManager.set(
      PosicionesService.CACHE_KEY_FOUND_ALL,
      res,
      60000,
    )

    return res
  }

  async findAllPaginated(paginatedQuery: PaginateQuery) {
    this.logger.log('Buscando todas las posiciones paginadas')

    const defaultQuery: boolean =
      JSON.stringify(paginatedQuery) ===
      JSON.stringify(PosicionesService.PAGED_DEFAULT_QUERY) // si es igual a true es que es el paginate default

    if (defaultQuery) {
      const cache: Paginated<Posicion> = <Paginated<Posicion>>(
        await this.getByCache(PosicionesService.CACHE_KEY_PAGINATED_DEFAULT)
      )
      if (cache) {
        return cache
      }
    }

    const cache: Paginated<Posicion> = <Paginated<Posicion>>(
      await this.getByCache(PosicionesService.CACHE_KEY_PAGINATED_DEFAULT)
    )
    if (cache) {
      return cache
    }

    const res = await paginate(paginatedQuery, this.posicionRepository, {
      loadEagerRelations: false, //default false: por si usara eager para las relaciones
      sortableColumns: ['id', 'nombre', 'deleted'], //These are the columns that are valid to be sorted by.
      nullSort: 'last', //Define whether to put null values at the beginning or end of the result set.
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['deleted'], //These columns will be searched through when using the search query
      filterableColumns: {
        //https://typeorm.io/#/find-options/advanced-options
        nombre: [
          FilterOperator.EQ, // no ponemos nada
          FilterSuffix.NOT, // usamos $not:COCINERO
          FilterOperator.ILIKE, // $ilike:S
        ],
        salario: [
          FilterOperator.EQ, //= valor
          FilterOperator.GT, // > valor
          FilterOperator.GTE, // >= valor
          FilterOperator.LT, //  < valor
          FilterOperator.LTE, // <= valor
        ],
        isActive: true,
      },
      relativePath: true, //Generate relative paths in the resource links
    })

    if (defaultQuery) {
      await this.cacheManager.set(
        PosicionesService.CACHE_KEY_PAGINATED_DEFAULT,
        res,
        60000,
      )
    }

    return res
  }

  async findById(id: string) {
    this.logger.log(`Buscando la Posicion con id ${id}`)
    const cache: Posicion = <Posicion>(
      await this.getByCache(PosicionesService.CACHE_KEY_FOUND + id)
    )
    if (cache) {
      return cache
    }

    const posicionRes = await this.posicionRepository
      .createQueryBuilder('posicion')
      .leftJoinAndMapMany(
        'posicion.trabajadores',
        'trabajadores',
        'trabajador',
        'trabajador.posicion.id = :id',
      )
      .where('posicion.id = :id', { id })
      .getOne()

    if (!posicionRes) {
      this.logger.log(`Posicion con id: ${id} no encontrada`)
      throw new NotFoundException(`Posicion con id ${id} no encontrada`)
    }
    await this.cacheManager.set(
      PosicionesService.CACHE_KEY_FOUND + id,
      posicionRes,
      60000,
    )

    return posicionRes
  }
  async create(createPosicionDto: CreatePosicionDto) {
    this.logger.log(`Creando posicion con nombre: ${createPosicionDto.nombre}`)

    const existSameName = await this.existByName(createPosicionDto.nombre)

    if (existSameName) {
      throw new BadRequestException(
        `La Categoria con el nombre ${createPosicionDto.nombre} ya existe`,
      )
    }
    await this.invalidateCachesCategory()

    return await this.posicionRepository.save(
      this.posicionMapper.createToPosicion(createPosicionDto),
    )
  }
  async updateById(id: string, updatePosicioneDto: UpdatePosicionDto) {
    this.logger.log(`Actualizando funko con id ${id}`)
    const original = await this.findById(id)

    const existSameName = await this.existByName(updatePosicioneDto.nombre)

    if (existSameName) {
      throw new BadRequestException(
        `La Posicion con nombre ${updatePosicioneDto.nombre} ya existe`,
      )
    }

    const updated = await this.posicionRepository.save(
      this.posicionMapper.updateToPosicion(original, updatePosicioneDto),
    )

    this.onChange(NotificationTipo.UPDATE, updated)
    await this.invalidateCachesCategory(PosicionesService.CACHE_KEY_FOUND + id)

    return updated
  }

  async softRemoveById(id: string) {
    this.logger.log(`Actualizando a deleted: true la posicion con id: ${id}`)

    const original = await this.findById(id)
    original.deleted = true
    const res = await this.posicionRepository.save(original)

    await this.invalidateCachesCategory(PosicionesService.CACHE_KEY_FOUND + id)

    return res
  }

  async removeById(id: string) {
    this.logger.log(`Eliminando posicion con id: ${id}`)

    const original = await this.findById(id)

    if (original.trabajadores && original.trabajadores.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar la posicion con id ${id} porque tiene trabajadores relacionados, use el metodo softRemoveById`,
      )
    }
    await this.posicionRepository.remove(original)

    await this.invalidateCachesCategory(PosicionesService.CACHE_KEY_FOUND + id)
  }
  async findByName(name: string) {
    this.logger.log(`Buscando la Categoria con nombre ${name}`)
    const posicionRes = await this.posicionRepository.findOneBy({
      nombre: name,
    })
    if (!posicionRes) {
      throw new NotFoundException(`Categoria con nombre ${name} no encontrada`)
    }

    await this.cacheManager.set(
      //tal vez deberia anadir una clave especifica para cuando busco por el nombre
      PosicionesService.CACHE_KEY_FOUND + posicionRes.id,
      posicionRes,
      60,
    )

    return posicionRes
  }
  async existByName(name: string) {
    this.logger.log(`Buscando la Posicion con nombre ${name}`)
    name = name.toUpperCase().trim()
    const posicionRes = await this.posicionRepository.findOneBy({
      nombre: name,
    })
    if (!posicionRes || posicionRes.deleted === true) {
      this.logger.log(`Posicion con nombre: ${name} no encontrada`)
      return null
      // throw new NotFoundException(`Posicion con nombre ${name} no encontrada`)
    }
    return posicionRes
  }

  private onChange(type: NotificationTipo, data: Posicion) {
    const notification: Notification<Posicion> = {
      message: `La Posicion con id ${data.id} ha sido ${type.toLowerCase()}`,
      type: type,
      data: data,
      createdAt: new Date(),
    }

    this.notificationGateway.sendMessage(notification)
  }
}
