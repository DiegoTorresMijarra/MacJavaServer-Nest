import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { TrabajadoresService } from './trabajadores.service'
import { CreateTrabajadoreDto } from './dto/create-trabajadore.dto'
import { UpdateTrabajadoreDto } from './dto/update-trabajadore.dto'

@Controller('trabajadores')
export class TrabajadoresController {
  constructor(private readonly trabajadoresService: TrabajadoresService) {}

  @Post()
  create(@Body() createTrabajadoreDto: CreateTrabajadoreDto) {
    return this.trabajadoresService.create(createTrabajadoreDto)
  }

  @Get()
  findAll() {
    return this.trabajadoresService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trabajadoresService.findOne(+id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTrabajadoreDto: UpdateTrabajadoreDto,
  ) {
    return this.trabajadoresService.update(+id, updateTrabajadoreDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trabajadoresService.remove(+id)
  }
}
