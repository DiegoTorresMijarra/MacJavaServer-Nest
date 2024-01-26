import { Module } from '@nestjs/common'
import { PosicionesService } from './posiciones.service'
import { PosicionesController } from './posiciones.controller'
import { PosicionMapper } from './posiciones-mapper/posicion-mapper'
import { Posicion } from './entities/posicion.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NotificationsModule } from '../../notifications/notifications.module'
import { CacheModule } from '@nestjs/cache-manager'
@Module({
  controllers: [PosicionesController],
  providers: [PosicionesService, PosicionMapper],
  imports: [
    TypeOrmModule.forFeature([Posicion]),
    NotificationsModule,
    CacheModule.register(),
  ],
  exports: [PosicionesModule],
})
export class PosicionesModule {}
