-- Table: public.prescricoes

-- DROP TABLE IF EXISTS public.prescricoes;

CREATE TABLE IF NOT EXISTS public.prescricoes
(
    id integer NOT NULL DEFAULT nextval('prescricoes_id_seq'::regclass),
    paciente_id integer,
    medicamento_nome character varying(255) COLLATE pg_catalog."default",
    dosagem character varying(100) COLLATE pg_catalog."default",
    data_prescricao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT prescricoes_pkey PRIMARY KEY (id),
    CONSTRAINT prescricoes_paciente_id_fkey FOREIGN KEY (paciente_id)
        REFERENCES public.pacientes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.prescricoes
    OWNER to postgres;