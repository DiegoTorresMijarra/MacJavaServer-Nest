import { Test, TestingModule } from '@nestjs/testing'
import { PosicionesService } from './posiciones.service'
import { Repository } from 'typeorm'
import { Posicion } from './entities/posicion.entity'
import { PosicionMapper } from './posiciones-mapper/posicion-mapper'
import { getRepositoryToken } from '@nestjs/typeorm'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { CreatePosicionDto } from './dto/create-posicion.dto'
import { UpdatePosicionDto } from './dto/update-posicion.dto'
import { Paginated, PaginateQuery } from 'nestjs-paginate'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Trabajador } from '../trabajadores/entities/trabajadores.entity'
import { MacjavaNotificationsGateway } from '../../notifications/macjava-notifications.gateway'
describe('PosicionesService', () => {
  let service: PosicionesService
  let repository: Repository<Posicion>
  let mapper: PosicionMapper
  let cacheManager: Cache
  let notificationGateway: MacjavaNotificationsGateway

  //mock mapper
  const mapperMock = {
    createToPosicion: jest.fn(),
    updateToPosicion: jest.fn(),
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
    //instanciamos un modulo de test, en el que injectamos las dependencias que trabajan en nuestro modulo de pposiciones
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PosicionesService,
        {
          provide: PosicionMapper,
          useValue: mapperMock,
        },
        {
          provide: getRepositoryToken(Posicion),
          useClass: Repository,
        },
        {
          provide: MacjavaNotificationsGateway,
          useValue: notificationMock,
        },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    }).compile()
    //asignamos las depedncias del modulo a nuestras variables para trabajar con ellas
    service = module.get<PosicionesService>(PosicionesService)
    repository = module.get<Repository<Posicion>>(getRepositoryToken(Posicion))
    mapper = module.get<PosicionMapper>(PosicionMapper)
    cacheManager = module.get<Cache>(CACHE_MANAGER)
    notificationGateway = module.get<MacjavaNotificationsGateway>(
      MacjavaNotificationsGateway,
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('PosicionesServiceFunc', () => {
    let createDto: CreatePosicionDto
    let updateDto: UpdatePosicionDto
    let original: Posicion
    let mockQueryBuilder

    beforeEach(async () => {
      createDto = new CreatePosicionDto()
      createDto.nombre = 'OTROS'
      updateDto = new UpdatePosicionDto()
      original = {
        ...new Posicion(),
        id: '00000000-0000-0000-0000-000000000001',
        nombre: 'MANAGER',
        salario: 10000,
        trabajadores: [],
      }
    })

    describe('invalidateCachesPosicion', () => {
      it('should invalidate the cache of the passed key too', async () => {
        jest.spyOn(cacheManager, 'del').mockResolvedValue()

        await service.invalidateCachesPosiciones('key')

        expect(cacheManager.del).toHaveBeenCalledTimes(3) //una para cada key eliminada
      })
      it('should invalidate the cache', async () => {
        jest.spyOn(cacheManager, 'del').mockResolvedValue()

        await service.invalidateCachesPosiciones()

        expect(cacheManager.del).toHaveBeenCalled()
      })
    })

    describe('getByCache', () => {
      it('should return the Posicion from the cache', async () => {
        jest.spyOn(cacheManager, 'get').mockResolvedValue(original)

        const res = await service.getByCache('key')

        expect(res).toEqual(original)
      })

      it('should return an array of Posiciones from the cache', async () => {
        jest.spyOn(cacheManager, 'get').mockResolvedValue([original])

        const res = await service.getByCache('key')

        expect(res).toEqual([original])
      })
      it('should return undefined when no hitted', async () => {
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)

        const res = await service.getByCache('key')

        expect(res).toBeUndefined()
      })
    })
    describe('onChange', () => {
      it('Should send a message', async () => {
        const sendMessageMock = jest.spyOn(notificationGateway, 'sendMessage')
        jest.spyOn(mapper, 'createToPosicion').mockReturnValue(original)
        jest.spyOn(repository, 'save').mockResolvedValue(original)

        jest.spyOn(service, 'existByName').mockResolvedValue(null)
        const posicion = await service.create(createDto)

        expect(sendMessageMock).toHaveBeenCalledTimes(1)
        /*
        expect(sendMessageMock).toHaveBeenCalledWith({
          message: `El Trabajador con id ${original.id} ha sido ${NotificationTipo.CREATE.toLowerCase()}`,
          type: NotificationTipo.CREATE,
          data: original,
          createdAt: , //la fecha exacta, no la puedo sacar porq la coge del sistema
        })
         */
      })
    })

    describe('findAll', () => {
      it('should return an array of Posiciones', async () => {
        const resTest: Posicion[] = [original]
        jest.spyOn(repository, 'find').mockResolvedValue(resTest)

        const posiciones = await service.findAll()

        expect(posiciones).toHaveLength(1)
      })
    })

    describe('findAllPaginated', () => {
      let paginatedQuery: PaginateQuery
      it('should return paginated Posiciones by cache when default one is passed', async () => {
        paginatedQuery = PosicionesService.PAGED_DEFAULT_QUERY
        const resTest: Paginated<Posicion> = {
          ...new Paginated(),
          data: [original],
        }

        jest.spyOn(service, 'getByCache').mockResolvedValue(resTest)

        const res = await service.findAllPaginated(paginatedQuery)
        expect(res).toEqual(resTest)
      })
      it('should return paginated Posiciones when default one is passed but its not in cache', async () => {
        const paginatedQuery = PosicionesService.PAGED_DEFAULT_QUERY
        const dataTest = [original]
        jest.spyOn(service, 'getByCache').mockResolvedValue(undefined)

        const resTest = {
          data: dataTest,
          links: {
            current: '/posiciones/paginated?page=1&limit=20&sortBy=id:DESC',
            next: '/posiciones/paginated?page=2&limit=20&sortBy=id:DESC',
            first: undefined,
            last: undefined,
            previous: undefined,
          },
        } as Paginated<Posicion>

        mockQueryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          addOrderBy: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockReturnValue(dataTest),
        }

        const mockCreateBuilder = jest
          .spyOn(repository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder)

        const res = await service.findAllPaginated(paginatedQuery)

        expect(mockCreateBuilder).toHaveBeenCalled()
        expect(res.data).toBeDefined()
        expect(res.links).toEqual(resTest.links)
      })
    })

    describe('findById', () => {
      it('should return a Posicion', async () => {
        mockQueryBuilder = {
          leftJoinAndMapMany: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(original),
        }

        jest
          .spyOn(repository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder)

        const posicion = await service.findById(original.id)

        expect(posicion).toEqual(original)
        expect(cacheManager.set).toHaveBeenCalled()
      })

      it('should throw an exception', async () => {
        mockQueryBuilder = {
          leftJoinAndMapMany: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        }
        jest
          .spyOn(repository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder)

        await expect(() => service.findById(original.id)).rejects.toThrow(
          NotFoundException,
        )
      })
    })

    describe('createPosicion', () => {
      it('should create a new Posicion', async () => {
        const createdPos: Posicion = {
          ...new Posicion(),
          id: '00000000-0000-0000-0000-000000000002',
          nombre: 'COCINERO',
          salario: 1500,
          trabajadores: [],
        }
        jest.spyOn(mapper, 'createToPosicion').mockReturnValue(createdPos)
        jest.spyOn(repository, 'save').mockResolvedValue(createdPos)
        jest.spyOn(service, 'existByName').mockResolvedValue(null)
        const posicion = await service.create(createDto)

        expect(posicion).toEqual(createdPos)
      })
      it('Should throw bad request exception', async () => {
        const badCreateDto: CreatePosicionDto = { nombre: 'aa', salario: -1 }
        jest.spyOn(service, 'existByName').mockResolvedValue(original)

        await expect(service.create(badCreateDto)).rejects.toThrow(
          BadRequestException,
        )
      })
    })

    describe('updatePosicion', () => {
      it('Should not update when no params passed', async () => {
        jest.spyOn(mapper, 'updateToPosicion').mockReturnValue(original)
        jest.spyOn(repository, 'save').mockResolvedValue(original)
        jest.spyOn(service, 'existByName').mockResolvedValue(null)
        jest.spyOn(service, 'findById').mockResolvedValue(original)

        const posicion = await service.updateById(original.id, updateDto)

        expect(posicion).toEqual(original)
      })

      it('Should update a Posicion', async () => {
        const posicion: Posicion = { ...original, nombre: 'CAMBIADO' }

        jest.spyOn(mapper, 'updateToPosicion').mockReturnValue(posicion)
        jest.spyOn(repository, 'save').mockResolvedValue(posicion)
        jest.spyOn(service, 'existByName').mockResolvedValue(null)
        jest.spyOn(service, 'findById').mockResolvedValue(original)

        const res = await service.updateById(original.id, updateDto)

        expect(res).toEqual(posicion)
      })

      it('Should throw not found exception', async () => {
        jest.spyOn(service, 'existByName').mockResolvedValue(null)
        jest
          .spyOn(service, 'findById')
          .mockRejectedValue(new NotFoundException())

        await expect(() =>
          service.updateById(original.id, updateDto),
        ).rejects.toThrow(NotFoundException)
      })

      it('Should throw type error when error name is passed', async () => {
        const badUpdateDto: UpdatePosicionDto = { nombre: 'aa' }

        await expect(() =>
          service.updateById(original.id, badUpdateDto),
        ).rejects.toThrow(TypeError)
      })
    })

    describe('softRemovePosicion', () => {
      it('Should soft remove a Posicion', async () => {
        const updatedPosicionTest: Posicion = { ...original, deleted: true }
        jest.spyOn(service, 'findById').mockResolvedValue(original)
        jest.spyOn(repository, 'save').mockResolvedValue(updatedPosicionTest)
        const posicion = await service.softRemoveById(original.id)

        expect(posicion.deleted).toBeTruthy()
      })

      it('Should throw not found exception', async () => {
        jest
          .spyOn(service, 'findById')
          .mockRejectedValue(new NotFoundException())

        await expect(() => service.softRemoveById(original.id)).rejects.toThrow(
          NotFoundException,
        )
      })
    })

    describe('removePosicion', () => {
      it('Should delete a Posicion', async () => {
        const posicion: Posicion = new Posicion()
        jest.spyOn(service, 'findById').mockResolvedValue(original)
        const delFunc = jest
          .spyOn(repository, 'remove')
          .mockResolvedValue(posicion)

        await service.removeById(original.id)

        expect(delFunc).toHaveBeenCalledTimes(1)
      })

      it('Should throw not found exception', async () => {
        jest
          .spyOn(service, 'findById')
          .mockRejectedValue(new NotFoundException())

        await expect(() => service.removeById(original.id)).rejects.toThrow(
          NotFoundException,
        )
      })
      it('Should throw bad request exception', async () => {
        const posWithTrab: Posicion = {
          ...original,
          trabajadores: [new Trabajador()],
        }

        jest.spyOn(service, 'findById').mockResolvedValue(posWithTrab)

        await expect(service.removeById(original.id)).rejects.toThrow(
          BadRequestException,
        )
      })
    })

    describe('findByName', () => {
      it('should return null if no name is provided', async () => {
        const res = await service.findByName(undefined)

        expect(res).toBeNull()
      })
      it('Should return a Posicion', async () => {
        jest.spyOn(repository, 'findOneBy').mockResolvedValue(original)
        const posicion = await service.findByName(original.nombre)
        expect(posicion.nombre).toEqual(original.nombre)
      })

      it('Should return null', async () => {
        jest.spyOn(repository, 'findOneBy').mockResolvedValue(null)
        const res = service.findByName(original.nombre)

        await expect(res).resolves.toBeNull()
      })
      it('Should not be key Sensitive', async () => {
        const mockFindOneBy = jest
          .spyOn(repository, 'findOneBy')
          .mockResolvedValue(original)

        const posicion = await service.findByName(original.nombre.toLowerCase())

        expect(posicion).toEqual(original)
        expect(mockFindOneBy).toHaveBeenCalledWith({
          nombre: original.nombre.toUpperCase().trim(),
        }) //comprobamos que se haya llamado al metodo findOneBy con mayusculas
      })
      it('Should return false when Posicion deleted is true', async () => {
        const falsyPosicionTest: Posicion = { ...original, deleted: false }
        jest.spyOn(repository, 'findOneBy').mockResolvedValue(falsyPosicionTest)

        const posicion = await service.findByName(original.nombre)

        expect(posicion).toBeTruthy()
      })
    })

    describe('existByName', () => {
      it('should return null if null is passed', async () => {
        const res = await service.existByName(undefined)

        expect(res).toBeNull()
      })
      it('Should return a Posicion', async () => {
        jest.spyOn(repository, 'findOneBy').mockResolvedValue(original)
        const posicion = await service.existByName(original.nombre)

        expect(posicion).toEqual(original)
      })

      it('Should return false when no Posicion exists with that name', async () => {
        jest.spyOn(repository, 'findOneBy').mockResolvedValue(null)

        const posicion = await service.existByName(original.nombre)

        expect(posicion).toBeFalsy()
      })
    })
  })
})
