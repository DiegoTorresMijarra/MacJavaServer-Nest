import { Test, TestingModule } from '@nestjs/testing'
import { PosicionesController } from './posiciones.controller'
import { PosicionesService } from './posiciones.service'
import { CacheModule } from '@nestjs/cache-manager'
import { CreatePosicionDto } from './dto/create-posicion.dto'
import { UpdatePosicionDto } from './dto/update-posicion.dto'
import { Posicion } from './entities/posicion.entity'
import { NotFoundException } from '@nestjs/common'
import { Paginated } from 'nestjs-paginate'

describe('PosicionesController', () => {
  let controller: PosicionesController
  let service: PosicionesService

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
      controllers: [PosicionesController],
      providers: [
        PosicionesService,
        {
          provide: PosicionesService,
          useValue: serviceMock,
        },
      ],
    }).compile()

    controller = module.get<PosicionesController>(PosicionesController)
    service = module.get<PosicionesService>(PosicionesService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
  describe('posicionesService', () => {
    let createDto: CreatePosicionDto
    let updateDto: UpdatePosicionDto
    let original: Posicion

    beforeAll(async () => {
      createDto = new CreatePosicionDto()
      createDto.nombre = 'DISNEY'
      updateDto = new UpdatePosicionDto()
      original = {
        id: '00000000-0000-0000-0000-000000000001',
        nombre: 'MANAGER',
        salario: 1000,
        created_at: new Date(),
        updated_at: new Date(),
        deleted: true,
        trabajadores: [],
      }
    })

    describe('findAll', () => {
      it('should return an array of posiciones', async () => {
        const resTest: Posicion[] = [original]
        serviceMock.findAll.mockResolvedValue(resTest)

        const posiciones = await controller.findAll()

        expect(posiciones).toHaveLength(1)
      })
    })
    describe('findAllPaginated', () => {
      it('should return an array of posiciones', async () => {
        const resTest: Paginated<Posicion> = new Paginated<Posicion>()
        resTest.data = [original]
        serviceMock.findAllPaginated.mockResolvedValue(resTest)

        const res = await controller.findAllPaginated(
          PosicionesService.PAGED_DEFAULT_QUERY,
        )

        expect(res.data).toHaveLength(1)
      })
    })
    describe('findById', () => {
      it('should return a posiciones', async () => {
        jest.spyOn(service, 'findById').mockResolvedValue(original)

        const posicion = await controller.findById(original.id)

        expect(posicion).toEqual(original)
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
      it('should return a posiciones', async () => {
        const createdPos: Posicion = {
          ...new Posicion(),
          nombre: 'Cocinero',
          salario: 1000,
        }
        jest.spyOn(service, 'create').mockResolvedValue(createdPos)

        const res = await controller.create(createDto)

        expect(res).toEqual(createdPos)
      })
    })
    describe('updateById', () => {
      it('Should not update when no params passed', async () => {
        jest.spyOn(service, 'updateById').mockResolvedValue(original)
        const res = await controller.updateById(original.id, updateDto)
        expect(res).toEqual(original)
      })
      it('Should update a posicion', async () => {
        updateDto.nombre = 'OTROS'
        const updatedPos: Posicion = {
          ...original,
          nombre: 'OTROS',
        }
        jest.spyOn(service, 'updateById').mockResolvedValue(updatedPos)

        const res = await controller.updateById(original.id, updateDto)

        expect(res).toEqual(updatedPos)
      })
      it('Should throw not found exception', async () => {
        jest
          .spyOn(service, 'updateById')
          .mockRejectedValue(new NotFoundException())

        await expect(() =>
          controller.updateById(
            '00000000-0000-0000-0000-000000000099',
            updateDto,
          ),
        ).rejects.toThrow(NotFoundException)
      })
    })
    describe('removeById', () => {
      it('Should remove a posicion', async () => {
        const servMock = jest.spyOn(service, 'removeById').mockResolvedValue()

        await controller.removeById(original.id)

        expect(servMock).toHaveBeenCalledTimes(1)
      })
      it('Should throw not found exception', async () => {
        jest
          .spyOn(service, 'removeById')
          .mockRejectedValue(new NotFoundException())

        await expect(() => controller.removeById(original.id)).rejects.toThrow(
          NotFoundException,
        )
      })
    })
    describe('SoftRemoveById', () => {
      it('Should update a posicion', async () => {
        const updatedPos: Posicion = {
          ...original,
          deleted: true,
        }
        const servMock = jest
          .spyOn(service, 'softRemoveById')
          .mockResolvedValue(updatedPos)

        const res = await controller.softRemoveById(updatedPos.id)
        expect(res.deleted).toBeTruthy()
        expect(servMock).toHaveBeenCalledTimes(1)
      })
      it('Should throw not found exception', async () => {
        jest
          .spyOn(service, 'softRemoveById')
          .mockRejectedValue(new NotFoundException())

        await expect(() =>
          controller.softRemoveById(original.id),
        ).rejects.toThrow(NotFoundException)
      })
    })
  })
})
