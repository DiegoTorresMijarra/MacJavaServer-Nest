import { Injectable } from '@nestjs/common'
import { CreateRestauranteDto } from './dto/create-restaurante.dto'
import { UpdateRestauranteDto } from './dto/update-restaurante.dto'

@Injectable()
export class RestaurantesService {
  create(createRestauranteDto: CreateRestauranteDto) {
    return 'This action adds a new restaurante'
  }

  findAll() {
    return `This action returns all restaurantes`
  }

  findOne(id: number) {
    return `This action returns a #${id} restaurante`
  }

  update(id: number, updateRestauranteDto: UpdateRestauranteDto) {
    return `This action updates a #${id} restaurante`
  }

  remove(id: number) {
    return `This action removes a #${id} restaurante`
  }
}
