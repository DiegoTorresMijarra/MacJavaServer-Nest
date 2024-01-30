import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoService } from './productos.service';
import { ProductosController } from './productos.controller';
import { ProductoEntity } from './entities/producto.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductoEntity]), // Registra ProductoEntity con TypeORM
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/productos',
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          callback(null, uniqueName);
        },
      }),
    }),
  ],
  controllers: [ProductosController],
  providers: [ProductoService],
})
export class ProductosModule {}
