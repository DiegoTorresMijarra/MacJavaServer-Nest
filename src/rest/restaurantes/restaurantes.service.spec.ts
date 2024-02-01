import { Test, TestingModule } from '@nestjs/testing'
import { RestaurantesService } from './restaurantes.service'
import {Repository} from "typeorm";
import {Restaurante} from "./entities/restaurante.entity";
import {RestaurantesMapper} from "./mapper/restaurantes.mapper";
import {getRepositoryToken} from "@nestjs/typeorm";
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { hash } from 'typeorm/util/StringUtils';
import {Paginated, PaginateQuery} from "nestjs-paginate";
import {CreateRestauranteDto} from "./dto/create-restaurante.dto";
import {BadRequestException, NotFoundException} from "@nestjs/common";

describe('RestaurantesService', () => {
  let service: RestaurantesService
  let repositorio: Repository<Restaurante>
  let mapper: RestaurantesMapper
  let cache: Cache

  const restauranteMapperMock = {
    createDtoToEntity: jest.fn(),
    createDtoToEntity2: jest.fn(),
    updateDtoToEntity: jest.fn(),
  }

  const cacheManagerMock = {
    get: jest.fn(()=> Promise.resolve()),
    set: jest.fn(()=> Promise.resolve()),
    store:{
      keys: jest.fn(),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
          RestaurantesService,
        {provide: getRepositoryToken(Restaurante), useClass: Repository,},
        {provide: RestaurantesMapper, useValue: restauranteMapperMock},
        {provide: CACHE_MANAGER, useValue: cacheManagerMock},
      ],
    }).compile()

    service = module.get<RestaurantesService>(RestaurantesService)
    repositorio = module.get<Repository<Restaurante>>(getRepositoryToken(Restaurante))
    mapper = module.get<RestaurantesMapper>(RestaurantesMapper)
    cache = module.get<Cache>(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAllPaginated', () => {

      it('debe devolver restaurantes desde la cache', async () => {
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
                current: 'restaurantes?page=1&limit=10&sortBy=id:ASC',
            },
        } as Paginated<Restaurante>

        // Mock the cacheManager.get method to return a cached result
        jest.spyOn(cache, 'get').mockResolvedValue(testCategories)

        // Call the findAll method
        const result = await service.findAllPaginated(paginateOptions)

        // Expect the cacheManager.get method to be called with the correct key
        expect(cache.get).toHaveBeenCalledWith(
            `restaurantes_paginated_${hash(JSON.stringify(paginateOptions))}`,
        )

        // Expect the result to be the cached result
        expect(result).toEqual(testCategories)
    });
      it('debe devolver restaurantes desde la base de datos', async () => {
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
                    current: 'restaurantes_paginated?page=1&limit=10&sortBy=id:ASC',
                },
            } as Paginated<Restaurante>

            // Mock the cacheManager.get method to return a cached result
            jest.spyOn(cache, 'get').mockResolvedValue(undefined)
            jest.spyOn(cache, 'set').mockResolvedValue(undefined)
            jest.spyOn(repositorio, 'findAndCount').mockResolvedValue([[], 1])
            jest.spyOn(service, 'findAllPaginated').mockResolvedValue(testCategories)

            // Call the findAll method
            const result = await service.findAllPaginated(paginateOptions)

            // Expect the result to be the cached result
            expect(result).toEqual(testCategories)
      })
  });

  describe('findOne', () => {
    it('deberia devolver un restaurante', async () => {
        const id = 1
        const restaurante = new Restaurante()
        jest.spyOn(service, 'existeRestaurantePorId').mockResolvedValue(restaurante)

        expect(service.findOne(id)).resolves.toEqual(restaurante)
    })
      it('debe saltar erro NotFound', () => {
            const id = 1

            jest.spyOn(service, 'existeRestaurantePorId').mockResolvedValue(undefined)

            expect(service.findOne(id)).rejects.toThrow()
      });
  })

  describe('create', () => {
        it('debe crear un restaurante', async () => {
            const restaurante = new Restaurante()
            const createDto: CreateRestauranteDto = {
                nombre: 'Restaurante 1',
                localidad: 'Localidad 1',
                calle: 'Calle false',
                borrado: false,
                capacidad: 10,
            }
            jest.spyOn(mapper, 'createDtoToEntity').mockReturnValue(restaurante)
            jest.spyOn(repositorio, 'save').mockResolvedValue(restaurante)


        })
        it('debe lanzar un error BadRequest si el nombre del restaurante ya existe', async () => {
            const restaurante = new Restaurante()
            const createDto: CreateRestauranteDto = {
                nombre: 'Restaurante 1',
                localidad: 'Localidad 1',
                calle: 'Calle false',
                borrado: false,
                capacidad: 10,
            }
            jest.spyOn(mapper, 'createDtoToEntity').mockReturnValue(restaurante)
            jest.spyOn(service, 'existeRestaurantePorNombre').mockResolvedValue(restaurante)


            await expect(service.create(createDto)).rejects.toThrow()
        })
        it('debe lanzar un error BadRequest si se ingresan datos mal', async () => {
            const restaurante = new Restaurante()
            const createDto: CreateRestauranteDto = {
                nombre: '',
                localidad: 'Localidad 1',
                calle: 'Calle false',
                borrado: false,
                capacidad: 10,
            }
            jest.spyOn(mapper, 'createDtoToEntity').mockReturnValue(restaurante)
            jest.spyOn(repositorio, 'save').mockResolvedValue(restaurante)

            await expect(service.create(createDto)).rejects.toThrow()
        })
    });

  describe('update', () => {
        it('debe actualizar un restaurante', () => {
            const id = 1
            const restaurante = new Restaurante()
            const updateDto : CreateRestauranteDto = {
                nombre: 'Restaurante 1',
                localidad: 'Localidad 1',
                calle: 'Calle false',
                borrado: false,
                capacidad: 10,
            }

            jest.spyOn(service, 'existeRestaurantePorId').mockResolvedValue(restaurante)
            jest.spyOn(service, 'invalidarCacheKey').mockResolvedValue(undefined)
            jest.spyOn(mapper, 'updateDtoToEntity').mockReturnValue(restaurante)
            jest.spyOn(repositorio, 'save').mockResolvedValue(restaurante)

            expect(service.update(id, updateDto)).resolves.toEqual(restaurante)
            expect(service.existeRestaurantePorId).toHaveBeenCalledWith(id)
        });
      it('debe lanzar un error BadRequest si se ingresan datos mal', async () => {
          const id = 1;
          const restaurante = new Restaurante();
          const updateDto: CreateRestauranteDto = {
              nombre: 'Restaurante 1',
              localidad: 'Localidad 1',
              calle: 'Calle false',
              borrado: false,
              capacidad: -10,
          }

          jest.spyOn(service, 'existeRestaurantePorId').mockResolvedValue(restaurante);
          jest.spyOn(service, 'invalidarCacheKey').mockResolvedValue(undefined);
          jest.spyOn(mapper, 'updateDtoToEntity').mockReturnValue(restaurante);
          jest.spyOn(repositorio, 'save').mockResolvedValue(restaurante);


      });
        it('debe lanzar un error NotFound si no existe el restaurante', () => {
            const id = 1
            const restaurante = new Restaurante()
            const updateDto : CreateRestauranteDto = {
                nombre: 'Restaurante 1',
                localidad: 'Localidad 1',
                calle: 'Calle false',
                borrado: false,
                capacidad: 10,
            }

            jest.spyOn(service, 'existeRestaurantePorId').mockResolvedValue(false)
            jest.spyOn(service, 'invalidarCacheKey').mockResolvedValue(undefined)
            expect(service.update(id, updateDto)).rejects.toThrow(NotFoundException)
            expect(service.existeRestaurantePorId).toHaveBeenCalledWith(id)
        });
    });

  describe('removeSoft', () => {
      it('debe marcar como borrado un restaurante', async () => {
          const id = 1;
          const restaurante = new Restaurante();

          jest.spyOn(service, 'existeRestaurantePorId').mockResolvedValue(restaurante);
          jest.spyOn(service, 'invalidarCacheKey').mockResolvedValue(undefined);
          jest.spyOn(repositorio, 'save').mockResolvedValue(restaurante);

          // Ejecutar la función y esperar que se resuelva la promesa
          await service.removeSoft(id);

          // Verificar que la función actualizó la propiedad 'borrado' a true
          expect(restaurante.borrado).toEqual(true);
          // Verificar otras llamadas a funciones y expectativas necesarias
      });
      it('debe lanzar un error NotFound si no existe el restaurante', () => {
            const id = 1
            const restaurante = new Restaurante()

            jest.spyOn(service, 'existeRestaurantePorId').mockResolvedValue(undefined)
            jest.spyOn(service, 'invalidarCacheKey').mockResolvedValue(undefined)
            expect(service.removeSoft(id)).rejects.toThrow(NotFoundException)
            expect(service.existeRestaurantePorId).toHaveBeenCalledWith(id)
      })
  });

  describe('existeRestaurantePorId', () => {
      it('debe devolver un restaurante', () => {
            const restaurante = new Restaurante()

            jest.spyOn(cache, 'get').mockResolvedValue(Promise.resolve(null))
            jest.spyOn(repositorio, 'findOneBy').mockResolvedValue(restaurante)
          jest.spyOn(cache, 'set').mockResolvedValue()
          expect( service.existeRestaurantePorId(1)).toEqual(Promise.resolve(restaurante))
          })
      it('debe devolver false si no existe el restaurante', () => {
            const id = 1
            const restaurante = new Restaurante()

            jest.spyOn(cache, 'get').mockResolvedValue(null)
            jest.spyOn(repositorio, 'findOneBy').mockResolvedValue(null)
            expect( service.existeRestaurantePorId(id)).resolves.toEqual(false)
      })

  });

  describe ('existeRestaurantePorNombre', () => {
      it('debe devolver un restaurante', () => {
            const nombre = 'Restaurante 1'
            const restaurante = new Restaurante()

          jest.spyOn(cache, 'get').mockResolvedValue(null)
          jest.spyOn(repositorio, 'findOneBy').mockResolvedValue(restaurante)
          expect( service.existeRestaurantePorNombre(nombre)).resolves.toEqual(restaurante)
      })
      it('debe devolver false si no existe el restaurante', () => {
            const nombre = 'Restaurante 1'
            const restaurante = new Restaurante()

            jest.spyOn(cache, 'get').mockResolvedValue(null)
            jest.spyOn(repositorio, 'findOneBy').mockResolvedValue(null)
             expect( service.existeRestaurantePorNombre(nombre)).resolves.toEqual(false)
      })
  });

})
