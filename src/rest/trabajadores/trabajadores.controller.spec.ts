import { Test, TestingModule } from '@nestjs/testing'
import { TrabajadoresController } from './trabajadores.controller'
import { TrabajadoresService } from './trabajadores.service'
import { PosicionesService } from '../posiciones/posiciones.service'
import { CacheModule } from '@nestjs/cache-manager'
import { Posicion } from '../posiciones/entities/posicion.entity'
import { Paginated } from 'nestjs-paginate'
import { NotFoundException } from '@nestjs/common'
import { Trabajador } from './entities/trabajadores.entity'
import { CreateTrabajadorDto } from './dto/create-trabajador.dto'
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto'

describe('TrabajadoresController', () => {
  let controller: TrabajadoresController
  let service: TrabajadoresService

  const serviceMock = {
    findAll: jest.fn(),
    findAllPaginated: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    removeById: jest.fn(),
    softRemoveById: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [TrabajadoresController],
      providers: [
        TrabajadoresService,
        {
          provide: TrabajadoresService,
          useValue: serviceMock,
        },
      ],
    }).compile()

    controller = module.get<TrabajadoresController>(TrabajadoresController)
    service = module.get<TrabajadoresService>(TrabajadoresService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('posicionesServiceFunc', () => {
    let originalCat: Posicion
    let original: Trabajador
    let createDto: CreateTrabajadorDto
    let updateDto: UpdateTrabajadorDto
    const notFoundUUID: string = '99999999-9999-9999-9999-999999999999'

    beforeAll(() => {
      originalCat = {
        id: '00000000-0000-0000-0000-000000000001',
        nombre: 'MANAGER',
        salario: 10000,
        created_at: new Date(),
        updated_at: new Date(),
        deleted: false,
        trabajadores: [],
      }
      original = {
        id: '00000000-0000-0000-0001-000000000001',
        dni: '53718369Y',
        nombre: 'T1',
        apellido: ' test',
        edad: 18,
        telefono: '629384747',
        created_at: new Date(),
        updated_at: new Date(),
        deleted: false,
        posicion: originalCat,
      }
      createDto = {
        dni: '53718368N',
        nombre: 'T2',
        apellido: ' test',
        edad: 18,
        telefono: '629384747',
        posicionNombre: 'MANAGER',
      }

      updateDto = new UpdateTrabajadorDto()
    })
    describe('findAll', () => {
      it('should return an array of categories', async () => {
        const resTest: Trabajador[] = [original]
        serviceMock.findAll.mockResolvedValue(resTest)

        const categories = await controller.findAll()

        expect(categories).toHaveLength(1)
      })
    })
    describe('findAllPaginated', () => {
      it('should return an array of categories', async () => {
        const resTest: Paginated<Trabajador> = new Paginated<Trabajador>()
        resTest.data = [original]
        serviceMock.findAllPaginated.mockResolvedValue(resTest)

        const categories = await controller.findAllPaginated(
          PosicionesService.PAGED_DEFAULT_QUERY,
        )

        expect(categories.data).toHaveLength(1)
      })
    })
    describe('findById', () => {
      it('should return a category', async () => {
        jest.spyOn(service, 'findById').mockResolvedValue(original)

        const category = await controller.findById(original.id)

        expect(category).toEqual(original)
      })
      it('should throw an exception', async () => {
        jest
          .spyOn(service, 'findById')
          .mockRejectedValue(new NotFoundException())

        await expect(() => controller.findById(original.id)).rejects.toThrow(
          NotFoundException,
        )
      })
    })
    describe('create', () => {
      it('should return a category', async () => {
        const createdFunko: Trabajador = {
          ...new Trabajador(),
          ...createDto,
          posicion: originalCat,
        }
        jest.spyOn(service, 'create').mockResolvedValue(createdFunko)

        const category = await controller.create(createDto)

        expect(category).toEqual(createdFunko)
      })
    })
    describe('updateById', () => {
      it('Should not update when no params passed', async () => {
        jest.spyOn(service, 'updateById').mockResolvedValue(original)
        const category = await controller.updateById(original.id, updateDto)
        expect(category).toEqual(original)
      })
      it('Should update a category', async () => {
        updateDto = { nombre: 'Cambiado', posicionNombre: 'OTROS' }
        const cat2: Posicion = {
          id: '00000000-0000-0000-0000-000000000002',
          nombre: 'OTROS',
          salario: 1500,
          created_at: new Date(),
          updated_at: new Date(),
          deleted: false,
          trabajadores: [],
        }
        const updatedFunko: Trabajador = {
          ...original,
          ...updateDto,
          posicion: cat2,
        }
        jest.spyOn(service, 'updateById').mockResolvedValue(updatedFunko)

        const category = await controller.updateById(original.id, updateDto)

        expect(category).toEqual(updatedFunko)
      })
      it('Should throw not found exception', async () => {
        jest
          .spyOn(service, 'updateById')
          .mockRejectedValue(new NotFoundException())

        await expect(() =>
          controller.updateById(notFoundUUID, updateDto),
        ).rejects.toThrow(NotFoundException)
      })
    })
    describe('removeById', () => {
      it('Should remove a category', async () => {
        const servMock = jest.spyOn(service, 'removeById').mockResolvedValue()

        await controller.removeById(original.id)

        expect(servMock).toHaveBeenCalledTimes(1)
      })
      it('Should throw not found exception', async () => {
        jest
          .spyOn(service, 'removeById')
          .mockRejectedValue(new NotFoundException())

        await expect(() => controller.removeById(notFoundUUID)).rejects.toThrow(
          NotFoundException,
        )
      })
    })
    describe('SoftRemoveById', () => {
      it('Should update deleted: true a category', async () => {
        const updatedCat: Trabajador = {
          ...original,
          deleted: true,
        }
        const servMock = jest
          .spyOn(service, 'softRemoveById')
          .mockResolvedValue(updatedCat)

        const cat = await controller.softRemoveById(updatedCat.id)
        expect(cat.deleted).toBeTruthy()
        expect(servMock).toHaveBeenCalledTimes(1)
      })
      it('Should throw not found exception', async () => {
        jest
          .spyOn(service, 'softRemoveById')
          .mockRejectedValue(new NotFoundException())

        await expect(() =>
          controller.softRemoveById(notFoundUUID),
        ).rejects.toThrow(NotFoundException)
      })
    })
  })
})
