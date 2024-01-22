import { Test, TestingModule } from '@nestjs/testing'
import { TrabajadoresController } from './trabajadores.controller'
import { TrabajadoresService } from './trabajadores.service'

describe('TrabajadoresController', () => {
  let controller: TrabajadoresController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrabajadoresController],
      providers: [TrabajadoresService],
    }).compile()

    controller = module.get<TrabajadoresController>(TrabajadoresController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
