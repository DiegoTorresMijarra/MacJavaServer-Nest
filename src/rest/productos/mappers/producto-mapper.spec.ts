import { Test, TestingModule } from '@nestjs/testing'
import { CreateProductoDto } from '../dto/create-producto.dto'
import { ResponseProductoDto } from '../dto/response-producto.dto'
import { Proveedor } from '../../proveedores/entities/proveedores.entity'
import { Producto } from '../entities/producto.entity'
import { ProductosMapper } from './producto-mapper'

describe('ProductosMapper', () => {
  let mapper: ProductosMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductosMapper],
    }).compile()

    mapper = module.get<ProductosMapper>(ProductosMapper)
  })

  describe('toEntity', () => {
    it('should map CreateProductoDto to Producto entity', () => {
      const createDto: CreateProductoDto = {
        nombre: 'Test Product',
        precio: 10,
        stock: 100,
        proveedor: 'Bimbo',
      }
      const proveedor: Proveedor = {
        ...new Proveedor(),
        id: 1,
        nombre: 'Bimbo',
      }

      const result = mapper.toEntity(createDto, proveedor)

      expect(result.nombre).toBe(createDto.nombre)
      expect(result.precio).toBe(createDto.precio)
      expect(result.stock).toBe(createDto.stock)
      expect(result.proveedor).toBe(proveedor)
    })
  })

  describe('toResponseDto', () => {
    it('should map Producto entity to ResponseProductoDto', () => {
      const productoEntity: Producto = {
        ...new Producto(),
        id: 1,
        nombre: 'Test Product',
        precio: 10,
        stock: 100,
        proveedor: {
          ...new Proveedor(),
          id: 1,
          nombre: 'Bimbo',
        },
      }

      const result = mapper.toResponseDto(productoEntity)

      expect(result).toBeInstanceOf(ResponseProductoDto)
      expect(result.id).toBe(productoEntity.id)
      expect(result.nombre).toBe(productoEntity.nombre)
      expect(result.precio).toBe(productoEntity.precio)
      expect(result.stock).toBe(productoEntity.stock)
      expect(result.proveedor).toBe(productoEntity.proveedor.nombre)
    })
  })
})
