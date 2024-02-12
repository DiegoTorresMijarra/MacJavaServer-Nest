import { Test, TestingModule } from '@nestjs/testing'
import { ProveedoresMapper } from './proveedores.mapper'
import { CreateProveedoresDto } from '../dto/create-proveedores.dto'
import { Proveedor } from '../entities/proveedores.entity'
import { UpdateProveedoresDto } from '../dto/update-proveedores.dto'

describe('ProveedoresMapper', () => {
  let provider: ProveedoresMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProveedoresMapper],
    }).compile()

    provider = module.get<ProveedoresMapper>(ProveedoresMapper)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })

  describe('ProveedoresMapper', () => {
    let proveedoresMapper: ProveedoresMapper

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [ProveedoresMapper],
      }).compile()

      proveedoresMapper = module.get<ProveedoresMapper>(ProveedoresMapper)
    })

    it('should be defined', () => {
      expect(proveedoresMapper).toBeDefined()
    })

    it('Mapear CreateDto a Proveedor', () => {
      const createProveedoresDto: CreateProveedoresDto = {
        nombre: 'Pizza 4 Quesos',
        tipo: 'Pizzas',
        telefono: '690135540',
      }

      const expectedProveedor: Proveedor = {
        ...new Proveedor(),
        id: 1,
        nombre: 'Pizza 4 Quesos',
        tipo: 'Pizzas',
        telefono: '690135540',
        productos: [],
      }

      const actualProveedor: Proveedor =
        proveedoresMapper.toEntity(createProveedoresDto)

      expect(actualProveedor.nombre).toEqual(expectedProveedor.nombre)
    })

    it('Mapear UpdateDto a Proveedor', () => {
      const updateproveedoresDto: UpdateProveedoresDto = {
        nombre: 'Pizza 4 Quesos',
        tipo: 'Pizzas',
        telefono: '690135540',
        deleted: false,
      }

      const expectedProveedoresEntity: Proveedor = {
        ...new Proveedor(),
        id: 1,
        nombre: 'Pizza 4 Quesos',
        tipo: 'Pizzas',
        telefono: '690135540',
        productos: [],
      }

      const actualProveedor: Proveedor =
        proveedoresMapper.toEntity(updateproveedoresDto)

      expect(actualProveedor).toBeInstanceOf(Proveedor)

      expect(actualProveedor.nombre).toEqual(expectedProveedoresEntity.nombre)
    })
  })
})
