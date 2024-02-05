import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { CreateClienteDto } from '../dto/create-cliente.dto'
import { Cliente } from '../entities/cliente.entity'
import { ResponseCliente } from '../dto/response-cliente.dto'

@Injectable()
export class ClienteMapper {
  toCliente(createProductoDto: CreateClienteDto): Cliente {
    return plainToClass(Cliente, createProductoDto)
  }
  toResponse(cliente: Cliente): ResponseCliente {
    return plainToClass(ResponseCliente, cliente)
  }
}
