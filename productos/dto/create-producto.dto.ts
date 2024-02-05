import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductoDto {
  @ApiProperty({
    example: 'Solomillo',
    description: 'El nombre del producto',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100, { message: 'El nombre debe tener entre 3 y 100 caracteres' })
  nombre: string;

  @ApiProperty({
    example: 'Solomillo de ternera',
    description: 'La descripción del producto',
    minLength: 10,
    maxLength: 255,
  })
  @ApiProperty({
    example: 21.99,
    description: 'El precio del producto',
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'El precio debe ser mayor que 0' })
  precio: number;

  @ApiProperty({
    example: 10,
    description: 'El stock del producto',
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'El stock debe ser mayor que 0' })
  stock: number;

  @ApiProperty({
    example: 'https://example.com/imagen.jpg',
    description: 'La URL de la imagen del producto',
    required: false,
  })
  @IsOptional()
  @IsString()
  imagen?: string;

  @ApiProperty({
    example: 'bimbo',
    description: 'El id del proveedor',
    required: false,
  })
  @IsOptional()
  @IsString()
  proveedor?: string;
}
