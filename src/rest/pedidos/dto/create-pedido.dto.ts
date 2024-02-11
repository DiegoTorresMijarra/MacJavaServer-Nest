import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsPositive,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

export class ProductosPedidosDto {
  @IsNotEmpty({
    message: 'El producto no puede estar vacío',
  })
  @IsPositive({
    message: 'La cantidad debe ser un número positivo mayor q 0',
  })
  @IsInt({ message: 'El id del producto debe ser un numero entero' })
  productoId: number

  @IsNotEmpty({
    message: 'La cantidad no puede estar vacía',
  })
  @Min(0, {
    message: 'La cantidad debe ser un número positivo; 0 incluido',
  })
  @IsInt({ message: 'La cantidad del producto debe ser un numero entero' })
  cantidad: number

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
  @IsNotEmpty({
    message: 'El idTrabajador no puede estar vacío',
  })
  @IsUUID(4, {
    message: 'El id del trabajador del pedido debe ser un UUID valido',
  })
  idTrabajador: string

  @IsNotEmpty({
    message: 'El idCliente no puede estar vacío',
  })
  @IsUUID(4, {
    message: 'El id del cliente del pedido debe ser un UUID valido',
  })
  idCliente: string

  @IsNotEmpty({ message: 'el idRestaurante no puede estar vacio' })
  @IsPositive({
    message: 'el idRestaurante debe ser un numero positivo mayor q 0',
  })
  @IsInt({ message: 'El idRestaurante del producto debe ser un numero entero' })
  idRestaurante: number
  /*
  @IsNotEmpty({
    message: 'El precio total del pedido no puede estar vacío',
  })
  @IsPositive({
    message: 'El precio total del pedido debe ser un numero positivo mayor q 0',
  })
  //  precioTotal: number
  // cantidadTotal: number

 */
  @IsNotEmpty({
    message: 'El pagado no puede estar vacío',
  })
  @IsBoolean({ message: 'El pagado debe ser un booleano' })
  pagado: boolean

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
