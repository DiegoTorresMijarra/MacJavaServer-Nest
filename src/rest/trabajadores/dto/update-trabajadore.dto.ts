import { PartialType } from '@nestjs/mapped-types'
import { CreateTrabajadoreDto } from './create-trabajadore.dto'

export class UpdateTrabajadoreDto extends PartialType(CreateTrabajadoreDto) {}
