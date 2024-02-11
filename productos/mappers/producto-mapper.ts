import { Injectable } from '@nestjs/common';
import { ProductoEntity } from '../entities/producto.entity';
import { plainToClass } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import { ResponseProductoDto } from '../dto/response-producto.dto';
import { ProductoNotificacionResponse } from '../../websockets/notifications/dto/producto-notificacion.dto';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { Proveedor } from '../../provedores/entities/proveedores.entity';

@Injectable()
export class ProductosMapper {
  toEntity(
    createProductoDto: CreateProductoDto,
    provedor: Proveedor,
  ): ProductoEntity {
    const productoEntity = plainToClass(ProductoEntity, createProductoDto);
    productoEntity.uuid = uuidv4(); // Asumiendo que se necesita un UUID
    productoEntity.proveedor = provedor;
    return productoEntity;
  }

  toResponseDto(productoEntity: ProductoEntity): ResponseProductoDto {
    const dto = plainToClass(ResponseProductoDto, productoEntity);
    if (productoEntity.proveedor && productoEntity.proveedor.nombre) {
      dto.proveedor = productoEntity.proveedor.nombre;
    } else {
      dto.proveedor = null;
    }
    return dto;
  }

  toNotificacionDto(
    productoEntity: ProductoEntity,
  ): ProductoNotificacionResponse {
    return plainToClass(ProductoNotificacionResponse, productoEntity);
  }
}
