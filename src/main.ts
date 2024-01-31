import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import * as process from 'process'
import { setupSwagger } from './config/swagger/swagger.config'
import * as dotenv from 'dotenv'

dotenv.config()
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  if (process.env.NODE_ENV === 'dev') {
    setupSwagger(app)
  }
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.API_PORT || 3000)
}
bootstrap().then(() =>
  console.log(
    `Servidor escuchando en el puerto ${
      process.env.API_PORT || 3000
    } y con el perfil ${process.env.NODE_ENV || 'dev'}`,
  ),
)
