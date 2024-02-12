import { Injectable } from '@nestjs/common'
import { CreatePedidoDto } from '../dto/create-pedido.dto'
import { Pedido, ProductosPedidos } from '../schemas/pedido.schema'
import { UpdatePedidoDto } from '../dto/update-pedido.dto'

@Injectable()
export class PedidosMapper {
  createToPedido(
    dto: CreatePedidoDto,
    cantidadTotal: number,
    precioTotal: number,
    productosPedidos: ProductosPedidos[],
  ): Pedido {
    return {
      ...new Pedido(),
      ...dto,
      cantidadTotal: cantidadTotal,
      precioTotal: precioTotal,
      productosPedidos: productosPedidos,
    }
  }
  updateToPedido(
    original: Pedido,
    dto: UpdatePedidoDto,
    cantidadTotal?: number,
    precioTotal?: number,
    productosPedidos?: ProductosPedidos[],
  ): Pedido {
    // const  updatePP: boolean = cantidadTotal && precioTotal && productosPedidos
    let updatePP: boolean = false
    if (cantidadTotal && precioTotal && productosPedidos) {
      updatePP = true
    }
    return {
      ...original,
      ...dto,
      productosPedidos: updatePP ? productosPedidos : original.productosPedidos,
      precioTotal: updatePP ? precioTotal : original.precioTotal,
      cantidadTotal: updatePP ? cantidadTotal : original.cantidadTotal,
      updatedAt: new Date(),
      // id: original.id,
    }
  }
}
