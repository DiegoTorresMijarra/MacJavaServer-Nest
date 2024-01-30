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
export class clienteExistGuard implements CanActivate {
  constructor(private readonly clienteService: ClientesService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const clienteId = request.params.id
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    if (!uuidRegex.test(clienteId)) {
      throw new BadRequestException('El ID del cliente no es válido')
    }
    return this.clienteService.existsID(clienteId).then((exists) => {
      if (!exists) {
        throw new NotFoundException('El ID del cliente no existe')
      }
      return true
    })
  }
}
