import { Test, TestingModule } from '@nestjs/testing'
import { ProveedoresController } from './proveedores.controller'
import { ProveedoresService } from './proveedores.service'
import {Proveedor} from "./entities/proveedores.entity";
import {CacheModule} from "@nestjs/cache-manager";
import {NotFoundException} from "@nestjs/common";
import {CreateProveedoresDto} from "./dto/create-proveedores.dto";
import {UpdateProveedoresDto} from "./dto/update-proveedores.dto";
import {Paginated} from "nestjs-paginate";

describe('ProveedoresController', () => {
  let controller: ProveedoresController
  let service: ProveedoresService

  const mockProveedoresService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    add: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeSoft: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [ProveedoresController],
      providers: [{ provide: ProveedoresService, useValue: mockProveedoresService },],
    }).compile()

    controller = module.get<ProveedoresController>(ProveedoresController)
    service = module.get<ProveedoresService>(ProveedoresService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should get all categorias', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'categorias',
      }

      const testCategories = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'categorias?page=1&limit=10&sortBy=nombre:ASC',
        },
      } as Paginated<Proveedor>
      jest.spyOn(service, 'findAll').mockResolvedValue(testCategories)
      const result: any = await controller.findAll(paginateOptions)

      // console.log(result)
      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
      // Expect the result to have the correct currentPage
      expect(result.meta.currentPage).toEqual(paginateOptions.page)
      // Expect the result to have the correct totalPages
      expect(result.meta.totalPages).toEqual(1) // You may need to adjust this value based on your test case
      // Expect the result to have the correct current link
      expect(result.links.current).toEqual(
          `categorias?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=nombre:ASC`,
      )
      expect(service.findAll).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('Deberia devolver un proveedor', async () => {
      const id = 1
      const mockResult = new Proveedor()

      jest.spyOn(service, 'findOne').mockResolvedValue(mockResult)
      await controller.findOne(id)
      expect(service.findOne).toHaveBeenCalledWith(id)
      expect(mockResult).toBeInstanceOf(Proveedor)
    })

    it('Lanza excepcion si no existe el proveedor', async () => {
      const id = 99
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException)
    })
  })

  describe('add', () => {
    it('Deberia crear un proveedor', async () => {
      const dto: CreateProveedoresDto = {
        nombre : 'test',
        tipo : 'Test',
        telefono : '651235576'
      }
      const mockResult = new Proveedor()
      jest.spyOn(service, 'add').mockResolvedValue(mockResult)
      await controller.add(dto)
      expect(service.add).toHaveBeenCalledWith(dto)
    })
  })

  describe('update', () => {
    it('Deberia actualizar un proveedor', async () => {
      const id = 1
      const dto: UpdateProveedoresDto = {
        nombre : 'tests',
        tipo : 'Tests',
        telefono : '651235570',
        deleted: true,
      }
      const mockResult = new Proveedor()
      jest.spyOn(service, 'update').mockResolvedValue(mockResult)
      await controller.update(id, dto)
      expect(service.update).toHaveBeenCalledWith(id, dto)
      expect(mockResult).toBeInstanceOf(Proveedor)
    })

    it('should throw NotFoundException if categoria does not exist', async () => {
      const id = 99
      const dto: UpdateProveedoresDto = {}
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())
      await expect(controller.update(id, dto)).rejects.toThrow(
          NotFoundException,
      )
    })
  })

  describe('remove', () => {
    it('should remove a categoria', async () => {
      const id = 1
      const mockResult = new Proveedor()
      const removeSpy = jest.spyOn(service, 'remove').mockResolvedValue(mockResult)
      const result = await controller.remove(id);

      expect(result).toEqual(mockResult);
      expect(removeSpy).toHaveBeenCalledWith(id)
    })

    it('should throw NotFoundException if categoria does not exist', async () => {
      const id = 1
      jest
          .spyOn(service, 'remove')
          .mockRejectedValue(new NotFoundException())
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException)
    })
  })

  /*describe('removeSoft', () => {
    it('should remove a categoria', async () => {
      const id = 1
      const mockResult: Proveedor & { deleted: false } = new Proveedor()
      jest.spyOn(service, 'removeSoft').mockResolvedValue(mockResult)
      await controller.removeSoft(id)
      expect(service.removeSoft).toHaveBeenCalledWith(id)
    })

    it('should throw NotFoundException if categoria does not exist', async () => {
      const id = 1
      jest
          .spyOn(service, 'removeSoft')
          .mockRejectedValue(new NotFoundException())
      await expect(controller.removeSoft(id)).rejects.toThrow(NotFoundException)
    })
  })*/
})
