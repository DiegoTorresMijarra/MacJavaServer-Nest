import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { UsersService } from '../usuarios/users.service'
import { AuthMapper } from './mappers/usuarios.mapper'
import { JwtService } from '@nestjs/jwt'
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common'
import { UserSignUpDto } from './dto/user-sign.up.dto'
import { UserSignInDto } from './dto/user-sign.in.dto'

describe('AuthService', () => {
  let authService: AuthService
  let usersServiceMock: UsersService
  let authMapperMock: AuthMapper
  let jwtServiceMock: JwtService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn((user) => ({
              id: 1,
              username: user.username,
              password: 'hashed_password',
              // Add other properties as needed
            })),
            findByUsername: jest.fn((username) =>
              username === 'john_doe'
                ? {
                    id: 1,
                    username: 'john_doe',
                    password: 'hashed_password',
                    // Add other properties as needed
                  }
                : null,
            ),
            validatePassword: jest.fn(
              (plainPassword, hashedPassword) =>
                plainPassword === 'Password123' &&
                hashedPassword === 'hashed_password',
            ),
            findOne: jest.fn((id) => ({
              id,
              username: 'john_doe',
              password: 'hashed_password',
              // Add other properties as needed
            })),
          },
        },
        {
          provide: AuthMapper,
          useValue: {
            toCreateDto: jest.fn((userSignUpDto) => ({
              nombre: userSignUpDto.nombre,
              apellidos: userSignUpDto.apellidos,
              username: userSignUpDto.username,
              email: userSignUpDto.email,
              password: userSignUpDto.password,
              roles: ['USER'],
            })),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mocked_access_token'),
          },
        },
      ],
    }).compile()

    authService = module.get<AuthService>(AuthService)
    usersServiceMock = module.get<UsersService>(UsersService)
    authMapperMock = module.get<AuthMapper>(AuthMapper)
    jwtServiceMock = module.get<JwtService>(JwtService)
  })

  describe('singUp', () => {
    it('should sign up a user and return access token', async () => {
      const userSignUpDto: UserSignUpDto = {
        nombre: 'John',
        apellidos: 'Doe',
        username: 'john_doe',
        email: 'john@example.com',
        password: 'Password123',
      }

      const result = await authService.singUp(userSignUpDto)

      expect(authMapperMock.toCreateDto).toHaveBeenCalledWith(userSignUpDto)
      expect(usersServiceMock.create).toHaveBeenCalledWith({
        id: 1,
        username: 'john_doe',
        password: 'hashed_password',
        // Add other properties as needed
      })
      expect(result).toEqual({
        access_token: 'mocked_access_token',
      })
    })
  })

  describe('singIn', () => {
    it('should sign in a user and return access token', async () => {
      const userSignInDto: UserSignInDto = {
        username: 'john_doe',
        password: 'Password123',
      }

      const result = await authService.singIn(userSignInDto)

      expect(usersServiceMock.findByUsername).toHaveBeenCalledWith('john_doe')
      expect(usersServiceMock.validatePassword).toHaveBeenCalledWith(
        'Password123',
        'hashed_password',
      )
      expect(result).toEqual({
        access_token: 'mocked_access_token',
      })
    })

    it('should throw BadRequestException if user is not found', async () => {
      const userSignInDto: UserSignInDto = {
        username: 'nonexistent_user',
        password: 'Password123',
      }

      await expect(authService.singIn(userSignInDto)).rejects.toThrowError(
        BadRequestException,
      )
      expect(usersServiceMock.findByUsername).toHaveBeenCalledWith(
        'nonexistent_user',
      )
    })

    it('should throw BadRequestException if password is invalid', async () => {
      const userSignInDto: UserSignInDto = {
        username: 'john_doe',
        password: 'InvalidPassword',
      }

      await expect(authService.singIn(userSignInDto)).rejects.toThrowError(
        BadRequestException,
      )
      expect(usersServiceMock.validatePassword).toHaveBeenCalledWith(
        'InvalidPassword',
        'hashed_password',
      )
    })
  })

  describe('validateUser', () => {
    it('should validate user and return user details', async () => {
      const result = await authService.validateUser(1)

      expect(usersServiceMock.findOne).toHaveBeenCalledWith(1)
      expect(result).toEqual({
        id: 1,
        username: 'john_doe',
        password: 'hashed_password',
        // Add other properties as needed
      })
    })
  })

  describe('getAccessToken', () => {
    it('should return access token', () => {
      const result = authService['getAccessToken'](1)

      expect(jwtServiceMock.sign).toHaveBeenCalledWith({ id: 1 })
      expect(result).toEqual({
        access_token: 'mocked_access_token',
      })
    })

    it('should throw InternalServerErrorException on token generation error', () => {
      jest.spyOn(jwtServiceMock, 'sign').mockImplementation(() => {
        throw new Error('Mocked error')
      })

      expect(() => authService['getAccessToken'](1)).toThrowError(
        InternalServerErrorException,
      )
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({ id: 1 })
    })
  })
})
