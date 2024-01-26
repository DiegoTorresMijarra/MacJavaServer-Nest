import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateClienteDto } from './dto/create-cliente.dto'
import { UpdateClienteDto } from './dto/update-cliente.dto'
import { ClienteMapper } from './mapper/cliente.mapper'
import { InjectRepository } from '@nestjs/typeorm'
import { Cliente } from './entities/cliente.entity'
import { Repository } from 'typeorm'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate'
import { hash } from 'typeorm/util/StringUtils'
import { ResponseCliente } from './dto/response-cliente.dto'

@Injectable()
export class ClientesService {
  logger: Logger = new Logger(ClientesService.name)
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    private readonly mapper: ClienteMapper,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async findAll(query: PaginateQuery) {
    this.logger.log('Buscando todos los clientes')
    const cache = await this.cacheManager.get(
      `all_clientes_page_${hash(JSON.stringify(query))}`,
    )
    if (cache) {
      this.logger.log('Buscando todos los clientes en cache')
      return cache
    }
    const pagination = await paginate(query, this.clienteRepository, {
      sortableColumns: [
        'dni',
        'nombre',
        'apellido',
        'imagen',
        'edad',
        'telefono',
      ],
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: [
        'dni',
        'nombre',
        'apellido',
        'imagen',
        'edad',
        'telefono',
      ],
      filterableColumns: {
        dni: [FilterOperator.EQ, FilterSuffix.NOT],
        nombre: [FilterOperator.EQ, FilterSuffix.NOT],
        apellido: [FilterOperator.EQ, FilterSuffix.NOT],
        imagen: [FilterOperator.EQ, FilterSuffix.NOT],
        edad: true,
        telefono: true,
        deleted: [FilterOperator.EQ, FilterSuffix.NOT],
      },
    })
    const res = {
      data: (pagination.data ?? []).map((cliente) =>
        this.mapper.toResponse(cliente),
      ),
      meta: pagination.meta,
      links: pagination.links,
    }
    await this.cacheManager.set(
      `all_clientes_page_${hash(JSON.stringify(query))}`,
      res,
      60,
    )
    return res
  }

  async findOne(id: string) {
    this.logger.log(`Buscando cliente con id ${id}`)
    const cache: ResponseCliente = await this.cacheManager.get(`cliente_${id}`)
    if (cache) {
      this.logger.log(`Cliente con id ${id} encontrado en cache`)
      return cache
    }
    const clienteEncontrar = await this.clienteRepository.findOneBy({ id })
    if (!clienteEncontrar) {
      throw new NotFoundException(`Cliente con id ${id} no encontrada`)
    } else {
      await this.cacheManager.set(`cliente_${id}`, clienteEncontrar, 60)
      return this.mapper.toResponse(clienteEncontrar)
    }
  }

  async create(createClienteDto: CreateClienteDto) {
    const clienteToCreate = this.mapper.toCliente(createClienteDto)
    const cliente = await this.exists(clienteToCreate.dni)
    if (cliente) {
      throw new BadRequestException(
        `El cliente con dni ${cliente.dni} ya existe`,
      )
    } else {
      const res = await this.clienteRepository.save(clienteToCreate)
      await this.invalidateKey('all_clientes')
      return this.mapper.toResponse(res)
    }
  }

  async update(id: string, updateClienteDto: UpdateClienteDto) {
    if (updateClienteDto.dni) {
      this.exists(updateClienteDto.dni)
    }
    const clienteToUpdated = await this.findOne(id)
    const res = await this.clienteRepository.save({
      ...clienteToUpdated,
      ...updateClienteDto,
    })
    await this.invalidateKey(`cliente_${id}`)
    await this.invalidateKey('all_cliente')
    return this.mapper.toResponse(res)
  }

  async removeSoft(id: string) {
    const clienteToRemove = await this.findOne(id)
    const res: Cliente = await this.clienteRepository.save({
      ...clienteToRemove,
      updatedAt: new Date(),
      is_deleted: true,
    })
    await this.invalidateKey(`cliente_${id}`)
    await this.invalidateKey('all_clientes')
    return this.mapper.toResponse(res)
  }
  public async exists(dni: string): Promise<Cliente> {
    const cliente = await this.clienteRepository
      .createQueryBuilder()
      .where('LOWER(dni) = LOWER(:dnie)', { dnie: dni.toLowerCase() })
      .getOne()
    return cliente
  }
  async invalidateKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }
}
