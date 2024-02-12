# MacJavaNest

Bienvenido a la API MacJavaNest, desarrollada por Jaime Lozano, Diego Torres, Oscar Encabo, Kelvin Sánchez y Raúl Rodríguez. Esta API ofrece una administración segura, completa y escalable de bases de datos, diseñada para la gestión de un restaurante online.

## Autores

- [Kelvin Sánchez](https://github.com/KevinSanchez5)
- [Jaime Lozano](https://github.com/jaime9lozano)
- [Oscar Encabo](https://github.com/Diokar017)
- [Diego Torres Mijarra](https://github.com/DiegoTorresMijarra)
- [Raul Rodriguez Luna](https://github.com/raulrz11)


## Pdf
[Documento](https://github.com/DiegoTorresMijarra/MacJavaServer-Nest/tree/master/pdf/MacJavaServer-Nest.pdf)

## Video
[Video](https://youtu.be/t7Uu5FNnc3s)

## Nest
Para trabajar con nuestra API, recomendamos mirar: [Nest](https://github.com/DiegoTorresMijarra/MacJavaServer-Nest/tree/master/README_NEST.md)

## ÍNDICE

1. [Introducción](#introducción)
2. [Gitflow](#gitflow)
3. [Tecnologías](#tecnologías)
4. [Bases de datos](#bases-de-datos)
5. [Características comunes de los endpoints](#características-comunes-de-los-endpoints)
6. [Categoría](#categoría)
7. [Trabajadores, clientes y proveedores](#trabajadores-clientes-y-proveedores)
8. [Restaurantes y productos](#restaurantes-y-productos)
9. [Autenticación](#autenticación)
10. [Usuarios](#usuarios)
11. [Pedidos](#pedidos)
12. [Despliegue](#despliegue)
13. [Tests](#tests)
14. [Conclusión y presupuesto](#conclusión-y-presupuesto)

## 1. Introducción <a name="introducción"></a>

La API MacJavaNest ofrece una administración segura, completa y escalable de bases de datos, diseñada para la gestión de un restaurante online. Basada en NestJS, destaca por su uso de TypeScript y su arquitectura escalable y modular.

## 2. Gitflow <a name="gitflow"></a>

Hemos seguido la metodología Gitflow para la organización del proyecto, creando ramas de características (features) que luego se integran en una rama de desarrollo (develop) para su testing y finalmente se fusionan en la rama principal (master) para la implementación.

## 3. Tecnologías <a name="tecnologías"></a>

La API utiliza NestJS como framework principal, aprovechando las características de TypeScript para un código más robusto y mantenible. Entre otras tecnologías destacadas se incluyen cache manager, TypeORM y Mongoose para la interacción con bases de datos, JWT para la autenticación y Jest para las pruebas.

## 4. Bases de datos <a name="bases-de-datos"></a>

Para el almacenamiento de datos estructurados utilizamos PostgreSQL, mientras que para datos semi-estructurados como los pedidos empleamos MongoDB. Estas bases de datos ofrecen robustez, escalabilidad y rendimiento para las necesidades de la aplicación.

## 5. Características comunes de los endpoints <a name="características-comunes-de-los-endpoints"></a>

Varios endpoints comparten características comunes, incluyendo modelos con notaciones de TypeORM, uso de UUIDs y Autonuméricos, DTOs y Mappers para la transferencia de datos, y métodos comunes como findAll, findById, save, update y deleteById.

## 6. Categoría <a name="categoría"></a>

El endpoint de categoría gestiona los roles (puestos) dentro del restaurante, con detalles como el nombre del puesto y un salario base asociado.

## 7. Trabajadores, clientes y proveedores <a name="trabajadores-clientes-y-proveedores"></a>

Estos endpoints permiten la gestión de trabajadores, clientes y proveedores. Solo los usuarios con rol de administrador pueden realizar cambios en las bases de datos.

## 8. Restaurantes y productos <a name="restaurantes-y-productos"></a>

Estos endpoints ofrecen control mixto, con acciones permitidas para todos los usuarios y acciones específicas solo para administradores. Se manejan respuestas detalladas y códigos de estado para garantizar la integridad de la aplicación.

## 9. Autenticación <a name="autenticación"></a>

El endpoint de autenticación permite registrar usuarios e iniciar sesión, utilizando JWT para la gestión de tokens y la autenticación de usuarios.

## 10. Usuarios <a name="usuarios"></a>

El endpoint de usuarios administra la información de los usuarios, con detalles tanto para administradores como para usuarios normales. Se utiliza Bcrypt para el almacenamiento seguro de contraseñas.

## 11. Pedidos <a name="pedidos"></a>

El endpoint de pedidos es el más complejo, gestionando los pedidos de restaurantes, clientes y trabajadores. Utiliza MongoDB para almacenar los datos de los pedidos y ofrece métodos para realizar operaciones CRUD y cálculos de precios.

## 12. Despliegue <a name="despliegue"></a>

Para el despliegue de la aplicación se utiliza Docker, facilitando su implementación en diferentes entornos. Se utilizan archivos `docker-compose` para gestionar los contenedores de la base de datos y de la aplicación.

## 13. Tests <a name="tests"></a>

Se han creado pruebas de caja negra y caja blanca para verificar el correcto funcionamiento de la aplicación. Se han utilizado Jest y Supertest para simular el comportamiento del código y se han mockeado las dependencias necesarias para las pruebas unitarias.

## 14. Conclusión y presupuesto <a name="conclusión-y-presupuesto"></a>

El proyecto MacJavaNest representa una inversión razonable en recursos financieros y humanos. Con una estrategia publicitaria en Instagram, el registro de un dominio, el uso de servicios en la nube y el trabajo de desarrolladores, se han logrado los objetivos del proyecto en un período de 2 meses.


El proyecto tiene el potencial de ser exitoso y generar un retorno positivo de la inversión realizada. La inversión en recursos técnicos y de marketing refleja el compromiso y motivación del equipo con el proyecto.

¡Gracias por leer nuestro README! Si tienes alguna pregunta o sugerencia, no dudes en contactarnos. ¡Esperamos que disfrutes usando nuestra API MacJavaNest!
