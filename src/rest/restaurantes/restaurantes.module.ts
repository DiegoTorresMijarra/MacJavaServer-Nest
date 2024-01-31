import { Module } from '@nestjs/common'
import { RestaurantesService } from './restaurantes.service'
import { RestaurantesController } from './restaurantes.controller'

@Module({
  controllers: [RestaurantesController],
  providers: [RestaurantesService],
})
export class RestaurantesModule {}
