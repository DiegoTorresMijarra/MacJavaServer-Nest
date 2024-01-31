import { Module } from '@nestjs/common'
import { ProveedoresService } from './proveedores.service'
import { ProveedoresController } from './proveedores.controller'
import { ProveedoresMapper } from './mappers/proveedores.mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Proveedor } from './entities/proveedores.entity'
import { Producto } from '../productos/entities/producto.entity'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Proveedor,
      //  /*Prueba*/ Producto
    ]),
    CacheModule.register(),
  ],
  controllers: [ProveedoresController],
  providers: [ProveedoresService, ProveedoresMapper],
})
export class ProveedoresModule {}
