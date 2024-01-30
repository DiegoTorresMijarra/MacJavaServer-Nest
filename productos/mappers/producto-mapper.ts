import { Injectable } from '@nestjs/common';
import { ProductoEntity } from '../entities/producto.entity';
import { plainToClass } from 'class-transformer';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { v4 as uuidv4 } from 'uuid';
import { ResponseProductoDto } from '../dto/response-producto.dto';
import { ProductoNotificacionResponse } from '../../websockets/notifications/dto/producto-notificacion.dto';

@Injectable()
export class ProductosMapper {
  toEntity(createProductoDto: CreateProductoDto): ProductoEntity {
    const productoEntity = plainToClass(ProductoEntity, createProductoDto);
    productoEntity.uuid = uuidv4(); // Asumiendo que se necesita un UUID
    return productoEntity;
  }

  toResponseDto(productoEntity: ProductoEntity): ResponseProductoDto {
    return plainToClass(ResponseProductoDto, productoEntity);
  }

  toNotificacionDto(
    productoEntity: ProductoEntity,
  ): ProductoNotificacionResponse {
    return plainToClass(ProductoNotificacionResponse, productoEntity);
  }
}
