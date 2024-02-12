SELECT 'CREATE DATABASE MacJava'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'MacJavaPostgres');
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS "posiciones";
DROP TABLE IF EXISTS "trabajadores";
DROP TABLE IF EXISTS "clientes";

DROP TABLE IF EXISTS "proveedores";
DROP SEQUENCE IF EXISTS proveedores_id_seq;

DROP TABLE IF EXISTS "restaurantes";
DROP SEQUENCE IF EXISTS restaurantes_id_seq;

DROP TABLE IF EXISTS "productos";
DROP SEQUENCE IF EXISTS productos_id_seq;

DROP TABLE IF EXISTS "user_roles";
DROP SEQUENCE IF EXISTS user_roles_id_seq;

DROP TABLE IF EXISTS "usuarios";

-- Crear la tabla position
CREATE TABLE "public"."posiciones" (
                                       "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
                                       "nombre" character varying(255) NOT NULL,
                                       "salario" numeric(10, 2),
                                       "created_at" timestamp DEFAULT now(),
                                       "updated_at" timestamp DEFAULT now(),
                                       "deleted" boolean DEFAULT false,
                                       CONSTRAINT "posicion_pk" PRIMARY KEY ("id"),
                                       CONSTRAINT "posicion_unique_name" UNIQUE ("nombre")
) WITH (oids = false);

TRUNCATE "posiciones";

-- Insertar datos en la tabla position
INSERT INTO "posiciones" ("id", "nombre","salario")
VALUES
        ('00000000-0000-0000-0000-000000000001',	'MANAGER', 10000.00),
        ('00000000-0000-0000-0000-000000000002',	'COCINERO', 1500.00),
        ('00000000-0000-0000-0000-000000000003',	'LIMPIEZA', 1450.00),
        ('00000000-0000-0000-0000-000000000004',	'CAMARERO', 1550.00),
        ('00000000-0000-0000-0000-000000000005',	'OTROS',	 1000.00),
        ('00000000-0000-0000-0000-000000000006',	'NO_ASIGNADO',	 1000.00);

-- Crear la tabla workers
CREATE TABLE "public"."trabajadores" (
                                    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
                                    "dni" character varying(255),
                                    "nombre" character varying(255),
                                    "apellido" character varying(255),
                                    "edad" integer,
                                    "telefono" character varying(255),
                                    "posicion_id" uuid,
                                    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
                                    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
                                    "deleted" boolean DEFAULT false,
                                    CONSTRAINT "trabajadores_pk" PRIMARY KEY ("id"),
                                    CONSTRAINT "trabajadores_posicion_fk" FOREIGN KEY ("posicion_id") REFERENCES "posiciones" ("id") NOT DEFERRABLE
) WITH (oids = false);
-- Insertar datos en la tabla workers
INSERT INTO "trabajadores" ("id", "dni", "nombre", "apellido", "edad", "telefono", "posicion_id")
VALUES
    ('00000000-0000-0000-0001-000000000001', '53718369Y', 'admin', 'admin', 25, '629384747', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0001-000000000002', '20500036K', 'user', 'user', 30, '629384748', '00000000-0000-0000-0000-000000000002'),
    ('c9fd1562-3396-46b3-9fd2-88acdb5c26fd', '39372090T', 'Jim', 'Smith', 35, '629384749', '00000000-0000-0000-0000-000000000003'),
    (uuid_generate_v4(), '42394835Q', 'Sarah', 'Johnson', 40, '629384750', '00000000-0000-0000-0000-000000000004'),
    (uuid_generate_v4(), '90594482N', 'Mike', 'Brown', 45, '629384746', '00000000-0000-0000-0000-000000000004');


-- Crear la tabla CLIENTES
CREATE TABLE "public"."clientes" (
                                     "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
                                     "dni" character varying(255) NOT NULL,
                                     "nombre" character varying(255) NOT NULL,
                                     "apellido" character varying(255) NOT NULL,
                                     "edad" integer NOT NULL,
                                     "telefono" character varying(255) NOT NULL,
                                     "imagen" character varying(255) DEFAULT 'https://via.placeholder.com/150' NOT NULL,
                                     "deleted" boolean DEFAULT false NOT NULL,
                                     "created_at" timestamp DEFAULT now() NOT NULL,
                                     "updated_at" timestamp DEFAULT now() NOT NULL,
                                     CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
) WITH (oids = false);
-- Insertar datos en la tabla CLIENTS
INSERT INTO "clientes" ("id", "dni", "nombre", "apellido", "edad", "telefono", "imagen", "deleted", "created_at", "updated_at")
VALUES
    ('00000000-0000-0000-0002-000000000001', '12345678A', 'John', 'Doe', 30, '123456789', 'https://via.placeholder.com/150', false, '2022-12-12', '2022-12-12'),
    ('00000000-0000-0000-0002-000000000002', '87654321B', 'Jane', 'Smith', 25, '987654321', 'https://via.placeholder.com/150', false, '2022-12-12', '2022-12-12'),
    ('1bc0640d-e02f-455c-bc16-793c81fd0e17', '55555555C', 'Michael', 'Johnson', 40, '555555555', 'https://via.placeholder.com/150', false, '2022-12-12', '2022-12-12'),
    (uuid_generate_v4(), '99999999D', 'Sarah', 'Williams', 35, '999999999', 'https://via.placeholder.com/150', false, '2022-12-12', '2022-12-12'),
    (uuid_generate_v4(), '11111111E', 'David', 'Brown', 28, '111111111', 'https://via.placeholder.com/150', true, '2022-12-12', '2022-12-12');


CREATE SEQUENCE proveedores_id_seq INCREMENT 1 MINVALUE 4 MAXVALUE 100 CACHE 1;

-- Crear la tabla proveedores
CREATE TABLE "public"."proveedores" (
                                   "id" bigint DEFAULT nextval('proveedores_id_seq') NOT NULL,
                                   "nombre" VARCHAR NOT NULL,
                                   "tipo" VARCHAR NOT NULL,
                                   "telefono" VARCHAR NOT NULL,
                                   "created_at" timestamp DEFAULT now(),
                                   "updated_at" timestamp DEFAULT now(),
                                   "deleted" BOOLEAN DEFAULT true,
                                   CONSTRAINT "proveedores_pk" PRIMARY KEY ("id")
)WITH (oids = false);

INSERT INTO proveedores (id, nombre, tipo, telefono)
VALUES
    (1,'Proveedor A', 'Tipo A', '123456789'),
    (2, 'Proveedor B', 'Tipo B', '987654321'),
    (3,'Proveedor C', 'Tipo C', '555555555');

--Crear sequencia para la tabla RESTAURANTES
CREATE SEQUENCE restaurantes_id_seq INCREMENT 1 MINVALUE 4 MAXVALUE 100 CACHE 1;
-- Crear la tabla RESTAURANTES
CREATE TABLE "public"."restaurantes" (
                                         "id" bigint DEFAULT nextval('restaurantes_id_seq') NOT NULL,
                                         "nombre" character varying(255) UNIQUE NOT NULL,
                                         "calle" character varying(255) NOT NULL,
                                         "localidad" character varying(255) NOT NULL,
                                         "capacidad" integer NOT NULL,
                                         "borrado" boolean DEFAULT false NOT NULL,
                                         "creado_en" timestamp DEFAULT now() NOT NULL,
                                         "actualizado_en" timestamp DEFAULT now() NOT NULL,
                                         CONSTRAINT "restaurantes_pkey" PRIMARY KEY ("id")
) WITH (oids = false);
-- Insertar datos en la tabla RESTAURANTES
INSERT INTO "restaurantes" ("id", "nombre", "calle", "localidad", "capacidad", "borrado",  "creado_en", "actualizado_en")

VALUES
    (1, 'madre nodriza', 'espacial', 'madrid', 200 , false, '1975-12-12', '2022-12-12'),
    (2, 'primer hijo', 'veloz', 'getafe',  80, false,  '2004-12-12', '2022-12-12'),
    (3, 'el abuelo', 'fifrancisco', 'toledo', 120, true,  '1936-12-12', '2022-12-12');

-- Crear la tabla de productos:

CREATE SEQUENCE productos_id_seq INCREMENT 1 MINVALUE 4 MAXVALUE 100 CACHE 1;

CREATE TABLE "public"."productos" (
                             "id" bigint DEFAULT nextval('productos_id_seq') NOT NULL,
                             "nombre" VARCHAR(100) NOT NULL,
                             "description" VARCHAR(100) NOT NULL,
                             "imagen" VARCHAR(100) DEFAULT 'https://via.placeholder.com/150',
                             "precio" DECIMAL(10,2) NOT NULL,
                             "stock" INT NOT NULL,
                             "uuid" UUID NOT NULL,
                             "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             "is_deleted" BOOLEAN DEFAULT FALSE,
                             "proveedor_id" BIGINT,
                             FOREIGN KEY ("proveedor_id") REFERENCES "proveedores" ("id")
);

INSERT INTO "productos" (id,nombre, description, imagen, precio, stock, uuid, proveedor_id)
VALUES
    (1,'Producto 1', 'Descripción del producto 1', 'https://via.placeholder.com/150', 10.99, 100, '00000000-0000-0000-0000-000000000001', 1),
    (2,'Producto 2', 'Descripción del producto 2', 'https://via.placeholder.com/150', 20.49, 50, '00000000-0000-0000-0000-000000000002', 2),
    (3,'Producto 3', 'Descripción del producto 3', 'https://via.placeholder.com/150', 15.75, 75, '00000000-0000-0000-0000-000000000003', 3);


DROP TABLE IF EXISTS "user_roles";
DROP SEQUENCE IF EXISTS user_roles_id_seq;
CREATE SEQUENCE user_roles_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 6 CACHE 1;

CREATE TABLE "public"."user_roles" (
                                       "user_id" uuid NOT NULL,
                                       "role" character varying(50) DEFAULT 'USER' NOT NULL,
                                       "id" integer DEFAULT nextval('user_roles_id_seq') NOT NULL,
                                       CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "user_roles" ("user_id", "role", "id") VALUES
                                                       ('00000000-0000-0000-0001-000000000001',	'USER',	1),
                                                       ('00000000-0000-0000-0001-000000000001',	'ADMIN',2),
                                                       ('00000000-0000-0000-0001-000000000002',	'USER',	3);

DROP TABLE IF EXISTS "usuarios";
DROP SEQUENCE IF EXISTS usuarios_id_seq;
CREATE SEQUENCE usuarios_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 5 CACHE 1;

CREATE TABLE "public"."usuarios" (
                                     "is_deleted" boolean DEFAULT false NOT NULL,
                                     "created_at" timestamp DEFAULT now() NOT NULL,
                                     "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
                                     "updated_at" timestamp DEFAULT now() NOT NULL,
                                     "apellidos" character varying(255) NOT NULL,
                                     "email" character varying(255) NOT NULL,
                                     "nombre" character varying(255) NOT NULL,
                                     "password" character varying(255) NOT NULL,
                                     "username" character varying(255) NOT NULL,
                                     CONSTRAINT "usuarios_email_key" UNIQUE ("email"),
                                     CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id"),
                                     CONSTRAINT "usuarios_username_key" UNIQUE ("username")
) WITH (oids = false);

INSERT INTO "usuarios" ("is_deleted", "created_at", "id", "updated_at", "apellidos", "email", "nombre", "password", "username") VALUES
                                                                                                                                    ('f',	'2023-11-02 11:43:24.724871',	'00000000-0000-0000-0001-000000000001',	'2023-11-02 11:43:24.724871',	'Admin Admin',	'admin@prueba.net',	'Admin',	'$2a$10$vPaqZvZkz6jhb7U7k/V/v.5vprfNdOnh4sxi/qpPRkYTzPmFlI9p2',	'admin'),
                                                                                                                                    ('f',	'2023-11-02 11:43:24.730431',	'00000000-0000-0000-0001-000000000002',	'2023-11-02 11:43:24.730431',	'User User',	'user@prueba.net',	'User',	'$2a$12$RUq2ScW1Kiizu5K4gKoK4OTz80.DWaruhdyfi2lZCB.KeuXTBh0S.',	'user');
ALTER TABLE ONLY "public"."user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY (user_id) REFERENCES usuarios(id) NOT DEFERRABLE;
