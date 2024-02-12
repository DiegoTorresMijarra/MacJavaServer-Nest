import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Producto } from './entities/producto.entity'
import { UpdateProductoDto } from './dto/update-producto.dto'
import { ResponseProductoDto } from './dto/response-producto.dto'
import { StorageService } from '../storage/storage.service'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate'
import { ProductosMapper } from './mappers/producto-mapper'
import { Request } from 'express'
import {
  Notification,
  NotificationTipo,
} from '../../notifications/models/notificacion.model'
import { Posicion } from '../posiciones/entities/posicion.entity'
import { MacjavaNotificationsGateway } from '../../notifications/macjava-notifications.gateway'

@Injectable()
export class ProductoService {
  private readonly logger = new Logger(ProductoService.name)

  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    private readonly productosMapper: ProductosMapper,
    private readonly storageService: StorageService,
    private readonly notificationGateway: MacjavaNotificationsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async findAll(query: PaginateQuery): Promise<any> {
    this.logger.log('Find all productos')

    // Asegúrate de que el path esté definido
    if (!query.path) {
      throw new Error('Path is required for pagination')
    }

    const queryBuilder = this.productoRepository.createQueryBuilder('producto')
    const pagination = await paginate(query, queryBuilder, {
      sortableColumns: ['nombre', 'precio', 'stock'],
      defaultSortBy: [['nombre', 'ASC']],
      searchableColumns: ['nombre', 'precio', 'stock'],
      filterableColumns: {
        nombre: [FilterOperator.EQ, FilterSuffix.NOT],
        precio: true,
        stock: true,
      },
    })

    return {
      data: (pagination.data ?? []).map((producto) =>
        this.productosMapper.toResponseDto(producto),
      ),
      meta: pagination.meta,
      links: pagination.links,
    }
  }

  async findOne(id: number): Promise<ResponseProductoDto> {
    this.logger.log(`Find one producto by id: ${id}`)
    const cacheKey = `product_${id}`
    const cache: ResponseProductoDto = await this.cacheManager.get(cacheKey)
    if (cache) {
      this.logger.log('Cache hit')
      return cache
    }

    const producto = await this.productoRepository.findOne({ where: { id } })
    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`)
    }

    const dto = this.productosMapper.toResponseDto(producto)
    await this.cacheManager.set(cacheKey, dto)
    return dto
  }

  async create(createProductoDto: {
    precio: number
    stock: number
    nombre: string
  }): Promise<ResponseProductoDto> {
    this.logger.log('Create producto')
    const producto = this.productosMapper.toEntity(createProductoDto)
    const res = await this.productoRepository.save(producto)
    this.onChange(NotificationTipo.CREATE, res)
    return this.productosMapper.toResponseDto(res)
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<ResponseProductoDto> {
    this.logger.log(`Update producto by id: ${id}`)
    const producto = await this.productoRepository.findOne({ where: { id } })
    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`)
    }

    Object.assign(producto, updateProductoDto)
    const res = await this.productoRepository.save(producto)

    this.onChange(NotificationTipo.UPDATE, res)

    return this.productosMapper.toResponseDto(res)
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Remove producto by id: ${id}`)
    const producto = await this.productoRepository.findOne({ where: { id } })
    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`)
    }

    await this.productoRepository.remove(producto)
    this.onChange(NotificationTipo.DELETE, producto)
  }

  async updateImage(
    id: number,
    file: Express.Multer.File,
    req: Request,
    withUrl: boolean = true,
  ): Promise<ResponseProductoDto> {
    this.logger.log(`Update image of producto with id: ${id}`)

    const producto = await this.productoRepository.findOne({ where: { id } })

    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`)
    }
    if (!file) {
      throw new BadRequestException('No se proporcionó ninguna imagen')
    }
    // Borramos su imagen si es distinta a la imagen por defecto
    if (producto.imagen !== Producto.IMAGE_DEFAULT) {
      this.logger.log(`Borrando imagen ${producto.imagen}`)
      let imagePath = producto.imagen
      if (withUrl) {
        imagePath = this.storageService.getFileNameWithouUrl(producto.imagen)
      }
      try {
        this.storageService.removeFile(imagePath)
      } catch (error) {
        this.logger.error(error)
      }
    }

    // Asumiendo que `uploadImage` en `storageService` ha sido actualizado para aceptar `Express.Multer.File`
    producto.imagen = file.filename
    const productoActualizado = await this.productoRepository.save(producto)
    this.onChange(NotificationTipo.UPDATE, productoActualizado)
    return this.productosMapper.toResponseDto(productoActualizado)
  }

  async exists(productId: number) {
    const producto = await this.productoRepository.findOne({
      where: { id: productId },
    })
    return !!producto
  }

  public async patchStock(id: number, monto: number, sumar: boolean) {
    this.logger.log(
      `${sumar ? 'Añadiendo' : 'Restando'} la cantidad de ${monto} al producto con id ${id}`,
    )
    const cacheKey = `product_${id}`

    const original = await this.findOne(id)
    const newStock = sumar ? original.stock + monto : original.stock - monto

    await this.cacheManager.del(cacheKey)
    return await this.productoRepository.update({ id: id }, { stock: newStock })
  }

  private onChange(type: NotificationTipo, data: Producto) {
    const notification: Notification<Producto> = {
      message: `La Posicion con id ${data.id} ha sido ${type.toLowerCase()}d`,
      type: type,
      data: data,
      createdAt: new Date(),
    }

    this.notificationGateway.sendMessage(notification)
  }
}
