import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'

import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, parse } from 'path'

import { ResponseProductoDto } from './dto/response-producto.dto'
import { ProductoService } from './productos.service'
import { CreateProductoDto } from './dto/create-producto.dto'
import { UpdateProductoDto } from './dto/update-producto.dto'
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager'
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Request } from 'express'
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
// Importaciones de autenticación y autorización, si las hay

@Controller('productos')
@UseInterceptors(CacheInterceptor)
@ApiTags('Productos')
export class ProductosController {
  private readonly logger: Logger = new Logger(ProductosController.name)

  constructor(private readonly productosService: ProductoService) {}
  @Get()
  @CacheKey('all_products')
  @ApiResponse({ status: 200, description: 'Lista de productos paginada.' })
  async findAll(
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<ResponseProductoDto>> {
    this.logger.log('Find all productos')
    return await this.productosService.findAll(query)
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'ProductoEntity encontrado',
    type: ResponseProductoDto,
  })
  @ApiNotFoundResponse({ description: 'ProductoEntity no encontrado' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseProductoDto> {
    this.logger.log(`Find one producto by id:${id}`)
    return await this.productosService.findOne(id)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: 'ProductoEntity creado',
    type: ResponseProductoDto,
  })
  @ApiBody({
    description: 'Datos del producto a crear',
    type: CreateProductoDto,
  })
  async create(
    @Body() createProductoDto: CreateProductoDto,
  ): Promise<ResponseProductoDto> {
    this.logger.log(`Create producto`)
    return await this.productosService.create(createProductoDto)
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiResponse({
    status: 200,
    description: 'ProductoEntity actualizado',
    type: ResponseProductoDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductoDto: UpdateProductoDto,
  ): Promise<ResponseProductoDto> {
    this.logger.log(`Update producto by id:${id}`)
    return await this.productosService.update(id, updateProductoDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @ApiBearerAuth()
  @Roles('ADMIN')
  @HttpCode(204)
  @ApiResponse({ status: 204, description: 'ProductoEntity eliminado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`Remove producto by id:${id}`)
    await this.productosService.remove(id)
  }

  @Patch(':id/imagen')
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @ApiBearerAuth()
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR || './storage-dir',
        filename: (req, file, cb) => {
          const { name } = parse(file.originalname)
          const fileName = `${Date.now()}_${name.replace(/\s/g, '')}`
          const fileExt = extname(file.originalname)
          cb(null, `${fileName}${fileExt}`)
        },
      }),
    }),
  )
  @ApiResponse({
    status: 200,
    description: 'Imagen del producto actualizada',
    type: ResponseProductoDto,
  })
  async updateImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<ResponseProductoDto> {
    this.logger.log(`Actualizando imagen del producto con id: ${id}`)
    return await this.productosService.updateImage(id, file, req, true)
  }
}
