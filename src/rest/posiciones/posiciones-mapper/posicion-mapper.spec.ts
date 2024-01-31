import { Test, TestingModule } from '@nestjs/testing'
import { PosicionMapper } from './posicion-mapper'

describe('PosicionesMapper', () => {
  let provider: PosicionMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PosicionMapper],
    }).compile()

    provider = module.get<PosicionMapper>(PosicionMapper)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })
})
