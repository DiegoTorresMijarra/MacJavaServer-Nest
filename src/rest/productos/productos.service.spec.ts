import { Test, TestingModule } from '@nestjs/testing'
import { ProductoService } from './productos.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Producto } from './entities/producto.entity'
import { Repository } from 'typeorm'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { ProductosMapper } from './mappers/producto-mapper'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { StorageService } from '../storage/storage.service'
import { MacjavaNotificationsGateway } from '../../notifications/macjava-notifications.gateway'
import { Proveedor } from '../proveedores/entities/proveedores.entity'
import { ResponseProductoDto } from './dto/response-producto.dto'

describe('ProductoService', () => {
  let service: ProductoService
  let repository: Repository<Producto>
  let repositoryProveedor: Repository<Proveedor>
  let mapper: ProductosMapper
  let storageService: StorageService

  const notificationMock = {
    sendMessage: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoService,
        {
          provide: getRepositoryToken(Producto),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Proveedor),
          useClass: Repository,
        },
        {
          provide: ProductosMapper,
          useValue: {
            toEntity: jest.fn(),
            toResponseDto: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: MacjavaNotificationsGateway,
          useValue: notificationMock,
        },
        {
          provide: StorageService,
          useValue: {
            uploadImage: jest.fn(),
            getFileNameWithouUrl: jest.fn(),
            removeFile: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<ProductoService>(ProductoService)
    repository = module.get<Repository<Producto>>(getRepositoryToken(Producto))
    repositoryProveedor = module.get<Repository<Proveedor>>(
      getRepositoryToken(Proveedor),
    )
    mapper = module.get<ProductosMapper>(ProductosMapper)
    storageService = module.get<StorageService>(StorageService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('ProductoServiceFunc', () => {
    let mockQueryBuilder
    describe('findAll', () => {
      it('should return paginated products', async () => {
        const query = {
          limit: 10,
          page: 1,
          path: 'test',
        }
        const producto = new Producto()

        mockQueryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          map: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          addOrderBy: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([]),
        }

        jest
          .spyOn(repository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)

        jest.spyOn(mapper, 'toResponseDto').mockReturnValue({
          ...producto,
          id: 0,
          proveedor: '',
        })

        const result = await service.findAll(query)
        expect(result).toBeDefined()
        expect(result.data).toHaveLength(0)
        expect(repository.createQueryBuilder).toHaveBeenCalledWith('producto')
      })

      it('should throw an error if path is not provided', async () => {
        const query = {
          limit: 10,
          page: 1,
        }
        await expect(service.findAll(query as any)).rejects.toThrow(Error)
      })
    })

    describe('findOne', () => {
      it('should return a product if found', async () => {
        const id = 1
        const producto = new Producto()

        mockQueryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(producto),
        }

        jest
          .spyOn(repository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)

        jest.spyOn(mapper, 'toResponseDto').mockReturnValue({
          ...new Producto(),
          id: 0,
          nombre: '',
          description: '',
          precio: 0,
          stock: 0,
          imagen: '',
          uuid: '',
          proveedor: '',
        })

        const res = await service.findOne(id)

        expect(res).toBeDefined()
        expect(repository.createQueryBuilder).toHaveBeenCalled()
        expect(mapper.toResponseDto).toHaveBeenCalledWith(producto)
      })

      it('should throw NotFoundException if product is not found', async () => {
        mockQueryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        }

        jest
          .spyOn(repository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)

        await expect(service.findOne(1)).rejects.toThrow(NotFoundException)
      })
    })

    describe('create', () => {
      it('should create a product', async () => {
        const createProductoDto = {
          nombre: 'Test',
          precio: 100,
          stock: 10,
          proveedor: '',
        }
        const producto = new Producto()

        jest.spyOn(service, 'checkProveedor').mockResolvedValue(new Proveedor())
        jest.spyOn(mapper, 'toEntity').mockReturnValue(producto)
        jest.spyOn(repository, 'save').mockResolvedValue(producto)
        jest.spyOn(mapper, 'toResponseDto').mockReturnValue({
          ...new Producto(),
          id: 0,
          proveedor: '',
        })

        const res = await service.create(createProductoDto)
        expect(res).toBeDefined()
        expect(repository.save).toHaveBeenCalledWith(producto)
        expect(mapper.toResponseDto).toHaveBeenCalledWith(producto)
      })
    })

    describe('update', () => {
      it('should update a product', async () => {
        const id = 1
        const updateProductoDto = {
          nombre: 'Test',
          precio: 100,
          stock: 10,
        }
        const producto = new Producto()

        jest.spyOn(service, 'checkProveedor').mockResolvedValue(new Proveedor())
        jest.spyOn(repository, 'findOne').mockResolvedValue(producto)
        jest.spyOn(repository, 'save').mockResolvedValue(producto)
        jest.spyOn(mapper, 'toResponseDto').mockReturnValue({
          ...new Producto(),
          id: 0,
          proveedor: '',
        } as ResponseProductoDto)

        const res = await service.update(id, updateProductoDto)
        expect(res).toBeDefined()
        expect(res.id).toEqual(0)
      })

      it('should throw NotFoundException if product is not found', async () => {
        const id = 1
        const updateProductoDto = {
          nombre: 'Test',
          precio: 100,
          stock: 10,
        }
        jest.spyOn(repository, 'findOne').mockResolvedValue(null)

        await expect(service.update(id, updateProductoDto)).rejects.toThrow(
          NotFoundException,
        )
      })
    })

    describe('remove', () => {
      it('should remove a product', async () => {
        const id = 1
        const producto = new Producto()
        jest.spyOn(repository, 'findOne').mockResolvedValue(producto)
        jest.spyOn(repository, 'remove').mockResolvedValue(producto)

        await service.remove(id)
        expect(repository.findOne).toHaveBeenCalledWith({ where: { id } })
        expect(repository.remove).toHaveBeenCalledWith(producto)
      })

      it('should throw NotFoundException if product is not found', async () => {
        const id = 1
        jest.spyOn(repository, 'findOne').mockResolvedValue(null)

        await expect(service.remove(id)).rejects.toThrow(NotFoundException)
      })
    })

    describe('updateImage', () => {
      const mockRequest = {
        protocol: 'http',
        get: () => 'localhost',
      }
      it('should update image of Producto', async () => {
        const mockFile = {
          filename: 'new_image',
        }

        const mockProductoEntity = new Producto()
        const mockResponseProductoDto = new ResponseProductoDto()

        jest.spyOn(repository, 'findOne').mockResolvedValue(mockProductoEntity)
        jest.spyOn(repository, 'save').mockResolvedValue(mockProductoEntity)
        jest
          .spyOn(mapper, 'toResponseDto')
          .mockReturnValue(mockResponseProductoDto)
        jest
          .spyOn(storageService, 'getFileNameWithouUrl')
          .mockReturnValue(mockFile.filename)

        expect(
          await service.updateImage(
            1, // Id del producto
            mockFile as any,
            mockRequest as any,
            true,
          ),
        ).toEqual(mockResponseProductoDto)
        expect(storageService.getFileNameWithouUrl).toHaveBeenCalled()
        expect(repository.save).toHaveBeenCalledWith(mockProductoEntity)
        expect(mapper.toResponseDto).toHaveBeenCalledWith(mockProductoEntity)
      })

      it('should throw NotFoundException if product is not found', async () => {
        const id = 1
        const imageFile = {} as Express.Multer.File
        jest.spyOn(repository, 'findOne').mockResolvedValue(null)

        await expect(
          service.updateImage(id, imageFile, mockRequest as any, true),
        ).rejects.toThrow(NotFoundException)
      })
    })
    describe('patchStock', () => {
      it('should update stock of Producto by adding', async () => {
        const id = 1
        const monto = 5
        const sumar = true

        const mockOriginalProducto = {
          id: id,
          stock: 10,
        }

        const newStock = mockOriginalProducto.stock + monto

        jest.spyOn(service, 'findOne').mockResolvedValue({
          ...mockOriginalProducto,
          proveedor: '',
        } as ResponseProductoDto)

        jest.spyOn(repository, 'update').mockResolvedValue({} as any)

        await service.patchStock(id, monto, sumar)

        expect(service.findOne).toHaveBeenCalledWith(id)
        expect(repository.update).toHaveBeenCalledWith(
          { id: id },
          { stock: newStock },
        )
      })

      it('should update stock of Producto by subtracting', async () => {
        const id = 1
        const monto = 5
        const sumar = false

        const mockOriginalProducto = {
          id: id,
          stock: 10,
        }

        const newStock = mockOriginalProducto.stock - monto

        jest.spyOn(service, 'findOne').mockResolvedValue({
          ...mockOriginalProducto,
          proveedor: '',
        } as ResponseProductoDto)
        jest.spyOn(repository, 'update').mockResolvedValue({} as any)

        await service.patchStock(id, monto, sumar)

        expect(service.findOne).toHaveBeenCalledWith(id)
        expect(repository.update).toHaveBeenCalledWith(
          { id: id },
          { stock: newStock },
        )
      })
    })
  })
})
