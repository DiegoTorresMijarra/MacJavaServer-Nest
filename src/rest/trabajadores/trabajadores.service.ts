import { Injectable } from '@nestjs/common'
import { CreateTrabajadorDto } from './dto/create-trabajador.dto'
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto'

@Injectable()
export class TrabajadoresService {
  create(createTrabajadoreDto: CreateTrabajadorDto) {
    return 'This action adds a new trabajadore'
  }

  findAll() {
    return `This action returns all trabajadores`
  }

  findOne(id: number) {
    return `This action returns a #${id} trabajadore`
  }

  update(id: number, updateTrabajadoreDto: UpdateTrabajadorDto) {
    return `This action updates a #${id} trabajadore`
  }

  remove(id: number) {
    return `This action removes a #${id} trabajadore`
  }
}
