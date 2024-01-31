import { Test, TestingModule } from '@nestjs/testing'
import { RestaurantesController } from './restaurantes.controller'
import { RestaurantesService } from './restaurantes.service'

describe('RestaurantesController', () => {
  let controller: RestaurantesController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantesController],
      providers: [RestaurantesService],
    }).compile()

    controller = module.get<RestaurantesController>(RestaurantesController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
