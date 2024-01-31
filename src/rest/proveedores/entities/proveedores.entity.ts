import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm"
import {Producto} from "../../productos/entities/producto.entity";

@Entity({name: 'proveedores'})
export class Proveedores {
    //Id por la poca cantidad de datos que tendra esta tabla
    // y porque solo usaremos una BD y no podran solaparse los id's
    @PrimaryGeneratedColumn()
    id: number
    @Column({type: 'varchar', nullable: false})
    nombre: string
    @Column({type: 'varchar', nullable: false})
    tipo: string
    @Column({type: 'varchar', nullable: false, unique: true})
    tlf: string
    @CreateDateColumn({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',})
    fechaCre: Date
    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    fechaUp: Date
    @Column({type: 'boolean', default: true})
    isActive: boolean = true
    @OneToMany(() => Producto, (producto) => producto.proveedor, {cascade: true})
    productos: Producto[]
}
