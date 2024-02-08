import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  ParseIntPipe,
  HttpCode,
  UseInterceptors,
} from '@nestjs/common'
import { RestaurantesService } from './restaurantes.service'
import { CreateRestauranteDto } from './dto/create-restaurante.dto'
import { UpdateRestauranteDto } from './dto/update-restaurante.dto'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'
import { Paginate, PaginateQuery } from 'nestjs-paginate'

@Controller('restaurantes')
@UseInterceptors(CacheInterceptor)
export class RestaurantesController {
  private readonly logger: Logger = new Logger(RestaurantesController.name)
  constructor(private readonly restaurantesService: RestaurantesService) {}

  @Get()
  @CacheKey('all_restaurantes')
  @CacheTTL(30000)
  async findAll() {
    this.logger.log('Pidiendo todos los restaurantes (Controller)')
    return await this.restaurantesService.findAll()
  }

  @Get('/paginated/')
  @CacheTTL(30)
  async findAllPaginated(@Paginate() paginatedQuery: PaginateQuery) {
    this.logger.log('Buscando todos los restaurantes paginados')
    return await this.restaurantesService.findAllPaginated(paginatedQuery)
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Pidiendo el restaurante con id: ${id} (Controller)`)
    return await this.restaurantesService.findOne(id)
  }

  @Post()
  @HttpCode(201)
  async create(@Body() createRestauranteDto: CreateRestauranteDto) {
    this.logger.log(`Creando un restaurante (Controller)`)
    return this.restaurantesService.create(createRestauranteDto)
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRestauranteDto: UpdateRestauranteDto,
  ) {
    this.logger.log('Actualizando un restaurante (Controller)')
    return this.restaurantesService.update(id, updateRestauranteDto)
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Eliminando un restaurante (Controller)`)
    return await this.restaurantesService.removeSoft(id)
  }
  @Get('by-name/:nombre')
  async findByName(@Param('nombre') nombre: string) {
    this.logger.log(
      `Pidiendo el restaurante con nombre: ${nombre} (Controller)`,
    )
    return await this.restaurantesService.findByName(nombre)
  }
}
