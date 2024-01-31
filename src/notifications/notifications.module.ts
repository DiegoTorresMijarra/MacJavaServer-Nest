import { Module } from '@nestjs/common'
import { MacjavaNotificationsGateway } from './macjava-notifications.gateway'

@Module({
  providers: [MacjavaNotificationsGateway],
  exports: [MacjavaNotificationsGateway],
})
export class NotificationsModule {}
