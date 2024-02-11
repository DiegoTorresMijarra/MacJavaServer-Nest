import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
  HttpCode,
  UseInterceptors,
  Logger,
  UseGuards,
} from '@nestjs/common'
import { ProveedoresService } from './proveedores.service'
import { CreateProveedoresDto } from './dto/create-proveedores.dto'
import { UpdateProveedoresDto } from './dto/update-proveedores.dto'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Proveedor } from './entities/proveedores.entity'
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('proveedores')
@ApiTags('Proveedores')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard, RolesAuthGuard)
export class ProveedoresController {
  private readonly logger = new Logger(ProveedoresController.name)

  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Get()
  @CacheKey('all_proveedores')
  @CacheTTL(30)
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiResponse({
    status: 200,
    description:
      'Lista de proveedores paginada. Se puede filtrar por limite, pagina sortBy, filter y search',
    type: Paginated<Proveedor>,
  })
  @ApiQuery({
    description: 'Filtro por limite de pagina',
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filtro por pagina',
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filtro de ordenación: campo:ASC|DESC',
    name: 'sortBy',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de busqueda: filter.campo = $eq:valor',
    name: 'filter',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de busqueda: search = valor',
    name: 'search',
    required: false,
    type: String,
  })
  async findAll(@Paginate() query: PaginateQuery) {
    this.logger.log(`Controlador: Obteniendo todos los proveedores`)
    return await this.proveedoresService.findAll(query)
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Proveedor encontrado',
    type: Proveedor,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador unico del proveedor',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Proveedor no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del proveedor no es válido',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Controlador: Obteniendo el proveedor con id ${id}`)
    return await this.proveedoresService.findOne(id)
  }

  @Post()
  @ApiBearerAuth()
  @Roles('ADMIN')
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Proveedor creado',
    type: Proveedor,
  })
  @ApiBody({
    description: 'Datos al crear el proveedor',
    type: CreateProveedoresDto,
  })
  @ApiBadRequestResponse({
    description:
      'Alguno de los campos no es valido segun las validaciones del dto',
  })
  @ApiBadRequestResponse({
    description: 'El telefono o el nombre ya existen',
  })
  async add(@Body() createProveedoresDto: CreateProveedoresDto) {
    this.logger.log(`Controlador: Creando proveedor`)
    return await this.proveedoresService.add(createProveedoresDto)
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Proveedor actualizado',
    type: Proveedor,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador unico del proveedor',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Proveedor no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del proveedor no es válido',
  })
  @ApiBody({
    description: 'Datos al actualizar el proveedor',
    type: UpdateProveedoresDto,
  })
  @ApiBadRequestResponse({
    description:
      'Alguno de los campos no es valido segun las validaciones del dto',
  })
  @ApiBadRequestResponse({
    description: 'El telefono o el nombre ya existen',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProveedoresDto: UpdateProveedoresDto,
  ) {
    this.logger.log(`Controlador: Actualizando el proveedor con id ${id}`)
    return await this.proveedoresService.update(id, updateProveedoresDto)
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Proveedor eliminado',
    type: Proveedor,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador unico del proveedor',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Proveedor no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del proveedor no es válido',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Controlador: Eliminando el proveedor con id ${id}`)
    return await this.proveedoresService.remove(id)
  }

  @Delete('/soft/:id')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Proveedor eliminado',
    type: Proveedor,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador unico del proveedor',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Proveedor no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del proveedor no es válido',
  })
  async removeSoft(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Controlador: Eliminando el proveedor con id ${id}`)
    return await this.proveedoresService.removeSoft(id)
  }
}
