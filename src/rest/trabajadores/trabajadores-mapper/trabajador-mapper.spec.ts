import { Test, TestingModule } from '@nestjs/testing'
import { TrabajadorMapper } from './trabajador-mapper'
import { Posicion } from '../../posiciones/entities/posicion.entity'
import { CreateTrabajadorDto } from '../dto/create-trabajador.dto'
import { UpdateTrabajadorDto } from '../dto/update-trabajador.dto'
import { Trabajador } from '../entities/trabajadores.entity'

describe('TrabajadorMapper', () => {
  let provider: TrabajadorMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrabajadorMapper],
    }).compile()

    provider = module.get<TrabajadorMapper>(TrabajadorMapper)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })
  describe('TrabajadorMapperFunc', () => {
    let original: Trabajador
    let posicion: Posicion
    let nuevaPosicion: Posicion
    let createDto: CreateTrabajadorDto
    let updateDto: UpdateTrabajadorDto

    beforeEach(() => {
      posicion = {
        id: '00000000-0000-0000-0000-000000000001',
        nombre: 'CAMARERO',
        salario: 1500,
        created_at: new Date(),
        updated_at: new Date(),
        deleted: false,
        trabajadores: [],
      }

      nuevaPosicion = {
        id: '00000000-0000-0000-0000-000000000002',
        nombre: 'MANAGER',
        salario: 10000,
        created_at: new Date(),
        updated_at: new Date(),
        deleted: false,
        trabajadores: [],
      } as Posicion

      createDto = {
        dni: '12345678Z',
        nombre: 'Juan',
        apellido: 'González',
        edad: 30,
        telefono: '123456789',
        posicionNombre: 'LIMPIEZA',
      } as CreateTrabajadorDto

      updateDto = {
        dni: '0t',
        nombre: 'Juan',
        apellido: 'Martínez',
        edad: 35,
        telefono: '987654321',
        posicionNombre: 'COCINERO',
      } as UpdateTrabajadorDto

      original = {
        id: '00000000-0000-0000-0000-000000000002',
        dni: '87654321A',
        nombre: 'María',
        apellido: 'López',
        edad: 25,
        telefono: '987654321',
        created_at: new Date(),
        updated_at: new Date(),
        deleted: false,
        posicion: posicion,
      } as Trabajador
    })

    it('CreateToTrabajador', () => {
      const res = provider.createToTrabajador(createDto, posicion)

      expect(res.nombre).toEqual('Juan')
      expect(res.apellido).toEqual('González')
      expect(res.posicion.nombre).toEqual('CAMARERO')
      expect(typeof res).toEqual(typeof Trabajador.prototype)
    })

    it('UpdateToTrabajador returns correct when dto passed', () => {
      const res = provider.updateToTrabajador(
        original,
        updateDto,
        nuevaPosicion,
      )

      expect(res.nombre).toEqual('Juan')
      expect(res.apellido).toEqual('Martínez')
      expect(res.edad).toEqual(35)
      expect(res.telefono).toEqual('987654321')
      expect(res.posicion.nombre).toEqual(nuevaPosicion.nombre)
      expect(typeof res).toEqual(typeof Trabajador.prototype)
    })

    it('UpdateToTrabajador no parameters passed', () => {
      const dto = {} as UpdateTrabajadorDto
      const res = provider.updateToTrabajador(original, dto, undefined)

      expect(res).toEqual(original)
      expect(typeof res).toEqual(typeof Trabajador.prototype)
    })

    it('TrabajadorToResponse returns correct response', () => {
      const res = provider.trabajadorToResponse(original)

      expect(res.id).toEqual(original.id)
      expect(res.nombre).toEqual(original.nombre)
      expect(res.updated_at).toEqual(original.updated_at)
      expect(res.posicion).toEqual(original.posicion.nombre)
    })
  })
})
