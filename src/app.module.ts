import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DataBaseConfigModule } from './config/data-base-config/data-base-config.module'
import { TrabajadoresModule } from './rest/trabajadores/trabajadores.module'
import { RestaurantesModule } from './rest/restaurantes/restaurantes.module'
import { CacheModule } from '@nestjs/cache-manager'
import { NotificationsModule } from './notifications/notifications.module'
import { PosicionesModule } from './rest/posiciones/posiciones.module'
import { ClientesModule } from './rest/clientes/clientes.module'
import { CorsConfigModule } from './config/cors/cors.module'
import { ProveedoresModule } from './rest/proveedores/proveedores.module'
import { ProductosModule } from './rest/productos/productos.module'
import { LocaleConfigModule } from './config/locale-config/locale-config.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, //para setearlo en todos los modulos
      envFilePath: '.env', //jugar con los config y los perfiles
      ignoreEnvFile: false,
    }),
    //locale config
    LocaleConfigModule,
    //entities
    TrabajadoresModule,
    PosicionesModule,
    ClientesModule,
    ProveedoresModule,
    ProductosModule,
    RestaurantesModule,
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
