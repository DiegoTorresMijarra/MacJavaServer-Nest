import { Injectable } from '@nestjs/common'
import { Producto } from '../entities/producto.entity'
import { plainToClass } from 'class-transformer'
import { CreateProductoDto } from '../dto/create-producto.dto'
import { ResponseProductoDto } from '../dto/response-producto.dto'
import { Proveedor } from '../../proveedores/entities/proveedores.entity'

@Injectable()
export class ProductosMapper {
  toEntity(dto: CreateProductoDto, proveedor: Proveedor): Producto {
    return {
      ...new Producto(),
      ...dto,
      proveedor: proveedor,
    }
  }

  toResponseDto(productoEntity: Producto): ResponseProductoDto {
    const dto = plainToClass(ResponseProductoDto, productoEntity)
    if (productoEntity.proveedor && productoEntity.proveedor.nombre) {
      dto.proveedor = productoEntity.proveedor.nombre
    } else {
      dto.proveedor = null
    }
    return dto
  }
}
