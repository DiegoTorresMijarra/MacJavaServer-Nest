import { Injectable } from '@nestjs/common'
import { UserSignUpDto } from '../dto/user-sign.up.dto'
import { CreateUserDto } from '../../usuarios/dto/create-user.dto'
import { Role } from '../../usuarios/entities/user-role.entity'

@Injectable()
export class AuthMapper {
  toCreateDto(userSignUpDto: UserSignUpDto): CreateUserDto {
    const userCreateDto = new CreateUserDto()
    userCreateDto.nombre = userSignUpDto.nombre
    userCreateDto.apellidos = userSignUpDto.apellidos
    userCreateDto.username = userSignUpDto.username
    userCreateDto.email = userSignUpDto.email
    userCreateDto.password = userSignUpDto.password
    userCreateDto.roles = [Role.USER]
    return userCreateDto
  }
}
