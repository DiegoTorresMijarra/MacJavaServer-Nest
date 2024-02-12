// Creamos el usuario administrador de la base de datos
// con sus daatos de conexion y los roles que tendra
// creo q es para mongoexpress

db.createUser({
  user: 'admin',
  pwd: 'admin123',
  roles: [
    {
      role: 'readWrite',
      db: 'MACJAVA_MDB',
    },
  ],
})

// Nos conectamos a la base de datos world
db = db.getSiblingDB('MACJAVA_MDB')

// Creamos la coleccion city
db.createCollection('pedidos')

// Insertamos los datos de la coleccion pedidos
db.pedidos.insertMany([
  {
    idCliente: '00000000-0000-0000-0002-000000000002',
    idTrabajador: '00000000-0000-0000-0001-000000000002',
    idRestaurante: 1,
    productosPedidos: [
      {
        cantidad: 2,
        productoId: 1,
        precioProducto: 10.5,
        precioTotal: 21.0,
      },
      {
        cantidad: 3,
        productoId: 3,
        precioProducto: 20.0,
        precioTotal: 60.0,
      },
    ],
    precioTotal: 81.0,
    cantidadTotal: 5,
    pagado: false,
    createdAt: '2023-10-23T12:57:17.3411925',
    updatedAt: '2023-10-23T12:57:17.3411925',
    deleted: false,
  },
  {
    idCliente: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    idTrabajador: '00000000-0000-0000-0001-000000000001',
    idRestaurante: 2,
    productosPedidos: [
      {
        cantidad: 2,
        productoId: 1,
        precioProducto: 10.5,
        precioTotal: 21.0,
      },
    ],
    precioTotal: 81.0,
    cantidadTotal: 5,
    pagado: false,
    createdAt: '2023-10-23T12:57:17.3411925',
    updatedAt: '2023-10-23T12:57:17.3411925',
    deleted: false,
  },
])
