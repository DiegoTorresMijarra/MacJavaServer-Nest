import { Test, TestingModule } from '@nestjs/testing'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

jest.mock('./users.service')

describe('UsersController', () => {
  let controller: UsersController
  let usersService: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
      imports: [CacheModule.register()],
    }).compile()

    controller = module.get<UsersController>(UsersController)
    usersService = module.get<UsersService>(UsersService)
  })

  describe('findAll', () => {
    it('debería devolver un array de usuarios para un administrador', async () => {
      // Arrange
      const resultado = [
        {
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
        },
      ]
      jest.spyOn(usersService, 'findAll').mockResolvedValue(resultado)

      // Act
      const respuesta = await controller.findAll()

      // Assert
      expect(respuesta).toEqual(resultado)
      expect(usersService.findAll).toHaveBeenCalled()
    })
  })
  describe('findOne', () => {
    it('should return user details for an admin', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174001'
      const user = {
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
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user)

      // Act
      const response = await controller.findOne(userId)

      // Assert
      expect(response).toEqual(user)
      expect(usersService.findOne).toHaveBeenCalledWith(userId)
    })
  })
  describe('UsersController', () => {
    let controller: UsersController
    let usersService: UsersService

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [UsersController],
        providers: [UsersService],
        imports: [CacheModule.register()],
      }).compile()

      controller = module.get<UsersController>(UsersController)
      usersService = module.get<UsersService>(UsersService)
    })

    describe('create', () => {
      it('should create a user and return 201 status code for an admin', async () => {
        // Arrange
        const createUserDto: CreateUserDto = {
          username: 'existinguser',
          nombre: 'jhon',
          apellidos: 'doe',
          email: 'existinguser@example.com',
          password: 'hashedpassword',
          roles: [],
        }
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
        jest.spyOn(usersService, 'create').mockResolvedValue(existingUser)

        // Act
        const response = await controller.create(createUserDto)

        // Assert
        expect(response).toEqual(existingUser)
        expect(usersService.create).toHaveBeenCalledWith(createUserDto)
      })

      it('should handle errors for duplicate user registration with a 400 status code', async () => {
        // Arrange
        const duplicatedUserDto: CreateUserDto = {
          username: 'username',
          nombre: 'jhon',
          apellidos: 'doe',
          email: 'newuser@example.com',
          password: 'password123',
          roles: ['USER'],
        }
        jest
          .spyOn(usersService, 'create')
          .mockRejectedValueOnce(
            new BadRequestException('Usuario ya registrado'),
          )

        // Act & Assert
        await expect(controller.create(duplicatedUserDto)).rejects.toThrowError(
          BadRequestException,
        )
        expect(usersService.create).toHaveBeenCalledWith(duplicatedUserDto)
      })
    })
  })
  describe('update', () => {
    it('should update a user and return the updated user for an admin', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174001'
      const updateUserDto: UpdateUserDto = {
        nombre: 'Updated Name',
        apellidos: 'Updated Lastname',
        username: 'updatedusername',
        email: 'updated@example.com',
        password: 'updatedpassword',
        isDeleted: false,
        roles: ['USER'],
      }
      const updatedUser = {
        id: userId,
        ...updateUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      jest.spyOn(usersService, 'update').mockResolvedValue(updatedUser)

      // Act
      const response = await controller.update(userId, updateUserDto)

      // Assert
      expect(response).toEqual(updatedUser)
      expect(usersService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
        true,
      )
    })

    it('should handle errors for updating a non-existent user with a 404 status code', async () => {
      // Arrange
      const nonExistentUserId = 'nonexistentuser'
      const updateUserDto: UpdateUserDto = {
        nombre: 'Updated Name',
        apellidos: 'Updated Lastname',
        username: 'updatedusername',
        email: 'updated@example.com',
        password: 'updatedpassword',
        isDeleted: false,
        roles: ['USER'],
      }
      jest
        .spyOn(usersService, 'update')
        .mockRejectedValueOnce(new NotFoundException('Usuario no encontrado'))

      // Act & Assert
      await expect(
        controller.update(nonExistentUserId, updateUserDto),
      ).rejects.toThrowError(NotFoundException)
      expect(usersService.update).toHaveBeenCalledWith(
        nonExistentUserId,
        updateUserDto,
        true,
      )
    })
  })
  describe('getProfile', () => {
    it('should get the profile of the authenticated user', async () => {
      // Arrange
      const authenticatedUser = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        username: 'authenticateduser',
        nombre: 'John',
        apellidos: 'Doe',
        email: 'john@example.com',
        roles: ['USER'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      }
      const requestMock = { user: authenticatedUser }

      // Act
      const response = await controller.getProfile(requestMock)

      // Assert
      expect(response).toEqual(authenticatedUser)
    })
  })
  describe('deleteProfile', () => {
    it('should delete the profile of the authenticated user with a 204 status code', async () => {
      // Arrange
      const authenticatedUser = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        username: 'authenticateduser',
        nombre: 'John',
        apellidos: 'Doe',
        email: 'john@example.com',
        roles: ['USER'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      }
      const requestMock = { user: authenticatedUser }

      // Act
      const response = await controller.deleteProfile(requestMock)

      // Assert
      expect(response).toBeUndefined()
      expect(usersService.deleteById).toHaveBeenCalledWith(authenticatedUser.id)
    })
  })
  describe('updateProfile', () => {
    it('should update the profile of the authenticated user and return the updated profile', async () => {
      // Arrange
      const authenticatedUser = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        username: 'authenticateduser',
        nombre: 'John',
        apellidos: 'Doe',
        email: 'john@example.com',
        roles: ['USER'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      }
      const updateUserDto: UpdateUserDto = {
        nombre: 'Updated Name',
        apellidos: 'Updated Lastname',
        username: 'updatedusername',
        email: 'updated@example.com',
        password: 'updatedpassword',
        isDeleted: false,
        roles: ['USER'],
      }
      const requestMock = { user: authenticatedUser }
      const updatedProfile = { ...authenticatedUser, ...updateUserDto }

      jest.spyOn(usersService, 'update').mockResolvedValueOnce(updatedProfile)

      // Act
      const response = await controller.updateProfile(
        requestMock,
        updateUserDto,
      )

      // Assert
      expect(response).toEqual(updatedProfile)
      expect(usersService.update).toHaveBeenCalledWith(
        authenticatedUser.id,
        updateUserDto,
        false,
      )
    })
  })

  // Puedes escribir pruebas similares para otros métodos en UsersController
})
