import { PartialType } from '@nestjs/mapped-types'
import { CreatePedidoDto, ProductosPedidosDto } from './create-pedido.dto'
import { ApiProperty } from '@nestjs/swagger'

export class UpdatePedidoDto extends PartialType(CreatePedidoDto) {
  @ApiProperty({
    example: 'c9fd1562-3396-46b3-9fd2-88acdb5c26fd',
    description: 'Id del trabajador',
  })
  idTrabajador?: string

  @ApiProperty({
    example: '1bc0640d-e02f-455c-bc16-793c81fd0e17',
    description: 'Id del cliente',
  })
  idCliente?: string

  @ApiProperty({
    example: 1,
    description: 'Id del restaurante',
  })
  idRestaurante?: number

  @ApiProperty({
    example: false,
    description: 'Si el producto esta borrado',
  })
  pagado?: boolean

  @ApiProperty({
    description: 'Array con los productos pedidos',
    type: ProductosPedidosDto,
  })
  productosPedidos?: ProductosPedidosDto[]
}
