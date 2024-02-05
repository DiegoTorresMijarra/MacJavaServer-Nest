import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoService } from './productos.service';
import { ProductosController } from './productos.controller';
import { ProductoEntity } from './entities/producto.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductoEntity]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const fileName: string = file.originalname.split('.')[0];
          const fileExtName: string = file.originalname.split('.')[1];
          cb(null, `${fileName}-${Date.now()}.${fileExtName}`);
        },
      }),
    }),
  ],
  controllers: [ProductosController],
  providers: [ProductoService, DataSource],
})
export class ProductosModule {}
