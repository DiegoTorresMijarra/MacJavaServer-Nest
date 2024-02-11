import { Test, TestingModule } from '@nestjs/testing';
import { ProductosController } from './productos.controller';
import { ProductoService } from './productos.service';
import { NotFoundException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ResponseProductoDto } from './dto/response-producto.dto';

describe('ProductosController', () => {
  let controller: ProductosController;
  let service: ProductoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductosController],
      providers: [
        {
          provide: ProductoService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            updateImage: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductosController>(ProductosController);
    service = module.get<ProductoService>(ProductoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const result = [];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll({ path: '' })).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a product', async () => {
      const result = new ResponseProductoDto();
      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(1)).toBe(result);
    });

    it('should throw NotFoundException if product is not found', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException('Producto no encontrado'));

      await expect(controller.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createProductoDto: CreateProductoDto = {
        proveedor: '',
        nombre: 'Test',
        precio: 100,
        stock: 10,
      };
      const result = new ResponseProductoDto(); // Asume que este es el tipo de respuesta esperada
      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createProductoDto)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateProductoDto: UpdateProductoDto = {
        proveedor: '',
        nombre: 'Test',
        precio: 100,
        stock: 10,
      };
      const result = new ResponseProductoDto(); // Asume que este es el tipo de respuesta esperada
      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update(1, updateProductoDto)).toBe(result);
    });

    it('should throw NotFoundException if product is not found', async () => {
      const updateProductoDto: UpdateProductoDto = {
        proveedor: '',
        nombre: 'Test',
        precio: 100,
        stock: 10,
      };
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new NotFoundException('Producto no encontrado'));

      await expect(controller.update(1, updateProductoDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue();

      await expect(controller.remove(1)).resolves.toBe(undefined);
    });

    it('should throw NotFoundException if product is not found', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(null);

      await expect(controller.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateImage', () => {
    it('should update the image of a product', async () => {
      const file = {} as Express.Multer.File;
      const result = new ResponseProductoDto(); // Suponiendo que updateImage devuelve un ResponseProductoDto
      jest.spyOn(service, 'updateImage').mockResolvedValue(result);

      expect(await controller.updateImage(1, file)).toBe(result);
    });

    it('should throw NotFoundException if product is not found', async () => {
      const file = {} as Express.Multer.File;
      jest
        .spyOn(service, 'updateImage')
        .mockRejectedValue(new NotFoundException('Producto no encontrado'));

      await expect(controller.updateImage(1, file)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
