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
import { Paginate, PaginateQuery } from 'nestjs-paginate'

//@UseGuards(JwtAuthGuard, RolesAuthGuard)
@Controller('posiciones')
export class PosicionesController {
  logger: Logger = new Logger(PosicionesController.name)
  constructor(private readonly posicionesService: PosicionesService) {}

  @Get('')
  @CacheKey(PosicionesService.CACHE_KEY_FOUND_ALL)
  @CacheTTL(30000) // validez de la cache 30000 milisegundos es en seg en la v4 de cache-manager
  //@Roles('USER')
  async findAll() {
    this.logger.log('Buscando todas las posiciones')
    return await this.posicionesService.findAll()
  }

  @Get('/paginated/')
  //@Roles('USER')
  async findAllPaginated(@Paginate() paginatedQuery: PaginateQuery) {
    this.logger.log('Buscando todas las posiciones paginadas')
    return await this.posicionesService.findAllPaginated(paginatedQuery)
  }

  @Get(':id')
  //  @Roles('USER')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Buscando la posicion con id ${id}`)
    return await this.posicionesService.findById(id)
  }
  @Post()
  @HttpCode(201)
  //@Roles('ADMIN')
  async create(@Body() createPosicioneDto: CreatePosicionDto) {
    this.logger.log(
      `Creando la posicion con nombre ${createPosicioneDto.nombre}`,
    )
    return await this.posicionesService.create(createPosicioneDto)
  }

  @Put(':id')
  //@Roles('ADMIN')
  async updateById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePosicioneDto: UpdatePosicionDto,
  ) {
    this.logger.log(`Actualizando la posicion con id ${id}`)
    return await this.posicionesService.updateById(id, updatePosicioneDto)
  }

  @Delete(':id')
  @HttpCode(204)
  // @Roles('ADMIN')
  async removeById(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Borrando posicion con id ${id}`)
    return await this.posicionesService.removeById(id)
  }

  @Patch('/softRemove/:id')
  // @Roles('ADMIN')
  async softRemoveById(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Actualizando a deleted: true la posicon con id: ${id}`)
    return await this.posicionesService.softRemoveById(id)
  }
}
