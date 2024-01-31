import { Module } from '@nestjs/common'
import { ProductosService } from './productos.service'
import { ProductosController } from './productos.controller'
import {TypeOrmModule} from "@nestjs/typeorm";
import {Producto} from "./entities/producto.entity";
import {Proveedores} from "../proveedores/entities/proveedores.entity";
import {ProductosMapper} from "./mappers/productos.mapper";

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Proveedores])],
  controllers: [ProductosController],
  providers: [ProductosService, ProductosMapper],
})
export class ProductosModule {}
