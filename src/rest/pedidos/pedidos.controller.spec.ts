import { Test, TestingModule } from '@nestjs/testing'
import { PedidosController } from './pedidos.controller'
import { PedidosService } from './pedidos.service'
import { Trabajador } from '../trabajadores/entities/trabajadores.entity'
import { Restaurante } from '../restaurantes/entities/restaurante.entity'
import { Cliente } from '../clientes/entities/cliente.entity'
import { Producto } from '../productos/entities/producto.entity'
import { Pedido, ProductosPedidos } from './schemas/pedido.schema'
import { CreatePedidoDto, ProductosPedidosDto } from './dto/create-pedido.dto'
import { UpdatePedidoDto } from './dto/update-pedido.dto'
import { Posicion } from '../posiciones/entities/posicion.entity'

describe('PedidosController', () => {
  let controller: PedidosController
  let service: PedidosService

  const mockService = {
    findAll: jest.fn(),
    findOneById: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    removeById: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PedidosController],
      providers: [{ provide: PedidosService, useValue: mockService }],
    }).compile()

    controller = module.get<PedidosController>(PedidosController)
    service = module.get<PedidosService>(PedidosService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
  describe('pedidosControllerFunc', () => {
    let trabajador: Trabajador
    let restaurante: Restaurante
    let cliente: Cliente
    let producto: Producto
    let productoPedido: ProductosPedidos
    let createPedidoDto: CreatePedidoDto
    let productoPedidoDto: ProductosPedidosDto[]
    let updatePedidoDto: UpdatePedidoDto
    let pedidoOriginal: Pedido

    beforeAll(() => {
      trabajador = {
        ...new Trabajador(),
        id: '00000000-0000-0000-0001-000000000001',
        dni: '53718369Y',
        nombre: 'T1',
        apellido: ' test',
        edad: 18,
        telefono: '629384747',
        posicion: new Posicion(),
      }
      restaurante = {
        ...new Restaurante(),
        id: 1,
      }
      cliente = {
        ...new Cliente(),
        id: '00000000-0000-0000-0002-000000000001',
        dni: '53718369Y',
      }
      producto = {
        ...new Producto(),
        id: 1,
        precio: 10,
        stock: 100,
      }
      productoPedido = {
        ...new ProductosPedidos(),
        productoId: 1,
        cantidad: 1,
        precioProducto: 10,
        precioTotal: 10,
      }
      productoPedidoDto = [{ productoId: 1, cantidad: 1, precioProducto: 10 }]
      createPedidoDto = {
        ...new CreatePedidoDto(),
        idCliente: '00000000-0000-0000-0002-000000000001',
        idTrabajador: '00000000-0000-0000-0001-000000000001',
        idRestaurante: 1,
        pagado: false,
        productosPedidos: [{ productoId: 1, cantidad: 1, precioProducto: 10 }],
      }
      pedidoOriginal = {
        ...new Pedido(),
        idCliente: '00000000-0000-0000-0002-000000000001',
        idTrabajador: '00000000-0000-0000-0001-000000000001',
        idRestaurante: 1,
        productosPedidos: [
          { productoId: 1, cantidad: 1, precioProducto: 10, precioTotal: 10 },
        ],
        pagado: false,
      }
      updatePedidoDto = new UpdatePedidoDto()
    })
    describe('findAll', () => {
      it('should return all products paginated', async () => {
        const page = 1
        const limit = 10
        const orderBy = 'idUsuario'
        const order = 'asc'

        const expectedResult = {
          docs: [],
          totalDocs: 10,
          limit: 10,
          page: 1,
          totalPages: 2,
          hasPrevPage: false,
          hasNextPage: true,
          prevPage: null,
          nextPage: 2,
          offset: 0,
          pagingCounter: 1,
        }

        mockService.findAll.mockResolvedValue(expectedResult)

        const result = await controller.findAll(page, limit, orderBy, order)

        expect(result).toEqual(expectedResult)
        expect(mockService.findAll).toHaveBeenCalledWith(
          page,
          limit,
          orderBy,
          order,
        )
      })
    })
    describe('findOneById', () => {
      it('should return the pedido when it exists', async () => {
        const id = 'some-id'
        const expectedResult = new Pedido()

        mockService.findOneById.mockResolvedValue(expectedResult)

        const result = await controller.findOneById(id)

        expect(result).toEqual(expectedResult)
        expect(mockService.findOneById).toHaveBeenCalledWith(id)
      })
    })

    describe('create', () => {
      it('should return the created pedido', async () => {
        const createPedidoDto = new CreatePedidoDto()
        const expectedResult = new Pedido()

        mockService.create.mockResolvedValue(expectedResult)

        const result = await controller.create(createPedidoDto)

        expect(result).toEqual(expectedResult)
        expect(mockService.create).toHaveBeenCalledWith(createPedidoDto)
      })
    })

    describe('update', () => {
      it('should return the updated pedido', async () => {
        const id = 'some-id'
        const updatePedidoDto = new UpdatePedidoDto()
        const expectedResult = new Pedido()

        mockService.updateById.mockResolvedValue(expectedResult)

        const result = await controller.update(id, updatePedidoDto)

        expect(result).toEqual(expectedResult)
        expect(mockService.updateById).toHaveBeenCalledWith(id, updatePedidoDto)
      })
    })

    describe('remove', () => {
      it('should delete a pedido', async () => {
        const id = 'some-id'
        const expectedResult = new Pedido()

        mockService.removeById.mockResolvedValue(expectedResult)

        const result = await controller.remove(id)

        expect(result).toEqual(expectedResult)
        expect(mockService.removeById).toHaveBeenCalledWith(id)
      })
    })
  })
})
