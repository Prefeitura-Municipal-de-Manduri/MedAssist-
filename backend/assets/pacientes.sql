-- Table: public.pacientes

-- DROP TABLE IF EXISTS public.pacientes;

CREATE TABLE IF NOT EXISTS public.pacientes
(
    id integer NOT NULL DEFAULT nextval('pacientes_id_seq'::regclass),
    nome text COLLATE pg_catalog."default" NOT NULL,
    contato text COLLATE pg_catalog."default",
    data_nascimento date,
    created_at timestamp without time zone DEFAULT now(),
    ultima_consulta_social date,
    proxima_consulta_social date,
    CONSTRAINT pacientes_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.pacientes
    OWNER to postgres;