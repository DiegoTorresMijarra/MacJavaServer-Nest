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

/**
 * Servicio CRUD para la gestion de las posiciones de nuestro negocio.  <br>
 * Los metodos que alteran alguna posicion emiten una notificacion, cuando el cambio se produce <br>
 * Los metodos que que recuperan datos almacenan los objetos en el gestor de la cache.
 */
@Injectable()
export class PosicionesService {
  logger: Logger = new Logger(PosicionesService.name)
  static readonly CACHE_KEY_FOUND_ALL: string = 'all_posiciones'
  static readonly CACHE_KEY_FOUND: string = 'posicion_'
  static readonly PAGED_DEFAULT_QUERY: PaginateQuery = {
    path: 'http://localhost:3000/posiciones/paginated',
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

  /**
   * Metodo para invalidar las cache de las posiciones, cuando sea llamado invalidara las que hacen referencia a varias posiciones (findAll y findAllPaginated) <br>
   * Además se le puede pasar la key del objeto que se quiera borrar de esta.
   * @param key (opcional) del objeto en la cache que se quiera borrar
   */
  async invalidateCachesPosiciones(key?: string) {
    this.logger.log('Invalidando cache de las posiciones')
    if (key) {
      await this.cacheManager.del(key)
      this.logger.log(`Invalidando cache de ${key}`)
    }
    await this.cacheManager.del(PosicionesService.CACHE_KEY_FOUND_ALL)
    await this.cacheManager.del(PosicionesService.CACHE_KEY_PAGINATED_DEFAULT)
  }

  /**
   * Metodo que recupera un objeto de la cache. Tipificamos, para evitar que puedan pasar objetos que no esten previstos o que sean instancias de otros endpoints; en ese caso, captura la excepcion (typeError) y devuelve null
   * @param key del objeto que se quiera recuperar.
   */
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

  /**
   * Metodo que devuelve una array de posiciones, esta implementado para usos relacionados con la administracion de la app. Para mostrar resultados, se recomienda usar:
   * @see {PosicionesService.findAllPaginated}
   */
  async findAll() {
    this.logger.log('Buscando todos las posiciones')

    const cache: Posicion[] = <Posicion[]>(
      await this.getByCache(PosicionesService.CACHE_KEY_FOUND_ALL)
    ) // tal vez me de error si le paso el objeto... revisar
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

  /**
   * Metodo que devuelve la pagina de posiciones que cumplen el query. <br>
   * Si el query pasado es el por defecto (sin ningun parametro) se buscara en la cache y si no se encuentra se seteara tras realizar la consulta.
   * @param paginatedQuery query de la paginacion
   */
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

  /**
   * Metodo que devuelve una posicion dado su id
   * @param id del objeto que se quiera recuperar
   * @throws NotFoundException si la posicion no existe
   */
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

  /**
   * Metodo que genera una posicion y la inserta en el repositorio<br>
   * tras esto borra las caches globales para evitar errores
   * @param createPosicionDto con los datos de la posicion a crear
   * @throws BadRequestException si el nombre de la posicion existe en el repo (es unique)
   */
  async create(createPosicionDto: CreatePosicionDto) {
    this.logger.log(`Creando posicion con nombre: ${createPosicionDto.nombre}`)

    const existSameName = await this.existByName(createPosicionDto.nombre)

    if (existSameName) {
      throw new BadRequestException(
        `La posicion con el nombre ${createPosicionDto.nombre} ya existe`,
      )
    }
    const res = await this.posicionRepository.save(
      this.posicionMapper.createToPosicion(createPosicionDto),
    )

    await this.invalidateCachesPosiciones()

    this.onChange(NotificationTipo.CREATE, res)

    return res
  }

  /**
   * Metodo que actualiza una posicion dado su id <br>
   * tras esto borra las caches que guardaran relacion con esta posicion
   * @param id del objeto que se quiera actualizar
   * @param updatePosicionDto con los datos de la posicion a actualizar
   * @throws NotFoundException si la posicion no existe
   * @throws BadRequestException si el nombre del posicion ya existe en el repo
   */
  async updateById(id: string, updatePosicionDto: UpdatePosicionDto) {
    this.logger.log(`Actualizando la posicion con id ${id}`)
    const original = await this.findById(id)

    const existSameName = await this.existByName(updatePosicionDto.nombre)

    if (existSameName) {
      throw new BadRequestException(
        `La Posicion con nombre ${updatePosicionDto.nombre} ya existe`,
      )
    }

    const updated = await this.posicionRepository.save(
      this.posicionMapper.updateToPosicion(original, updatePosicionDto),
    )

    this.onChange(NotificationTipo.UPDATE, updated)
    await this.invalidateCachesPosiciones(
      PosicionesService.CACHE_KEY_FOUND + id,
    )

    return updated
  }

  /**
   * Metodo que actualiza el deleted de la posicion dada a true <br>
   * tras esto borra las caches que guardaran relacion con esta posicion
   * @param id del objeto que se quiera eliminar (borrado logico)
   * @throws NotFoundException si la posicion no existe
   */
  async softRemoveById(id: string) {
    this.logger.log(`Actualizando a deleted: true la posicion con id: ${id}`)

    const original = await this.findById(id)
    original.deleted = true
    const res = await this.posicionRepository.save(original)

    this.onChange(NotificationTipo.UPDATE, res)

    await this.invalidateCachesPosiciones(
      PosicionesService.CACHE_KEY_FOUND + id,
    )

    return res
  }

  /**
   * Metodo que elimina una posicion dado su id
   * @param id del objeto que se quiera eliminar
   * @throws NotFoundException si la posicion no existe
   * @throws BadRequestException si la posicion contiene trabajadores, evitamos error en la bbdd
   */
  async removeById(id: string) {
    this.logger.log(`Eliminando posicion con id: ${id}`)

    const original = await this.findById(id)

    if (original.trabajadores && original.trabajadores.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar la posicion con id ${id} porque tiene trabajadores relacionados, use el metodo softRemoveById`,
      )
    }

    await this.posicionRepository.remove(original)

    this.onChange(NotificationTipo.DELETE, original)

    await this.invalidateCachesPosiciones(
      PosicionesService.CACHE_KEY_FOUND + id,
    )
  }
  /**
   * Metodo que devuelve una posicion dado su nombre <br>
   * es usado con el objetivo de obtener una posicon valida: **con  deleted=false** <br>
   * no lanza excepciones si la posicion no existe o no es valida devuelve null; notifica por el canal de errores de la app si ha ocurrido algo de lo anterior
   * @param name de la posicion que se quiera recuperar
   */
  async findByName(name: string) {
    this.logger.log(`Buscando la posicion con nombre ${name}`)

    if (!name) {
      this.logger.error(`La posicion a validar no tiene nombre`) //salgo rapido si se pasara  undefined como param
      return null
    }

    const posicionRes = await this.posicionRepository.findOneBy({
      nombre: name.toUpperCase().trim(),
    })

    if (!posicionRes) {
      this.logger.error(`Posicion con nombre: ${name} no encontrada`)
      return null
      // throw new NotFoundException(`Posicion con nombre ${name} no encontrada`)
    }
    if (posicionRes.deleted === true) {
      this.logger.error(`Posicion con nombre: ${name} tiene delete=true`)
      //podria simplificarlo, pero asi queda mas claro asi
      return null
    }

    await this.cacheManager.set(
      //tal vez deberia anadir una clave especifica para cuando busco por el nombre
      PosicionesService.CACHE_KEY_FOUND + posicionRes.id,
      posicionRes,
      60,
    )

    return posicionRes
  }
  /**
   * Metodo que devuelve una posicion dado su nombre <br>
   * Se usa para comprobar que el nombre pasado no pertenece a ninguna posicion del repositorio <br>
   * podria devolver un boolean pero se implementa de esta forma, por si en el futuro se pretende obtener o comprobar mas valores de la posicion obtenida
   * @param name nombre de la posicion a comprobar
   */
  async existByName(name: string) {
    this.logger.log(`Buscando la Posicion con nombre ${name}`)
    if (!name) {
      return null
    }
    return await this.posicionRepository.findOneBy({
      nombre: name,
    })
  }

  /**
   * metodo para emitir una notificacion de que la posicon ha sido creada o alterada, enviando el tipo del cambio en el objeto y los datos de este. <br>
   * Lo manda al gateway generañ de la app
   * @param type tipo del cambio
   * @param data objeto cambiado
   * @private el metodo es privado, ya que en principio solo se llama desde el servicio asociaco al objeto en cuestion
   */
  private onChange(type: NotificationTipo, data: Posicion) {
    const notification: Notification<Posicion> = {
      message: `La Posicion con id ${data.id} ha sido ${type.toLowerCase()}d`,
      type: type,
      data: data,
      createdAt: new Date(),
    }

    this.notificationGateway.sendMessage(notification)
  }
}
