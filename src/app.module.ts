import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DataBaseConfigModule } from './config/data-base-config/data-base-config.module'
import {RestaurantesModule} from "./rest/restaurantes/restaurantes.module";
import { CacheModule } from '@nestjs/cache-manager'
import { TrabajadoresModule } from './rest/trabajadores/trabajadores.module'
import { NotificationsModule } from './notifications/notifications.module'
import { PosicionesModule } from './rest/posiciones/posiciones.module'
import * as process from 'process'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, //para setearlo en todos los modulos
      envFilePath: '.env', //jugar con los config y los perfiles
      ignoreEnvFile: false,
    }),
    //entities
    TrabajadoresModule,
    PosicionesModule,
    RestaurantesModule,
    //cache
    CacheModule.register(),
    //bbdd con postgrest
    DataBaseConfigModule,
    //notifications
    NotificationsModule,
  ],

})
export class AppModule {}
