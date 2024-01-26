import { IsUUID } from 'class-validator'
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Trabajador } from '../../trabajadores/entities/trabajadores.entity'

export enum PosicionesValidas {
  MANAGER = 'MANAGER',
  COCINERO = 'COCINERO',
  LIMPIEZA = 'LIMPIEZA',
  CAMARERO = 'CAMARERO',
  'NO_ASIGNADO' = 'NO_ASIGNADO',
}
@Entity('posiciones')
export class Posicion {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_Category',
  })
  @IsUUID(5, {
    message: 'El id debe ser un UUID',
  })
  id: string

  @Column({
    type: 'character varying',
    unique: true,
    nullable: false,
    name: 'nombre',
  })
  nombre: string

  @Column({
    type: 'decimal',
    precision: 2,
  })
  salario: number

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date = new Date()

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date = new Date()

  @Column({ type: 'boolean', name: 'deleted', default: false })
  deleted: boolean = false

  @OneToMany(() => Trabajador, (trabajador) => trabajador.posicion)
  trabajadores: Trabajador[]
}
