import { Injectable } from '@nestjs/common'
import { CreateTrabajadoreDto } from './dto/create-trabajadore.dto'
import { UpdateTrabajadoreDto } from './dto/update-trabajadore.dto'

@Injectable()
export class TrabajadoresService {
  create(createTrabajadoreDto: CreateTrabajadoreDto) {
    return 'This action adds a new trabajadore'
  }

  findAll() {
    return `This action returns all trabajadores`
  }

  findOne(id: number) {
    return `This action returns a #${id} trabajadore`
  }

  update(id: number, updateTrabajadoreDto: UpdateTrabajadoreDto) {
    return `This action updates a #${id} trabajadore`
  }

  remove(id: number) {
    return `This action removes a #${id} trabajadore`
  }
}
