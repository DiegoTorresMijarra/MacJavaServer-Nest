import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class ProductosPedidosDto {
  @ApiProperty({
    example: 1,
    description: 'Id del producto',
  })
  @IsNotEmpty({
    message: 'El producto no puede estar vacío',
  })
  @IsPositive({
    message: 'La cantidad debe ser un número positivo mayor q 0',
  })
  @IsInt({ message: 'El id del producto debe ser un numero entero' })
  productoId: number

  @ApiProperty({
    example: 1,
    description: 'Cantidad del producto',
  })
  @IsNotEmpty({
    message: 'La cantidad no puede estar vacía',
  })
  @Min(0, {
    message: 'La cantidad debe ser un número positivo; 0 incluido',
  })
  @IsInt({ message: 'La cantidad del producto debe ser un numero entero' })
  cantidad: number

  @ApiProperty({
    example: 1.0,
    description: 'Precio del producto',
  })
  @IsNotEmpty({
    message: 'El precio del producto no puede estar vacío',
  })
  @IsPositive({
    message: 'El precio del producto debe ser un número positivo mayor q 0',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'El precio del producto debe ser un número com max dos decimales',
    },
  )
  precioProducto: number
  //precioTotal: number
}
export class CreatePedidoDto {
  @ApiProperty({
    example: 'c9fd1562-3396-46b3-9fd2-88acdb5c26fd',
    description: 'Id del trabajador',
  })
  @IsNotEmpty({
    message: 'El idTrabajador no puede estar vacío',
  })
  @IsUUID(4, {
    message: 'El id del trabajador del pedido debe ser un UUID valido',
  })
  idTrabajador: string

  @ApiProperty({
    example: '1bc0640d-e02f-455c-bc16-793c81fd0e17',
    description: 'Id del cliente',
  })
  @IsNotEmpty({
    message: 'El idCliente no puede estar vacío',
  })
  @IsUUID(4, {
    message: 'El id del cliente del pedido debe ser un UUID valido',
  })
  idCliente: string

  @ApiProperty({
    example: 1,
    description: 'Id del restaurante',
  })
  @IsNotEmpty({ message: 'el idRestaurante no puede estar vacio' })
  @IsPositive({
    message: 'el idRestaurante debe ser un numero positivo mayor q 0',
  })
  @IsInt({ message: 'El idRestaurante del producto debe ser un numero entero' })
  idRestaurante: number

  @ApiProperty({
    example: false,
    description: 'Si el producto esta borrado',
  })
  @IsNotEmpty({
    message: 'El pagado no puede estar vacío',
  })
  @IsBoolean({ message: 'El pagado debe ser un booleano' })
  pagado: boolean

  @ApiProperty({
    description: 'Array con los productos pedidos',
    type: ProductosPedidosDto,
  })
  @IsNotEmpty({
    message: 'debe haber algun producto pedido',
  })
  @IsArray({
    message: 'Los productos pedidos debe ser un array',
  })
  @ValidateNested({
    message: 'Cada producto pedido debe ser valido',
  })
  @Type(() => ProductosPedidosDto)
  productosPedidos: ProductosPedidosDto[]
}
