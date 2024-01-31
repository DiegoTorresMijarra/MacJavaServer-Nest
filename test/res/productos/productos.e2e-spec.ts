import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { CreateProductoDto } from '../../../src/productos/dto/create-producto.dto';
import { UpdateProductoDto } from '../../../src/productos/dto/update-producto.dto';
import { CacheModule } from '@nestjs/cache-manager';
import { ProductosController } from '../../../src/productos/productos.controller';
import { ProductoService } from '../../../src/productos/productos.service';

describe('ProductosController (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  const myEndpoint = `/productos`;

  const myProductoResponse = {
    id: 1,
    nombre: 'nombre',
    precio: 100,
    stock: 10,
    imagen: 'imagen',
    uuid: 'uuid',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  };

  const createProductoDto: CreateProductoDto = {
    description: '',
    nombre: 'nombre',
    precio: 100,
    stock: 10,
    imagen: 'imagen',
  };

  const updateProductoDto: UpdateProductoDto = {
    nombre: 'nombre',
    descripcion: 'descripcion',
    precio: 100,
    stock: 10,
    imagen: 'imagen',
  };

  const mockProductosService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeSoft: jest.fn(),
    updateImage: jest.fn(),
    exists: jest.fn(),
  };

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [ProductosController],
      providers: [{ provide: ProductoService, useValue: mockProductosService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /productos', () => {
    it('debería devolver la lista de productos', async () => {
      mockProductosService.findAll.mockResolvedValue([myProductoResponse]);

      const response = await request(app.getHttpServer())
        .get(myEndpoint)
        .expect(200);
      expect(response.body).toEqual([myProductoResponse]);
      expect(mockProductosService.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /productos/:id', () => {
    it('debería retornar un producto específico', async () => {
      mockProductosService.findOne.mockResolvedValue(myProductoResponse);

      const response = await request(app.getHttpServer())
        .get(`${myEndpoint}/${myProductoResponse.id}`)
        .expect(200);
      expect(response.body).toEqual(myProductoResponse);
      expect(mockProductosService.findOne).toHaveBeenCalledWith(
        myProductoResponse.id,
      );
    });

    it('debería lanzar un error si el producto no existe', async () => {
      mockProductosService.findOne.mockRejectedValue(new NotFoundException());

      await request(app.getHttpServer())
        .get(`${myEndpoint}/${myProductoResponse.id}`)
        .expect(404);
    });
  });

  describe('POST /productos', () => {
    it('debería crear un producto', async () => {
      mockProductosService.create.mockResolvedValue(myProductoResponse);

      const response = await request(app.getHttpServer())
        .post(myEndpoint)
        .send(createProductoDto)
        .expect(201);
      expect(response.body).toEqual(myProductoResponse);
      expect(mockProductosService.create).toHaveBeenCalledWith(
        createProductoDto,
      );
    });
  });

  describe('PUT /productos/:id', () => {
    it('debería actualizar un producto', async () => {
      mockProductosService.update.mockResolvedValue(myProductoResponse);

      const response = await request(app.getHttpServer())
        .put(`${myEndpoint}/${myProductoResponse.id}`)
        .send(updateProductoDto)
        .expect(200);
      expect(response.body).toEqual(myProductoResponse);
      expect(mockProductosService.update).toHaveBeenCalledWith(
        myProductoResponse.id,
        updateProductoDto,
      );
    });

    it('debería lanzar un error si el producto no existe', async () => {
      mockProductosService.update.mockRejectedValue(new NotFoundException());

      await request(app.getHttpServer())
        .put(`${myEndpoint}/${myProductoResponse.id}`)
        .send(updateProductoDto)
        .expect(404);
    });
  });

  describe('DELETE /productos/:id', () => {
    it('debería eliminar un producto', async () => {
      mockProductosService.remove.mockResolvedValue(myProductoResponse);

      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${myProductoResponse.id}`)
        .expect(204);
    });

    it('debería lanzar un error si el producto no existe', async () => {
      mockProductosService.remove.mockRejectedValue(new NotFoundException());

      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${myProductoResponse.id}`)
        .expect(404);
    });
  });

  describe('PATCH /productos/imagen/:id', () => {
    it('debería actualizar la imagen de un producto', async () => {
      const file = Buffer.from('file');
      mockProductosService.exists.mockResolvedValue(true);
      mockProductosService.updateImage.mockResolvedValue(myProductoResponse);

      await request(app.getHttpServer())
        .patch(`${myEndpoint}/imagen/${myProductoResponse.id}`)
        .attach('file', file, 'image.jpg')
        .set('Content-Type', 'multipart/form-data')
        .expect(200);
    });
  });
});
