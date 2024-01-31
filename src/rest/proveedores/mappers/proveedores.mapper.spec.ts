import {Test, TestingModule} from "@nestjs/testing";
import {ProveedoresMapper} from "./proveedores.mapper";
import {CreateProveedoresDto} from "../dto/create-proveedores.dto";
import {Proveedores} from "../entities/proveedores.entity";
import {UpdateProveedoresDto} from "../dto/update-proveedores.dto";

describe('ProveedoresMapper', () => {
    let provider: ProveedoresMapper

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ProveedoresMapper],
        }).compile()

        provider = module.get<ProveedoresMapper>(ProveedoresMapper)
    })

    it('should be defined', () => {
        expect(provider).toBeDefined()
    })

    describe('ProveedoresMapper', () => {
        let proveedoresMapper: ProveedoresMapper

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [ProveedoresMapper],
            }).compile()

            proveedoresMapper = module.get<ProveedoresMapper>(ProveedoresMapper)
        })

        it('should be defined', () => {
            expect(proveedoresMapper).toBeDefined()
        })

        it('Mapear CreateDto a Proveedor', () => {
            const createProveedoresDto: CreateProveedoresDto = {
                nombre: 'Pizza 4 Quesos',
                tipo: 'Pizzas',
                tlf: '690135540',
            }

            const expectedProveedor: Proveedores = {
                id: 1,
                nombre: 'Pizza 4 Quesos',
                tipo: 'Pizzas',
                tlf: '690135540',
                fechaCre: new Date(),
                fechaUp: new Date(),
                isActive: true,
                productos: [],
            }

            const actualProveedor: Proveedores =
                proveedoresMapper.toEntity(createProveedoresDto)

            expect(actualProveedor.nombre).toEqual(
                expectedProveedor.nombre,
            )
        })

        it('Mapear UpdateDto a Proveedor', () => {
            const updateproveedoresDto: UpdateProveedoresDto = {
                nombre: 'Pizza 4 Quesos',
                tipo: 'Pizzas',
                tlf: '690135540',
                isActive: false,
            }

            const expectedCategoriaEntity: Proveedores = {
                id: 1,
                nombre: 'Pizza 4 Quesos',
                tipo: 'Pizzas',
                tlf: '690135540',
                fechaCre: new Date(),
                fechaUp: new Date(),
                isActive: false,
                productos: [],
            }

            const actualProveedor: Proveedores =
                proveedoresMapper.toEntity(updateproveedoresDto)

            expect(actualProveedor).toBeInstanceOf(Proveedores)

            expect(actualProveedor.nombre).toEqual(
                expectedCategoriaEntity.nombre,
            )
        })
    })
})