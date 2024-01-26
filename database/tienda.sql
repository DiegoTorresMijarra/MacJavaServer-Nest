SELECT 'CREATE DATABASE macjavaPostgres'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'macjavaPostgres');
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
DROP TABLE IF EXISTS "clientes";
-- Crear la tabla CLIENTES
CREATE TABLE "public"."clientes" (
                                    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
                                    "dni" character varying(255),
                                    "nombre" character varying(255),
                                    "apellido" character varying(255),
                                    "edad" integer,
                                    "telefono" character varying(255),
                                    "imagen" character varying(255),
                                    "deleted" boolean,
                                    "created_at" timestamp,
                                    "updated_at" timestamp,
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