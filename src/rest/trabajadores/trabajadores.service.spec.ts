import { Test, TestingModule } from '@nestjs/testing'
import { TrabajadoresService } from './trabajadores.service'
import { PosicionesService } from '../posiciones/posiciones.service'
import { Repository } from 'typeorm'
import { Trabajador } from './entities/trabajadores.entity'
import { TrabajadorMapper } from './trabajadores-mapper/trabajador-mapper'
import { MacjavaNotificationsGateway } from '../../notifications/macjava-notifications.gateway'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import { Posicion } from '../posiciones/entities/posicion.entity'
import { CreateTrabajadorDto } from './dto/create-trabajador.dto'
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto'
import { PaginateQuery } from 'nestjs-paginate'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ResponseTrabajadorDto } from './dto/response-trabajador.dto'

describe('TrabajadoresService', () => {
  let trabService: TrabajadoresService
  let posService: PosicionesService
  let repository: Repository<Trabajador>
  let mapper: TrabajadorMapper
  let notificationGateway: MacjavaNotificationsGateway
  let cacheManager: Cache

  const mapperMock = {
    createToTrabajador: jest.fn(),
    updateToTrabajador: jest.fn(),
    trabajadorToResponse: jest.fn(),
  }

  const posServMock = {
    findByName: jest.fn(),
  }

  const notificationMock = {
    sendMessage: jest.fn(),
  }

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    del: jest.fn(),
    store: {
      keys: jest.fn(),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrabajadoresService,
        { provide: PosicionesService, useValue: posServMock },
        { provide: getRepositoryToken(Trabajador), useClass: Repository },
        { provide: TrabajadorMapper, useValue: mapperMock },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
        {
          provide: MacjavaNotificationsGateway,
          useValue: notificationMock,
        },
      ],
    }).compile()

    trabService = module.get<TrabajadoresService>(TrabajadoresService)
    posService = module.get<PosicionesService>(PosicionesService)
    repository = module.get<Repository<Trabajador>>(
      getRepositoryToken(Trabajador),
    )
    mapper = module.get<TrabajadorMapper>(TrabajadorMapper)
    notificationGateway = module.get<MacjavaNotificationsGateway>(
      MacjavaNotificationsGateway,
    )
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(trabService).toBeDefined()
  })
  describe('trabajadoresServiceFunc', () => {
    let originalPos: Posicion
    let original: Trabajador
    let createDto: CreateTrabajadorDto
    let updateDto: UpdateTrabajadorDto
    let responseDto: ResponseTrabajadorDto
    let mockQueryBuilder

    beforeAll(() => {
      originalPos = {
        ...new Posicion(),
        id: '00000000-0000-0000-0000-000000000001',
        nombre: 'MANAGER',
        salario: 10000,
        trabajadores: [],
      }
      original = {
        ...new Trabajador(),
        id: '00000000-0000-0000-0001-000000000001',
        dni: '53718369Y',
        nombre: 'T1',
        apellido: ' test',
        edad: 18,
        telefono: '629384747',
        posicion: originalPos,
      }
      createDto = {
        dni: '53718368N',
        nombre: 'T2',
        apellido: ' test',
        edad: 18,
        telefono: '629384747',
        posicionNombre: 'MANAGER',
      }
      responseDto = {
        ...original,
        posicion: original.posicion.nombre,
      }
      updateDto = new UpdateTrabajadorDto()
    })

    describe('invalidateCachesPosition', () => {
      it('should invalidate the cache of the passed key too', async () => {
        jest.spyOn(cacheManager, 'del').mockResolvedValue()

        await trabService.invalidateCachesTrabajadores('key')

        expect(cacheManager.del).toHaveBeenCalledTimes(3)
      })

      it('should invalidate the cache', async () => {
        jest.spyOn(cacheManager, 'del').mockResolvedValue()

        await trabService.invalidateCachesTrabajadores()

        expect(cacheManager.del).toHaveBeenCalled()
      })
    })

    describe('getByCache', () => {
      it('should return the Position from the cache', async () => {
        jest.spyOn(cacheManager, 'get').mockResolvedValue(original)

        const res = await trabService.getByCache('key')

        expect(res).toEqual(original)
      })

      it('should return an array of Position from the cache', async () => {
        jest.spyOn(cacheManager, 'get').mockResolvedValue([original])

        const res = await trabService.getByCache('key')

        expect(res).toEqual([original])
      })
      it('should return undefined when no hitted', async () => {
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)

        const res = await trabService.getByCache('key')

        expect(res).toBeUndefined()
      })
    })

    describe('onChange', () => {
      it('Should send a message', async () => {
        const sendMessageMock = jest.spyOn(notificationGateway, 'sendMessage')
        const createdTrabajador: Trabajador = {
          ...new Trabajador(),
          ...createDto,
          posicion: originalPos,
        }
        jest.spyOn(mapper, 'createToTrabajador').mockReturnValue(original)
        jest.spyOn(repository, 'save').mockResolvedValue(createdTrabajador)
        jest.spyOn(trabService, 'checkPosicion').mockResolvedValue(originalPos)
        jest.spyOn(trabService, 'checkByDni').mockReturnValue(null)

        const res = await trabService.create(createDto)

        expect(sendMessageMock).toHaveBeenCalledTimes(1)
        /*
        expect(sendMessageMock).toHaveBeenCalledWith({
          message: `El Trabajador con id ${createdTrabajador.id} ha sido ${NotificationTipo.CREATE.toLowerCase()}`,
          type: NotificationTipo.CREATE,
          data: createdTrabajador,
          createdAt: , //la fecha exacta, no la puedo sacar porq la coge del sistema
        })
         */
      })
    })

    describe('findAll', () => {
      it('Should return all Trabajadores', async () => {
        mockQueryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([original]),
        }

        jest
          .spyOn(repository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder)

        const res = await trabService.findAll()
        expect(res).toEqual([original])
      })
    })

    describe('findAllPaginated()', () => {
      let paginatedQuery: PaginateQuery
      const paginateOptions = {
        page: 1,
        limit: 20,
        path: 'trabajadores/paginated',
      }

      it('should return a page of Trabajador', async () => {
        paginatedQuery = {
          path: 'http://localhost:3000/trabajadores/paginate?page=1&limit=10&sortBy=nombre:ASC',
        }

        mockQueryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          addOrderBy: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([]),
        }
        jest
          .spyOn(repository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)

        jest
          .spyOn(mapperMock, 'trabajadorToResponse')
          .mockResolvedValue(responseDto)

        const res = await trabService.findAllPaginated(paginatedQuery)

        expect(res.meta.itemsPerPage).toEqual(paginateOptions.limit)
        expect(res.meta.currentPage).toEqual(paginateOptions.page)
      })
    })

    describe('findById', () => {
      it('should return a Position', async () => {
        jest.spyOn(repository, 'findOneBy').mockResolvedValue(original)

        mockQueryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(original),
        }
        jest
          .spyOn(repository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder)

        const res = await trabService.findById(original.id)

        expect(res).toEqual(original)
        expect(cacheManager.set).toHaveBeenCalled()
      })
      it('should throw an exception', async () => {
        mockQueryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        }

        jest
          .spyOn(repository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder)

        await expect(() => trabService.findById(original.id)).rejects.toThrow(
          NotFoundException,
        )
      })
    })

    describe('create', () => {
      it('Should create a Trabajador', async () => {
        const createdTrabajador: Trabajador = {
          ...new Trabajador(),
          ...createDto,
          posicion: originalPos,
        }
        jest.spyOn(mapper, 'createToTrabajador').mockReturnValue(original)
        const repositorySaveMock = jest
          .spyOn(repository, 'save')
          .mockResolvedValue(createdTrabajador)
        jest.spyOn(trabService, 'checkPosicion').mockResolvedValue(originalPos)
        jest.spyOn(trabService, 'checkByDni').mockReturnValue(null)

        const res = await trabService.create(createDto)
        expect(res).toEqual(createdTrabajador)
        expect(repositorySaveMock).toHaveBeenCalledTimes(1)
      })

      it('Should throw Type Error', async () => {
        jest.spyOn(mapper, 'createToTrabajador').mockReturnValue(null)
        await expect(() => trabService.create(createDto)).rejects.toThrow(
          TypeError,
        )
      })
    })
    describe('updateById', () => {
      it('Should not update when no params passed', async () => {
        const mapperMock = jest
          .spyOn(mapper, 'updateToTrabajador')
          .mockReturnValue(original)
        const repositorySaveMock = jest
          .spyOn(repository, 'save')
          .mockResolvedValue(original)

        jest.spyOn(trabService, 'checkByDni').mockReturnValue(null)
        jest.spyOn(trabService, 'findById').mockResolvedValue(original)

        const res = await trabService.updateById(
          '00000000-0000-0000-0001-000000000001',
          updateDto,
        )

        expect(res).toEqual(original)
        expect(mapperMock).toHaveBeenCalledTimes(1)
        expect(repositorySaveMock).toHaveBeenCalledTimes(1)
      })

      it('Should update a Trabajador', async () => {
        const pos2: Posicion = {
          ...new Posicion(),
          id: '00000000-0000-0000-0000-000000000002',
          nombre: 'OTROS',
          salario: 1500,
          trabajadores: [],
        }

        const updatedTrabajador: Trabajador = {
          ...original,
          ...updateDto,
          posicion: pos2,
        }

        jest
          .spyOn(mapper, 'updateToTrabajador')
          .mockReturnValue(updatedTrabajador)
        jest.spyOn(repository, 'save').mockResolvedValue(updatedTrabajador)
        jest.spyOn(trabService, 'checkPosicion').mockResolvedValue(pos2)
        jest.spyOn(trabService, 'checkByDni').mockResolvedValue(null)
        jest.spyOn(trabService, 'findById').mockResolvedValue(original)

        const res = await trabService.updateById(
          '00000000-0000-0000-0001-000000000001',
          updateDto,
        )

        expect(res).toEqual(updatedTrabajador)
      })
      it('Should throw Type Error', async () => {
        await expect(() =>
          trabService.updateById(
            '00000000-0000-0000-0001-000000000001',
            updateDto,
          ),
        ).rejects.toThrow(TypeError)
      })
    })
    describe('removeById', () => {
      it('Should remove a Trabajador', async () => {
        const trabajadorDelTest: Trabajador = new Trabajador()
        const repositoryFindOneByMock = jest
          .spyOn(trabService, 'findById')
          .mockResolvedValue(original)
        const repositoryDeleteMock = jest
          .spyOn(repository, 'remove')
          .mockResolvedValue(trabajadorDelTest)

        await trabService.removeById('00000000-0000-0000-0001-000000000001')

        expect(repositoryDeleteMock).toHaveBeenCalledTimes(1)
        expect(repositoryFindOneByMock).toHaveBeenCalledTimes(1)
      })
      it('Should throw not found exception', async () => {
        jest
          .spyOn(trabService, 'findById')
          .mockRejectedValue(new NotFoundException())
        await expect(() =>
          trabService.removeById('00000000-0000-0000-0001-000000000001'),
        ).rejects.toThrow(NotFoundException)
      })
    })
    describe('checkPosition', () => {
      it('Should return a valid Position', async () => {
        jest.spyOn(posService, 'findByName').mockResolvedValue(originalPos)

        const res = await trabService.checkPosicion(original.nombre)

        expect(res).toEqual(originalPos)
      })
      it('Should throw Bad Request exception', async () => {
        jest.spyOn(posService, 'findByName').mockResolvedValue(null)

        await expect(() =>
          trabService.checkPosicion('CatNotExist'),
        ).rejects.toThrow(BadRequestException)
      })
    })
    describe('softRemoveTrabajador', () => {
      it('Should soft remove a Trabajador', async () => {
        const updatedTrabajadorTest: Trabajador = { ...original, deleted: true }
        jest.spyOn(trabService, 'findById').mockResolvedValue(original)
        jest.spyOn(repository, 'save').mockResolvedValue(updatedTrabajadorTest)
        const category = await trabService.softRemoveById(original.id)

        expect(category.deleted).toBeTruthy()
      })

      it('Should throw not found exception', async () => {
        jest
          .spyOn(trabService, 'findById')
          .mockRejectedValue(new NotFoundException())

        await expect(() =>
          trabService.softRemoveById(original.id),
        ).rejects.toThrow(NotFoundException)
      })
    })
  })
})
