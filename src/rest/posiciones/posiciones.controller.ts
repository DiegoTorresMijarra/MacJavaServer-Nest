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
  ApiBody,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Posicion } from './entities/posicion.entity'
import { UUID } from 'typeorm/driver/mongodb/bson.typings'

//@UseGuards(JwtAuthGuard, RolesAuthGuard)
@ApiTags('Posiciones')
@Controller('posiciones')
export class PosicionesController {
  logger: Logger = new Logger(PosicionesController.name)
  constructor(private readonly posicionesService: PosicionesService) {}

  @Get('')
  @ApiResponse({
    status: 200,
    description: 'Retorna todas las posiciones',
    type: Promise<Posicion[]>,
  })
  @CacheKey(PosicionesService.CACHE_KEY_FOUND_ALL)
  @CacheTTL(30000) // validez de la cache 30000 milisegundos es en seg en la v4 de cache-manager
  //@Roles('USER')
  async findAll() {
    this.logger.log('Buscando todas las posiciones')
    return await this.posicionesService.findAll()
  }

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
  //@Roles('USER')
  async findAllPaginated(@Paginate() paginatedQuery: PaginateQuery) {
    this.logger.log('Buscando todas las posiciones paginadas')
    return await this.posicionesService.findAllPaginated(paginatedQuery)
  }

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
  @Post()
  @HttpCode(201)
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

  @Put(':id')
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
  //@Roles('ADMIN')
  async updateById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePosicioneDto: UpdatePosicionDto,
  ) {
    this.logger.log(`Actualizando la posicion con id ${id}`)
    return await this.posicionesService.updateById(id, updatePosicioneDto)
  }

  @Delete(':id')
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
  // @Roles('ADMIN')
  async removeById(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Borrando posicion con id ${id}`)
    return await this.posicionesService.removeById(id)
  }

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
  // @Roles('ADMIN')
  async softRemoveById(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Actualizando a deleted: true la posicon con id: ${id}`)
    return await this.posicionesService.softRemoveById(id)
  }
}
