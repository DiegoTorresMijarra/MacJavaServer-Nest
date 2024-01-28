import { ClienteMapper } from './cliente.mapper'
import { Test, TestingModule } from '@nestjs/testing'
import { CreateClienteDto } from '../dto/create-cliente.dto'
import { Cliente } from '../entities/cliente.entity'
import { ResponseCliente } from '../dto/response-cliente.dto'

describe('ClienteMapper', () => {
  let clienteMapper: ClienteMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClienteMapper],
    }).compile()

    clienteMapper = module.get<ClienteMapper>(ClienteMapper)
  })

  it('debería estar definido', () => {
    expect(clienteMapper).toBeDefined()
  })

  describe('toCliente', () => {
    it('debería mapear CreateClienteDto a Cliente', () => {
      // Arrange
      const createClienteDto: CreateClienteDto = {
        dni: '62840516G',
        nombre: 'Manolo',
        apellido: 'Hernandez',
        edad: 23,
        telefono: '549573654',
      }

      // Act
      const result: Cliente = clienteMapper.toCliente(createClienteDto)

      // Assert
      expect(result).toBeDefined()
      expect(result.dni).toEqual(createClienteDto.dni)
    })
  })

  describe('toResponse', () => {
    it('debería mapear Cliente a ResponseCliente', () => {
      // Arrange
      const cliente: Cliente = {
        id: '00000000-0000-0000-0000-000000000055',
        dni: '62840516G',
        nombre: 'Manolo',
        apellido: 'Hernandez',
        edad: 23,
        telefono: '549573654',
        imagen: 'https://via.placeholder.com/150',
        deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      }

      // Act
      const result: ResponseCliente = clienteMapper.toResponse(cliente)

      // Assert
      expect(result).toBeDefined()
      expect(result.dni).toEqual(cliente.dni)
    })
  })
})
