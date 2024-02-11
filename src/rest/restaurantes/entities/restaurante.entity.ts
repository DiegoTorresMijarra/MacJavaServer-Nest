import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

/**
 * Clase que representa la entidad de Restaurante
 * @export
 * @class Restaurante
 *
 * @property {number} id - Identificador del restaurante
 * @property {string} nombre - Nombre del restaurante
 * @property {string} calle - Calle del restaurante
 * @property {string} localidad - Localidad del restaurante
 * @property {number} capacidad - Capacidad del restaurante
 * @property {boolean} borrado - Indica si el restaurante ha sido borrado
 * @property {Date} creadoEn - Fecha de creación del restaurante
 * @property {Date} actualizadoEn - Fecha de actualización del restaurante
 *
 */
@Entity('restaurantes')
export class Restaurante {
    public readonly CLASS_NAME = 'Restaurante';

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
    borrado: boolean = false;

    @CreateDateColumn({
        type: 'timestamp',
        name: 'creado_en',
        default: () => 'CURRENT_TIMESTAMP'
    })
    creadoEn: Date = new Date();

    @UpdateDateColumn({
        type: 'timestamp',
        name: 'actualizado_en',
        default: () => 'CURRENT_TIMESTAMP'
    })
    actualizadoEn: Date = new Date()


    //trabajadores: Trabajadores [];
}
