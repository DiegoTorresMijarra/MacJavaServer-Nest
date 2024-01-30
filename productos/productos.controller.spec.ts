import { Test, TestingModule } from '@nestjs/testing';
import { ProductoController } from './productos.controller';
import { ProductoService } from './productos.service';

describe('ProductosController', () => {
  let controller: ProductoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductoController],
      providers: [ProductoService],
    }).compile();

    controller = module.get<ProductoController>(ProductoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
