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
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ResponseProductoDto } from './dto/response-producto.dto';
import { StorageService } from '../storage/storage.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate';
import { ProductosMapper } from './mappers/producto-mapper';

import { CreateProductoDto } from './dto/create-producto.dto';
import { Proveedor } from '../provedores/entities/proveedores.entity';

@Injectable()
export class ProductoService {
  private readonly logger = new Logger(ProductoService.name);

  constructor(
    @InjectRepository(ProductoEntity)
    @InjectRepository(Proveedor) // Corregido
    private readonly proveedoresRepository: Repository<Proveedor>, // Corregido
    private readonly productoRepository: Repository<ProductoEntity>,
    private readonly productosMapper: ProductosMapper,
    private readonly storageService: StorageService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(query: PaginateQuery): Promise<any> {
    this.logger.log('Find all productos');

    if (!query.path) {
      throw new Error('Path is required for pagination');
    }

    const queryBuilder = this.productoRepository.createQueryBuilder('producto');
    const pagination = await paginate(query, queryBuilder, {
      sortableColumns: ['nombre', 'precio', 'stock', 'proveedor.nombre'], // Corregido
      select: ['id', 'nombre', 'stock', 'precio', 'imagen', 'proveedor.nombre'], // Corregido
      defaultSortBy: [['nombre', 'ASC']],
      relations: ['proveedor'], // Corregido
      searchableColumns: ['nombre', 'precio', 'stock', 'proveedor.nombre'], // Corregido
      filterableColumns: {
        nombre: [FilterOperator.EQ, FilterSuffix.NOT],
        precio: true,
        stock: true,
        'proveedor.nombre': [FilterOperator.IN], // Corregido
      },
    });

    return {
      data: (pagination.data ?? []).map((producto) =>
        this.productosMapper.toResponseDto(producto),
      ),
      meta: pagination.meta,
      links: pagination.links,
    };
  }

  async findOne(id: number): Promise<ResponseProductoDto> {
    this.logger.log(`Find one producto by id: ${id}`);
    const cacheKey = `product_${id}`;
    const cache: ResponseProductoDto = await this.cacheManager.get(cacheKey);
    if (cache) {
      this.logger.log('Cache hit');
      return cache;
    }

    const exists = await this.productoRepository
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.proveedor', 'proveedor') // Corregido
      .where('producto.id = :id', { id })
      .getOne();
    if (!exists) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    const dto = this.productosMapper.toResponseDto(exists);
    await this.cacheManager.set(cacheKey, dto);
    return dto;
  }

  async create(
    createProductoDto: CreateProductoDto,
  ): Promise<ResponseProductoDto> {
    this.logger.log('Create producto');
    const proveedor = await this.checkProveedor(createProductoDto.proveedor); // Corregido
    const producto = this.productosMapper.toEntity(
      createProductoDto,
      proveedor,
    );
    const productoCreado = await this.productoRepository.save(producto);
    return this.productosMapper.toResponseDto(productoCreado);
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<ResponseProductoDto> {
    this.logger.log(`Update producto by id: ${id}`);
    const producto = await this.productoRepository.findOne({
      where: { id },
      relations: ['proveedor'], // Corregido
    });
    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    if (updateProductoDto.proveedor) {
      // Corregido
      producto.proveedor = await this.checkProveedor(
        updateProductoDto.proveedor,
      ); // Corregido
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

  async exists(productId: number) {
    return this.productoRepository
      .findOne({ where: { id: productId } })
      .then((producto) => !!producto);
  }

  public async checkProveedor(nombreProveedor: string) {
    // Corregido
    const proveedor = await this.proveedoresRepository // Corregido
      .createQueryBuilder()
      .where('LOWER(nombre) = LOWER(:nombre)', {
        nombre: nombreProveedor.toLowerCase(),
      }) // Corregido
      .getOne();

    if (!proveedor) {
      // Corregido
      throw new BadRequestException(
        `El proveedor ${nombreProveedor} no existe`,
      ); // Corregido
    }
    return proveedor;
  }
}
