import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  Logger,
  Put,
} from '@nestjs/common'
import { TrabajadoresService } from './trabajadores.service'
import { CreateTrabajadorDto } from './dto/create-trabajador.dto'
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto'
import { CacheKey, CacheTTL } from '@nestjs/cache-manager'
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
import { Trabajador } from './entities/trabajadores.entity'
import { ResponseTrabajadorDto } from './dto/response-trabajador.dto'
import { UUID } from 'typeorm/driver/mongodb/bson.typings'

@ApiTags('Trabajadores')
@Controller('trabajadores')
export class TrabajadoresController {
  logger: Logger = new Logger(TrabajadoresController.name)
  constructor(private readonly trabajadoresService: TrabajadoresService) {}

  @Get('')
  @ApiResponse({
    status: 200,
    description: 'Lista de trabajadores',
    type: Promise<Trabajador[]>,
  })
  @CacheKey(TrabajadoresService.CACHE_KEY_FOUND_ALL)
  @CacheTTL(30000) // validez de la cache 30000 milisegundos es en seg en la v4 de cache-manager
  //@Roles('USER')
  async findAll() {
    this.logger.log('Buscando todos los trabajadores')
    return await this.trabajadoresService.findAll()
  }

  @Get('/paginated/')
  @ApiResponse({
    status: 200,
    description: 'Pagina de trabajadores paginada',
    type: Promise<Paginated<ResponseTrabajadorDto>>,
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
  @CacheKey(TrabajadoresService.CACHE_KEY_PAGINATED)
  @CacheTTL(30000)
  //@Roles('USER')
  async findAllPaginated(@Paginate() paginatedQuery: PaginateQuery) {
    this.logger.log('Buscando todos los trabajadores paginados')
    return await this.trabajadoresService.findAllPaginated(paginatedQuery)
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Trabajador encontrado',
    type: Promise<Trabajador>,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del Trabajador',
    type: UUID,
  })
  @ApiNotFoundResponse({
    description: 'Trabajador no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del Trabajador no es válido',
  })
  //  @Roles('USER')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Buscando el trabajador con id ${id}`)
    return await this.trabajadoresService.findById(id)
  }
  @Post()
  @ApiResponse({
    status: 201,
    description: 'Trabajador creado',
    type: Promise<Trabajador>,
  })
  @ApiBody({
    description: 'Datos del trabajador a crear',
    type: CreateTrabajadorDto,
  })
  @ApiBadRequestResponse({
    description: 'Los datos del trabajador no son válidos',
  })
  @HttpCode(201)
  //@Roles('ADMIN')
  async create(@Body() createTrabajadorDto: CreateTrabajadorDto) {
    this.logger.log(`Creando el trabajador con dni ${createTrabajadorDto.dni}`)
    return await this.trabajadoresService.create(createTrabajadorDto)
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'Trabajador actualizado',
    type: Promise<Trabajador>,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del Trabajador',
    type: UUID,
  })
  @ApiBody({
    description: 'Datos del trabajador a actualizar',
    type: UpdateTrabajadorDto,
  })
  @ApiNotFoundResponse({
    description: 'Trabajador no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del Trabajador no es válido',
  })
  //@Roles('ADMIN')
  async updateById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTrabajadorDto: UpdateTrabajadorDto,
  ) {
    this.logger.log(`Actualizando la trabajador con id ${id}`)
    return await this.trabajadoresService.updateById(id, updateTrabajadorDto)
  }

  @Delete(':id')
  @ApiResponse({
    status: 204,
    description: 'No Content',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del Trabajador',
    type: UUID,
  })
  @ApiNotFoundResponse({
    description: 'Trabajador no encontrado',
  })
  @HttpCode(204)
  // @Roles('ADMIN')
  async removeById(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Borrando trabajador con id ${id}`)
    return await this.trabajadoresService.removeById(id)
  }
  @Patch('/softRemove/:id')
  @ApiResponse({
    status: 200,
    description: 'Trabajador con deleted:true',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del Trabajador',
    type: UUID,
  })
  @ApiNotFoundResponse({
    description: 'Trabajador no encontrado',
  })
  // @Roles('ADMIN')
  async softRemoveById(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Actualizando a deleted: true el Trabajador con id: ${id}`)
    return await this.trabajadoresService.softRemoveById(id)
  }
}
