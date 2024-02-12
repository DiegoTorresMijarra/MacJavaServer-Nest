import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  Put,
} from '@nestjs/common'
import { PosicionesService } from './posiciones.service'
import { CreatePosicionDto } from './dto/create-posicion.dto'
import { UpdatePosicionDto } from './dto/update-posicion.dto'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Posicion } from './entities/posicion.entity'
import { UUID } from 'typeorm/driver/mongodb/bson.typings'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard'

/**
 * Controlador para la gestion de las peticiones relacionadas con las posiciones.
 */
//@UseGuards(JwtAuthGuard, RolesAuthGuard)
@ApiTags('Posiciones')
@Controller('posiciones')
@UseGuards(JwtAuthGuard, RolesAuthGuard)
export class PosicionesController {
  logger: Logger = new Logger(PosicionesController.name)
  constructor(private readonly posicionesService: PosicionesService) {}

  /**
   * **Obtiene todas las posiciones.**
   * Se realiza cacheo de la consulta y se buscara en la cache cuando sea llamado
   * @see PosicionesService.findAll
   * @returns Promise<Posicion[]> - Array de objetos Posicion.
   */
  @Get('')
  @ApiResponse({
    status: 200,
    description: 'Retorna todas las posiciones',
    type: Promise<Posicion[]>,
  })
  @CacheKey(PosicionesService.CACHE_KEY_FOUND_ALL)
  @CacheTTL(30000) // validez de la cache 30000 milisegundos es en seg en la v4 de cache-manager
  @ApiBearerAuth()
  @Roles('USER')
  async findAll() {
    this.logger.log('Buscando todas las posiciones')
    return await this.posicionesService.findAll()
  }

  /**
   * **Obtiene todas las posiciones paginadas.**
   * Se realiza cacheo de la consulta y se buscara en la cache cuando sea llamado
   * @see PosicionesService.findAllPaginated
   * @returns Promise<Paginated<Posicion>> - Objeto paginado de objetos Posicion.
   */
  @Get('/paginated/')
  @ApiResponse({
    status: 200,
    description: 'Retorna todas las posiciones paginadas',
    type: Promise<Paginated<Posicion>>,
  })
  @ApiQuery({
    description: 'Filtro por limite por pagina',
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filtro por pagina',
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filtro de ordenación: campo:ASC|DESC',
    name: 'sortBy',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de busqueda: filter.campo = $eq:valor',
    name: 'filter',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de busqueda: search = valor',
    name: 'search',
    required: false,
    type: String,
  })
  @ApiBearerAuth()
  @Roles('USER')
  async findAllPaginated(@Paginate() paginatedQuery: PaginateQuery) {
    this.logger.log('Buscando todas las posiciones paginadas')
    return await this.posicionesService.findAllPaginated(paginatedQuery)
  }

  /**
   * **Obtiene una posicion por su id.**
   * Se realiza cacheo de la consulta y se buscara en la cache cuando sea llamado
   * @see PosicionesService.findById
   * @returns Promise<Posicion> - Objeto Posicion.
   * @throws NotFoundException cuando no se encuentre ninguna poscion con ese id
   * @throws BadRequestException cuando el id pasado sea incorrecto
   */
  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Retorna una posicion',
    type: Promise<Posicion>,
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: UUID,
  })
  @ApiNotFoundResponse({
    description: 'La posicion no existe',
  })
  @ApiBadRequestResponse({
    description: 'El id de la posicion no es valido',
  })
  //  @Roles('USER')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Buscando la posicion con id ${id}`)
    return await this.posicionesService.findById(id)
  }

  /**
   * **Crea una posicion.**
   * Se realiza cacheo de la consulta en el servicio y se buscara en la cache cuando sea llamado
   * @see PosicionesService.create
   * @returns Promise<Posicion> - Objeto Posicion.
   * @throws BadRequestException si el dto pasado no es correcto
   */
  @Post()
  @HttpCode(201)
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiResponse({
    status: 201,
    description: 'Crea una posicion',
    type: Promise<Posicion>,
  })
  @ApiParam({
    name: 'createPosicionDto',
    required: true,
    type: CreatePosicionDto,
  })
  @ApiBadRequestResponse({
    description: 'El contenido de la posicion no es valido',
  })
  //@Roles('ADMIN')
  async create(@Body() createPosicioneDto: CreatePosicionDto) {
    this.logger.log(
      `Creando la posicion con nombre ${createPosicioneDto.nombre}`,
    )
    return await this.posicionesService.create(createPosicioneDto)
  }

  /**
   * **Actualiza una posicion.**
   * @see PosicionesService.updateById
   * @returns Promise<Posicion> - Objeto Posicion.
   * @throws BadRequestException si el id o el dto son incorrectos
   * @throws NotFoundException si la pos con ese id no existe
   */
  @Put(':id')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiResponse({
    status: 200,
    description: 'Actualiza una posicion',
    type: Promise<Posicion>,
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: UUID,
  })
  @ApiBody({
    description: 'Datos de la posicion para actualizar',
    type: UpdatePosicionDto,
  })
  @ApiNotFoundResponse({
    description: 'La posicion no existe',
  })
  @ApiBadRequestResponse({
    description: 'El id de la posicion no es valido',
  })
  @ApiBadRequestResponse({
    description: 'El nuevo contenido de la posicion no es valido',
  })
  @ApiBearerAuth()
  @Roles('ADMIN')
  async updateById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePosicioneDto: UpdatePosicionDto,
  ) {
    this.logger.log(`Actualizando la posicion con id ${id}`)
    return await this.posicionesService.updateById(id, updatePosicioneDto)
  }

  /**
   * **Elimina una posicion.**
   * @see PosicionesService.softRemoveById
   * @throws BadRequestException si el id es incorrectos
   * @throws NotFoundException si la posicion con ese id no existe
   */
  @Delete(':id')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiResponse({
    status: 204,
    description: 'Elimina una posicion',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: UUID,
  })
  @ApiNotFoundResponse({
    description: 'La posicion no existe',
  })
  @ApiBadRequestResponse({
    description: 'El id de la posicion no es valido',
  })
  @HttpCode(204)
  async removeById(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Borrando posicion con id ${id}`)
    return await this.posicionesService.removeById(id)
  }

  /**
   * **Borrado logico de una posicion.**
   * Parchea el valor del atributo deleted de la posicion a true
   * @see PosicionesService.softRemoveById
   * @returns Promise<Posicion> - Objeto Posicion.
   * @throws BadRequestException si el id es incorrectos
   * @throws NotFoundException si la posicion con ese id no existe
   */
  @Patch('/softRemove/:id')
  @ApiResponse({
    status: 200,
    description: 'Actualiza el campo deleted de la posicion a true',
    type: Promise<Posicion>,
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: UUID,
  })
  @ApiNotFoundResponse({
    description: 'La posicion no existe',
  })
  @ApiBadRequestResponse({
    description: 'El id de la posicion no es valido',
  })
  @ApiBearerAuth()
  @Roles('ADMIN')
  async softRemoveById(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Actualizando a deleted: true la posicon con id: ${id}`)
    return await this.posicionesService.softRemoveById(id)
  }
}
