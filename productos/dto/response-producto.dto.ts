import { ApiProperty } from '@nestjs/swagger';

export class ResponseProductoDto {
  @ApiProperty({ example: 1, description: 'Identificador único del producto' })
  id: number;

  @ApiProperty({ example: 'Solomillo', description: 'Nombre del producto' })
  nombre: string;

  @ApiProperty({
    example: 'Solomillo de ternera',
    description: 'Descripción del producto',
  })
  description: string;

  @ApiProperty({ example: 21.99, description: 'Precio del producto' })
  precio: number;

  @ApiProperty({ example: 10, description: 'Stock del producto' })
  stock: number;

  @ApiProperty({
    example: 'https://via.placeholder.com/150',
    description: 'Imagen del producto',
  })
  imagen: string;
  @ApiProperty({ example: 'jwst223', description: 'UUID único del producto' })
  uuid: string;

  @ApiProperty({
    example: '2023-09-01T12:34:56Z',
    description: 'Fecha y hora de creación del producto',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-09-02T10:20:30Z',
    description: 'Fecha y hora de actualización del producto',
  })
  updatedAt: Date;

  @ApiProperty({
    example: false,
    description: 'Indica si el producto ha sido eliminado',
  })
  isDeleted: boolean;
  @ApiProperty({
    example: 'bimbo',
    description: 'El id del proveedor',
    required: false,
  })
  proveedor: string;
}
