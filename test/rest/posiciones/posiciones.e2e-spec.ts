import { Test, TestingModule } from '@nestjs/testing'
import {
  BadRequestException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common'
import * as request from 'supertest'
import { CacheModule } from '@nestjs/cache-manager'
import { Paginated } from 'nestjs-paginate'
import { PosicionesController } from '../../../src/rest/posiciones/posiciones.controller'
import { PosicionesService } from '../../../src/rest/posiciones/posiciones.service'
import { Trabajador } from '../../../src/rest/trabajadores/entities/trabajadores.entity'
import { CreatePosicionDto } from '../../../src/rest/posiciones/dto/create-posicion.dto'
import { UpdatePosicionDto } from '../../../src/rest/posiciones/dto/update-posicion.dto'
import { Posicion } from '../../../src/rest/posiciones/entities/posicion.entity'
import { json } from 'express'

describe('PosicionesController (e2e)', () => {
  let app: INestApplication
  const endpoint = '/posiciones'

  const serviceMock = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    removeById: jest.fn(),
    findAllPaginated: jest.fn(),
    softRemoveById: jest.fn(), //todo
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [PosicionesController],
      providers: [
        PosicionesService,
        {
          provide: PosicionesService,
          useValue: serviceMock,
        },
      ],
    }).compile()

    app = module.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('posicionesControllerFunc', () => {
    let createDto: CreatePosicionDto
    let updateDto: UpdatePosicionDto
    let original: Posicion
    const notFoundUUID: string = '99999999-9999-9999-9999-999999999999'

    beforeAll(async () => {
      createDto = new CreatePosicionDto()
      createDto.nombre = 'OTROS'
      createDto.salario = 1000

      updateDto = new UpdatePosicionDto()
      original = {
        ...new Posicion(),
        id: '00000000-0000-0000-0000-000000000001',
        nombre: 'MANAGER',
        salario: 10000,
        trabajadores: [],
      }
    })
    describe(`Get ${endpoint} `, () => {
      it('should return an array of posiciones', async () => {
        serviceMock.findAll.mockResolvedValue([original])
        const response = await request(app.getHttpServer())
          .get(endpoint)
          .expect(200)
        expect(response.body.length).toEqual(1)
        expect(serviceMock.findAll).toHaveBeenCalled()
      })
    })
    describe(`Get ${endpoint}/paginated`, () => {
      it('should return an array of posiciones', async () => {
        const resTest: Paginated<Posicion> = new Paginated<Posicion>()
        resTest.data = [original]
        serviceMock.findAllPaginated.mockResolvedValue(resTest)

        const response = await request(app.getHttpServer())
          .get(`${endpoint}/paginated?page=1&limit=10&sortBy=nombre:ASC`)
          .expect(200)

        expect(serviceMock.findAllPaginated).toHaveBeenCalled()
        expect(response.body.data).toHaveLength(1)
      })
    })
    describe(`Get ${endpoint}/:id `, () => {
      it('should return a single Posicion', async () => {
        serviceMock.findById.mockResolvedValue(original)

        const response = await request(app.getHttpServer())
          .get(`${endpoint}/${original.id}`)
          .expect(200)

        expect(response.text).toContain(`"nombre":"${original.nombre}"`)
        expect(serviceMock.findById).toHaveBeenCalled()
      })
      it('should return Not found exception', async () => {
        serviceMock.findById.mockRejectedValue(new NotFoundException())
        await request(app.getHttpServer())
          .get(`${endpoint}/${notFoundUUID}`)
          .expect(404)
        expect(serviceMock.findById).toHaveBeenCalled()
      })
    })
    describe(`Post ${endpoint} `, () => {
      it('should create a Posicion', async () => {
        const createdPos: Posicion = {
          ...new Posicion(),
          ...createDto,
        }
        serviceMock.create.mockResolvedValue(createdPos)
        const response = await request(app.getHttpServer())
          .post(endpoint)
          .send(createDto)
          .expect(201)

        expect(response.text).toContain(`"nombre":"${createdPos.nombre}"`)
        expect(serviceMock.create).toHaveBeenCalled()
      })
      it('Should throw Bad Request exception', async () => {
        serviceMock.create.mockRejectedValue(new BadRequestException())
        await request(app.getHttpServer())
          .post(endpoint)
          .send(createDto)
          .expect(400)
        expect(serviceMock.create).toHaveBeenCalled()
      })
    })
    describe(`Put ${endpoint}/:id  `, () => {
      it('should not update when no params passed', async () => {
        serviceMock.updateById.mockResolvedValue(original)
        const response = await request(app.getHttpServer())
          .put(`${endpoint}/${original.id}`)
          .send({})
          .expect(200)

        expect(serviceMock.updateById).toHaveBeenCalled()
        expect(response.text).toContain(`"nombre":"${original.nombre}"`)
      })
      it('should throw Not found exception', async () => {
        serviceMock.updateById.mockRejectedValue(new NotFoundException())
        await request(app.getHttpServer())
          .put(`${endpoint}/${notFoundUUID}`)
          .send(updateDto)
          .expect(404)
        expect(serviceMock.updateById).toHaveBeenCalled()
      })
      it('should update a Posicion', async () => {
        updateDto.nombre = 'OTROS'
        const updatedPos: Posicion = {
          ...original,
          ...updateDto,
        }
        serviceMock.updateById.mockResolvedValue(updatedPos)
        const response = await request(app.getHttpServer())
          .put(`${endpoint}/${original.id}`)
          .send(updateDto)
          .expect(200)

        expect(response.text).toContain(`"nombre":"${updatedPos.nombre}"`)
        expect(serviceMock.updateById).toHaveBeenCalled()
      })
      it('Should throw Bad Request exception', async () => {
        serviceMock.updateById.mockRejectedValue(new BadRequestException())
        await request(app.getHttpServer())
          .put(`${endpoint}/${original.id}`)
          .send(updateDto)
          .expect(400)
        expect(serviceMock.updateById).toHaveBeenCalled()
      })
    })
    describe(`Del ${endpoint}/:id  `, () => {
      it('should delete a Posicion', async () => {
        const posDelTest = new Posicion()
        posDelTest.id = '00000000-0000-0000-0000-000000000002'
        const servMock = serviceMock.removeById.mockResolvedValue(posDelTest)
        const response = await request(app.getHttpServer())
          .delete(`${endpoint}/${posDelTest.id}`)
          .expect(204)
        expect(servMock).toHaveBeenCalled()
      })
      it('should throw Not found exception', async () => {
        serviceMock.removeById.mockRejectedValue(new NotFoundException())

        await request(app.getHttpServer())
          .delete(`${endpoint}/${notFoundUUID}`)
          .expect(404)
        expect(serviceMock.removeById).toHaveBeenCalled()
      })
      it('Should throw Bad Request exception', async () => {
        const posWithTrab: Posicion = {
          ...original,
          trabajadores: [new Trabajador()],
        }

        const servMock = serviceMock.removeById.mockRejectedValue(
          new BadRequestException(),
        )

        await request(app.getHttpServer())
          .delete(`${endpoint}/${posWithTrab.id}`)
          .expect(400)

        expect(servMock).toHaveBeenCalled()
      })
    })
    describe(`Patch ${endpoint}/softRemove/:id`, () => {
      it('should update deleted: true', async () => {
        const funkDelTest = new Trabajador()
        funkDelTest.id = '00000000-0000-0000-0000-000000000002'
        funkDelTest.deleted = true

        const servMock =
          serviceMock.softRemoveById.mockResolvedValue(funkDelTest)

        const response = await request(app.getHttpServer())
          .patch(`${endpoint}/softRemove/${funkDelTest.id}`)
          .expect(200)

        expect(response.text).toContain(`"deleted":true`)
        expect(servMock).toHaveBeenCalled()
      })
      it('should throw not found exception', async () => {
        serviceMock.softRemoveById.mockRejectedValue(new NotFoundException())

        await request(app.getHttpServer())
          .patch(`${endpoint}/softRemove/${notFoundUUID}`)
          .expect(404)
        expect(serviceMock.softRemoveById).toHaveBeenCalled()
      })
    })
  })
})
