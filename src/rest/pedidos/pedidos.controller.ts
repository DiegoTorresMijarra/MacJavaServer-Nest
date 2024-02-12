import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  Logger,
  Put,
  UseGuards,
  HttpCode,
} from '@nestjs/common'
import { PedidosService } from './pedidos.service'
import { CreatePedidoDto } from './dto/create-pedido.dto'
import { UpdatePedidoDto } from './dto/update-pedido.dto'
import { OrderByValidatePipe } from './pipes/orderby-validate.pipe'
import { OrderValidatePipe } from './pipes/order-validate.pipe'
import { IdValidatePipe } from './pipes/id-validate.pipe'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

/**
 * Controlador para la gestion de las peticiones relacionadas con los pedidos.
 */
@UseGuards(JwtAuthGuard, RolesAuthGuard)
@ApiTags('Pedidos')
@Controller('pedidos')
@Roles('ADMIN')
export class PedidosController {
  logger: Logger = new Logger(PedidosController.name)
  constructor(private readonly pedidosService: PedidosService) {}

  /**
   * **Obtiene todas los pedidos paginados.**
   * @see {PedidosService.findAll}
   * @returns Promise<PaginateResult<Pedido>> - Array de objetos Posicion.
   */
  @Get('')
  @ApiResponse({
    status: 200,
    description: 'Pagina de pedidos',
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
    description: 'criterio de ordenación: campo:idUsuario',
    name: 'orderBy',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de ordenación: campo:ASC|DESC',
    name: 'order',
    required: false,
    type: String,
  })
  @Get()
  @Roles('ADMIN')
  async findAll(
    @Query('page', new DefaultValuePipe(1)) page: number = 1,
    @Query('limit', new DefaultValuePipe(20)) limit: number = 20,
    @Query('orderBy', new DefaultValuePipe('idUsuario'), OrderByValidatePipe)
    orderBy: string = 'idUsuario',
    @Query('order', new DefaultValuePipe('asc'), OrderValidatePipe)
    order: string,
  ) {
    this.logger.log(
      `Buscando todos los pedidos con: ${JSON.stringify({
        page,
        limit,
        orderBy,
        order,
      })}`,
    )
    return await this.pedidosService.findAll(page, limit, orderBy, order)
  }

  /**
   * **Obtiene un pedido por su id.**
   * @see {PedidosService.findOne}
   * @returns Promise<Pedido> - Objeto Pedido.
   */
  @ApiResponse({
    status: 200,
    description: 'Obtiene un pedido por id',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del Pedido',
    type: ObjectId,
  })
  @ApiNotFoundResponse({
    description: 'Pedido no encontrado',
  })
  @Get(':id')
  @Roles('ADMIN')
  findOneById(@Param('id', IdValidatePipe) id: string) {
    this.logger.log(`Buscando pedido con id${id}`)
    return this.pedidosService.findOneById(id)
  }

  /**
   * **Crea un pedido.**
   * @see {PedidosService.create}
   * @param {CreatePedidoDto} createPedidoDto - body del pedido a crear
   * @returns Promise<Pedido> - Objeto Pedido.
   * @throws BadRequestException si el dto es incorrectos
   */
  @ApiResponse({
    status: 201,
    description: 'Crea un pedido',
  })
  @ApiBody({
    description: 'Datos del pedido a crear',
    type: CreatePedidoDto,
  })
  @ApiBadRequestResponse({
    description: 'Los datos del pedido no son válidos',
  })
  @Post()
  @HttpCode(201)
  @Roles('ADMIN')
  create(@Body() createPedidoDto: CreatePedidoDto) {
    this.logger.log('Creando pedido')
    return this.pedidosService.create(createPedidoDto)
  }

  /**
   * Metodo de actualizado del pedido
   * @param id
   * @param updatePedidoDto
   * @throws NotFoundException
   * @throws BadRequestException
   */
  @ApiResponse({
    status: 200,
    description: 'Actualiza un pedido',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del Pedido',
    type: ObjectId,
  })
  @ApiNotFoundResponse({
    description: 'Pedido no encontrado',
  })
  @ApiBody({
    description: 'Datos del pedido a actualizar',
    type: UpdatePedidoDto,
  })
  @ApiBadRequestResponse({
    description: 'Los datos del pedido no son válidos',
  })
  @Put(':id')
  @Roles('ADMIN')
  update(
    @Param('id', IdValidatePipe) id: string,
    @Body() updatePedidoDto: UpdatePedidoDto,
  ) {
    this.logger.log(`Actualizando pedido con id${id}`)
    return this.pedidosService.updateById(id, updatePedidoDto)
  }
  /**
   * **Elimina un pedido.**
   * @see {PedidosService.remove}
   * @param {string} id - Identificador del Pedido
   * @returns Promise<Pedido> - Objeto Pedido.
   * @throws NotFoundException
   */
  @ApiResponse({
    status: 204,
    description: 'Elimina un pedido',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del Pedido',
    type: ObjectId,
  })
  @ApiNotFoundResponse({
    description: 'Pedido no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'Los datos del pedido no son válidos',
  })
  @HttpCode(204)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', IdValidatePipe) id: string) {
    this.logger.log(`Eliminando pedido con id${id}`)
    return this.pedidosService.removeById(id)
  }
}
