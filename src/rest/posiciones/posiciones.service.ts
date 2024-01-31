import { Injectable } from '@nestjs/common'
import { CreatePosicioneDto } from './dto/create-posicione.dto'
import { UpdatePosicioneDto } from './dto/update-posicione.dto'

@Injectable()
export class PosicionesService {
  create(createPosicioneDto: CreatePosicioneDto) {
    return 'This action adds a new posicione'
  }

  findAll() {
    return `This action returns all posiciones`
  }

  findOne(id: number) {
    return `This action returns a #${id} posicione`
  }

  update(id: number, updatePosicioneDto: UpdatePosicioneDto) {
    return `This action updates a #${id} posicione`
  }

  remove(id: number) {
    return `This action removes a #${id} posicione`
  }
}
