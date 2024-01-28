import {Restaurante} from "../entities/restaurante.entity";
import {CreateRestauranteDto} from "../dto/create-restaurante.dto";
import { plainToClass } from 'class-transformer';
import {UpdateRestauranteDto} from "../dto/update-restaurante.dto";

export class RestaurantesMapper{
    createDtoToEntity(dto: CreateRestauranteDto): Restaurante{
        const restaurante: Restaurante = {
            id: null,
            borrado: false,
            ...dto,
            creadoEn: new Date(),
            actualizadoEn: new Date(),
        };
        restaurante.nombre.toLowerCase();
        restaurante.calle.toLowerCase();
        restaurante.localidad.toLowerCase();

        return restaurante;
    }

    createDtoToEntity2(dto: CreateRestauranteDto): Restaurante{
        const restau: Restaurante = plainToClass(Restaurante, dto);
        return restau;
    }

    updateDtoToEntity(dto: UpdateRestauranteDto, restaurante: Restaurante): Restaurante{
        restaurante = {
            ...restaurante,
            ...dto,
            actualizadoEn: new Date()
        };
        return restaurante;
    }
}