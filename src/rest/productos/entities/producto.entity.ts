import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Proveedores} from "../../proveedores/entities/proveedores.entity";

@Entity({name: 'productos'})
export class Producto {
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    nombre: string
    @Column()
    categoria: string
    @ManyToOne(() => Proveedores, (proveedor) => proveedor.productos, {onDelete: 'SET NULL', eager: true})
    @JoinColumn({name:'proveedor_id'})
    proveedor: Proveedores
}
