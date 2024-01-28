import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Posicion } from '../../posiciones/entities/posicion.entity'

@Entity('trabajadores')
export class Trabajador {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'trabajadores_pk', //no creo q vaya a ser util en esta entidad en concreto, pero me parece una buena practica
  })
  id: string

  @Column({ type: 'character varying', unique: true })
  dni: string

  @Column({ type: 'character varying' })
  nombre: string

  @Column({ type: 'character varying' })
  apellido: string

  @Column({ type: 'int' })
  edad: number

  @Column({ type: 'character varying' })
  telefono: string

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date = new Date()

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date = new Date()

  @Column({ type: 'boolean', name: 'deleted', default: false })
  deleted: boolean = false

  @ManyToOne(() => Posicion, (posicion) => posicion.trabajadores)
  @JoinColumn({ name: 'posicion_id' })
  posicion: Posicion
}
