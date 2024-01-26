import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { PosicionesService } from './posiciones.service'
import { CreatePosicionDto } from './dto/create-posicion.dto'
import { UpdatePosicionDto } from './dto/update-posicion.dto'

@Controller('posiciones')
export class PosicionesController {
  constructor(private readonly posicionesService: PosicionesService) {}

  @Post()
  create(@Body() createPosicioneDto: CreatePosicionDto) {
    return this.posicionesService.create(createPosicioneDto)
  }

  @Get()
  findAll() {
    return this.posicionesService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.posicionesService.findOne(+id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePosicioneDto: UpdatePosicionDto,
  ) {
    return this.posicionesService.update(+id, updatePosicioneDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.posicionesService.remove(+id)
  }
}
