import { Test, TestingModule } from '@nestjs/testing'
import { PosicionesService } from './posiciones.service'

describe('PosicionesService', () => {
  let service: PosicionesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PosicionesService],
    }).compile()

    service = module.get<PosicionesService>(PosicionesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
