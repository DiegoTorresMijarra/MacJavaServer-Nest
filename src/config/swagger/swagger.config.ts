import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { INestApplication } from '@nestjs/common'

// Para evitar que un endpint salga: @ApiExcludeController() // Excluir el controlador de Swagger

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('API REST MacJava Nestjs DAW 2023/2024')
    .setDescription(
      'Tienda MacJava de un API REST con Nestjs para 2º DAW. 2023/2024',
    )
    .setContact(
      'MacJava Nest',
      'https://github.com/DiegoTorresMijarra/MacJavaServer-Nest.git',
      'Jaime9lozano@gmail.com',
    )
    .setLicense('CC BY-NC-SA 4.0', 'https://creativecommons.org/')
    .setVersion('1.0.0')
    .addTag('Clientes', 'Operaciones con los clientes')
    .addTag('Storage', 'Operaciones con almacenamiento')
    .addTag('Auth', 'Operaciones de autenticación')
    .addTag('Posiciones', 'Operaciones con las posiciones')
    .addTag('Trabajadores', 'Operaciones con los trabajadores')
    .addTag('Proveedores', 'Operaciones con proveedores')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document) // http://localhost:3000/api
}
