import { Module } from '@nestjs/common'
import {DataBaseConfigModule} from "./config/data-base-config/data-base-config.module";
import {ProveedoresModule} from "./rest/proveedores/proveedores.module";
import {CacheModule} from "@nestjs/cache-manager";
import {ConfigModule} from "@nestjs/config";
import {ProductosModule} from "./rest/productos/productos.module";

@Module({
  imports: [
      ConfigModule.forRoot(),
      DataBaseConfigModule,
      CacheModule.register(),
      ProveedoresModule,
      ProductosModule
  ]
})
export class AppModule {}
