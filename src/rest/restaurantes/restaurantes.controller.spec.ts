import { Test, TestingModule } from '@nestjs/testing'
import { RestaurantesController } from './restaurantes.controller'
import { RestaurantesService } from './restaurantes.service'
import {CacheModule} from "@nestjs/cache-manager";

describe('RestaurantesController', () => {
  let controller: RestaurantesController
  let service: RestaurantesService
  const mockRestaurantesService = {
    findAll: jest.fn(),
    //findAllPaginated: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByName: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantesController],
        imports: [CacheModule.register()],
      providers: [{provide: RestaurantesService, useValue: mockRestaurantesService}],
    }).compile()

    controller = module.get<RestaurantesController>(RestaurantesController)
    service = module.get<RestaurantesService>(RestaurantesService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

})
