import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateTrabajadorDto } from './dto/create-trabajador.dto'
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Trabajador } from './entities/trabajadores.entity'
import { Repository } from 'typeorm'
import { PosicionesService } from '../posiciones/posiciones.service'
import { MacjavaNotificationsGateway } from '../../notifications/macjava-notifications.gateway'
import { TrabajadorMapper } from './trabajadores-mapper/trabajador-mapper'
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
import { Posicion } from '../posiciones/entities/posicion.entity'
import { ResponseTrabajadorDto } from './dto/response-trabajador.dto'

/**
 * Servicio CRUD para la gestion de los trabajadores de nuestro negocio.  <br>
 * Los metodos que alteran alguna posicion emiten una notificacion, cuando el cambio se produce <br>
 * Los metodos que que recuperan datos almacenan los objetos en el gestor de la cache.
 */
@Injectable()
export class TrabajadoresService {
  logger: Logger = new Logger(TrabajadoresService.name)
  static readonly CACHE_KEY_FOUND_ALL: string = 'all_trabajadores'
  static readonly CACHE_KEY_FOUND: string = 'trabajador_'
  static readonly CACHE_KEY_PAGINATED: string = 'trabajadores_paginated'
  constructor(
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    private readonly trabajadorMapper: TrabajadorMapper,
    private readonly notificationGateway: MacjavaNotificationsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly posicionesService: PosicionesService,
  ) {}

  /**
   * Metodo para invalidar las cache de los trabajadores, cuando sea llamado invalidara las que hacen referencia a varios trabajadores (findAll y findAllPaginated) <br>
   * Además se le puede pasar la key del objeto que se quiera borrar de esta.
   * @param key (opcional) del objeto en la cache que se quiera borrar
   */
  async invalidateCachesTrabajadores(key?: string) {
    this.logger.log('Invalidando cache de los  Trabajadores')
    if (key) {
      await this.cacheManager.del(key)
      this.logger.log(`Invalidando cache de ${key}`)
    }
    await this.cacheManager.del(TrabajadoresService.CACHE_KEY_FOUND_ALL)
    await this.cacheManager.del(TrabajadoresService.CACHE_KEY_PAGINATED)
  }
  /**
   * Metodo que recupera un objeto de la cache. Tipificamos, para evitar que puedan pasar objetos que no esten previstos o que sean instancias de otros endpoints; en ese caso, captura la excepcion (typeError) y devuelve null
   * @param key del objeto que se quiera recuperar.
   */
  async getByCache(key: string): Promise<Trabajador | Trabajador[]> {
    //todo le podria añadir boolean si quiero añadirle los exist
    let res: Trabajador | Trabajador[]
    try {
      res = await this.cacheManager.get(key)
      if (res) {
        this.logger.log(`Cache ${key} hitted`)
      }
    } catch (error) {
      // capturo las cache que me devuelvan un tipo que no esta contemplado, (los typerror)
      this.logger.error(`Cache de tipo invalido, causa:${error.message}`)
    }
    return res
  }

  /**
   * Metodo que devuelve una array de Trabajadores, esta implementado para usos relacionados con la administracion de la app. Para mostrar resultados, se recomienda usar:
   * @see {TrabajadoresService.findAllPaginated}
   */
  async findAll() {
    this.logger.log('Buscando todos los Trabajadores')

    const cache: Trabajador[] = <Trabajador[]>(
      await this.getByCache(TrabajadoresService.CACHE_KEY_FOUND_ALL)
    )
    if (cache) {
      return cache
    }

    const res = this.trabajadorRepository
      .createQueryBuilder('trabajador')
      .leftJoinAndSelect('trabajador.posicion', 'posicion')
      // .orderBy('trabajador.nombre', 'ASC')
      .getMany()

    await this.cacheManager.set(
      TrabajadoresService.CACHE_KEY_FOUND_ALL,
      res,
      60000,
    )

    return res
  }

  /**
   * Metodo que devuelve un trabajador dado su id
   * @param id del objeto que se quiera recuperar
   * @throws NotFoundException si el trabajador no existe
   */
  async findById(id: string) {
    this.logger.log(`Buscando el trabajador con id ${id}`)

    const cache: Trabajador = <Trabajador>(
      await this.getByCache(TrabajadoresService.CACHE_KEY_FOUND + id)
    )
    if (cache) {
      return cache
    }
    const trabajador = await this.trabajadorRepository
      .createQueryBuilder('trabajador')
      .leftJoinAndSelect('trabajador.posicion', 'posicion')
      .where('trabajador.id = :id', { id })
      .getOne()

    if (!trabajador) {
      throw new NotFoundException(`trabajador con id ${id} no encontrado`)
    }
    await this.cacheManager.set(
      TrabajadoresService.CACHE_KEY_FOUND + id,
      trabajador,
      60000,
    )

    return trabajador
  }

  /**
   * Metodo que devuelve la pagina de posiciones que cumplen el query. <br>
   * cacheo las busquedas especificas en el controlador, pero no en el servicio, en el findAll si para operaciones internas, pero la paginacion se la dejamos al cliente
   * @param paginatedQuery
   */
  async findAllPaginated(paginatedQuery: PaginateQuery) {
    this.logger.log('Buscando todas los trabajadores paginados')

    const queryBuilder = this.trabajadorRepository
      .createQueryBuilder('trabajador')
      .leftJoinAndSelect('trabajador.posicion', 'posicion')

    const res = await paginate(paginatedQuery, queryBuilder, {
      loadEagerRelations: false, //default false: por si usara eager para las relaciones
      sortableColumns: ['nombre', 'apellido', 'edad', 'deleted'], //These are the columns that are valid to be sorted by.
      nullSort: 'last', //Define whether to put null values at the beginning or end of the result set.
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: ['nombre', 'apellido'], //These columns will be searched through when using the search query
      filterableColumns: {
        //https://typeorm.io/#/find-options/advanced-options
        nombre: [
          FilterOperator.EQ, // no ponemos nada
          FilterSuffix.NOT, // usamos $not:DISNEY
          FilterOperator.ILIKE, // $ilike:S
        ],
        apellido: [
          FilterOperator.EQ, // no ponemos nada
          FilterSuffix.NOT, // usamos $not:DISNEY
          FilterOperator.ILIKE, // $ilike:S
        ],
        edad: [
          FilterOperator.EQ, //= valor
          FilterOperator.GT, // > valor
          FilterOperator.GTE, // >= valor
          FilterOperator.LT, //  < valor
          FilterOperator.LTE, // <= valor
        ],
        deleted: true,
      },
      relativePath: true, //Generate relative paths in the resource links
    })

    return {
      ...res,
      data: (res.data ?? []).map((trabajador) =>
        this.trabajadorMapper.trabajadorToResponse(trabajador),
      ),
    } as Paginated<ResponseTrabajadorDto>
  }
  /**
   * Metodo que genera un trabajador y la inserta en el repositorio<br>
   * tras esto borra las caches globales para evitar errores. <br>
   * La posicion la obtiene del servicio de las posicones
   * @param createTrabajadorDto con los datos del trabajador a crear
   * @throws BadRequestException si el id es erroneo, si los datos son incorrectos, si el dni ya existe o si la categoria del trabajador no existe o no es valida (deleted=true)
   */
  async create(createTrabajadorDto: CreateTrabajadorDto) {
    this.logger.log(`Creando Trabajador ${JSON.stringify(createTrabajadorDto)}`)

    await this.checkByDni(createTrabajadorDto.dni) //no hago nada, pero lanzo la excepcion

    const pos = await this.checkPosicion(createTrabajadorDto.posicionNombre)
    const toSave: Trabajador = this.trabajadorMapper.createToTrabajador(
      createTrabajadorDto,
      pos,
    )

    const saved = await this.trabajadorRepository.save(toSave)

    this.onChange(NotificationTipo.CREATE, saved)
    await this.invalidateCachesTrabajadores()

    return saved
  }

  /**
   * Metodo que actualiza un trabajador dado su id<br>
   * tras esto borra las caches globales para evitar errores. <br>
   * La posicion la obtiene del servicio de las posicones
   * @param id del objeto que se quiera actualizar
   * @throws BadRequestException si el id es erroneo, si los datos son incorrectos, si el dni ya existe o si la categoria del trabajador no existe o no es valida (deleted=true)
   * @throws NotFoundException si el trabajador con ese id no existe
   */
  async updateById(id: string, updateTrabajadorDto: UpdateTrabajadorDto) {
    this.logger.log(`Actualizando Trabajador con id ${id}`)
    const original = await this.findById(id)

    if (updateTrabajadorDto.dni) {
      await this.checkByDni(updateTrabajadorDto.dni) //no hago nada, pero lanzo la excepcion
    }

    let pos: Posicion
    if (updateTrabajadorDto.posicionNombre) {
      pos = await this.checkPosicion(updateTrabajadorDto.posicionNombre)
    }

    const updated = await this.trabajadorRepository.save(
      this.trabajadorMapper.updateToTrabajador(
        original,
        updateTrabajadorDto,
        pos,
      ),
    )

    this.onChange(NotificationTipo.UPDATE, updated)

    await this.invalidateCachesTrabajadores(
      TrabajadoresService.CACHE_KEY_FOUND + id,
    )

    return updated
  }

  /**
   * Metodo que borra un trabajador dado su id<br>
   * tras esto borra las caches globales para evitar errores. <br>
   * @param id del objeto que se quiera borrar
   * @throws NotFoundException si el trabajador con ese id no existe
   */
  async removeById(id: string) {
    this.logger.log(`Borrando Trabajador con id ${id}`)
    const original = await this.findById(id)
    this.onChange(
      NotificationTipo.DELETE,
      await this.trabajadorRepository.remove(original),
    )
    await this.invalidateCachesTrabajadores(
      TrabajadoresService.CACHE_KEY_FOUND + id,
    )
  }

  /**
   * Metodo que hace el borrado logico (deleted=true) de un trabajador dado su id<br>
   * tras esto borra las caches globales para evitar errores. <br>
   * @param id del objeto que se quiera borrar
   * @throws NotFoundException si el trabajador con ese id no existe
   */
  async softRemoveById(id: string) {
    this.logger.log(`Actualizando a deleted: true Trabajador con id ${id}`)
    const original = await this.findById(id)
    original.deleted = true
    const res = await this.trabajadorRepository.save(original)

    this.onChange(NotificationTipo.UPDATE, res)
    await this.invalidateCachesTrabajadores(
      TrabajadoresService.CACHE_KEY_FOUND + id,
    )
    return res
  }

  /**
   * checks if the posicion exists and isActive and returns it, throws BadRequestException otherwise
   * @param posicionName
   */
  async checkPosicion(posicionName: string): Promise<Posicion> {
    this.logger.log(
      `Comprobando si existe y es valida la Posicon ${posicionName}`,
    )
    const posicion = await this.posicionesService.findByName(posicionName)
    if (!posicion) {
      throw new BadRequestException(`La Posicion ${posicionName} no es valida`)
    }
    return posicion
  }

  /**
   * metodo que comprueba si existe algun trabajador con el dni pasado y lanza una excepcion si existe.
   * @throws BadRequestException si existe un trabajador con ese dni
   * @param dni
   * @return Promise<false>
   */
  async checkByDni(dni: string) {
    const existByDni: boolean = await this.trabajadorRepository.existsBy({
      dni: dni,
    })
    if (existByDni) {
      throw new BadRequestException(`Ya existe un Trabajador con el dni ${dni}`)
    }
    return existByDni
  }

  /**
   * metodo para emitir una notificacion de un trabajador ha sido creada o alterada, enviando el tipo del cambio en el objeto y los datos de este. <br>
   * Lo manda al gateway generañ de la app
   * @param type tipo del cambio
   * @param data objeto cambiado
   * @private el metodo es privado, ya que en principio solo se llama desde el servicio asociaco al objeto en cuestion
   */
  private onChange(type: NotificationTipo, data: Trabajador) {
    const notification: Notification<Trabajador> = {
      message: `El Trabajador con id ${data.id} ha sido ${type.toLowerCase()}`,
      type: type,
      data: data,
      createdAt: new Date(),
    }

    this.notificationGateway.sendMessage(notification)
  }
}
