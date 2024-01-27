import { Test, TestingModule } from '@nestjs/testing';
import { TrabajadorMapper } from './trabajador-mapper';

describe('TrabajadorMapper', () => {
  let provider: TrabajadorMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrabajadorMapper],
    }).compile();

    provider = module.get<TrabajadorMapper>(TrabajadorMapper);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
