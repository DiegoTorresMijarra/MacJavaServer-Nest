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
import { Paginate, PaginateQuery } from 'nestjs-paginate'

@Controller('trabajadores')
export class TrabajadoresController {
  logger: Logger = new Logger(TrabajadoresController.name)
  constructor(private readonly trabajadoresService: TrabajadoresService) {}
  @Get('')
  @CacheKey(TrabajadoresService.CACHE_KEY_FOUND_ALL)
  @CacheTTL(30000) // validez de la cache 30000 milisegundos es en seg en la v4 de cache-manager
  //@Roles('USER')
  async findAll() {
    this.logger.log('Buscando todos los trabajadores')
    return await this.trabajadoresService.findAll()
  }

  @Get('/paginated/')
  @CacheKey(TrabajadoresService.CACHE_KEY_PAGINATED)
  @CacheTTL(30000)
  //@Roles('USER')
  async findAllPaginated(@Paginate() paginatedQuery: PaginateQuery) {
    this.logger.log('Buscando todos los trabajadores paginados')
    return await this.trabajadoresService.findAllPaginated(paginatedQuery)
  }

  @Get(':id')
  //  @Roles('USER')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Buscando el trabajador con id ${id}`)
    return await this.trabajadoresService.findById(id)
  }
  @Post()
  @HttpCode(201)
  //@Roles('ADMIN')
  async create(@Body() createTrabajadorDto: CreateTrabajadorDto) {
    this.logger.log(`Creando el trabajador con dni ${createTrabajadorDto.dni}`)
    return await this.trabajadoresService.create(createTrabajadorDto)
  }

  @Put(':id')
  //@Roles('ADMIN')
  async updateById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTrabajadorDto: UpdateTrabajadorDto,
  ) {
    this.logger.log(`Actualizando la trabajador con id ${id}`)
    return await this.trabajadoresService.updateById(id, updateTrabajadorDto)
  }

  @Delete(':id')
  @HttpCode(204)
  // @Roles('ADMIN')
  async removeById(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Borrando trabajador con id ${id}`)
    return await this.trabajadoresService.removeById(id)
  }
}
