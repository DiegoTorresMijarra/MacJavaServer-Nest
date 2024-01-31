import {ArrayNotEmpty, IsArray, IsNotEmpty, IsString, Length, Matches, NotContains} from "class-validator";
import {Producto} from "../../productos/entities/producto.entity";

export class CreateProveedoresDto {
    @IsNotEmpty({message: 'El nombre del proveedor no puede estar vacio'})
    @IsString({message: 'El nombre debe ser una cadena de caracteres'})
    @Length(3, 30, { message: 'El nombre debe tener entre 3 y 30 caracteres' })
    @NotContains(' ', {
        message: 'El nombre no puede contener espacios en blanco',
    })
    nombre: string
    @IsNotEmpty({message: 'El tipo de producto no puede estar vacio'})
    @IsString({message: 'El tipo debe ser una cadena de caracteres'})
    @Length(3, 30, { message: 'El tipo debe tener entre 3 y 30 caracteres' })
    @NotContains(' ', {
        message: 'El tipo no puede contener espacios en blanco',
    })
    tipo: string
    @IsNotEmpty({message: 'El telefono del proveedor no puede estar vacio'})
    @Matches(/^[679]\d{8}$/, { message: 'El teléfono debe empezar por 6, 7 o 9 y tener 9 dígitos en total' })
    tlf: string
}
