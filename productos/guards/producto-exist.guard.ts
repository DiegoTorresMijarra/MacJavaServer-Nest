import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ProductoService } from '../productos.service';
@Injectable()
export class ProductoExistsGuard implements CanActivate {
  constructor(private readonly productsService: ProductoService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const productId = parseInt(request.params.id, 10);
    if (isNaN(productId)) {
      throw new BadRequestException('El id del producto no es válido');
    }
    return this.productsService.exists(productId).then((exists) => {
      if (!exists) {
        throw new BadRequestException('El ID del producto no existe');
      }
      return true;
    });
  }
}
