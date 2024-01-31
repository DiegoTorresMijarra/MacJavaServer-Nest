import {CreateProveedoresDto} from "../dto/create-proveedores.dto";
import {Proveedores} from "../entities/proveedores.entity";
import {plainToClass} from "class-transformer";
import {Injectable} from "@nestjs/common";
import {UpdateProveedoresDto} from "../dto/update-proveedores.dto";

@Injectable()
export class ProveedoresMapper{
    toEntity(createProveedoresDto: CreateProveedoresDto | UpdateProveedoresDto){
        const entity = plainToClass(Proveedores, createProveedoresDto)
        return entity
    }
}