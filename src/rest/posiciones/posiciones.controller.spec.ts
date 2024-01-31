import { Test, TestingModule } from '@nestjs/testing'
import { PosicionesController } from './posiciones.controller'
import { PosicionesService } from './posiciones.service'

describe('PosicionesController', () => {
  let controller: PosicionesController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PosicionesController],
      providers: [PosicionesService],
    }).compile()

    controller = module.get<PosicionesController>(PosicionesController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
