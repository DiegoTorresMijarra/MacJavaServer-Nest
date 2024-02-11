import {IsBoolean, IsNotEmpty, IsOptional, IsPositive, IsString, Length} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

/**
 * DTO para la creación de un restaurante
 * @export
 * @class CreateRestauranteDto
 *
 * @property {string} nombre - Nombre del restaurante
 * @property {string} calle - Calle del restaurante
 * @property {string} localidad - Localidad del restaurante
 * @property {number} capacidad - Capacidad del restaurante
 * @property {boolean} borrado - Indica si el restaurante ha sido borrado
 *
 */
export class CreateRestauranteDto {
    @ApiProperty({
        example: 'MacJava',
        description: 'Nombre del restaurante',
        minLength: 3,
        maxLength: 255,
    })
    @IsString({ message: 'El nombre debe ser un string' })
    @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
    @Length(3, 255, { message: 'El nombre debe tener entre $constraint1 y $constraint2 caracteres' })
    nombre: string;

    @ApiProperty({
        example: 'Calle de la piruleta',
        description: 'Calle del restaurante',
        minLength: 3,
        maxLength: 255,
    })
    @IsString({ message: 'La calle debe ser un string' })
    @IsNotEmpty({ message: 'La calle no puede estar vacía' })
    @Length(3, 255, { message: 'El nombre debe tener entre $constraint1 y $constraint2 caracteres' })
    calle: string;

    @ApiProperty({
        example: 'Madrid',
        description: 'Localidad del restaurante',
        minLength: 3,
        maxLength: 100,
    })
    @IsString({ message: 'La localidad debe ser un string' })
    @IsNotEmpty({ message: 'La localidad no puede estar vacía' })
    @Length(3, 255, { message: 'El nombre debe tener entre $constraint1 y $constraint2 caracteres' })
    localidad: string;

    @ApiProperty({
        example: 100,
        description: 'Capacidad del restaurante',
    })
    @IsPositive({ message: 'La capacidad debe ser un número positivo' })
    @IsNotEmpty({ message: 'La capacidad no puede estar vacía' })
    @IsOptional()
    capacidad: number;

    @ApiProperty({
        example: false,
        description: 'Indica si el estado del restaurante es borrado o no',
    })
    @IsBoolean({ message: 'El borrado debe ser un booleano' })
    @IsOptional()
    borrado: boolean;

}
