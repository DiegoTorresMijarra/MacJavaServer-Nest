import { Test, TestingModule } from '@nestjs/testing'
import { PosicionMapper } from './posicion-mapper'
import { CreatePosicionDto } from '../dto/create-posicion.dto'
import { UpdatePosicionDto } from '../dto/update-posicion.dto'
import { Posicion } from '../entities/posicion.entity'

describe('PosicionesMapper', () => {
  let provider: PosicionMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PosicionMapper],
    }).compile()

    provider = module.get<PosicionMapper>(PosicionMapper)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })
  describe('PosicionMapperFunc', () => {
    let original: Posicion // Declara las variables que necesitarás para las pruebas
    let createDto: CreatePosicionDto
    let updateDto: UpdatePosicionDto

    beforeEach(() => {
      original = {
        ...new Posicion(),
        id: '00000000-0000-0000-0000-000000000001',
        nombre: 'MANAGER',
        salario: 2000,
        trabajadores: [],
      }

      createDto = new CreatePosicionDto()
      createDto.nombre = 'COCINERO'
      createDto.salario = 1500

      updateDto = new UpdatePosicionDto()
      updateDto.nombre = 'CAMBIADO'
      updateDto.salario = 1800
    })

    it('CreateToPosicion', () => {
      const res = provider.createToPosicion(createDto)

      expect(res.nombre).toEqual('COCINERO')
      expect(res.salario).toEqual(1500)
      expect(typeof res).toEqual(typeof Posicion.prototype)
    })

    it('UpdateToPosicion returns correct when dto passed', () => {
      const res = provider.updateToPosicion(original, updateDto)

      expect(res.nombre).toEqual('CAMBIADO')
      expect(res.salario).toEqual(1800)
      expect(typeof res).toEqual(typeof Posicion.prototype)
    })
    it('UpdateToPosicion no parameters passed', () => {
      const res = provider.updateToPosicion(original, undefined)

      expect(res.nombre).toEqual(original.nombre)
      expect(res.salario).toEqual(original.salario)
      expect(typeof res).toEqual(typeof Posicion.prototype)
    })
  })
})
