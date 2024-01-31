import { Module } from '@nestjs/common'
import { RestaurantesService } from './restaurantes.service'
import { RestaurantesController } from './restaurantes.controller'
import {Restaurante} from "./entities/restaurante.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {RestaurantesMapper} from "./mapper/restaurantes.mapper";
import {CacheModule} from "@nestjs/cache-manager";

@Module({
  imports: [TypeOrmModule.forFeature([Restaurante]), CacheModule.register(),],
  controllers: [RestaurantesController],
  providers: [RestaurantesService, RestaurantesMapper],
})
export class RestaurantesModule {}
