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

describe('ProductoService', () => {
  let service: ProductoService
  let repository: Repository<Producto>
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
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
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
          },
        },
      ],
    }).compile()

    service = module.get<ProductoService>(ProductoService)
    repository = module.get<Repository<Producto>>(getRepositoryToken(Producto))
    mapper = module.get<ProductosMapper>(ProductosMapper)
    storageService = module.get<StorageService>(StorageService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const query = {
        limit: 10,
        page: 1,
        path: 'test',
      }
      const producto = new Producto()
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        paginate: jest.fn().mockResolvedValue({
          data: [producto],
          meta: {},
          links: {},
        }),
      } as any)
      jest.spyOn(mapper, 'toResponseDto').mockReturnValue({
        id: 0,
        nombre: '',
        description: '',
        precio: 0,
        stock: 0,
        imagen: '',
        uuid: '',
        createdAt: undefined,
        updatedAt: undefined,
        isDeleted: false,
      })

      const result = await service.findAll(query)
      expect(result).toBeDefined()
      expect(result.data).toHaveLength(1)
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('producto')
      expect(mapper.toResponseDto).toHaveBeenCalledWith(producto)
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
      jest.spyOn(repository, 'findOne').mockResolvedValue(producto)
      jest.spyOn(mapper, 'toResponseDto').mockReturnValue({
        id: 0,
        nombre: '',
        description: '',
        precio: 0,
        stock: 0,
        imagen: '',
        uuid: '',
        createdAt: undefined,
        updatedAt: undefined,
        isDeleted: false,
      })

      expect(await service.findOne(id)).toBeDefined()
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } })
      expect(mapper.toResponseDto).toHaveBeenCalledWith(producto)
    })

    it('should throw NotFoundException if product is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null)

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a product', async () => {
      const createProductoDto = {
        nombre: 'Test',
        precio: 100,
        stock: 10,
      }
      const producto = new Producto()
      jest.spyOn(mapper, 'toEntity').mockReturnValue(producto)
      jest.spyOn(repository, 'save').mockResolvedValue(producto)
      jest.spyOn(mapper, 'toResponseDto').mockReturnValue({
        id: 0,
        nombre: '',
        description: '',
        precio: 0,
        stock: 0,
        imagen: '',
        uuid: '',
        createdAt: undefined,
        updatedAt: undefined,
        isDeleted: false,
      })

      expect(await service.create(createProductoDto)).toBeDefined()
      expect(mapper.toEntity).toHaveBeenCalledWith(createProductoDto)
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
      jest.spyOn(repository, 'findOne').mockResolvedValue(producto)
      jest.spyOn(repository, 'save').mockResolvedValue(producto)
      jest.spyOn(mapper, 'toResponseDto').mockReturnValue({
        id: 0,
        nombre: '',
        description: '',
        precio: 0,
        stock: 0,
        imagen: '',
        uuid: '',
        createdAt: undefined,
        updatedAt: undefined,
        isDeleted: false,
      })

      expect(await service.update(id, updateProductoDto)).toBeDefined()
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } })
      expect(repository.save).toHaveBeenCalledWith(producto)
      expect(mapper.toResponseDto).toHaveBeenCalledWith(producto)
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
    it('should update the image of a product', async () => {
      const id = 1
      const imageFile = {} as Express.Multer.File
      const producto = new Producto()
      jest.spyOn(repository, 'findOne').mockResolvedValue(producto)
      jest
        .spyOn(storageService, 'getFileNameWithouUrl')
        .mockReturnValue('image.jpg')
      jest.spyOn(repository, 'save').mockResolvedValue(producto)
      jest.spyOn(mapper, 'toResponseDto').mockReturnValue({
        id: 0,
        nombre: '',
        description: '',
        precio: 0,
        stock: 0,
        imagen: '',
        uuid: '',
        createdAt: undefined,
        updatedAt: undefined,
        isDeleted: false,
      })

      expect(
        await service.updateImage(id, imageFile, mockRequest as any, true),
      ).toBeDefined()
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } })
      expect(storageService.getFileNameWithouUrl).toHaveBeenCalledWith(
        imageFile,
      )
      expect(repository.save).toHaveBeenCalledWith(producto)
      expect(mapper.toResponseDto).toHaveBeenCalledWith(producto)
    })

    it('should throw NotFoundException if product is not found', async () => {
      const id = 1
      const imageFile = {} as Express.Multer.File
      jest.spyOn(repository, 'findOne').mockResolvedValue(null)

      await expect(
        service.updateImage(id, imageFile, mockRequest as any, true),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw BadRequestException if no image is provided', async () => {
      const id = 1
      await expect(
        service.updateImage(id, null, mockRequest as any, true),
      ).rejects.toThrow(BadRequestException)
    })
  })
})
