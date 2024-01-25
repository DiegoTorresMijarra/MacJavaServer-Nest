import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DataBaseConfigModule } from './config/data-base-config/data-base-config.module'
import { ClientesModule } from './rest/clientes/clientes.module'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, //para setearlo en todos los modulos
      envFilePath: '.env', //jugar con los config y los perfiles
      ignoreEnvFile: false,
    }),
    //bbdd con postgrest
    DataBaseConfigModule,
    CacheModule.register(),
    ClientesModule,
  ],
  providers: [],
})
export class AppModule {}