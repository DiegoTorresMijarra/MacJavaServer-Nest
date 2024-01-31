import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity({ name: 'productos' })
export class ProductoEntity {
  public static IMAGE_DEFAULT = 'https://via.placeholder.com/150';
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  description: string;
  S;

  @Column({
    type: 'varchar',
    length: 100,
    default: ProductoEntity.IMAGE_DEFAULT,
  })
  imagen: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ type: 'int' })
  stock: number;

  @Column({ type: 'uuid' })
  uuid: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;
}
