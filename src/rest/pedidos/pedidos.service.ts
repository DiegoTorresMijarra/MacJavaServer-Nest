import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreatePedidoDto, ProductosPedidosDto } from './dto/create-pedido.dto'
import { UpdatePedidoDto } from './dto/update-pedido.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Pedido, ProductosPedidos } from './schemas/pedido.schema'
import { PaginateModel } from 'mongoose'
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import { RestaurantesService } from '../restaurantes/restaurantes.service'
import { MacjavaNotificationsGateway } from '../../notifications/macjava-notifications.gateway'
import { ClientesService } from '../clientes/clientes.service'
import { TrabajadoresService } from '../trabajadores/trabajadores.service'
import { ProductoService } from '../productos/productos.service'
import { UpdateResult } from 'typeorm'
import { PedidosMapper } from './pedidos-mapper/pedidos-mapper'

export const PedidosOrderByValues: string[] = ['_id', 'idUsuario'] // Lo usamos en los pipes
export const PedidosOrderValues: string[] = ['asc', 'desc'] // Lo usamos en los pipes

@Injectable()
export class PedidosService {
  logger: Logger = new Logger(PedidosService.name)

  constructor(
    @InjectModel(Pedido.name)
    private readonly pedidosRepository: PaginateModel<Pedido>,
    private readonly mapper: PedidosMapper,
    //otros modulos:
    private readonly restauranteService: RestaurantesService,
    private readonly clienteService: ClientesService,
    private readonly trabajadorService: TrabajadoresService,
    private readonly productosService: ProductoService,
    //cache y ws
    private readonly notificationGateway: MacjavaNotificationsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(page: number, limit: number, orderBy: string, order: string) {
    this.logger.log(
      `Buscando todos los pedidos con paginación y filtros: ${JSON.stringify({
        page,
        limit,
        orderBy,
        order,
      })}`,
    )
    const options = {
      page,
      limit,
      sort: {
        [orderBy]: order,
      },
      collection: 'es_ES', // para que use la configuración de idioma de España
    }

    return await this.pedidosRepository.paginate({}, options)
  }

  async findOneById(id: string) {
    this.logger.log(`Buscando pedido con id ${id}`)
    const res = await this.pedidosRepository.findById(id).exec()
    if (!res) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`)
    }
    return res
  }
  async create(createPedidoDto: CreatePedidoDto) {
    this.logger.log(`Creando pedido`)

    await this.chekOrderIds(createPedidoDto)
    const productosYTotales = await this.checkProductosPedidos(
      createPedidoDto.productosPedidos,
    )
    await this.actualizarStockProductos(
      productosYTotales.productosPComprobados,
      false,
    )

    return await this.pedidosRepository.create(
      this.mapper.createToPedido(
        createPedidoDto,
        productosYTotales.cantidadTotal,
        productosYTotales.precioTotal,
        productosYTotales.productosPComprobados,
      ),
    )
  }
  async updateById(id: string, updatePedidoDto: UpdatePedidoDto) {
    this.logger.log(`Actualizando pedido con id ${id}`)
    const original = await this.findOneById(id)

    await this.chekOrderIds(updatePedidoDto)

    const productosYTotales = await this.checkProductosPedidos(
      updatePedidoDto.productosPedidos,
    )

    if (productosYTotales.productosPComprobados) {
      //si nos lo han pasado, y es valido (no ha lanzado exc) actualizamos los stocks
      await this.actualizarStockProductos(
        productosYTotales.productosPComprobados,
        false,
      )
      await this.actualizarStockProductos(original.productosPedidos, true)
    }

    const pedidoActualizado = this.mapper.updateToPedido(
      original,
      updatePedidoDto,
      productosYTotales.cantidadTotal,
      productosYTotales.precioTotal,
      productosYTotales.productosPComprobados,
    )

    return await this.pedidosRepository
      .findByIdAndUpdate(id, { pedidoActualizado }, { new: true })
      .exec()
  }

  async removeById(id: string) {
    this.logger.log(`Eliminando pedido con id ${id}`)

    const original = await this.findOneById(id)

    await this.actualizarStockProductos(original.productosPedidos, false)

    return await this.pedidosRepository.findByIdAndDelete(id).exec()
  }

  async chekOrderIds(orderIds: Pedido | CreatePedidoDto | UpdatePedidoDto) {
    this.logger.log(
      `Comprobando los id del pedido: idRestaurante: ${orderIds.idRestaurante}; 
      idTrabajador: ${orderIds.idTrabajador}; 
      idCliente: ${orderIds.idCliente}`,
    )

    try {
      //si no da error, se cumple el metodo, podria devolver boolean
      await this.restauranteService.findOne(orderIds.idRestaurante)
      await this.trabajadorService.findById(orderIds.idTrabajador)
      await this.clienteService.findOne(orderIds.idCliente)
      //return true
    } catch (exception) {
      //return false
      throw new BadRequestException(
        `Error en los ids proporcionados: ${exception.message}`,
      )
    }
  }

  async checkProductosPedidos(productosPedidos: ProductosPedidosDto[]) {
    this.logger.log('Comprobando los productos del pedido')

    if (!productosPedidos) {
      return {
        cantidadTotal: null,
        precioTotal: null,
        productosPComprobados: null,
      }
    }

    const productosPComprobados: ProductosPedidos[] = []

    let cantidadTotal: number = 0
    let precioTotal: number = 0

    for (const pp of productosPedidos) {
      this.logger.log(`Comprobando producto: ${pp.productoId}`)

      const productoReal = await this.productosService.findOne(pp.productoId)
      if (
        !productoReal ||
        productoReal.stock <= pp.cantidad ||
        productoReal.precio != pp.precioProducto
      ) {
        throw new BadRequestException(
          `Producto con id ${pp.productoId} no encontrado o datos de este erroneos`,
        )
      } else {
        precioTotal += pp.cantidad * pp.precioProducto
        cantidadTotal += pp.cantidad

        productosPComprobados.push({
          productoId: pp.productoId,
          cantidad: pp.cantidad,
          precioProducto: pp.precioProducto,
          precioTotal: pp.cantidad * pp.precioProducto,
        })
      }
    }
    return {
      cantidadTotal,
      precioTotal,
      productosPComprobados,
    }
  }

  async actualizarStockProductos(
    productosPedidos: ProductosPedidos[],
    sumar: boolean,
  ) {
    this.logger.log('Actualizando el stock de los productos del pedido')

    for (const pp of productosPedidos) {
      this.logger.log(`Actualizando el stock del producto: ${pp.productoId}`)

      await this.productosService.patchStock(pp.productoId, pp.cantidad, sumar)
    }
  }

  async userExists(id: string) {
    this.logger.log(`Comprobando si existen pedidos del usuario con id: ${id}`)

    const res = await this.pedidosRepository.exists({ idCliente: id })
    if (!res) {
      //throw new NotFoundException(`No se encontraron pedidos del usuario con id: ${id}`)
      return false
    }
    return true
  }

  async getPedidosByUser(id: string) {
    this.logger.log(`Obteniendo Pedidos por el id de usuario: ${id}`)

    const res = await this.pedidosRepository.find({ idCliente: id })

    return res
  }
}
