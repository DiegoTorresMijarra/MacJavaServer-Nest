SELECT 'CREATE DATABASE MacJava'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'MacJavaPostgres');
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS "posiciones";
DROP TABLE IF EXISTS "trabajadores";

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

