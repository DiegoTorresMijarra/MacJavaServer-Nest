SELECT 'CREATE DATABASE MacJava'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'MacJavaPostgres');
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS "posiciones";
DROP TABLE IF EXISTS "trabajadores";
DROP TABLE IF EXISTS "clientes";
DROP TABLE IF EXISTS "proveedores";
DROP SEQUENCE IF EXISTS proveedores_id_seq;
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
    (uuid_generate_v4(), '39372090T', 'Jim', 'Smith', 35, '629384749', '00000000-0000-0000-0000-000000000003'),
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
    ('00000000-0000-0000-0000-000000000099', '12345678A', 'John', 'Doe', 30, '123456789', 'https://via.placeholder.com/150', false, '2022-12-12', '2022-12-12'),
    (uuid_generate_v4(), '87654321B', 'Jane', 'Smith', 25, '987654321', 'https://via.placeholder.com/150', false, '2022-12-12', '2022-12-12'),
    (uuid_generate_v4(), '55555555C', 'Michael', 'Johnson', 40, '555555555', 'https://via.placeholder.com/150', false, '2022-12-12', '2022-12-12'),
    (uuid_generate_v4(), '99999999D', 'Sarah', 'Williams', 35, '999999999', 'https://via.placeholder.com/150', false, '2022-12-12', '2022-12-12'),
    (uuid_generate_v4(), '11111111E', 'David', 'Brown', 28, '111111111', 'https://via.placeholder.com/150', true, '2022-12-12', '2022-12-12');


CREATE SEQUENCE proveedores_id_seq INCREMENT 1 MINVALUE 4 MAXVALUE 100 CACHE 1;

-- Crear la tabla proveedores
CREATE TABLE "public"."proveedores" (
                                   "id" bigint DEFAULT nextval('proveedores_id_seq') NOT NULL,
                                   "nombre" VARCHAR NOT NULL,
                                   "tipo" VARCHAR NOT NULL,
                                   "telefono" VARCHAR NOT NULL UNIQUE,
                                   "created_at" timestamp DEFAULT now(),
                                   "updated_at" timestamp DEFAULT now(),
                                   "deleted" BOOLEAN DEFAULT true,
                                   CONSTRAINT "proveedores_pk" PRIMARY KEY ("id")
)WITH (oids = false);