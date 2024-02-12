import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProductoService } from './productos.service'
import { ProductosController } from './productos.controller'
import { Producto } from './entities/producto.entity'
import { MulterModule } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { NotificationsModule } from '../../notifications/notifications.module'
import { StorageModule } from '../storage/storage.module'
import { CacheModule } from '@nestjs/cache-manager'
import { ProductosMapper } from './mappers/producto-mapper'
import { Proveedor } from '../proveedores/entities/proveedores.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, Proveedor]),
    CacheModule.register(),
    NotificationsModule,
    StorageModule,
  ],
  controllers: [ProductosController],
  providers: [ProductoService, ProductosMapper],
  exports: [ProductoService, ProductosMapper],
})
export class ProductosModule {}
