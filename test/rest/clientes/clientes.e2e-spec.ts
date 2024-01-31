import { INestApplication, NotFoundException } from '@nestjs/common'
import { ResponseCliente } from '../../../src/rest/clientes/dto/response-cliente.dto'
import { UpdateClienteDto } from '../../../src/rest/clientes/dto/update-cliente.dto'
import { CreateClienteDto } from '../../../src/rest/clientes/dto/create-cliente.dto'
import { CacheModule } from '@nestjs/cache-manager'
import { Test, TestingModule } from '@nestjs/testing'
import { ClientesController } from '../../../src/rest/clientes/clientes.controller'
import { ClientesService } from '../../../src/rest/clientes/clientes.service'
import * as request from 'supertest'

describe('ClientesController (e2e)', () => {
  let app: INestApplication
  const myEndpoint = `/clientes`
  const myClienteResponse: ResponseCliente = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    dni: '42749516G',
    nombre: 'cliente-test',
    apellido: 'cliente-test2',
    edad: 32,
    telefono: '537465965',
    imagen: 'imagen-test',
    created_at: new Date(),
    updated_at: new Date(),
    deleted: false,
  }
  const dtoUpdate: UpdateClienteDto = {
    dni: '42749516G',
    nombre: 'cliente-test',
    apellido: 'cliente-test2',
    edad: 32,
    telefono: '537465965',
    imagen: 'imagen-test2',
    deleted: true,
  }
  const dtoCreate: CreateClienteDto = {
    dni: '42749516G',
    nombre: 'cliente-test',
    apellido: 'cliente-test2',
    edad: 32,
    telefono: '537465965',
  }
  const mockClientesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    removeSoft: jest.fn(),
    exists: jest.fn(),
  }
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [ClientesController],
      providers: [
        ClientesService,
        { provide: ClientesService, useValue: mockClientesService },
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })
  afterAll(async () => {
    await app.close()
  })
  describe('GET /clientes', () => {
    it('Devuelve FindAll Page', async () => {
      mockClientesService.findAll.mockResolvedValue([myClienteResponse])

      const { body } = await request(app.getHttpServer())
        .get(myEndpoint)
        .expect(200)
      expect(() => {
        expect(body).toEqual([myClienteResponse])
        expect(mockClientesService.findAll).toHaveBeenCalled()
      })
    })
    it('Devuelve FindAll Page con query', async () => {
      mockClientesService.findAll.mockResolvedValue([myClienteResponse])

      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}?page=1&limit=10`)
        .expect(200)
      expect(() => {
        expect(body).toEqual([myClienteResponse])
        expect(mockClientesService.findAll).toHaveBeenCalled()
      })
    })
  })
  describe('GET /clientes/:id', () => {
    it('Devuelve el findOne', async () => {
      mockClientesService.findOne.mockResolvedValue(myClienteResponse)

      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}/${myClienteResponse.id}`)
        .expect(200)
      expect(() => {
        expect(body).toEqual(myClienteResponse)
        expect(mockClientesService.findOne).toHaveBeenCalled()
      })
    })

    it('Devuelve NotFound', async () => {
      mockClientesService.findOne.mockRejectedValue(new NotFoundException())

      await request(app.getHttpServer())
        .get(`${myEndpoint}/${myClienteResponse.id}`)
        .expect(404)
    })
  })
  describe('POST /clientes', () => {
    it('Crea un funko', async () => {
      mockClientesService.create.mockResolvedValue(myClienteResponse)

      const { body } = await request(app.getHttpServer())
        .post(myEndpoint)
        .send(dtoCreate)
        .expect(201)
      expect(() => {
        expect(body).toEqual(myClienteResponse)
        expect(mockClientesService.create).toHaveBeenCalledWith(dtoCreate)
      })
    })
  })
  describe('PUT /clientes/:id', () => {
    it('Devuelve cliente actualizado', async () => {
      mockClientesService.update.mockResolvedValue(myClienteResponse)

      const { body } = await request(app.getHttpServer())
        .put(`${myEndpoint}/${myClienteResponse.id}`)
        .send(dtoUpdate)
        .expect(200)
      expect(() => {
        expect(body).toEqual(myClienteResponse)
        expect(mockClientesService.update).toHaveBeenCalledWith(
          myClienteResponse.id,
          dtoUpdate,
        )
      })
    })

    it('Devuelve NotFound', async () => {
      mockClientesService.update.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .put(`${myEndpoint}/${myClienteResponse.id}`)
        .send(mockClientesService)
        .expect(404)
    })
  })
  describe('DELETE /clientes/:id', () => {
    it('Elimina un cliente', async () => {
      mockClientesService.removeSoft.mockResolvedValue(myClienteResponse)

      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${myClienteResponse.id}`)
        .expect(204)
    })

    it('Devuelve NotFound', async () => {
      mockClientesService.removeSoft.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${myClienteResponse.id}`)
        .expect(404)
    })
  })
})
