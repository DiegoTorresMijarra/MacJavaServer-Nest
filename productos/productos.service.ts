import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoEntity } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ResponseProductoDto } from './dto/response-producto.dto';
import { StorageService } from '../storage/storage.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { hash } from 'typeorm/util/StringUtils';
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate';
import { ProductosMapper } from './mappers/producto-mapper';

@Injectable()
export class ProductoService {
  private readonly logger: Logger = new Logger(ProductoService.name);

  constructor(
    @InjectRepository(ProductoEntity)
    private readonly productoRepository: Repository<ProductoEntity>,
    private readonly productosMapper: ProductosMapper,
    private readonly storageService: StorageService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(query: PaginateQuery): Promise<any> {
    this.logger.log('Find all productos');
    const cacheKey = `all_products_page_${hash(JSON.stringify(query))}`;
    const cache = await this.cacheManager.get(cacheKey);
    if (cache) {
      this.logger.log('Cache hit');
      return cache;
    }

    const queryBuilder = this.productoRepository.createQueryBuilder('producto');
    const pagination = await paginate(query, queryBuilder, {
      sortableColumns: ['nombre', 'precio', 'stock'],
      defaultSortBy: [['nombre', 'ASC']],
      searchableColumns: ['nombre', 'precio', 'stock'],
      filterableColumns: {
        nombre: [FilterOperator.EQ, FilterSuffix.NOT],
        precio: true,
        stock: true,
      },
    });

    const res = {
      data: (pagination.data ?? []).map((productos) =>
        this.productosMapper.toResponseDto(productos),
      ),
      meta: pagination.meta,
      links: pagination.links,
    };

    // Guardamos en caché
    await this.cacheManager.set(
      `all_products_page_${hash(JSON.stringify(query))}`,
      res,
      60,
    );
    return res;
  }
  async findOne(id: number): Promise<ResponseProductoDto> {
    this.logger.log(`Find one producto by id: ${id}`);
    const cacheKey = `product_${id}`;
    const cache: ResponseProductoDto = await this.cacheManager.get(cacheKey);
    if (cache) {
      this.logger.log('Cache hit');
      return cache;
    }

    const producto = await this.productoRepository.findOne({ where: { id } });
    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    const dto = this.productosMapper.toResponseDto(producto);
    await this.cacheManager.set(cacheKey, dto);
    return dto;
  }

  async create(
    createProductoDto: CreateProductoDto,
  ): Promise<ResponseProductoDto> {
    this.logger.log('Create producto');
    const producto = this.productosMapper.toEntity(createProductoDto);
    const productoCreado = await this.productoRepository.save(producto);
    return this.productosMapper.toResponseDto(productoCreado);
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<ResponseProductoDto> {
    this.logger.log(`Update producto by id: ${id}`);
    const producto = await this.productoRepository.findOne({ where: { id } });
    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    Object.assign(producto, updateProductoDto);
    const productoActualizado = await this.productoRepository.save(producto);
    return this.productosMapper.toResponseDto(productoActualizado);
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Remove producto by id: ${id}`);
    const producto = await this.productoRepository.findOne({ where: { id } });
    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    await this.productoRepository.remove(producto);
  }

  async updateImage(
    id: number,
    imageFile: Express.Multer.File,
  ): Promise<ResponseProductoDto> {
    this.logger.log(`Update image of producto with id: ${id}`);

    const producto = await this.productoRepository.findOne({ where: { id } });
    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    if (!imageFile) {
      throw new BadRequestException('No se proporcionó ninguna imagen');
    }
    producto.imagen = this.storageService.uploadImage(imageFile);
    const productoActualizado = await this.productoRepository.save(producto);

    return this.productosMapper.toResponseDto(productoActualizado);
  }
}
