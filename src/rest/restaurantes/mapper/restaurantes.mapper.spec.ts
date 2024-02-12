import { RestaurantesMapper } from './restaurantes.mapper'
import { Test, TestingModule } from '@nestjs/testing'
import { CreateRestauranteDto } from '../dto/create-restaurante.dto'
import { Restaurante } from '../entities/restaurante.entity'

describe('RestaurantesMapper', () => {
  let mapper: RestaurantesMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RestaurantesMapper],
    }).compile()

    mapper = module.get<RestaurantesMapper>(RestaurantesMapper)
  })

  it('deberia estar definido', () => {
    expect(mapper).toBeDefined()
  })
  describe('createDtoToEntity', () => {
    it('deberia convertir un dto a una entidad', () => {
      const dto: CreateRestauranteDto = {
        nombre: 'Restaurante 1',
        calle: 'Calle 1',
        localidad: 'Localidad 1',
        borrado: false,
        capacidad: 100,
      }
      const entidad = mapper.createDtoToEntity(dto)
      expect(entidad).toBeDefined()
      expect(entidad.nombre).toEqual(dto.nombre.toLowerCase())
      expect(entidad.calle).toEqual(dto.calle.toLowerCase())
      expect(entidad.localidad).toEqual(dto.localidad.toLowerCase())
      expect(entidad.capacidad).toEqual(dto.capacidad)
    })
  })

  describe('createDtoToEntity2', () => {
    it('deberia convertir un dto a una entidad', () => {
      const dto: CreateRestauranteDto = {
        nombre: 'Restaurante 1',
        calle: 'Calle 1',
        localidad: 'Localidad 1',
        borrado: false,
        capacidad: 100,
      }
      const entidad = mapper.createDtoToEntity2(dto)
      expect(entidad).toBeDefined()
      expect(entidad.nombre).toEqual(dto.nombre.toLowerCase())
      expect(entidad.calle).toEqual(dto.calle.toLowerCase())
      expect(entidad.localidad).toEqual(dto.localidad.toLowerCase())
      expect(entidad.capacidad).toEqual(dto.capacidad)
    })
  })

  describe('updateDtoToEntity', () => {
    it('deberia actualizar una entidad con los datos de un dto', () => {
      const entidad: Restaurante = {
        ...new Restaurante(),
        id: 1,
        nombre: 'Restaurante 1',
        calle: 'Calle 1',
        localidad: 'Localidad 1',
        capacidad: 100,
      }
      const dto: CreateRestauranteDto = {
        nombre: 'Restaurante 2',
        calle: 'Calle 2',
        localidad: 'Localidad 2',
        borrado: true,
        capacidad: 200,
      }
      const entidad2 = mapper.updateDtoToEntity(dto, entidad)
      expect(entidad2).toBeDefined()
      expect(entidad2.id).toEqual(entidad.id)
      expect(entidad2.nombre).toEqual(dto.nombre.toLowerCase())
      expect(entidad2.calle).toEqual(dto.calle.toLowerCase())
      expect(entidad2.localidad).toEqual(dto.localidad.toLowerCase())
      expect(entidad2.capacidad).toEqual(dto.capacidad)
      expect(entidad2.borrado).toEqual(dto.borrado)
      expect(entidad2.creadoEn).toEqual(entidad.creadoEn)
    })
  })
})
