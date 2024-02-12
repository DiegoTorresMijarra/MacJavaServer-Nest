import { Test, TestingModule } from '@nestjs/testing'
import { ClientesController } from './clientes.controller'
import { ClientesService } from './clientes.service'
import { CacheModule } from '@nestjs/cache-manager'
import { ResponseCliente } from './dto/response-cliente.dto'
import { Paginated } from 'nestjs-paginate'
import { NotFoundException } from '@nestjs/common'
import { CreateClienteDto } from './dto/create-cliente.dto'
import { UpdateClienteDto } from './dto/update-cliente.dto'
import { Request } from 'express'

describe('ClientesController', () => {
  let controller: ClientesController
  let service: ClientesService
  const clienteServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    removeSoft: jest.fn(),
    updateImage: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [ClientesController],
      providers: [{ provide: ClientesService, useValue: clienteServiceMock }],
    }).compile()

    controller = module.get<ClientesController>(ClientesController)
    service = module.get<ClientesService>(ClientesService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
  describe('findAll', () => {
    it('Devuelve FindAll', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'clientes',
      }

      const testClientes = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'clientes?page=1&limit=10&sortBy=nombre:ASC',
        },
      } as Paginated<ResponseCliente>

      jest.spyOn(service, 'findAll').mockResolvedValue(testClientes)
      const result: any = await controller.findAll(paginateOptions)

      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
      expect(result.meta.currentPage).toEqual(paginateOptions.page)
      expect(result.meta.totalPages).toEqual(1)
      expect(result.links.current).toEqual(
        `clientes?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=nombre:ASC`,
      )
      expect(service.findAll).toHaveBeenCalled()
    })
  })
  describe('findOne', () => {
    it('Devuelve un cliente', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174002'
      const mockResult: ResponseCliente = new ResponseCliente()

      jest.spyOn(service, 'findOne').mockResolvedValue(mockResult)
      await controller.findOne(id)
      expect(service.findOne).toHaveBeenCalledWith(id)
      expect(mockResult).toBeInstanceOf(ResponseCliente)
    })

    it('Devuelve NotFound', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174002'
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException)
    })
  })
  describe('create', () => {
    it('Create cliente', async () => {
      const dto: CreateClienteDto = {
        dni: '42749516G',
        nombre: 'cliente-test',
        apellido: 'cliente-test2',
        edad: 32,
        telefono: '537465965',
      }
      const mockResult: ResponseCliente = new ResponseCliente()
      jest.spyOn(service, 'create').mockResolvedValue(mockResult)
      await controller.create(dto)
      expect(service.create).toHaveBeenCalledWith(dto)
      expect(mockResult).toBeInstanceOf(ResponseCliente)
    })
  })
  describe('update', () => {
    it('Cliente actualizado', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174002'
      const dto: UpdateClienteDto = {
        dni: '42749516G',
        nombre: 'cliente-test',
        apellido: 'cliente-test2',
        edad: 32,
        telefono: '537465965',
        imagen: 'imagen-test2',
        deleted: true,
      }
      const mockResult: ResponseCliente = new ResponseCliente()
      jest.spyOn(service, 'update').mockResolvedValue(mockResult)
      await controller.update(id, dto)
      expect(service.update).toHaveBeenCalledWith(id, dto)
      expect(mockResult).toBeInstanceOf(ResponseCliente)
    })

    it('Devuelve NotFound', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174002'
      const dto: UpdateClienteDto = {
        dni: '42749516G',
        nombre: 'cliente-test',
        apellido: 'cliente-test2',
        edad: 32,
        telefono: '537465965',
        imagen: 'imagen-test2',
        deleted: true,
      }
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())
      await expect(controller.update(id, dto)).rejects.toThrow(
        NotFoundException,
      )
    })
  })
  describe('remove', () => {
    it('Cliente eliminado', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174002'
      const mockResult: ResponseCliente = new ResponseCliente()
      jest.spyOn(service, 'removeSoft').mockResolvedValue(mockResult)
      await controller.remove(id)
      expect(service.removeSoft).toHaveBeenCalledWith(id)
    })

    it('Devuelve NotFound', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174002'
      jest
        .spyOn(service, 'removeSoft')
        .mockRejectedValue(new NotFoundException())
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException)
    })
  })
  describe('updateImage', () => {
    it('update a cliente imagen', async () => {
      const mockId = '123e4567-e89b-12d3-a456-426614174002'
      const mockFile = {} as Express.Multer.File
      const mockReq = {} as Request
      const mockResult: ResponseCliente = new ResponseCliente()

      jest.spyOn(service, 'updateImage').mockResolvedValue(mockResult)

      await controller.updateImage(mockId, mockFile, mockReq)
      expect(service.updateImage).toHaveBeenCalledWith(
        mockId,
        mockFile,
        mockReq,
        true,
      )
      expect(mockResult).toBeInstanceOf(ResponseCliente)
    })
  })
})
