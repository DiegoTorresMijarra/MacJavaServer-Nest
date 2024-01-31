import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import * as process from 'process'
import { Notification, NotificationTipo } from './models/notificacion.model'
import { Posicion } from '../rest/posiciones/entities/posicion.entity'
import { Trabajador } from '../rest/trabajadores/entities/trabajadores.entity'
import { Cliente } from '../rest/clientes/entities/cliente.entity'

const ENDPOINT: string = `/ws/${process.env.API_VERSION || 'v1'}/macjava`

@WebSocketGateway({
  namespace: ENDPOINT,
})
export class MacjavaNotificationsGateway {
  @WebSocketServer()
  private server: Server

  private readonly logger = new Logger(MacjavaNotificationsGateway.name)

  constructor() {
    this.logger.log(`MacjavaNotificationsGateway is listening on ${ENDPOINT}`)
  }

  sendMessage(notification: Notification<Posicion | Trabajador | Cliente>) {
    this.server.emit(
      `${notification.type}D_${notification.data.CLASS_NAME.toUpperCase()}`, //puede que valga con el name
      notification,
    )
  }

  @SubscribeMessage('UPDATED_POSICION')
  handleUpdatePosicion(client: Socket, data: any) {
    // Aquí puedes manejar la lógica para procesar la actualización del Posicion
    // y enviar la notificación a todos los clientes conectados
    const notification: Notification<Posicion> = {
      message: 'Se ha actualizado una posicion',
      type: NotificationTipo.UPDATE,
      data: data,
      createdAt: new Date(),
    }

    this.sendMessage(notification)
  }
  @SubscribeMessage('CREATED_POSICION')
  handleCreatePosicion(client: Socket, data: any) {
    const notification: Notification<Posicion> = {
      message: 'Se ha creado una Posicion',
      type: NotificationTipo.CREATE,
      data: data,
      createdAt: new Date(),
    }

    this.sendMessage(notification)
  }
  @SubscribeMessage('DELETED_POSICION')
  handleDeletePosicion(client: Socket, data: any) {
    const notification: Notification<Posicion> = {
      message: 'Se ha eliminado una Posicion',
      type: NotificationTipo.DELETE,
      data: data,
      createdAt: new Date(),
    }

    this.sendMessage(notification)
  }
  @SubscribeMessage('UPDATED_TRABAJADOR')
  handleUpdateTrabajador(client: Socket, data: any) {
    const notification: Notification<Posicion> = {
      message: 'Se ha actualizado un Trabajador',
      type: NotificationTipo.UPDATE,
      data: data,
      createdAt: new Date(),
    }

    this.sendMessage(notification)
  }
  @SubscribeMessage('CREATED_TRABAJADOR')
  handleCreateTrabajador(client: Socket, data: any) {
    const notification: Notification<Posicion> = {
      message: 'Se ha creado una Trabajador',
      type: NotificationTipo.CREATE,
      data: data,
      createdAt: new Date(),
    }

    this.sendMessage(notification)
  }
  @SubscribeMessage('DELETED_TRABAJADOR')
  handleDeleteTrabajador(client: Socket, data: any) {
    const notification: Notification<Posicion> = {
      message: 'Se ha eliminado una Trabajador',
      type: NotificationTipo.DELETE,
      data: data,
      createdAt: new Date(),
    }

    this.sendMessage(notification)
  }

  @SubscribeMessage('UPDATED_CLIENTE')
  handleUpdateCliente(client: Socket, data: any) {
    const notification: Notification<Cliente> = {
      message: 'Se ha actualizado un Cliente',
      type: NotificationTipo.UPDATE,
      data: data,
      createdAt: new Date(),
    }

    this.sendMessage(notification)
  }
  @SubscribeMessage('CREATED_CLIENTE')
  handleCreateCliente(client: Socket, data: any) {
    const notification: Notification<Cliente> = {
      message: 'Se ha creado una Cliente',
      type: NotificationTipo.CREATE,
      data: data,
      createdAt: new Date(),
    }

    this.sendMessage(notification)
  }
  @SubscribeMessage('DELETED_CLIENTE')
  handleDeleteCliente(client: Socket, data: any) {
    const notification: Notification<Cliente> = {
      message: 'Se ha eliminado una Cliente',
      type: NotificationTipo.DELETE,
      data: data,
      createdAt: new Date(),
    }

    this.sendMessage(notification)
  }
  private handleConnection(client: Socket) {
    // Este método se ejecutará cuando un cliente se conecte al WebSocket
    this.logger.debug('Cliente conectado:', client.id)
    this.server.emit(
      'connection',
      ' Notifications WS: Posiciones, Trabajadores - MacJava API NestJS',
    )
  }

  private handleDisconnect(client: Socket) {
    // Este método se ejecutará cuando un cliente se desconecte del WebSocket
    console.log('Cliente desconectado:', client.id)
    this.logger.debug('Cliente desconectado:', client.id)
  }
}
