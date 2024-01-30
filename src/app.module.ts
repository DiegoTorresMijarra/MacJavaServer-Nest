import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DataBaseConfigModule } from './config/data-base-config/data-base-config.module'
import { TrabajadoresModule } from './rest/trabajadores/trabajadores.module'
import { PosicionesService } from './rest/posiciones/posiciones.service'
import { CacheModule } from '@nestjs/cache-manager'
import * as process from 'process'
import { NotificationsModule } from './notifications/notifications.module'
import { PosicionesModule } from './rest/posiciones/posiciones.module'
import { ClientesModule } from './rest/clientes/clientes.module'
import { CorsConfigModule } from './config/cors/cors.module'

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
    ClientesModule,
    //cache
    CacheModule.register(),
    //bbdd con postgrest
    CorsConfigModule,
    DataBaseConfigModule,
    //notifications
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
