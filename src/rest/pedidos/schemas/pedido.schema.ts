import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import { Document } from 'typeorm'
import { UUID } from 'typeorm/driver/mongodb/bson.typings'

export class ProductosPedidos {
  @Prop({
    type: BigInt,
    required: true,
  })
  productoId: number

  @Prop({
    type: Number,
    required: true,
  })
  cantidad: number

  @Prop({
    type: Number,
    required: true,
  })
  precioProducto: number

  @Prop({
    type: Number,
    required: true,
  })
  precioTotal: number
}
export type PedidoDocument = Pedido & Document

@Schema({
  collection: 'pedidos',
  timestamps: false,
  versionKey: false,
  id: true,
  toJSON: {
    virtuals: true,
    // Aquí añadimos el método toJSON
    transform: (doc, ret) => {
      delete ret.__v // Eliminamos el campo __v
      ret.id = ret._id // Mapeamos el _id a id
      delete ret._id // Eliminamos el _id
      delete ret._class // Esto es por si usamos discriminadores
    },
  },
})
export class Pedido {
  @Prop({
    type: String,
    required: true,
    length: 36,
  })
  idTrabajador: string

  @Prop({
    type: String,
    required: true,
    length: 36,
  })
  idCliente: string

  @Prop({
    type: Number,
    required: true,
  })
  idRestaurante: number

  @Prop({
    type: Number,
    required: true,
  })
  precioTotal: number

  @Prop({
    type: Number,
    required: true,
  })
  cantidadTotal: number

  @Prop({
    type: Boolean,
    required: true,
  })
  pagado: boolean

  @Prop({
    required: true,
  })
  productosPedidos: ProductosPedidos[]

  @Prop({ default: Date.now })
  createdAt: Date = new Date()

  @Prop({ default: Date.now })
  updatedAt: Date = new Date()

  @Prop({
    type: Boolean,
    required: true,
  })
  deleted: boolean = false
}

export const PedidoSchema = SchemaFactory.createForClass(Pedido)
PedidoSchema.plugin(mongoosePaginate)
