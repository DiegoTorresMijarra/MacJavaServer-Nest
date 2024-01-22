import { Module } from '@nestjs/common'
import { TrabajadoresService } from './trabajadores.service'
import { TrabajadoresController } from './trabajadores.controller'

@Module({
  controllers: [TrabajadoresController],
  providers: [TrabajadoresService],
})
export class TrabajadoresModule {}
