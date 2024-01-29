import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { ClientesService } from '../clientes.service'

@Injectable()
export class funkoExistGuard implements CanActivate {
  constructor(private readonly clienteService: ClientesService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const clienteId = request.params.id
    if (isNaN(clienteId)) {
      throw new BadRequestException('El ID del cliente no es válido')
    }
    return this.clienteService.exists(clienteId).then((exists) => {
      if (!exists) {
        throw new NotFoundException('El ID del cliente no existe')
      }
      return true
    })
  }
}
