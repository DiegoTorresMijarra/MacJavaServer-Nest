import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as process from 'process'
import {ValidationPipe} from "@nestjs/common";
import {Connection} from "typeorm";
import {setupSwagger} from "./config/swagger/swagger.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
    const connection = app.get(Connection)

    // Lógica para borrar y recrear datos en la base de datos
    await connection.dropDatabase()
    await connection.synchronize()
  app.setGlobalPrefix(process.env.API_VERSION || 'v1')
  app.useGlobalPipes(new ValidationPipe())

    if (process.env.NODE_ENV === 'dev') {
        setupSwagger(app)
    }

  await app.listen(3000)
}
bootstrap().then(() =>
    console.log(
        `Servidro escichando en el puerto ${
            process.env.API_PORT || 3000
        } y con el perfil ${process.env.NODE_ENV || 'dev'}`,
    ),
)
