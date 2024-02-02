import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete, Logger, ParseIntPipe, HttpCode, UseInterceptors,
} from '@nestjs/common'
import { RestaurantesService } from './restaurantes.service'
import { CreateRestauranteDto } from './dto/create-restaurante.dto'
import { UpdateRestauranteDto } from './dto/update-restaurante.dto'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'
import {Paginate, Paginated, PaginateQuery} from 'nestjs-paginate'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";
import {Restaurante} from "./entities/restaurante.entity";


@Controller('restaurantes')
@UseInterceptors(CacheInterceptor)
@ApiTags('Restaurantes')
export class RestaurantesController {
  private readonly logger: Logger = new Logger(RestaurantesController.name);
  constructor(private readonly restaurantesService: RestaurantesService) {}

  @Get()
  @CacheKey('all_restaurantes')
  @CacheTTL(30000)
  @ApiResponse({status: 200, description: 'Obtiene todos los restaurantes', type: Restaurante, isArray: true})
  async findAll() {
    this.logger.log('Pidiendo todos los restaurantes (Controller)');
    return await this.restaurantesService.findAll()
  }

  @Get('/paginated/')
  @CacheTTL(30)
  @ApiResponse({status: 200, description: 'Obtiene todos los restaurantes paginados', type:Paginated<Restaurante>})
  @ApiQuery({description:'Filtro por pagina', name: 'page', required: false, type: Number})
  @ApiQuery({description:'Filtro por limite', name: 'limit', required: false, type: Number})
  async findAllPaginated(@Paginate() paginatedQuery: PaginateQuery) {
    this.logger.log('Buscando todos los restaurantes paginados')
    return await this.restaurantesService.findAllPaginated(paginatedQuery)
  }

  @Get(':id')
  @ApiResponse({status: 200, description: 'Obtiene un restaurante por id', type: Restaurante})
  @ApiNotFoundResponse({description: 'No se encuentra el restaurante'})
  @ApiParam({name: 'id', description: 'Id del restaurante', type: Number})
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Pidiendo el restaurante con id: ${id} (Controller)`);
    return await this.restaurantesService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  @ApiResponse({status: 201, description: 'Crea un restaurante', type: Restaurante})
  @ApiBadRequestResponse({description: 'Error en los datos del nuevo restaurante'})
  @ApiBody({description:' Datos del restaurante a crear', type: CreateRestauranteDto})
  //@Roles('ADMIN')
  async create(@Body() createRestauranteDto: CreateRestauranteDto) {
    this.logger.log(`Creando un restaurante (Controller)`);
    return this.restaurantesService.create(createRestauranteDto)
  }

  @Patch(':id')
  @ApiResponse({status: 200, description: 'Actualiza un restaurante', type: Restaurante})
  @ApiNotFoundResponse({description: 'No se encuentra el restaurante que quiere actualizar'})
  @ApiBadRequestResponse({description: 'Error en los datos del restaurante a actualizar'})
    @ApiParam({name: 'id', description: 'Id del restaurante', type: Number})
    @ApiBody({description:' Datos del restaurante a actualizar', type: UpdateRestauranteDto})
  //@Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRestauranteDto: UpdateRestauranteDto,
  ) {
    this.logger.log('Actualizando un restaurante (Controller)');
    return this.restaurantesService.update(id, updateRestauranteDto)
  }

  @Delete(':id')
  @ApiResponse({status: 200, description: 'Elimina un restaurante'})
  @ApiNotFoundResponse({description: 'No se encuentra el restaurante que quiere eliminar'})
  @ApiParam({name: 'id', description: 'Id del restaurante', type: Number})
  //@Roles('ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Eliminando un restaurante (Controller)`);
    return await this.restaurantesService.removeSoft(id);
  }
  @Get('by-name/:nombre')
  @ApiResponse({status: 200, description: 'Obtiene un restaurante por nombre', type: Restaurante})
  @ApiNotFoundResponse({description: 'No se encuentra el restaurante'})
  @ApiParam({name: 'nombre', description: 'Nombre del restaurante que se quiere buscar', type: String})
  async findByName(@Param('nombre') nombre: string) {
    this.logger.log(`Pidiendo el restaurante con nombre: ${nombre} (Controller)`);
    return await this.restaurantesService.findByName(nombre);
  }

}
