import { Test, TestingModule } from '@nestjs/testing'
import { RestaurantesController } from './restaurantes.controller'
import { RestaurantesService } from './restaurantes.service'
import { CacheModule } from '@nestjs/cache-manager'
import { PaginateQuery } from 'nestjs-paginate'
import { Restaurante } from './entities/restaurante.entity'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CreateRestauranteDto } from './dto/create-restaurante.dto'

describe('RestaurantesController', () => {
  let controller: RestaurantesController
  let service: RestaurantesService
  const mockRestaurantesService = {
    findAll: jest.fn(),
    findAllPaginated: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByName: jest.fn(),
  }
  const mockPaginatedQuery: PaginateQuery = {
    path: 'http://localhost:3000/restaurantes/paginated/',
    page: 1,
    limit: 10,
  }

  beforeEach(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantesController],
      imports: [CacheModule.register()],
      providers: [
        { provide: RestaurantesService, useValue: mockRestaurantesService },
      ],
    }).compile()

    controller = modulo.get<RestaurantesController>(RestaurantesController)
    service = modulo.get<RestaurantesService>(RestaurantesService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('debe devolver array de todos los restaurantes ', async () => {
      const mockRestaurants = [
        { name: 'Restaurant A' },
        { name: 'Restaurant B' },
      ]
      mockRestaurantesService.findAll.mockResolvedValue(mockRestaurants)

      const result = await controller.findAll()

      expect(result).toEqual(mockRestaurants)
    })

    it('debe mostrar un log con la accion', async () => {
      const mockRestaurants = [
        { name: 'Restaurant A' },
        { name: 'Restaurant B' },
      ]
      mockRestaurantesService.findAll.mockResolvedValue(mockRestaurants)
      const loggerSpy = jest.spyOn(controller['logger'], 'log')

      await controller.findAll()

      expect(loggerSpy).toHaveBeenCalledWith(
        'Pidiendo todos los restaurantes (Controller)',
      )
    })
  })

  describe('findAllPaginated', () => {
    it('debe mostrar los restaurantes paginados', async () => {
      const mockPaginatedRestaurants = [
        { name: 'Restaurante 1' },
        { name: 'Restaurante 2' },
      ]
      mockRestaurantesService.findAllPaginated.mockResolvedValue(
        mockPaginatedRestaurants,
      )

      const result = await controller.findAllPaginated(mockPaginatedQuery)

      expect(result).toEqual(mockPaginatedRestaurants)
    })
  })

  describe('findOne', () => {
    it('debe devolver un restaurante', async () => {
      const mockRestaurant: Restaurante = new Restaurante()
      const id = 1

      jest.spyOn(service, 'findOne').mockResolvedValue(mockRestaurant)
      const res = await controller.findOne(id)
      expect(service.findOne).toHaveBeenCalledWith(id)
      expect(res).toBeInstanceOf(Restaurante)
    })

    it('debe lanzar un erro NotFoundException si no existe el Restaurante', async () => {
      const id = 10
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('debe crear un restaurante', async () => {
      const dto: CreateRestauranteDto = {
        nombre: 'Restaurante test',
        calle: 'Calle test',
        localidad: 'Localidad test',
        capacidad: 100,
        borrado: false,
      }
      const mockRestaurant: Restaurante = new Restaurante()
      jest.spyOn(service, 'create').mockResolvedValue(mockRestaurant)
      await controller.create(dto)
      expect(service.create).toHaveBeenCalledWith(dto)
    })
    it('debe mostrar un error BadRequest si se ingresan datos mal', () => {
      const dto: CreateRestauranteDto = {
        nombre: '',
        calle: 'Calle test',
        localidad: 'Localidad test',
        capacidad: 100,
        borrado: false,
      }
      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException())
      expect(controller.create(dto)).rejects.toThrow(BadRequestException)
    })
  })

  describe('update', () => {
    it('debe actualizar un restaurante con los datos combinados del dto y el restaurante a modificar ', () => {
      const id = 1
      const dto: CreateRestauranteDto = {
        nombre: 'Restaurante test',
        calle: 'Calle test',
        localidad: 'Localidad test',
        capacidad: 100,
        borrado: false,
      }
      const mockRestaurant: Restaurante = new Restaurante()
      jest.spyOn(service, 'update').mockResolvedValue(mockRestaurant)
      expect(controller.update(id, dto)).resolves.toEqual(mockRestaurant)
    })
    it('debe mostrar un error BadRequest si se ingresan datos mal', () => {
      const id = 1
      const dto: CreateRestauranteDto = {
        nombre: 'Restaurante test',
        calle: 'Calle test',
        localidad: 'Localidad test',
        capacidad: -100,
        borrado: false,
      }
      jest.spyOn(service, 'update').mockRejectedValue(new BadRequestException())
      expect(controller.update(id, dto)).rejects.toThrow(BadRequestException)
    })
  })

  describe('findByName', () => {
    it('debe devolver un restaurante', async () => {
      const mockRestaurant: Restaurante = new Restaurante()
      const nombre = 'Restaurante test'

      jest.spyOn(service, 'findByName').mockResolvedValue(mockRestaurant)
      await controller.findByName(nombre)
      expect(service.findByName).toHaveBeenCalledWith(nombre)
      expect(service.findByName).not.toBeInstanceOf(Restaurante)
    })

    it('debe lanzar un erro NotFoundException si no existe el Restaurante', async () => {
      const nombre = 'Restaurante test'
      jest
        .spyOn(service, 'findByName')
        .mockRejectedValue(new NotFoundException())
      await expect(controller.findByName(nombre)).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
