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
  OTROS = 'OTROS',
  'NO_ASIGNADO' = 'NO_ASIGNADO',
}
@Entity('posiciones')
export class Posicion {
  public readonly CLASS_NAME = 'Posicion'

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'posicion_pk',
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
    type: 'numeric',
    precision: 2,
  })
  salario: number

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date = new Date()

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at: Date = new Date()

  @Column({ type: 'boolean', name: 'deleted', default: false })
  deleted: boolean = false

  @OneToMany(() => Trabajador, (trabajador) => trabajador.posicion)
  trabajadores: Trabajador[]
}
