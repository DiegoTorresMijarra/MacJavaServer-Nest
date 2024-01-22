import { Test, TestingModule } from '@nestjs/testing'
import { RestaurantesService } from './restaurantes.service'

describe('RestaurantesService', () => {
  let service: RestaurantesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RestaurantesService],
    }).compile()

    service = module.get<RestaurantesService>(RestaurantesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
