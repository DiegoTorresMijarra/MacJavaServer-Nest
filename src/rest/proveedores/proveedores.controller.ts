import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete, ParseIntPipe, Put, HttpCode, UseInterceptors, Logger,
} from '@nestjs/common'
import { ProveedoresService } from './proveedores.service'
import { CreateProveedoresDto } from './dto/create-proveedores.dto'
import { UpdateProveedoresDto } from './dto/update-proveedores.dto'
import {CacheInterceptor, CacheKey, CacheTTL} from "@nestjs/cache-manager";
import {Paginate, PaginateQuery} from "nestjs-paginate";

@Controller('proveedores')
@UseInterceptors(CacheInterceptor)
export class ProveedoresController {
  private readonly logger = new Logger(ProveedoresController.name)

  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Get()
  @CacheKey('all_proveedores')
  @CacheTTL(30)
  async findAll(@Paginate() query: PaginateQuery) {
    this.logger.log(`Controlador: Obteniendo todos los funkos`)
    return await this.proveedoresService.findAll(query)
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Controlador: Obteniendo el proveedor con id ${id}`)
    return await this.proveedoresService.findOne(id)
  }

  @Post()
  @HttpCode(201)
  async add(@Body() createProveedoresDto: CreateProveedoresDto) {
    this.logger.log(`Controlador: Creando proveedor`)
    return await this.proveedoresService.add(createProveedoresDto)
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProveedoresDto: UpdateProveedoresDto,
  ) {
    this.logger.log(`Controlador: Actualizando el proveedor con id ${id}`)
    return await this.proveedoresService.update(id, updateProveedoresDto)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Controlador: Eliminando el proveedor con id ${id}`)
    return await this.proveedoresService.remove(id)
  }

  @Delete('/soft/:id')
  @HttpCode(204)
  async removeSoft(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Controlador: Eliminando el proveedor con id ${id}`)
    return await this.proveedoresService.removeSoft(id)
  }
}
