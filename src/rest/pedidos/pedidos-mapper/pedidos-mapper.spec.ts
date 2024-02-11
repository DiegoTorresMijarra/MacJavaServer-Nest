import { Test, TestingModule } from '@nestjs/testing'
import { PedidosMapper } from './pedidos-mapper'

describe('PedidosMapper', () => {
  let provider: PedidosMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PedidosMapper],
    }).compile()

    provider = module.get<PedidosMapper>(PedidosMapper)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })
})
