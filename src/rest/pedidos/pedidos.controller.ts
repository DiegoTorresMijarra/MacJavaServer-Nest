import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  Logger,
  Put,
} from '@nestjs/common'
import { PedidosService } from './pedidos.service'
import { CreatePedidoDto } from './dto/create-pedido.dto'
import { UpdatePedidoDto } from './dto/update-pedido.dto'
import { OrderByValidatePipe } from './pipes/orderby-validate.pipe'
import { OrderValidatePipe } from './pipes/order-validate.pipe'
import { IdValidatePipe } from './pipes/id-validate.pipe'

@Controller('pedidos')
export class PedidosController {
  logger: Logger = new Logger(PedidosController.name)
  constructor(private readonly pedidosService: PedidosService) {}

  @Get()
  // @Roles('ADMIN')
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

  @Get(':id')
  findOneById(@Param('id', IdValidatePipe) id: string) {
    this.logger.log(`Buscando pedido con id${id}`)
    return this.pedidosService.findOneById(id)
  }

  @Post()
  create(@Body() createPedidoDto: CreatePedidoDto) {
    this.logger.log('Creando pedido')
    return this.pedidosService.create(createPedidoDto)
  }

  @Put(':id')
  update(
    @Param('id', IdValidatePipe) id: string,
    @Body() updatePedidoDto: UpdatePedidoDto,
  ) {
    this.logger.log(`Actualizando pedido con id${id}`)
    return this.pedidosService.updateById(id, updatePedidoDto)
  }

  @Delete(':id')
  remove(@Param('id', IdValidatePipe) id: string) {
    this.logger.log(`Eliminando pedido con id${id}`)
    return this.pedidosService.removeById(id)
  }
}
