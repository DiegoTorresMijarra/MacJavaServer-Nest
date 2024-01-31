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
  HttpCode,
  ParseUUIDPipe,
  Patch,
  UseGuards,
  BadRequestException,
  UploadedFile,
  Req,
} from '@nestjs/common'
import { ClientesService } from './clientes.service'
import { CreateClienteDto } from './dto/create-cliente.dto'
import { UpdateClienteDto } from './dto/update-cliente.dto'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import { clienteExistGuard } from './guard/cliente-exists.guard'
import { diskStorage } from 'multer'
import { FileInterceptor } from '@nestjs/platform-express'
import { extname, parse } from 'path'
import { Request } from 'express'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ResponseCliente } from './dto/response-cliente.dto'

@Controller('clientes')
@UseInterceptors(CacheInterceptor)
@ApiTags('Clientes')
export class ClientesController {
  logger: Logger = new Logger(ClientesController.name)
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  @CacheKey('all_clientes')
  @CacheTTL(30)
  @ApiResponse({
    status: 200,
    description:
      'Lista de clientes paginada. Se puede filtrar por limite, pagina sortBy, filter y search',
    type: Paginated<ResponseCliente>,
  })
  @ApiQuery({
    description: 'Filtro por limite por pagina',
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
    this.logger.log('Buscando todos los clientes')
    return await this.clientesService.findAll(query)
  }

  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado',
    type: ResponseCliente,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del cliente',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Cliente no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del cliente no es válido',
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Buscando cliente con id ${id}`)
    return this.clientesService.findOne(id)
  }

  @Post()
  @HttpCode(201)
  @ApiBearerAuth() // Indicar que se requiere autenticación con JWT en Swagger
  @ApiResponse({
    status: 201,
    description: 'Cliente creado',
    type: ResponseCliente,
  })
  @ApiBody({
    description: 'Datos del cliente a crear',
    type: CreateClienteDto,
  })
  @ApiBadRequestResponse({
    description:
      'Algunos de los campos no son válidos según la especificación del DTO',
  })
  create(@Body() createClienteDto: CreateClienteDto) {
    this.logger.log('Creando un nuevo cliente')
    return this.clientesService.create(createClienteDto)
  }

  @Put(':id')
  @ApiBearerAuth() // Indicar que se requiere autenticación con JWT en Swagger
  @ApiResponse({
    status: 200,
    description: 'Cliente actualizado',
    type: ResponseCliente,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del cliente',
    type: Number,
  })
  @ApiBody({
    description: 'Datos del cliente a actualizar',
    type: UpdateClienteDto,
  })
  @ApiNotFoundResponse({
    description: 'Cliente no encontrado',
  })
  @ApiBadRequestResponse({
    description:
      'Algunos de los campos no son válidos según la especificación del DTO',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    this.logger.log(`Actualizando cliente con id ${id}`)
    return this.clientesService.update(id, updateClienteDto)
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiBearerAuth() // Indicar que se requiere autenticación con JWT en Swagger
  @ApiResponse({
    status: 204,
    description: 'Cliente eliminado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del cliente',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Cliente no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del cliente no es válido',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Eliminando cliente con id ${id}`)
    return this.clientesService.removeSoft(id)
  }
  @Patch('/imagen/:id')
  @UseGuards(clienteExistGuard)
  @ApiBearerAuth() // Indicar que se requiere autenticación con JWT en Swagger
  @ApiResponse({
    status: 200,
    description: 'Imagen actualizada',
    type: ResponseCliente,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del cliente',
    type: Number,
  })
  @ApiProperty({
    name: 'file',
    description: 'Fichero de imagen',
    type: 'string',
    format: 'binary',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Fichero de imagen',
    type: FileInterceptor('file'),
  })
  @ApiNotFoundResponse({
    description: 'Cliente no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del cliente no es válido',
  })
  @ApiBadRequestResponse({
    description: 'El fichero no es válido o de un tipo no soportado',
  })
  @ApiBadRequestResponse({
    description: 'El fichero no puede ser mayor a 1 megabyte',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR || './storage-dir',
        filename: (req, file, cb) => {
          // const fileName = uuidv4() // usamos uuid para generar un nombre único para el archivo
          const { name } = parse(file.originalname)
          const fileName = `${Date.now()}_${name.replace(/\s/g, '')}`
          const fileExt = extname(file.originalname) // extraemos la extensión del archivo
          cb(null, `${fileName}${fileExt}`) // llamamos al callback con el nombre del archivo
        },
      }),
      // Validación de archivos
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif']
        const maxFileSize = 1024 * 1024 // 1 megabyte
        if (!allowedMimes.includes(file.mimetype)) {
          cb(
            new BadRequestException(
              'Fichero no soportado. No es del tipo imagen válido',
            ),
            false,
          )
        } else if (file.size > maxFileSize) {
          cb(
            new BadRequestException(
              'El tamaño del archivo no puede ser mayor a 1 megabyte.',
            ),
            false,
          )
        } else {
          cb(null, true)
        }
      },
    }),
  )
  async updateImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    this.logger.log(`Actualizando imagen al cliente con ${id}:  ${file}`)

    return await this.clientesService.updateImage(id, file, req, true)
  }
}
