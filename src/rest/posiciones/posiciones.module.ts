import { Module } from '@nestjs/common'
import { PosicionesService } from './posiciones.service'
import { PosicionesController } from './posiciones.controller'
import { PosicionMapper } from './posiciones-mapper/posicion-mapper'

@Module({
  controllers: [PosicionesController],
  providers: [PosicionesService, PosicionMapper],
})
export class PosicionesModule {}
