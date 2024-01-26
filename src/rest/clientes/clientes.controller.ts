import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  Put,
  Logger,
  ParseIntPipe,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ClientesService } from './clientes.service'
import { CreateClienteDto } from './dto/create-cliente.dto'
import { UpdateClienteDto } from './dto/update-cliente.dto'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'
import { Paginate, PaginateQuery } from 'nestjs-paginate'

@Controller('clientes')
@UseInterceptors(CacheInterceptor)
export class ClientesController {
  logger: Logger = new Logger(ClientesController.name)
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  @CacheKey('all_clientes')
  @CacheTTL(30)
  async findAll(@Paginate() query: PaginateQuery) {
    this.logger.log('Buscando todos los clientes')
    return await this.clientesService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Buscando cliente con id ${id}`)
    return this.clientesService.findOne(id)
  }

  @Post()
  @HttpCode(201)
  create(@Body() createClienteDto: CreateClienteDto) {
    this.logger.log('Creando un nuevo cliente')
    return this.clientesService.create(createClienteDto)
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    this.logger.log(`Actualizando cliente con id ${id}`)
    return this.clientesService.update(id, updateClienteDto)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Eliminando cliente con id ${id}`)
    return this.clientesService.removeSoft(id)
  }
}
