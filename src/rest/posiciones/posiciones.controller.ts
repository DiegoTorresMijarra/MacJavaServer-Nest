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
import { CreatePosicioneDto } from './dto/create-posicione.dto'
import { UpdatePosicioneDto } from './dto/update-posicione.dto'

@Controller('posiciones')
export class PosicionesController {
  constructor(private readonly posicionesService: PosicionesService) {}

  @Post()
  create(@Body() createPosicioneDto: CreatePosicioneDto) {
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
    @Body() updatePosicioneDto: UpdatePosicioneDto,
  ) {
    return this.posicionesService.update(+id, updatePosicioneDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.posicionesService.remove(+id)
  }
}
