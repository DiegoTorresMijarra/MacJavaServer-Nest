import { Logger, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import * as process from 'process'
import { Posicion } from '../../rest/posiciones/entities/posicion.entity'
import { Trabajador } from '../../rest/trabajadores/entities/trabajadores.entity'
import { Cliente } from '../../rest/clientes/entities/cliente.entity'
import { Proveedor } from '../../rest/proveedores/entities/proveedores.entity'
import { Producto } from '../../rest/productos/entities/producto.entity'
import { Restaurante } from '../../rest/restaurantes/entities/restaurante.entity'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  imports: [
    // Configurar el módulo de base de datos de Postgres asíncronamente
    // TypeOrm
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        type: 'postgres', // Tipo de base de datos
        host: process.env.POSTGRES_HOST || 'localhost', // Dirección del servidor
        port: parseInt(process.env.POSTGRES_PORT) || 5432, // Puerto del servidor
        username: process.env.DATABASE_USER || 'admin', // Nombre de usuario
        password: process.env.DATABASE_PASSWORD || 'admin123', // Contraseña de usuario
        database: process.env.POSTGRES_DATABASE || 'MACJAVA_PS', // Nombre de la base de datos
        entities: [
          Posicion,
          Trabajador,
          Cliente,
          Proveedor,
          Producto,
          Restaurante,
        ], // Entidades de la base de datos (buscar archivos con extensión .entity.ts o .entity.js)
        synchronize: false, // Sincronizar la base de datos
        autoLoadEntities: true, //me daba un error al cargar las entidades si no lo metia todo
        logging: process.env.NODE_ENV === 'dev' ? 'all' : false, // Esto es para que se muestren los logs de las consultas
        retryAttempts: 5,
        connectionFactory: (connection) => {
          Logger.log('Postgres database connected', 'PostgresDBConfigModule')
          return connection
        },
      }),
    }),
  ],
})
export class DataBasePostgreSQLConfigModule {}

@Module({
  imports: [
    // Configurar el módulo de base de datos de Mongo asíncronamente
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: `mongodb://${process.env.DATABASE_USER || 'admin'}:${process.env.DATABASE_PASSWORD || 'admin123'}@${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || '27017'}/${process.env.MONGO_DATABASE || 'MACJAVA_MDB'}`,
        retryAttempts: 3,
        connectionFactory: (connection) => {
          Logger.log(
            `MongoDB readyState: ${connection.readyState}`,
            'DataBaseMongoDBConfigModule',
          )
          return connection
        },
      }),
    }),
  ],
})
export class DataBaseMongoDBConfigModule {}
