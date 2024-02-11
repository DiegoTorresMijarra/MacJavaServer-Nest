import {INestApplication, NotFoundException} from "@nestjs/common";
import {RestaurantesService} from "../../src/rest/restaurantes/restaurantes.service";
import {Test} from "@nestjs/testing";
import {RestaurantesModule} from "../../src/rest/restaurantes/restaurantes.module";
import * as request from 'supertest';
import {Restaurante} from "../../src/rest/restaurantes/entities/restaurante.entity";
import {UpdateRestauranteDto} from "../../src/rest/restaurantes/dto/update-restaurante.dto";
import {CreateRestauranteDto} from "../../src/rest/restaurantes/dto/create-restaurante.dto";


describe('RestaurantesController (e2e)', () => {
    let app: INestApplication;
    const endpoint= '/restaurantes';

    const restaurante : Restaurante = {
        id: 1,
        nombre: 'Restaurante A',
        calle: 'Calle 1',
        localidad: 'Localidad 1',
        capacidad: 100,
        borrado: false,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
    };
    const updateRestaurante : UpdateRestauranteDto = {
        nombre: 'Nombre nuevo'
    }
    const createDto : CreateRestauranteDto = {
        nombre: 'Restaurante A',
        calle: 'Calle 1',
        localidad: 'Localidad 1',
        capacidad: 100,
        borrado: false,
    }

    const mockRestaurantesService = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        removeSoft: jest.fn(),
        findByName: jest.fn(),
        findAllPaginated: jest.fn()
    };
    beforeEach(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [RestaurantesModule],
            providers: [
                RestaurantesService,{provide: RestaurantesService, useValue: mockRestaurantesService}
            ]
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    })

    afterAll(async () => {
        await app.close();
    })

    describe('GET /paginated', () => {
        it('debe devolver un array de restaurantes paginados', () => {
            mockRestaurantesService.findAllPaginated.mockResolvedValue([restaurante]);
            const body=  request(app.getHttpServer())
                .get(endpoint)
                .expect(200);
            expect(() => {
                expect(body).toEqual([restaurante])
                expect(mockRestaurantesService.findAllPaginated).toHaveBeenCalled()
            })
        });
    });

    describe ('GET /:id', () => {
        it('debe devolver un restaurante', () => {
            mockRestaurantesService.findOne.mockResolvedValue(restaurante);
            const body = request(app.getHttpServer())
                .get(`${endpoint}/${restaurante.id}`)
                .expect(200);
            expect(() => {
                expect(body).toEqual(restaurante)
                expect(mockRestaurantesService.findOne).toHaveBeenCalledWith(restaurante.id)
            })
        });
        it('debe devolver un error 404 si no existe el restaurante', () => {
            mockRestaurantesService.findOne.mockResolvedValue(null);
            const body = request(app.getHttpServer())
                .get(`${endpoint}/${restaurante.id}`)
                .expect(404);
            expect(() => {
                expect(body).toThrowError(NotFoundException)
                expect(mockRestaurantesService.findOne).toHaveBeenCalledWith(restaurante.id)
            })
        });
    });

    describe('POST /', () => {
        it('debe devolver un restaurante', () => {
            mockRestaurantesService.create.mockResolvedValue(restaurante);
            const body = request(app.getHttpServer())
                .post(endpoint)
                .send(createDto)
                .expect(201);
            expect(() => {
                expect(body).toEqual(restaurante)
                expect(mockRestaurantesService.create).toHaveBeenCalledWith(createDto)
            })
        });
    })
    describe('PATCH /:id', () => {
        it('debe devolver un restaurante', () => {
            mockRestaurantesService.update.mockResolvedValue(restaurante);
            const body = request(app.getHttpServer())
                .patch(`${endpoint}/${restaurante.id}`)
                .send(updateRestaurante)
                .expect(200);
            expect(() => {
                expect(body).toEqual(restaurante)
                expect(mockRestaurantesService.update).toHaveBeenCalledWith(restaurante.id, updateRestaurante)
            })
        });
        it('debe devolver un error 404 si no existe el restaurante', () => {
            mockRestaurantesService.update.mockResolvedValue(null);
            const body = request(app.getHttpServer())
                .patch(`${endpoint}/${restaurante.id}`)
                .send(updateRestaurante)
                .expect(404);
            expect(() => {
                expect(body).toThrowError(NotFoundException)
                expect(mockRestaurantesService.update).toHaveBeenCalledWith(restaurante.id, updateRestaurante)
            })
        })
    })
    describe('DELETE /:id', () => {
        it('debe devolver un restaurante', () => {
            mockRestaurantesService.removeSoft.mockResolvedValue(restaurante);
            const body = request(app.getHttpServer())
                .delete(`${endpoint}/${restaurante.id}`)
                .expect(200);
            expect(() => {
                expect(body).toEqual(restaurante)
                expect(mockRestaurantesService.removeSoft).toHaveBeenCalledWith(restaurante.id)
            })
        });
    })
    describe('GET /nombre/:nombre', () => {
        it('debe devolver un restaurante', () => {
            mockRestaurantesService.findByName.mockResolvedValue(restaurante);
            const body = request(app.getHttpServer())
                .get(`${endpoint}/by-name/${restaurante.nombre}`)
                .expect(200);
            expect(() => {
                expect(body).toEqual(restaurante)
                expect(mockRestaurantesService.findByName).toHaveBeenCalledWith(restaurante.nombre)
            })
        });
        it('debe devolver un error 404 si no existe el restaurante', () => {
            mockRestaurantesService.findByName.mockResolvedValue(null);
            const body = request(app.getHttpServer())
                .get(`${endpoint}/by-name/${restaurante.nombre}`)
                .expect(404);
            expect(() => {
                expect(body).toThrowError(NotFoundException)
                expect(mockRestaurantesService.findByName).toHaveBeenCalledWith(restaurante.nombre)
            })
        })
    });
})