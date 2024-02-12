import { Test, TestingModule } from '@nestjs/testing'
import {
  PedidosOrderByValues,
  PedidosOrderValues,
  PedidosService,
} from './pedidos.service'
import { TrabajadoresService } from '../trabajadores/trabajadores.service'
import { MacjavaNotificationsGateway } from '../../notifications/macjava-notifications.gateway'
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import { PaginateModel } from 'mongoose'
import { Pedido, ProductosPedidos } from './schemas/pedido.schema'
import { ClientesService } from '../clientes/clientes.service'
import { ProductoService } from '../productos/productos.service'
import { PedidosMapper } from './pedidos-mapper/pedidos-mapper'
import { RestaurantesService } from '../restaurantes/restaurantes.service'
import { getModelToken } from '@nestjs/mongoose'
import { Trabajador } from '../trabajadores/entities/trabajadores.entity'
import { Restaurante } from '../restaurantes/entities/restaurante.entity'
import { Cliente } from '../clientes/entities/cliente.entity'
import { Producto } from '../productos/entities/producto.entity'
import { Posicion } from '../posiciones/entities/posicion.entity'
import { CreatePedidoDto, ProductosPedidosDto } from './dto/create-pedido.dto'
import { UpdatePedidoDto } from './dto/update-pedido.dto'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ResponseProductoDto } from '../productos/dto/response-producto.dto'

describe('PedidosService', () => {
  let service: PedidosService
  let repository: PaginateModel<Pedido>
  let mapper: PedidosMapper
  //entidades
  let clienteService: ClientesService
  let trabajadorService: TrabajadoresService
  let restauranteService: RestaurantesService
  let productosService: ProductoService
  //cahe ws
  let notificationGateway: MacjavaNotificationsGateway
  let cacheManager: Cache

  const mapperMock = {
    createToPedido: jest.fn(),
    updateToPedido: jest.fn(),
  }

  const trabServMock = {
    findById: jest.fn(),
  }
  const resServMock = {
    findOne: jest.fn(),
  }
  const clientServMock = {
    findOne: jest.fn(),
  }
  const prodServMock = {
    findOne: jest.fn(),
    patchStock: jest.fn(),
  }

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    del: jest.fn(),
    store: {
      keys: jest.fn(),
    },
  }

  const notificationMock = {
    sendMessage: jest.fn(),
  }
  const mockRepo = {
    paginate: jest.fn(),
    findById: jest.fn().mockImplementationOnce(() => ({
      exec: jest.fn().mockResolvedValueOnce((): Pedido => {
        return new Pedido()
      }),
    })),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn().mockImplementationOnce(() => ({
      exec: jest.fn().mockResolvedValueOnce((): Pedido => {
        return new Pedido()
      }),
    })),
    findByIdAndDelete: jest.fn().mockImplementationOnce(() => ({
      exec: jest.fn().mockResolvedValueOnce((): Pedido => {
        return new Pedido()
      }),
    })),
    exists: jest.fn(),
    find: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidosService,
        {
          provide: getModelToken(Pedido.name),
          useValue: mockRepo,
        },
        { provide: TrabajadoresService, useValue: trabServMock },
        { provide: RestaurantesService, useValue: resServMock },
        { provide: ClientesService, useValue: clientServMock },
        { provide: ProductoService, useValue: prodServMock },
        { provide: PedidosMapper, useValue: mapperMock },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
        {
          provide: MacjavaNotificationsGateway,
          useValue: notificationMock,
        },
      ],
    }).compile()

    service = module.get<PedidosService>(PedidosService)
    repository = module.get<PaginateModel<Pedido>>(getModelToken(Pedido.name))
    mapper = module.get<PedidosMapper>(PedidosMapper)

    trabajadorService = module.get<TrabajadoresService>(TrabajadoresService)
    restauranteService = module.get<RestaurantesService>(RestaurantesService)
    productosService = module.get<ProductoService>(ProductoService)
    clienteService = module.get<ClientesService>(ClientesService)

    notificationGateway = module.get<MacjavaNotificationsGateway>(
      MacjavaNotificationsGateway,
    )
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('pedidosServiceFunc', () => {
    let trabajador: Trabajador
    let restaurante: Restaurante
    let cliente: Cliente
    let producto: Producto
    let productoPedido: ProductosPedidos
    let createPedidoDto: CreatePedidoDto
    let productoPedidoDto: ProductosPedidosDto[]
    let updatePedidoDto: UpdatePedidoDto
    let pedidoOriginal: Pedido
    let mockExec

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
    describe('chekOrderIds', () => {
      it('should return validate all id', async () => {
        const mockResFind = jest
          .spyOn(resServMock, 'findOne')
          .mockResolvedValue(restaurante)
        const mockTrabFind = jest
          .spyOn(trabServMock, 'findById')
          .mockResolvedValue(trabajador)
        const mockClientFind = jest
          .spyOn(clientServMock, 'findOne')
          .mockResolvedValue(cliente)

        const res = await service.chekOrderIds(pedidoOriginal)

        expect(mockClientFind).toHaveBeenCalled()
        expect(mockTrabFind).toHaveBeenCalled()
        expect(mockResFind).toHaveBeenCalled()
      })
      it('should throw bad request when one is mising', async () => {
        const mockResFind = jest
          .spyOn(resServMock, 'findOne')
          .mockResolvedValue(restaurante)
        const mockTrabFind = jest
          .spyOn(trabServMock, 'findById')
          .mockResolvedValue(trabajador)
        const mockClientFind = jest
          .spyOn(clientServMock, 'findOne')
          .mockRejectedValue(NotFoundException)

        await expect(() =>
          service.chekOrderIds(pedidoOriginal),
        ).rejects.toThrow(BadRequestException)
      })
    })
    describe('checkProductosPedidos', () => {
      it('should return correct, when correct one is passed', async () => {
        const mockProdFind = jest
          .spyOn(productosService, 'findOne')
          .mockResolvedValue({
            ...producto,
            proveedor: 'Bimbo',
          } as ResponseProductoDto)

        const res = await service.checkProductosPedidos(productoPedidoDto)

        expect(res.productosPComprobados).toEqual([productoPedido])
        expect(res.cantidadTotal).toEqual(1)
        expect(res.precioTotal).toEqual(10)
        expect(mockProdFind).toHaveBeenCalled()
      })
      it('should throw bad request when one is incorrect', async () => {
        const mockProdFind = jest
          .spyOn(productosService, 'findOne')
          .mockResolvedValue({
            ...producto,
            precio: 99,
            proveedor: 'Bimbo',
          })

        await expect(() =>
          service.checkProductosPedidos(productoPedidoDto),
        ).rejects.toThrow(BadRequestException)
      })
      it('should null when null one is passed', async () => {
        const res = await service.checkProductosPedidos(undefined)

        expect(res.productosPComprobados).toBeNull()
        expect(res.precioTotal).toBeNull()
        expect(res.cantidadTotal).toBeNull()
      })
    })
    describe('actualizarStockProductos', () => {
      it('should update all stock', async () => {
        const mockProServ = jest.spyOn(prodServMock, 'patchStock')
        const res = await service.actualizarStockProductos(
          [productoPedido],
          true,
        )
        expect(mockProServ).toHaveBeenCalled()
        expect(mockProServ).toHaveBeenCalledWith(
          productoPedido.productoId,
          productoPedido.cantidad,
          true,
        )
      })
    })
    describe('findAll', () => {
      it('should return all products paginated', async () => {
        const page = 1
        const limit = 10
        const orderBy = PedidosOrderByValues[0]
        const order = PedidosOrderValues[0]

        const paginatedResult = {
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
        const mockRepo = jest
          .spyOn(repository, 'paginate')
          .mockResolvedValue(paginatedResult)
        const result = await service.findAll(page, limit, orderBy, order)
        expect(result).toEqual(paginatedResult)
        expect(mockRepo).toHaveBeenCalledWith(
          {},
          {
            page,
            limit,
            sort: {
              [orderBy]: order,
            },
            collection: 'es_ES',
          },
        )
      })
    })
    describe('findOneById', () => {
      it('should return the pedido when it exists', async () => {
        const mockRepo = jest
          .spyOn(repository, 'findById')
          .mockResolvedValue(pedidoOriginal)

        const result = await service.findOneById('')

        expect(mockRepo).toHaveBeenCalled()
      })
    })
    describe('create', () => {
      it('should return the created pedido', async () => {
        const mockRepo = jest
          .spyOn(repository, 'create')
          .mockResolvedValue(pedidoOriginal as any)

        const mockCheckId = jest
          .spyOn(service, 'chekOrderIds')
          .mockResolvedValue()

        const mockCheckProductosPedidos = jest
          .spyOn(service, 'checkProductosPedidos')
          .mockResolvedValue({
            cantidadTotal: 1,
            precioTotal: 10,
            productosPComprobados: [productoPedido],
          })

        const mockCheckActualizarStock = jest.spyOn(
          service,
          'actualizarStockProductos',
        )

        const result = await service.create(createPedidoDto)

        expect(mockRepo).toHaveBeenCalled()
        expect(mockCheckId).toHaveBeenCalled()
        expect(mockCheckProductosPedidos).toHaveBeenCalled()
        expect(mockCheckActualizarStock).toHaveBeenCalled()
      })
    })
    describe('update', () => {
      it('should return the created pedido', async () => {
        const mockFindService = jest
          .spyOn(service, 'findOneById')
          .mockResolvedValue(pedidoOriginal as any)

        const mockRepo = jest
          .spyOn(repository, 'findByIdAndUpdate')
          .mockResolvedValue(pedidoOriginal as any)

        const mockCheckId = jest
          .spyOn(service, 'chekOrderIds')
          .mockResolvedValue()

        const mockCheckProductosPedidos = jest
          .spyOn(service, 'checkProductosPedidos')
          .mockResolvedValue({
            cantidadTotal: 1,
            precioTotal: 10,
            productosPComprobados: [productoPedido],
          })

        const mockCheckActualizarStock = jest.spyOn(
          service,
          'actualizarStockProductos',
        )

        const result = await service.updateById('', updatePedidoDto)

        expect(mockRepo).toHaveBeenCalled()
        expect(mockCheckId).toHaveBeenCalled()
        expect(mockCheckProductosPedidos).toHaveBeenCalled()
        expect(mockCheckActualizarStock).toHaveBeenCalled()
        expect(mockFindService).toHaveBeenCalled()
      })
    })
    describe('remove', () => {
      it('should delete a pedido', async () => {
        const mockFindService = jest
          .spyOn(service, 'findOneById')
          .mockResolvedValue(pedidoOriginal as any)

        const mockRepo = jest
          .spyOn(repository, 'findByIdAndDelete')
          .mockResolvedValue(pedidoOriginal as any)

        const mockCheckActualizarStock = jest.spyOn(
          service,
          'actualizarStockProductos',
        )

        const result = await service.removeById('')

        expect(mockRepo).toHaveBeenCalled()
        expect(mockCheckActualizarStock).toHaveBeenCalled()
        expect(mockFindService).toHaveBeenCalled()
      })
    })
    describe('userExists', () => {
      it('should return true if one exists', async () => {
        const mockRepo = jest
          .spyOn(repository, 'exists')
          .mockResolvedValue(pedidoOriginal as any)

        const result = await service.userExists('')

        expect(mockRepo).toHaveBeenCalled()
        expect(result).toBeTruthy()
      })
    })
    describe('getPedidosByUser', () => {
      it('should return array if one exists', async () => {
        const mockRepo = jest
          .spyOn(repository, 'find')
          .mockResolvedValue([pedidoOriginal] as any)

        const result = await service.getPedidosByUser('')

        expect(mockRepo).toHaveBeenCalled()
        expect(result).toBeTruthy()
      })
    })
  })
})
