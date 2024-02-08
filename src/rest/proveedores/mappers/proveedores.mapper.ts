import {CreateProveedoresDto} from "../dto/create-proveedores.dto";
import {Proveedor} from "../entities/proveedores.entity";
import {plainToClass} from "class-transformer";
import {Injectable} from "@nestjs/common";
import {UpdateProveedoresDto} from "../dto/update-proveedores.dto";

@Injectable()
export class ProveedoresMapper{
    toEntity(createProveedoresDto: CreateProveedoresDto | UpdateProveedoresDto){
        const entity = plainToClass(Proveedor, createProveedoresDto)
        return entity
    }
}