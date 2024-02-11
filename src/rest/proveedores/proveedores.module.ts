import { Module } from '@nestjs/common'
import { ProveedoresService } from './proveedores.service'
import { ProveedoresController } from './proveedores.controller'
import { ProveedoresMapper } from './mappers/proveedores.mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Proveedor } from './entities/proveedores.entity'
import { CacheModule } from '@nestjs/cache-manager'
import { MacjavaNotificationsGateway } from '../../notifications/macjava-notifications.gateway'

@Module({
  imports: [TypeOrmModule.forFeature([Proveedor]), CacheModule.register()],
  controllers: [ProveedoresController],
  providers: [
    ProveedoresService,
    ProveedoresMapper,
    MacjavaNotificationsGateway,
  ],
})
export class ProveedoresModule {}
