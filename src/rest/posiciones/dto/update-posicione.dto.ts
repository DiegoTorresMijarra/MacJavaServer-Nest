import { PartialType } from '@nestjs/mapped-types'
import { CreatePosicioneDto } from './create-posicione.dto'

export class UpdatePosicioneDto extends PartialType(CreatePosicioneDto) {}
