import { Test, TestingModule } from '@nestjs/testing'
import {
  BadRequestException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common'
import * as request from 'supertest'
import { CacheModule } from '@nestjs/cache-manager'
import { Paginated } from 'nestjs-paginate'
import { TrabajadoresController } from '../../../src/rest/trabajadores/trabajadores.controller'
import { TrabajadoresService } from '../../../src/rest/trabajadores/trabajadores.service'
import { Posicion } from '../../../src/rest/posiciones/entities/posicion.entity'
import { Trabajador } from '../../../src/rest/trabajadores/entities/trabajadores.entity'
import { CreateTrabajadorDto } from '../../../src/rest/trabajadores/dto/create-trabajador.dto'
import { UpdateTrabajadorDto } from '../../../src/rest/trabajadores/dto/update-trabajador.dto'

describe('TrabajadoresController (e2e)', () => {
  let app: INestApplication
  const endpoint = '/trabajadores'

  const serviceMock = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    removeById: jest.fn(),
    findAllPaginated: jest.fn(),
    softRemoveById: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [TrabajadoresController],
      providers: [
        TrabajadoresService,
        {
          provide: TrabajadoresService,
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

  describe('trabajadoresControllerFunc', () => {
    let originalPos: Posicion
    let original: Trabajador
    let createDto: CreateTrabajadorDto
    let updateDto: UpdateTrabajadorDto
    const notFoundUUID: string = '99999999-9999-9999-9999-999999999999'

    beforeAll(() => {
      originalPos = {
        ...new Posicion(),
        id: '00000000-0000-0000-0000-000000000001',
        nombre: 'MANAGER',
        salario: 10000,
        trabajadores: [],
      }
      original = {
        ...new Trabajador(),
        id: '00000000-0000-0000-0001-000000000001',
        dni: '00000000t',
        nombre: 'Trabajador1',
        apellido: 'apellido',
        edad: 18,
        telefono: '629384747',
        posicion: originalPos,
      }
      createDto = {
        dni: '00000001r',
        nombre: 'Trabajador2',
        apellido: 'apellido2',
        edad: 40,
        telefono: '629384748',
        posicionNombre: 'OTROS',
      }
      updateDto = new UpdateTrabajadorDto()
    })

    describe(`Get ${endpoint} `, () => {
      it('should return an array of Trabajadores', async () => {
        serviceMock.findAll.mockResolvedValue([original])
        const response = await request(app.getHttpServer())
          .get(endpoint)
          .expect(200)
        expect(response.body.length).toEqual(1)
        expect(serviceMock.findAll).toHaveBeenCalled()
      })
    })
    describe(`Get ${endpoint}/paginated`, () => {
      it('should return an array of Trabajadores', async () => {
        const resTest: Paginated<Trabajador> = new Paginated<Trabajador>()
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
      it('should return a single Trabajador', async () => {
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
      it('should create a Trabajador', async () => {
        const createdTrab: Trabajador = {
          ...new Trabajador(),
          ...createDto,
          posicion: originalPos,
        }
        serviceMock.create.mockResolvedValue(createdTrab)

        const response = await request(app.getHttpServer())
          .post(endpoint)
          .send(createDto)
          .expect(201)

        expect(response.text).toContain(`"nombre":"${createdTrab.nombre}"`)
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
          .send({ name: undefined })
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
      it('should update a Trabajador', async () => {
        updateDto.nombre = 'Cambiado'
        const updatedTrab: Trabajador = {
          ...original,
          ...updateDto,
          posicion: originalPos,
        }
        serviceMock.updateById.mockResolvedValue(updatedTrab)
        const response = await request(app.getHttpServer())
          .put(`${endpoint}/${original.id}`)
          .send(updateDto)
          .expect(200)

        expect(response.text).toContain(`"nombre":"${updatedTrab.nombre}"`)
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
      it('should delete a Trabajador', async () => {
        const trabDelTest = new Trabajador()
        trabDelTest.id = '00000000-0000-0000-0001-000000000002'
        const servMock = serviceMock.removeById.mockResolvedValue(trabDelTest)
        const response = await request(app.getHttpServer())
          .delete(`${endpoint}/${trabDelTest.id}`)
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
    })
    describe(`Patch ${endpoint}/softRemove/:id`, () => {
      it('should update deleted: true', async () => {
        const trabDelTest = new Trabajador()
        trabDelTest.id = '00000000-0000-0000-0001-000000000002'
        trabDelTest.deleted = true

        const servMock =
          serviceMock.softRemoveById.mockResolvedValue(trabDelTest)

        const response = await request(app.getHttpServer())
          .patch(`${endpoint}/softRemove/${trabDelTest.id}`)
          .expect(200)

        expect(response.body.deleted).toBeTruthy()
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
