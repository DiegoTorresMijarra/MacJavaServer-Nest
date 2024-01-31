SELECT 'CREATE DATABASE MacJava_PS'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'MacJava_PS');
DROP TABLE IF EXISTS "restaurantes";
DROP SEQUENCE IF EXISTS restaurantes_id_seq;

--Crear sequencia para la tabla RESTAURANTES
CREATE SEQUENCE restaurantes_id_seq START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 10000 START 4 CACHE 1;
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