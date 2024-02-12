import { Test, TestingModule } from '@nestjs/testing'
import { UsuariosMapper } from './usuarios.mapper'
import { Usuario } from '../entities/user.entity'
import { CreateUserDto } from '../dto/create-user.dto'
import { Role, UserRole } from '../entities/user-role.entity'

describe('UsuariosMapper', () => {
  let mapper: UsuariosMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsuariosMapper],
    }).compile()

    mapper = module.get<UsuariosMapper>(UsuariosMapper)
  })

  describe('toResponseDto', () => {
    it('should map Usuario entity to UserDto', () => {
      const usuario: Usuario = {
        id: '00000000-0000-0000-0000-000000000001',
        nombre: 'John',
        apellidos: 'Doe',
        password: '1234',
        username: 'johndoe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        roles: [],
      }

      const result = mapper.toResponseDto(usuario)

      expect(result).toBeDefined()
      expect(result.id).toBe(usuario.id)
      expect(result.nombre).toBe(usuario.nombre)
      expect(result.apellidos).toBe(usuario.apellidos)
      expect(result.username).toBe(usuario.username)
      expect(result.email).toBe(usuario.email)
      expect(result.createdAt).toBe(usuario.createdAt)
      expect(result.updatedAt).toBe(usuario.updatedAt)
      expect(result.isDeleted).toBe(usuario.isDeleted)
    })
  })

  describe('toResponseDtoWithRoles', () => {
    it('should map Usuario entity to UserDto with provided roles', () => {
      const usuario: Usuario = {
        id: '00000000-0000-0000-0000-000000000001',
        nombre: 'John',
        apellidos: 'Doe',
        password: '1234',
        username: 'johndoe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        roles: [],
      }
      const roles: UserRole[] = [
        { id: 1, role: Role.USER, usuario: usuario },
        { id: 2, role: Role.ADMIN, usuario: usuario },
      ]

      const result = mapper.toResponseDtoWithRoles(usuario, roles)

      expect(result).toBeDefined()
      expect(result.id).toBe(usuario.id)
      expect(result.nombre).toBe(usuario.nombre)
      expect(result.apellidos).toBe(usuario.apellidos)
      expect(result.username).toBe(usuario.username)
      expect(result.email).toBe(usuario.email)
      expect(result.createdAt).toBe(usuario.createdAt)
      expect(result.updatedAt).toBe(usuario.updatedAt)
      expect(result.isDeleted).toBe(usuario.isDeleted)
    })
  })

  describe('toEntity', () => {
    it('should map CreateUserDto to Usuario entity', () => {
      const createUserDto: CreateUserDto = {
        nombre: 'John',
        apellidos: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password',
        roles: ['ADMIN', 'USER'],
      }

      const result = mapper.toEntity(createUserDto)

      expect(result).toBeDefined()
      expect(result.nombre).toBe(createUserDto.nombre)
      expect(result.apellidos).toBe(createUserDto.apellidos)
      expect(result.username).toBe(createUserDto.username)
      expect(result.email).toBe(createUserDto.email)
      expect(result.password).toBe(createUserDto.password)
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
      expect(result.isDeleted).toBe(false)
    })
  })
})
