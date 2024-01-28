import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DataBaseConfigModule } from './config/data-base-config/data-base-config.module'
import {RestaurantesModule} from "./rest/restaurantes/restaurantes.module";
import {CacheModule} from "@nestjs/common/cache";

@Module({
  controllers: [],
  providers: [],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, //para setearlo en todos los modulos
      envFilePath: '.env', //jugar con los config y los perfiles
      ignoreEnvFile: false,
    }),
    //bbdd con postgrest
    DataBaseConfigModule,
    CacheModule.register(),
    RestaurantesModule,
  ],
})
export class AppModule {}
