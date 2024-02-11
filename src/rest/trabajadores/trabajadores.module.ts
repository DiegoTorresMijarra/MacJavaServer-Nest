import { Module } from '@nestjs/common'
import { TrabajadoresService } from './trabajadores.service'
import { TrabajadoresController } from './trabajadores.controller'
import { TrabajadorMapper } from './trabajadores-mapper/trabajador-mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Trabajador } from './entities/trabajadores.entity'
import { PosicionesModule } from '../posiciones/posiciones.module'
import { CacheModule } from '@nestjs/cache-manager'
import { NotificationsModule } from '../../notifications/notifications.module'
import { PosicionesService } from '../posiciones/posiciones.service'
import { Posicion } from '../posiciones/entities/posicion.entity'

@Module({
  controllers: [TrabajadoresController],
  providers: [TrabajadoresService, TrabajadorMapper],
  imports: [
    TypeOrmModule.forFeature([Trabajador, Posicion]),
    PosicionesModule,
    NotificationsModule,
    CacheModule.register(),
  ],
  exports: [TrabajadoresService, TrabajadorMapper],
})
export class TrabajadoresModule {}