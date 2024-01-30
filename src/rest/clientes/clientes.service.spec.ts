import { Test, TestingModule } from '@nestjs/testing'
import { ClientesService } from './clientes.service'
import { Cliente } from './entities/cliente.entity'
import { Repository } from 'typeorm'
import { ClienteMapper } from './mapper/cliente.mapper'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Paginated } from 'nestjs-paginate'
import { hash } from 'typeorm/util/StringUtils'
import { ResponseCliente } from './dto/response-cliente.dto'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CreateClienteDto } from './dto/create-cliente.dto'
import { UpdateClienteDto } from './dto/update-cliente.dto'
import { StorageService } from '../storage/storage.service'

describe('ClientesService', () => {
  let service: ClientesService
  let repo: Repository<Cliente>
  let mapper: ClienteMapper
  let storageService: StorageService
  let cacheManager: Cache

  const clienteMapperMock = {
    toCliente: jest.fn(),
    toResponse: jest.fn(),
  }

  const storageServiceMock = {
    removeFile: jest.fn(),
    getFileNameWithouUrl: jest.fn(),
  }

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientesService,
        { provide: ClienteMapper, useValue: clienteMapperMock },
        {
          provide: getRepositoryToken(Cliente),
          useClass: Repository,
        },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    }).compile()

    service = module.get<ClientesService>(ClientesService)
    repo = module.get<Repository<Cliente>>(getRepositoryToken(Cliente))
    mapper = module.get<ClienteMapper>(ClienteMapper)
    storageService = module.get<StorageService>(StorageService)
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('Devuelve FindAll repository', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'clientes',
      }

      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([]),
      }

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)

      jest.spyOn(mapper, 'toResponse').mockReturnValue(new ResponseCliente())

      const result: any = await service.findAll(paginateOptions)

      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
      expect(result.meta.currentPage).toEqual(paginateOptions.page)
      expect(result.links.current).toEqual(
        `clientes?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=id:ASC`,
      )
      expect(cacheManager.get).toHaveBeenCalled()
      expect(cacheManager.set).toHaveBeenCalled()
    })

    it('FindAll del cache', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'clientes',
      }

      const testClientes = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'clientes?page=1&limit=10&sortBy=nombre:ASC',
        },
      } as Paginated<Cliente>

      jest.spyOn(cacheManager, 'get').mockResolvedValue(testClientes)

      const result = await service.findAll(paginateOptions)

      expect(cacheManager.get).toHaveBeenCalledWith(
        `all_clientes_page_${hash(JSON.stringify(paginateOptions))}`,
      )
      expect(result).toEqual(testClientes)
    })
  })

  describe('findOne', () => {
    it('Un Cliente del repositorio', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174002'
      const testCliente: Cliente = {
        id: id,
        dni: '62840516G',
        nombre: 'Manolo',
        apellido: 'Hernandez',
        edad: 23,
        telefono: '549573654',
        imagen: 'https://via.placeholder.com/150',
        deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      }
      const testClienteResponse = new ResponseCliente()

      jest.spyOn(mapper, 'toResponse').mockReturnValue(testClienteResponse)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(testCliente)
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      expect(await service.findOne(id)).toEqual(testClienteResponse)
    })

    it('Una cliente del cache', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174002'
      const cachedCliente: ResponseCliente = {
        id: id,
        dni: '62840516G',
        nombre: 'Manolo',
        apellido: 'Hernandez',
        edad: 23,
        telefono: '549573654',
        imagen: 'https://via.placeholder.com/150',
        deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      }

      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedCliente)

      const result = await service.findOne(id)

      expect(result).toEqual(cachedCliente)
    })
    it('Cliente NotFound', async () => {
      // Arrange
      const id = '123e4567-e89b-12d3-a456-426614174002'
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null)
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(null)

      // Act y Assert
      await expect(service.findOne(id)).rejects.toThrowError(NotFoundException)
      expect(cacheManager.get).toHaveBeenCalledWith(`cliente_${id}`)
      expect(repo.findOneBy).toHaveBeenCalledWith({ id })
    })
  })

  describe('create', () => {
    it('Devuelve cliente creado', async () => {
      const testCliente = new Cliente()
      const dto = new CreateClienteDto()
      const testClienteResponse = new ResponseCliente()

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(mapper, 'toCliente').mockReturnValue(testCliente)
      jest.spyOn(mapper, 'toResponse').mockReturnValue(testClienteResponse)
      jest.spyOn(repo, 'save').mockResolvedValue(testCliente)
      jest.spyOn(service, 'exists').mockResolvedValue(null)
      const toClienteNewMock = jest
        .spyOn(mapper, 'toCliente')
        .mockReturnValue(testCliente)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      expect(await service.create(dto)).toEqual(testClienteResponse)
      expect(toClienteNewMock).toHaveBeenCalledWith(dto)
    })
    it('Devuelve BadRequestException', async () => {
      const testCliente = new Cliente()
      const dto = new CreateClienteDto()

      jest.spyOn(repo, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(testCliente),
      } as any)

      jest.spyOn(mapper, 'toCliente').mockReturnValue(testCliente)
      jest.spyOn(repo, 'save').mockResolvedValue(testCliente)
      jest.spyOn(service, 'exists').mockResolvedValue(testCliente)
      const toCategoriaNewMock = jest
        .spyOn(mapper, 'toCliente')
        .mockReturnValue(testCliente)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      await expect(service.create(dto)).rejects.toThrow(BadRequestException)
      expect(toCategoriaNewMock).toHaveBeenCalledWith(dto)
    })
  })

  describe('update', () => {
    it('Devuelve cliente actualizado', async () => {
      const testCliente = new Cliente()
      const testClienteResponse = new ResponseCliente()

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(testCliente),
      }

      const mockUpdateClienteDto = new UpdateClienteDto()

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(service, 'exists').mockResolvedValue(null)
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(testCliente)
      jest.spyOn(mapper, 'toCliente').mockReturnValue(testCliente)
      jest.spyOn(mapper, 'toResponse').mockReturnValue(testClienteResponse)
      jest.spyOn(repo, 'save').mockResolvedValue(testCliente)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      const result = await service.update(
        '123e4567-e89b-12d3-a456-426614174002',
        mockUpdateClienteDto,
      )

      expect(result).toEqual(testClienteResponse)
    })
    it('Devuelve NotFound', async () => {
      const testCliente = new Cliente()
      const testClienteResponse = new ResponseCliente()
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(new Cliente()),
      }

      const mockUpdateClienteDto = new UpdateClienteDto()

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(service, 'exists').mockResolvedValue(null)
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(null)
      jest.spyOn(repo, 'save').mockResolvedValue(testCliente)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])
      jest.spyOn(mapper, 'toCliente').mockReturnValue(testCliente)
      jest.spyOn(mapper, 'toResponse').mockReturnValue(testClienteResponse)

      await expect(
        service.update(
          '123e4567-e89b-12d3-a456-426614174002',
          mockUpdateClienteDto,
        ),
      ).rejects.toThrowError(NotFoundException)
    })
  })
  describe('removeSoft', () => {
    it('delete', async () => {
      const testCliente = new Cliente()
      const testClienteResponse = new ResponseCliente()
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(testCliente)
      jest.spyOn(repo, 'save').mockResolvedValue(testCliente)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])
      jest.spyOn(mapper, 'toResponse').mockReturnValue(testClienteResponse)

      expect(
        await service.removeSoft('123e4567-e89b-12d3-a456-426614174002'),
      ).toEqual(testClienteResponse)
    })
    it('NotFound', async () => {
      const testCliente = new Cliente()
      const testClienteResponse = new ResponseCliente()
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(null)
      jest.spyOn(repo, 'save').mockResolvedValue(testCliente)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])
      jest.spyOn(mapper, 'toResponse').mockReturnValue(testClienteResponse)

      await expect(
        service.removeSoft('123e4567-e89b-12d3-a456-426614174002'),
      ).rejects.toThrowError(NotFoundException)
    })
  })
  describe('updateImage', () => {
    it('Update image Funko', async () => {
      const mockRequest = {
        protocol: 'http',
        get: () => 'localhost',
      }
      const mockFile = {
        filename: 'new_image',
      }

      const mockClienteEntity = new Cliente()
      const mockResponseClienteDto = new ResponseCliente()

      jest.spyOn(service, 'existsID').mockResolvedValue(mockClienteEntity)

      jest.spyOn(repo, 'save').mockResolvedValue(mockClienteEntity)

      jest.spyOn(mapper, 'toResponse').mockReturnValue(mockResponseClienteDto)

      expect(
        await service.updateImage(
          '123e4567-e89b-12d3-a456-426614174002',
          mockFile as any,
          mockRequest as any,
          true,
        ),
      ).toEqual(mockResponseClienteDto)

      expect(storageService.removeFile).toHaveBeenCalled()
      expect(storageService.getFileNameWithouUrl).toHaveBeenCalled()
    })
  })
})
