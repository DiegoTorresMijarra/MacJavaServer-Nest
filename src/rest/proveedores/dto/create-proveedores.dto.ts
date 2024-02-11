import {ArrayNotEmpty, IsArray, IsNotEmpty, IsString, Length, Matches, NotContains} from "class-validator";
import {Producto} from "../../productos/entities/producto.entity";
import {ApiProperty} from "@nestjs/swagger";

export class CreateProveedoresDto {
    @ApiProperty({
        example: 'WayuRetamar',
        description: 'Nombre del proveedor',
        minLength: 3,
        maxLength: 30,
    })
    @IsNotEmpty({message: 'El nombre del proveedor no puede estar vacio'})
    @IsString({message: 'El nombre debe ser una cadena de caracteres'})
    @Length(3, 30, { message: 'El nombre debe tener entre 3 y 30 caracteres' })
    @NotContains(' ', {
        message: 'El nombre no puede contener espacios en blanco',
    })
    nombre: string

    @ApiProperty({
        example: 'Carnes',
        description: 'Tipo de  producto que provee',
        minLength: 3,
        maxLength: 30,
    })
    @IsNotEmpty({message: 'El tipo de producto no puede estar vacio'})
    @IsString({message: 'El tipo debe ser una cadena de caracteres'})
    @Length(3, 30, { message: 'El tipo debe tener entre 3 y 30 caracteres' })
    @NotContains(' ', {
        message: 'El tipo no puede contener espacios en blanco',
    })
    tipo: string

    @ApiProperty({
        example: '690143372',
        description: 'Telefono del proveedor',
    })
    @IsNotEmpty({message: 'El telefono del proveedor no puede estar vacio'})
    @IsMobilePhone(
    LocaleConfigModule.LOCALE_MOBILE,
    {},
    { message: 'El telefono debe ser un telefono movil valido' },
  )
    telefono: string
}
