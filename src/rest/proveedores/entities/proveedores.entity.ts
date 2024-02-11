import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { Producto } from '../../productos/entities/producto.entity'

@Entity({ name: 'proveedores' })
export class Proveedor {
    public readonly CLASS_NAME = 'Proveedor'

    //Id por la poca cantidad de datos que tendra esta tabla
    // y porque solo usaremos una BD y no podran solaparse los id's
    @PrimaryGeneratedColumn()
    id: number
    @Column({ type: 'varchar', nullable: false })
    nombre: string
    @Column({ type: 'varchar', nullable: false })
    tipo: string
    @Column({ type: 'varchar', nullable: false, unique: true })
    telefono: string
    @CreateDateColumn({
        type: 'timestamp',
        name: 'created_at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date
    @UpdateDateColumn({
        type: 'timestamp',
        name: 'updated_at',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updated_at: Date
    @Column({ type: 'boolean', default: true })
    deleted: boolean

    @OneToMany(() => Producto, (producto) => producto.proveedor, {
        cascade: true,
    })
    productos: Producto[]
}