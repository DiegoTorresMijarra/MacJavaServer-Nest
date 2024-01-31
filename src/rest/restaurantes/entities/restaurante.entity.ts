import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity('restaurantes')
export class Restaurante {
    @PrimaryGeneratedColumn({type: 'bigint', name : 'id'})
    id: number;

    @Column({type: 'varchar', length: 100, name: 'nombre', nullable: false, unique: true})
    nombre: string;

    @Column({type: 'varchar', length: 255, name: 'calle'})
    calle: string;

    @Column({type: 'varchar', length: 100, name: 'localidad'})
    localidad: string;

    @Column({type: 'int', name: 'capacidad'})
    capacidad: number;

    @Column({type: 'boolean', name: 'borrado', default: false})
    borrado: boolean;

    @CreateDateColumn({
        type: 'timestamp',
        name: 'creado_en',
        default: () => 'CURRENT_TIMESTAMP'
    })
    creadoEn: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        name: 'actualizado_en',
        default: () => 'CURRENT_TIMESTAMP'
    })
    actualizadoEn: Date;


    //trabajadores: Trabajadores [];
}
