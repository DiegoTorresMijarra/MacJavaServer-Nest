import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import * as process from 'process'
import { setupSwagger } from './config/swagger/swagger.config'
import * as dotenv from 'dotenv'
import { getSSLOptions } from './config/ssl/ssl.config'

dotenv.config()
async function bootstrap() {
  const httpsOptions = getSSLOptions()
  const app = await NestFactory.create(AppModule, { httpsOptions })
  if (process.env.NODE_ENV === 'dev') {
    setupSwagger(app)
  }
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.API_PORT || 3000)
}
bootstrap().then(() => {
  console.log(
    `Servidor escuchando en el puerto ${process.env.API_PORT || 3000}`,
  )
  if (process.env.NODE_ENV === 'dev') {
    console.log('🛠️ Iniciando Nestjs Modo desarrollo 🛠️')
  } else {
    console.log('🚗 Iniciando Nestjs Modo producción 🚗')
  }
  if (process.env.NODE_ENV === 'dev') {
    console.log(
      `Swagger configurado en la ruta: http:localhost:${process.env.API_PORT || 3000}/api/`,
    )
  }
})
