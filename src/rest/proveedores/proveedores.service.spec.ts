import { Test, TestingModule } from '@nestjs/testing'
import { ProveedoresService } from './proveedores.service'
import {Repository} from "typeorm";
import {Proveedor} from "./entities/proveedores.entity";
import {ProveedoresMapper} from "./mappers/proveedores.mapper";
import {Cache} from "cache-manager"
import {getRepositoryToken} from "@nestjs/typeorm";
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import {NotFoundException} from "@nestjs/common";
import {CreateProveedoresDto} from "./dto/create-proveedores.dto";
import {UpdateProveedoresDto} from "./dto/update-proveedores.dto";
import {hash} from "typeorm/util/StringUtils";
import {MacjavaNotificationsGateway} from "../../notifications/macjava-notifications.gateway";
import {NotificationsModule} from "../../notifications/notifications.module";
import {paginate} from "nestjs-paginate";

describe('ProveedoresService', () => {
  let service: ProveedoresService
  let repository: Repository<Proveedor>
  let mapper: ProveedoresMapper
  let cache: Cache
  let proveedpresGateaway: MacjavaNotificationsGateway

  //Mocks
  const proveedoresMapperMock = {
    toEntity: jest.fn(),
  }

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(),
    },
  }

  const proveedoresGateawayMock = {
    sendMessage: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [NotificationsModule],
      providers: [
          ProveedoresService,
        { provide: ProveedoresMapper, useValue: proveedoresMapperMock },
        {
          provide: getRepositoryToken(Proveedor),
          useClass: Repository,
        },
        {
          provide: MacjavaNotificationsGateway,
          useValue: proveedoresGateawayMock,
        },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },],
    }).compile()

    service = module.get<ProveedoresService>(ProveedoresService)
    repository = module.get<Repository<Proveedor>>(
        getRepositoryToken(Proveedor),
    )
    mapper = module.get<ProveedoresMapper>(ProveedoresMapper)
    proveedpresGateaway = module.get<MacjavaNotificationsGateway>(
        MacjavaNotificationsGateway,
    )
    cache = module.get<Cache>(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findOne', () => {
    it('Deberia devolver un proveedor', async () => {
      const testProveedor = new Proveedor()
      jest.spyOn(cache, 'get').mockResolvedValue(Promise.resolve(null))

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(testProveedor)

      jest.spyOn(cache, 'set').mockResolvedValue()

      expect(await service.findOne(1)).toEqual(testProveedor)
    })

    it('Lanza excepcion si no existe el proveedor', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null)
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException)
    })
  })

  describe('add', () => {
    it('Deberia crear un proveedor', async () => {
      const testProveedor = new Proveedor()
      testProveedor.nombre = 'test'
      testProveedor.tipo = 'Test'
      testProveedor.telefono = '651235576'

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(testProveedor),
      }

      jest.spyOn(repository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(repository, 'findOne').mockResolvedValue(null)
      jest.spyOn(mapper, 'toEntity').mockReturnValue(testProveedor)
      jest.spyOn(repository, 'save').mockResolvedValue(testProveedor)

      jest.spyOn(cache.store, 'keys').mockResolvedValue([])

      expect(await service.add(new CreateProveedoresDto())).toEqual(
          testProveedor,
      )
      expect(mapper.toEntity).toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('Deberia actualizar el proveedor', async () => {
      const testProveedor = new Proveedor()
      testProveedor.nombre = 'tests'
      testProveedor.tipo = 'Tests'
      testProveedor.telefono = '651235570'
      testProveedor.deleted = false

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(testProveedor),
      }

      const mockUpdateProveedoresDto = new UpdateProveedoresDto()

      jest.spyOn(repository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(service, 'findOne').mockResolvedValue(testProveedor)
      jest.spyOn(repository, 'findOne').mockResolvedValue(null)
      jest.spyOn(mapper, 'toEntity').mockReturnValue(testProveedor)
      jest.spyOn(repository, 'save').mockResolvedValue(testProveedor)

      const result = await service.update(1, mockUpdateProveedoresDto)

      expect(result).toEqual(testProveedor)
    })
  })

  describe('remove', () => {
    it('Deberia borrar el proveedor', async () => {
      const testProveedor = new Proveedor()
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(testProveedor)
      jest.spyOn(repository, 'remove').mockResolvedValue(testProveedor)

      expect(await service.remove(1)).toEqual(testProveedor)
    })
  })

  describe('removeSoft', () => {
    it('Deberia hacer el borrado logico', async () => {
      const testProveedor = new Proveedor()
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(testProveedor)
      jest.spyOn(repository, 'save').mockResolvedValue(testProveedor)

      expect(await service.removeSoft(1)).toEqual(testProveedor)
    })
  })
})
