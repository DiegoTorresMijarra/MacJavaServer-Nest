import { Test, TestingModule } from '@nestjs/testing'
import { PedidosMapper } from './pedidos-mapper'
import { Pedido, ProductosPedidos } from '../schemas/pedido.schema'
import { UpdatePedidoDto } from '../dto/update-pedido.dto'
import { CreatePedidoDto } from '../dto/create-pedido.dto'

describe('PedidosMapper', () => {
  let mapper: PedidosMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PedidosMapper],
    }).compile()

    mapper = module.get<PedidosMapper>(PedidosMapper)
  })

  it('should be defined', () => {
    expect(mapper).toBeDefined()
  })

  describe('createToPedido', () => {
    it('should map CreatePedidoDto to Pedido entity', () => {
      const createDto: CreatePedidoDto = {
        idTrabajador: 'someId',
        idCliente: 'someId',
        idRestaurante: 1,
        pagado: true,
        productosPedidos: [],
      }
      const cantidadTotal = 10
      const precioTotal = 100
      const productosPedidos: ProductosPedidos[] = []

      const result = mapper.createToPedido(
        createDto,
        cantidadTotal,
        precioTotal,
        productosPedidos,
      )

      expect(result.idTrabajador).toBe(createDto.idTrabajador)
      expect(result.idCliente).toBe(createDto.idCliente)
      expect(result.idRestaurante).toBe(createDto.idRestaurante)
      expect(result.pagado).toBe(createDto.pagado)
      expect(result.cantidadTotal).toBe(cantidadTotal)
      expect(result.precioTotal).toBe(precioTotal)
      expect(result.productosPedidos).toBe(productosPedidos)
    })
  })

  describe('updateToPedido', () => {
    it('should map UpdatePedidoDto to Pedido entity with full update', () => {
      const originalPedido: Pedido = new Pedido()
      const updateDto: UpdatePedidoDto = {
        idTrabajador: 'updatedId',
        idCliente: 'updatedId',
        idRestaurante: 2,
        pagado: false,
        productosPedidos: [],
      }
      const cantidadTotal = 20
      const precioTotal = 200
      const productosPedidos: ProductosPedidos[] = []

      const result = mapper.updateToPedido(
        originalPedido,
        updateDto,
        cantidadTotal,
        precioTotal,
        productosPedidos,
      )

      expect(result.idTrabajador).toBe(updateDto.idTrabajador)
      expect(result.idCliente).toBe(updateDto.idCliente)
      expect(result.idRestaurante).toBe(updateDto.idRestaurante)
      expect(result.pagado).toBe(updateDto.pagado)
      expect(result.cantidadTotal).toBe(cantidadTotal)
      expect(result.precioTotal).toBe(precioTotal)
      expect(result.productosPedidos).toBe(productosPedidos)
    })
  })
})
