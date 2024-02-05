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

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto]),
    CacheModule.register(),
    NotificationsModule,
    StorageModule,
    /*
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const fileName: string = file.originalname.split('.')[0]
          const fileExtName: string = file.originalname.split('.')[1]
          cb(null, `${fileName}-${Date.now()}.${fileExtName}`)
        },
      }),
    }),

     */
  ],
  controllers: [ProductosController],
  providers: [ProductoService, ProductosMapper],
  exports: [ProductoService, ProductosMapper],
})
export class ProductosModule {}
