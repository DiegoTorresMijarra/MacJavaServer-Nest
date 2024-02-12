import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Proveedor } from '../../proveedores/entities/proveedores.entity'
@Entity({ name: 'productos' })
export class Producto {
  public static IMAGE_DEFAULT = 'https://via.placeholder.com/150'
  public readonly CLASS_NAME = 'Producto'

  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @Column({ type: 'varchar', length: 100 })
  nombre: string

  @Column({ type: 'varchar', length: 100 })
  description: string

  @Column({
    type: 'varchar',
    length: 100,
    default: Producto.IMAGE_DEFAULT,
  })
  imagen: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number

  @Column({ type: 'int' })
  stock: number

  @Column({ type: 'uuid' })
  uuid: string

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date
  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.productos, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor
}
