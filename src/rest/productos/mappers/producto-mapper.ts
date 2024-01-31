import { Injectable } from '@nestjs/common'
import { Producto } from '../entities/producto.entity'
import { plainToClass } from 'class-transformer'
import { CreateProductoDto } from '../dto/create-producto.dto'
import { v4 as uuidv4 } from 'uuid'
import { ResponseProductoDto } from '../dto/response-producto.dto'

@Injectable()
export class ProductosMapper {
  toEntity(createProductoDto: CreateProductoDto): Producto {
    const productoEntity = plainToClass(Producto, createProductoDto)
    productoEntity.uuid = uuidv4() // Asumiendo que se necesita un UUID
    return productoEntity
  }

  toResponseDto(productoEntity: Producto): ResponseProductoDto {
    return plainToClass(ResponseProductoDto, productoEntity)
  }
}
