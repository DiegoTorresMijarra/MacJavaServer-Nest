import { Module } from '@nestjs/common'
import { ProductosService } from './productos.service'
import { ProductosController } from './productos.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Producto } from './entities/producto.entity'
import { Proveedor } from '../proveedores/entities/proveedores.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Proveedor])],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule {}
