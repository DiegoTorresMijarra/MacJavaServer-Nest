import { Logger, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import * as process from 'process'
import * as Path from 'path'
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
        database: process.env.POSTGRES_DATABASE || 'MacJava_PS', // Nombre de la base de datos
        entities: [], // Entidades de la base de datos (buscar archivos con extensión .entity.ts o .entity.js)
        synchronize: false, // Sincronizar la base de datos
        //autoLoadEntities: true, //me daba un error al cargar las entidades si no lo metia
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
export class DataBaseConfigModule {}
