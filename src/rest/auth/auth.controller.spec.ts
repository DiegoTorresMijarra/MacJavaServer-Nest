import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserSignUpDto } from './dto/user-sign.up.dto'
import { UserSignInDto } from './dto/user-sign.in.dto'
import { JwtService } from '@nestjs/jwt'
import { BadRequestException, INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { UsersService } from '../usuarios/users.service'
import { AuthMapper } from './mappers/usuarios.mapper'

describe('AuthController', () => {
  let app: INestApplication

  const usersServiceMock = {
    create: jest.fn(),
    findByUsername: jest.fn(),
    validatePassword: jest.fn(),
  }

  const jwtServiceMock = {
    sign: jest.fn(),
  }

  const authMapperMock = {
    toCreateDto: jest.fn(),
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: AuthMapper,
          useValue: authMapperMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile()

    app = module.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /auth/signup', () => {
    it('should register a user and return an access token', async () => {
      const userSignUpDto: UserSignUpDto = {
        nombre: 'John',
        apellidos: 'Doe',
        username: 'john_doe',
        email: 'john@example.com',
        password: 'Password123',
      }

      usersServiceMock.create.mockResolvedValueOnce({ id: '1' })
      jwtServiceMock.sign.mockReturnValueOnce('mocked_access_token')

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(userSignUpDto)
        .expect(201)

      expect(response.body).toHaveProperty('access_token')
    })

    it('should handle errors for duplicate user registration', async () => {
      const duplicatedUserSignUpDto: UserSignUpDto = {
        nombre: 'John',
        apellidos: 'Doe',
        username: 'john_doe',
        email: 'john@example.com',
        password: 'Password123',
      }

      usersServiceMock.create.mockRejectedValueOnce(
        new BadRequestException('Usuario ya registrado'),
      )

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(duplicatedUserSignUpDto)
        .expect(400)

      expect(response.body).toHaveProperty('message', 'Usuario ya registrado')
    })
  })

  describe('POST /auth/signin', () => {
    it('should sign in a user and return an access token', async () => {
      const userSignInDto: UserSignInDto = {
        username: 'john_doe',
        password: 'Password123',
      }

      const mockedUser = {
        id: '1',
        username: 'john_doe',
        password: 'hashed_password',
      }
      usersServiceMock.findByUsername.mockResolvedValueOnce(mockedUser)
      usersServiceMock.validatePassword.mockResolvedValueOnce(true)
      jwtServiceMock.sign.mockReturnValueOnce('mocked_access_token')

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(userSignInDto)
        .expect(201)

      expect(response.body).toHaveProperty('access_token')
    })

    it('should handle errors for invalid credentials during sign in', async () => {
      const invalidUserSignInDto: UserSignInDto = {
        username: 'john_doe',
        password: 'InvalidPassword',
      }

      usersServiceMock.findByUsername.mockResolvedValueOnce(null)

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(invalidUserSignInDto)
        .expect(400)

      expect(response.body).toHaveProperty(
        'message',
        'username or password are invalid',
      )
    })
  })
})
