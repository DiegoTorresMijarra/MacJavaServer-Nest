import {Restaurante} from "../entities/restaurante.entity";
import {CreateRestauranteDto} from "../dto/create-restaurante.dto";
import { plainToClass } from 'class-transformer';
import {UpdateRestauranteDto} from "../dto/update-restaurante.dto";

/**
 * Clase que se encarga de mapear los datos de los restaurantes, de dtos a entidades
 * @class
 *
 */
export class RestaurantesMapper{

    /**
     * Convierte un dto de creación a una entidad
     * @param dto - datos del restaurante
     * @returns entidad Restaurante
     */
    createDtoToEntity(dto: CreateRestauranteDto): Restaurante{
        const restaurante: Restaurante = {
            id: null,
            borrado: false,
            ...dto,
            creadoEn: new Date(),
            actualizadoEn: new Date(),
        };
        restaurante.nombre=restaurante.nombre.toLowerCase();
        restaurante.calle=restaurante.calle.toLowerCase();
        restaurante.localidad=restaurante.localidad.toLowerCase();

        return restaurante;
    }

    /**
     * Convierte un dto de creación a una entidad
     * @param dto - datos del restaurante
     * @returns entidad Restaurante
     */
    createDtoToEntity2(dto: CreateRestauranteDto): Restaurante{
        const restau: Restaurante = plainToClass(Restaurante, dto);
        restau.creadoEn = new Date();
        restau.actualizadoEn = new Date();
        restau.nombre=restau.nombre.toLowerCase();
        restau.calle=restau.calle.toLowerCase();
        restau.localidad=restau.localidad.toLowerCase();

        return restau;
    }

    /**
     * Convierte un dto de actualización a una entidad
     * @param dto - datos del restaurante
     * @param restaurante - entidad del restaurante
     * @returns entidad Restaurante
     */
    updateDtoToEntity(dto: UpdateRestauranteDto, restaurante: Restaurante): Restaurante{
        const restauranteNuevo : Restaurante = {
            ...restaurante,
            ...dto,
        };
        restauranteNuevo.nombre=restauranteNuevo.nombre.toLowerCase();
        restauranteNuevo.calle=restauranteNuevo.calle.toLowerCase();
        restauranteNuevo.localidad=restauranteNuevo.localidad.toLowerCase();
        restauranteNuevo.actualizadoEn = new Date();
        return restauranteNuevo;
    }
}