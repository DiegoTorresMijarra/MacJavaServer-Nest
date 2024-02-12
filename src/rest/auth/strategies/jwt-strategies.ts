import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthService } from '../auth.service'
import { Usuario } from '../../usuarios/entities/user.entity'

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // el token como barer token
      ignoreExpiration: false, // ignora la expiracion
      // La clave secreta
      secretOrKey: Buffer.from(
        process.env.TOKEN_SECRET || 'TokenSecreto',
        'utf-8',
      ).toString('base64'),
    })
  }

  // Si se valida obtenemos el role
  async validate(payload: Usuario) {
    const id = payload.id
    return await this.authService.validateUser(id)
  }
}
