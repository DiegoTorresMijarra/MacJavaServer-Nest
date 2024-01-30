import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('clientes')
export class Cliente {
  public static IMAGE_DEFAULT = 'https://via.placeholder.com/150'
  @PrimaryColumn({ type: 'uuid' })
  id: string
  @Column({ type: 'varchar', length: 9, unique: true })
  dni: string
  @Column({ type: 'varchar', length: 255 })
  nombre: string
  @Column({ type: 'varchar', length: 255 })
  apellido: string
  @Column({ type: 'integer' })
  edad: number
  @Column({ type: 'varchar', length: 20 })
  telefono: string
  @Column({ type: 'text', default: Cliente.IMAGE_DEFAULT })
  imagen: string
  @Column({ type: 'boolean', default: false })
  deleted: boolean
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date
}
