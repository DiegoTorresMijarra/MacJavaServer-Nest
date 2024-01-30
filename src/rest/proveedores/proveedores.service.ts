import {BadRequestException, Inject, Injectable, Logger, NotFoundException} from '@nestjs/common'
import { CreateProveedoresDto } from './dto/create-proveedores.dto'
import { UpdateProveedoresDto } from './dto/update-proveedores.dto'
import {ProveedoresMapper} from "./mappers/proveedores.mapper";
import {InjectRepository} from "@nestjs/typeorm";
import {Proveedores} from "./entities/proveedores.entity";
import {Repository} from "typeorm";
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import { Cache } from 'cache-manager'
import {hash} from "typeorm/util/StringUtils";
import {FilterOperator, FilterSuffix, paginate, PaginateQuery} from "nestjs-paginate";

@Injectable()
export class ProveedoresService {
  private readonly logger = new Logger(ProveedoresService.name)

  constructor(
      private readonly proveedoresMapper: ProveedoresMapper,
      @InjectRepository(Proveedores)
      private readonly proveedoresRepository: Repository<Proveedores>,
      @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
  }

  async findAll(query: PaginateQuery) {
    this.logger.log('Servicio: Buscado todos los proveedores')
    const cache: Proveedores = await this.cacheManager.get(
        `all_proveedores_paginated_${hash(JSON.stringify(query))}`,
    )
    if (cache) {
      return cache
    }

    const paginacion = await paginate(query, this.proveedoresRepository, {
      sortableColumns: ['id', 'nombre', 'tipo', 'tlf', 'fechaCre', 'fechaUp', 'isActive'],
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: [
        'id',
        'nombre',
        'tipo',
        'tlf',
        'fechaCre',
        'fechaUp',
        'isActive'
      ],
      select: ['id', 'nombre', 'tipo', 'tlf', 'fechaCre', 'fechaUp', 'isActive'],
      filterableColumns: {
        nombre: [FilterOperator.EQ, FilterSuffix.NOT],
        tipo: [FilterOperator.EQ, FilterSuffix.NOT],
        tlf: [FilterOperator.EQ, FilterSuffix.NOT],
        fechaCre: [FilterOperator.EQ, FilterSuffix.NOT],
        fechaUp: [FilterOperator.EQ, FilterSuffix.NOT],
      },
    })

    const proveedores = {
      data: (paginacion.data ?? []),
      meta: paginacion.meta,
      links: paginacion.links,
    }
    await this.cacheManager.set(
        `all_proveedores_paginated_${hash(JSON.stringify(query))}`,
        proveedores,
        60,
    )
    return proveedores
  }

  async findOne(id: number) {
    this.logger.log(`Servicio: Obteniendo el proveedor con id ${id}`)

    const cache: Proveedores = await this.cacheManager.get(`proveedor_${id}`)
    if (cache) {
      return cache
    }

    const existingProveedor = await this.proveedoresRepository.findOneBy({id})
    if (!existingProveedor) {
      throw new NotFoundException(`El funko con id ${id} no existe`)
    }

    await this.cacheManager.set(`proveedor_${id}`, existingProveedor, 60)

    return existingProveedor
  }

  async add(createProveedoresDto: CreateProveedoresDto) {
    this.logger.log(`Servicio: Creando proveedor`)
    const nombre = createProveedoresDto.nombre
    const tlf = createProveedoresDto.tlf

    const existsProveedor = await this.proveedoresRepository.findOne({
      where: { nombre },
    })
    if (existsProveedor) {
      throw new BadRequestException(`Ya estamos trabajando con ${nombre}`)
    }
    const existsTlf = await this.proveedoresRepository.findOne({
      where: { tlf },
    })
    if (existsTlf) {
      throw new BadRequestException(`El telefono ${tlf} ya existe`)
    }

    const proveedorMapped = this.proveedoresMapper.toEntity(createProveedoresDto)
    const newProveedor = await this.proveedoresRepository.save(proveedorMapped)

    await this.invalidateCacheKey('all_proveedores')

    return newProveedor
  }

  async update(id: number, updateProveedoreDto: UpdateProveedoresDto) {
    this.logger.log(`Servicio: Actualizando el proveedor con id ${id}`)
    const existingProveedor = await this.findOne(id)

    const nombre = updateProveedoreDto.nombre
    const tlf = updateProveedoreDto.tlf

    const existsProveedor = await this.proveedoresRepository.findOne({
      where: { nombre },
    })
    if (existsProveedor) {
      throw new BadRequestException(`Ya estamos trabajando con ${nombre}`)
    }
    const existsTlf = await this.proveedoresRepository.findOne({
      where: { tlf },
    })
    if (existsTlf) {
      throw new BadRequestException(`El telefono ${tlf} ya existe`)
    }

    const updatedProveedor = await this.proveedoresRepository.save({
      ...existingProveedor,
      ...updateProveedoreDto
    })

    await this.invalidateCacheKey('all_proveedores')
    await this.invalidateCacheKey(`proveedor_${id}`)

    return updatedProveedor
  }

  async remove(id: number) {
    this.logger.log(`Servicio: Eliminando el proveedor con id ${id}`)
    const existingProveedor = await this.findOne(id)
    const deletedProveedor = await this.proveedoresRepository.remove(existingProveedor)

    await this.invalidateCacheKey('all_proveedores')
    await this.invalidateCacheKey(`proveedor_${id}`)

    return deletedProveedor
  }

  async removeSoft(id: number){
    this.logger.log(`Servicio: Eliminando el proveedor con id ${id}`)
    const existingProveedor = await this.findOne(id)
    const inActiveProveedor = await this.proveedoresRepository.save({
      ...existingProveedor,
      fechaUp: new Date(),
      isActive: false
    })

    await this.invalidateCacheKey('all_proveedores')
    await this.invalidateCacheKey(`proveedor_${id}`)

    return inActiveProveedor
  }

  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }
}
