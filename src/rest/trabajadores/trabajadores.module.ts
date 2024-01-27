import { Module } from '@nestjs/common'
import { TrabajadoresService } from './trabajadores.service'
import { TrabajadoresController } from './trabajadores.controller'
import { TrabajadorMapper } from './trabajadores-mapper/trabajador-mapper'

@Module({
  controllers: [TrabajadoresController],
  providers: [TrabajadoresService, TrabajadorMapper],
})
export class TrabajadoresModule {}
