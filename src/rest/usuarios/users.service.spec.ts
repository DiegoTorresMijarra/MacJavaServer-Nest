import { Test, TestingModule } from '@nestjs/testing'
import { Repository } from 'typeorm'
import { UsersService } from './users.service'
import { Usuario } from './entities/user.entity'
import { BcryptService } from './bcrypt.service'
import { PedidosService } from '../pedidos/pedidos.service'
import { UsuariosMapper } from './mappers/usuarios.mapper'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Role, UserRole } from './entities/user-role.entity'
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { CreatePedidoDto } from '../pedidos/dto/create-pedido.dto'
import { Pedido } from '../pedidos/schemas/pedido.schema'
import { UpdatePedidoDto } from '../pedidos/dto/update-pedido.dto'

jest.mock('uuid')

describe('UsersService', () => {
  let service: UsersService
  let repository: Repository<Usuario>

  const bcryptServiceMock = {
    hash: jest.fn(),
    isMatch: jest.fn(),
  }

  const pedidosServiceMock = {
    userExists: jest.fn(),
    getPedidosByUser: jest.fn(),
    findOneById: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    removeById: jest.fn(),
  }

  const usuariosMapperMock = {
    toResponseDto: jest.fn(),
    toEntity: jest.fn(),
    toResponseDtoWithRoles: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            find: jest.fn(),
            findOneBy: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserRole),
          useValue: {},
        },
        {
          provide: BcryptService,
          useValue: bcryptServiceMock,
        },
        {
          provide: PedidosService,
          useValue: pedidosServiceMock,
        },
        {
          provide: UsuariosMapper,
          useValue: usuariosMapperMock,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    repository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should return all users', async () => {
      // Arrange
      const mockUsers = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          username: 'user1',
          email: 'user1@example.com',
          nombre: 'John',
          apellidos: 'Doe',
          password: 'hashedpassword',
          createdAt: new Date(),
          updatedAt: new Date(),
          roles: [],
          isDeleted: false,
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          username: 'user2',
          email: 'user2@example.com',
          nombre: 'Jane',
          apellidos: 'Doe',
          password: 'hashedpassword',
          createdAt: new Date(),
          updatedAt: new Date(),
          roles: [],
          isDeleted: false,
        },
      ]
      jest.spyOn(repository, 'find').mockResolvedValue(mockUsers)

      // Act
      const result = await service.findAll()

      // Assert
      expect(result).toEqual(
        mockUsers.map((user) => usuariosMapperMock.toResponseDto(user)),
      )
      expect(repository.find).toHaveBeenCalled()
    })

    it('should return empty array when no users found', async () => {
      // Arrange
      jest.spyOn(repository, 'find').mockResolvedValue([])

      // Act
      const result = await service.findAll()

      // Assert
      expect(result).toEqual([])
      expect(repository.find).toHaveBeenCalled()
    })
  })
  describe('findOne', () => {
    it('should return a user by id', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174001'
      const mockUser = {
        id: userId,
        username: 'user1',
        email: 'user1@example.com',
        nombre: 'John',
        apellidos: 'Doe',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [],
        isDeleted: false,
      }
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(mockUser)

      // Act
      const result = await service.findOne(userId)

      // Assert
      expect(result).toEqual(usuariosMapperMock.toResponseDto(mockUser))
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: userId })
    })
  })
  describe('create', () => {
    it('should throw BadRequestException if username already exists', async () => {
      // Arrange
      const existingUser = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        username: 'existinguser',
        nombre: 'jhon',
        apellidos: 'doe',
        email: 'existinguser@example.com',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [],
        isDeleted: false,
      }

      const createUserDto: CreateUserDto = {
        username: existingUser.username,
        nombre: 'jhon',
        apellidos: 'doe',
        email: 'newuser@example.com',
        password: 'password123',
        roles: ['USER'],
      }

      jest.spyOn(service, 'findByUsername').mockResolvedValue(existingUser)

      // Act and Assert
      await expect(service.create(createUserDto)).rejects.toThrowError(
        BadRequestException,
      )
      expect(service.findByUsername).toHaveBeenCalledWith(
        createUserDto.username,
      )
    })
  })
  describe('deleteById', () => {
    it('should delete a user by id (logical deletion)', async () => {
      // Arrange
      const existingUser = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        username: 'existinguser',
        nombre: 'jhon',
        apellidos: 'doe',
        email: 'existinguser@example.com',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [],
        isDeleted: false,
      }

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(existingUser)
      jest.spyOn(pedidosServiceMock, 'userExists').mockResolvedValue(true)
      jest
        .spyOn(repository, 'save')
        .mockImplementation(async (user: Usuario) => user)

      // Act
      await service.deleteById('123e4567-e89b-12d3-a456-426614174001')

      // Assert
      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: '123e4567-e89b-12d3-a456-426614174001',
      })
      expect(pedidosServiceMock.userExists).toHaveBeenCalledWith(
        existingUser.id,
      )
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '123e4567-e89b-12d3-a456-426614174001',
          isDeleted: true,
        }),
      )
    })

    it('should delete a user by id (physical deletion)', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174001'
      const existingUser = {
        id: userId,
        username: 'existinguser',
        nombre: 'jhon',
        apellidos: 'doe',
        email: 'existinguser@example.com',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [],
        isDeleted: false,
      }

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(existingUser)
      jest.spyOn(pedidosServiceMock, 'userExists').mockResolvedValue(false)
      jest.spyOn(repository, 'delete').mockResolvedValue(undefined)

      // Act
      const result = await service.deleteById(userId)

      // Assert
      expect(result).toBeUndefined()
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: userId })
      expect(pedidosServiceMock.userExists).toHaveBeenCalledWith(
        existingUser.id,
      )

      expect(repository.delete).toHaveBeenCalledWith({ id: userId })
    })

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174001'
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(undefined)

      // Act & Assert
      await expect(service.deleteById(userId)).rejects.toThrowError(
        NotFoundException,
      )
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: userId })
    })
  })
  describe('update', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174001'

    it('should update user profile without roles', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        nombre: 'Updated Name',
        apellidos: 'Updated Lastname',
        username: 'updatedusername',
        email: 'updated@example.com',
        password: 'updatedpassword',
        isDeleted: false,
        roles: ['USER'],
      }

      const existingUser = {
        id: userId,
        username: 'existinguser',
        nombre: 'jhon',
        apellidos: 'doe',
        email: 'existinguser@example.com',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [],
        isDeleted: false,
      }

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(existingUser)
      jest
        .spyOn(bcryptServiceMock, 'hash')
        .mockResolvedValue('updatedhashedpassword')
      jest
        .spyOn(repository, 'save')
        .mockImplementation(async (user: Usuario) => user)

      // Act
      await service.update(userId, updateUserDto)

      // Assert
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: userId })
      expect(bcryptServiceMock.hash).toHaveBeenCalledWith('updatedpassword')
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: userId,
          username: 'updatedusername',
          nombre: 'Updated Name',
          apellidos: 'Updated Lastname',
          email: 'updated@example.com',
          password: 'updatedhashedpassword',
          roles: [], // Puedes ajustar esto según sea necesario
          isDeleted: false,
        }),
      )
    })

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        nombre: 'Updated Name',
        apellidos: 'Updated Lastname',
        username: 'updatedusername',
        email: 'updated@example.com',
        password: 'updatedpassword',
        roles: ['ADMIN'],
        isDeleted: false,
      }
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(undefined)

      // Act & Assert
      await expect(service.update(userId, updateUserDto)).rejects.toThrowError(
        NotFoundException,
      )
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: userId })
    })
  })
  describe('getPedidos', () => {
    it('should return user orders', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174001'
      const userOrders = [
        { id: 'order1', productId: 'product1', quantity: 2 },
        { id: 'order2', productId: 'product2', quantity: 1 },
      ]

      jest
        .spyOn(pedidosServiceMock, 'getPedidosByUser')
        .mockResolvedValue(userOrders)

      // Act
      const result = await service.getPedidos(userId)

      // Assert
      expect(result).toEqual(userOrders)
      expect(pedidosServiceMock.getPedidosByUser).toHaveBeenCalledWith(userId)
    })
    it('should handle case where user has no orders', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174002'

      jest.spyOn(pedidosServiceMock, 'getPedidosByUser').mockResolvedValue([])

      // Act
      const result = await service.getPedidos(userId)

      // Assert
      expect(result).toEqual([])
      expect(pedidosServiceMock.getPedidosByUser).toHaveBeenCalledWith(userId)
    })

    it('should handle errors from pedidosService', async () => {
      // Arrange
      const userId = 'invalidUserId'

      jest
        .spyOn(pedidosServiceMock, 'getPedidosByUser')
        .mockRejectedValue(new Error('Some error from pedidosService'))

      // Act & Assert
      await expect(service.getPedidos(userId)).rejects.toThrowError(
        'Some error from pedidosService',
      )
      expect(pedidosServiceMock.getPedidosByUser).toHaveBeenCalledWith(userId)
    })
  })
  describe('getPedido', () => {
    it('should return the order for a valid user and order ID', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174001'
      const orderId = 'order1'
      const order = {
        id: orderId,
        idCliente: userId,
      }

      jest.spyOn(pedidosServiceMock, 'findOneById').mockResolvedValue(order)

      // Act
      const result = await service.getPedido(userId, orderId)

      // Assert
      expect(result).toEqual(order)
      expect(pedidosServiceMock.findOneById).toHaveBeenCalledWith(orderId)
    })

    it('should throw ForbiddenException if the user does not have permission', async () => {
      // Arrange
      const userId = 'user1'
      const orderId = 'order1'
      const order = {
        id: orderId,
        idCliente: 'differentUser',
      }

      jest.spyOn(pedidosServiceMock, 'findOneById').mockResolvedValue(order)

      // Act & Assert
      await expect(service.getPedido(userId, orderId)).rejects.toThrowError(
        ForbiddenException,
      )
      expect(pedidosServiceMock.findOneById).toHaveBeenCalledWith(orderId)
    })

    it('should handle errors from pedidosService', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174001'
      const orderId = 'invalidOrderId'

      jest
        .spyOn(pedidosServiceMock, 'findOneById')
        .mockRejectedValue(new Error('Some error from pedidosService'))

      // Act & Assert
      await expect(service.getPedido(userId, orderId)).rejects.toThrowError(
        'Some error from pedidosService',
      )
      expect(pedidosServiceMock.findOneById).toHaveBeenCalledWith(orderId)
    })
  })
  describe('createPedido', () => {
    it('should create a new order for the authenticated user', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174001'
      const createPedidoDto = { idCliente: userId } as CreatePedidoDto
      const pedido = { idCliente: userId } as Pedido

      jest.spyOn(pedidosServiceMock, 'create').mockResolvedValue(pedido)

      // Act
      const result = await service.createPedido(createPedidoDto, userId)

      // Assert
      expect(result).toBeDefined()
      expect(pedidosServiceMock.create).toHaveBeenCalledWith(createPedidoDto)
    })

    it('should throw BadRequestException if idCliente is different from authenticated user', async () => {
      // Arrange
      const userId = 'user1'
      const createPedidoDto = {} as CreatePedidoDto

      // Act & Assert
      await expect(
        service.createPedido(createPedidoDto, userId),
      ).rejects.toThrowError(BadRequestException)
    })
  })
  describe('updatePedido', () => {
    it('should update an order for the authenticated user', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174001'
      const orderId = 'order1'
      const updatePedidoDto = {
        idCliente: userId,
      } as UpdatePedidoDto
      const pedido = { idCliente: userId } as Pedido
      jest.spyOn(pedidosServiceMock, 'findOneById').mockResolvedValue(pedido)
      jest.spyOn(pedidosServiceMock, 'updateById').mockResolvedValue(pedido)

      // Act
      const result = await service.updatePedido(
        orderId,
        updatePedidoDto,
        userId,
      )

      // Assert
      expect(result).toBeDefined()
      expect(pedidosServiceMock.findOneById).toHaveBeenCalledWith(orderId)
      expect(pedidosServiceMock.updateById).toHaveBeenCalledWith(
        orderId,
        updatePedidoDto,
      )
    })

    it('should throw BadRequestException if idCliente in updatePedidoDto is different from authenticated user', async () => {
      // Arrange
      const userId = 'user1'
      const orderId = 'order1'
      const updatePedidoDto = {
        idCliente: 'differentUser',
      }

      // Act & Assert
      await expect(
        service.updatePedido(orderId, updatePedidoDto, userId),
      ).rejects.toThrowError(BadRequestException)
    })

    it('should throw Badrequest', async () => {
      // Arrange
      const userId = 'user1'
      const orderId = 'order1'
      const updatePedidoDto = {
        idCliente: 'differentUser',
      }
      const pedido = {} as Pedido
      jest.spyOn(pedidosServiceMock, 'findOneById').mockResolvedValue(pedido)

      // Act & Assert
      await expect(
        service.updatePedido(orderId, updatePedidoDto, userId),
      ).rejects.toThrowError(BadRequestException)
    })
  })
  describe('removePedido', () => {
    it('should remove an order for the authenticated user', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174001'
      const orderId = 'order1'
      const pedido = { idCliente: userId } as Pedido
      jest.spyOn(pedidosServiceMock, 'findOneById').mockResolvedValue(pedido)
      jest.spyOn(pedidosServiceMock, 'removeById').mockResolvedValue(undefined)

      // Act
      const result = await service.removePedido(orderId, userId)

      // Assert
      expect(result).toBeUndefined()
      expect(pedidosServiceMock.findOneById).toHaveBeenCalledWith(orderId)
      expect(pedidosServiceMock.removeById).toHaveBeenCalledWith(orderId)
    })

    it('should throw ForbiddenException when removing an order not owned by the authenticated user', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174001'
      const orderId = 'order1'
      const pedido = { idCliente: 'anotherUserId' } as Pedido
      jest.spyOn(pedidosServiceMock, 'findOneById').mockResolvedValue(pedido)
      jest.spyOn(pedidosServiceMock, 'removeById').mockResolvedValue(undefined)

      // Act & Assert
      await expect(service.removePedido(orderId, userId)).rejects.toThrowError(
        ForbiddenException,
      )
      expect(pedidosServiceMock.findOneById).toHaveBeenCalledWith(orderId)
    })
  })
})
