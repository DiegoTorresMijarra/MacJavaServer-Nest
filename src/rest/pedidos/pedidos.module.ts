import { Module } from '@nestjs/common'
import { PedidosService } from './pedidos.service'
import { PedidosController } from './pedidos.controller'
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose'
import { Pedido } from './schemas/pedido.schema'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import { CacheModule } from '@nestjs/cache-manager'
import { RestaurantesModule } from '../restaurantes/restaurantes.module'
import { ClientesModule } from '../clientes/clientes.module'
import { TrabajadoresModule } from '../trabajadores/trabajadores.module'
import { NotificationsModule } from '../../notifications/notifications.module'
import { PedidosMapper } from './pedidos-mapper/pedidos-mapper'
import { ProductosModule } from '../productos/productos.module'
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Pedido.name,
        useFactory: () => {
          const schema = SchemaFactory.createForClass(Pedido)
          schema.plugin(mongoosePaginate)
          return schema
        },
      },
    ]),
    //cache
    CacheModule.register(),
    //ws
    NotificationsModule,
    //modulos necesarios:
    RestaurantesModule,
    ClientesModule,
    TrabajadoresModule,
    ProductosModule,
  ],
  controllers: [PedidosController],
  providers: [PedidosService, PedidosMapper],
  exports: [PedidosService],
})
export class PedidosModule {}
