import { PartialType } from '@nestjs/mapped-types'
import { CreatePedidoDto, ProductosPedidosDto } from './create-pedido.dto'

export class UpdatePedidoDto extends PartialType(CreatePedidoDto) {
  idTrabajador?: string
  idCliente?: string
  idRestaurante?: number
  // precioTotal?: number
  // cantidadTotal?: number
  pagado?: boolean
  productosPedidos?: ProductosPedidosDto[]
}
