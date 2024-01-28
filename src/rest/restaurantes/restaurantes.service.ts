import {Inject, Injectable, Logger, NotFoundException} from '@nestjs/common'
import { CreateRestauranteDto } from './dto/create-restaurante.dto'
import { UpdateRestauranteDto } from './dto/update-restaurante.dto'
import {trabajadoresAnyadidosDto} from "./dto/trabajadores-anyadidos.dto";
import {Restaurante} from "./entities/restaurante.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {RestaurantesMapper} from "./mapper/restaurantes.mapper";
import {CACHE_MANAGER} from "@nestjs/common/cache";
import {async} from "rxjs";

@Injectable()
export class RestaurantesService {
  logger= new Logger(RestaurantesService.name);

  constructor(
      @InjectRepository(Restaurante)
        private readonly repositorioRestaurante : Repository<Restaurante>,
      private readonly mapper: RestaurantesMapper,
  ){}
  async findAll() {
    this.logger.log('Obteniendo todos los restaurantes (Service)');
    return await this.repositorioRestaurante.find();
  }

  async findOne(id: number) {
    this.logger.log(`Obteniendo el restaurante con id: ${id} (Service)`);
    const restaurante = await this.existeRestaurantePorId(id);
    if (restaurante) {
      return restaurante;
    } else {
      throw new NotFoundException(`Restaurante con id: ${id} no encontrado`)
    }
  }

  //No se puede crear un restaurante que tenga el nombre de uno ya existente
  async create(createRestauranteDto: CreateRestauranteDto) {
    this.logger.log(`Creando un restaurante (Service)`);
    //primero con el primer metodo de dtoAEntidad falta prueba
    const rest= this.existeRestaurantePorNombre(createRestauranteDto.nombre);
    if (rest) {
      throw new NotFoundException(`Restaurante con nombre: ${createRestauranteDto.nombre} ya existe, ingrese otro nombre`)
    }else{
        const restaurante= this.mapper.createDtoToEntity(createRestauranteDto);
        await this.repositorioRestaurante.save(restaurante);
        return restaurante;
    }
  }

  async update(id: number, updateRestauranteDto: UpdateRestauranteDto) {
    this.logger.log(`Actualizando un restaurante (Service)`);
    const restaurante: Restaurante|false = await this.existeRestaurantePorId(id);
    if(restaurante){
      const restauranteActualizado = this.mapper.updateDtoToEntity(updateRestauranteDto, restaurante);
      await this.repositorioRestaurante.save(restauranteActualizado);
    }else{
        throw new NotFoundException(`Restaurante con id: ${id} no encontrado`)
    }
  }


  async findByName(nombre: string) {
        this.logger.log(`Obteniendo el restaurante con nombre: ${nombre} (Service)`);
        const restaurante = await this.existeRestaurantePorNombre(nombre);
        if (restaurante) {
            return restaurante;
        } else {
            throw new NotFoundException(`Restaurante con nombre: ${nombre} no encontrado`)
        }
    }

  async removeSoft(id: number) {
        this.logger.log(`Eliminando restaurante con id ${id} (Service)`);
        const restaurante = await this.existeRestaurantePorId(id);
        if (restaurante) {
            restaurante.borrado = true;
            await this.repositorioRestaurante.save(restaurante);
        } else {
          throw new NotFoundException(`Restaurante con id: ${id} no encontrado`)
        }
    }

  async existeRestaurantePorId(id: number): Promise<false|Restaurante> {
    const restau= await this.repositorioRestaurante.findOneBy({id})
    if (restau) {
      return restau;
    }else{
      return false;
    }
  }

  async existeRestaurantePorNombre(nombre: string): Promise<Restaurante|false> {
    const restau= await this.repositorioRestaurante.findOneBy({nombre})
    if (restau) {
      return restau;
    }else{
      return false;
    }
  }

    // Metodo añadir trabajadores a un restaurante uno o varios a la vez
    anyadirTrabajadores(trabajadores: trabajadoresAnyadidosDto) {}

    // Metodo eliminar trabajadores de un restaurante uno a uno
}
