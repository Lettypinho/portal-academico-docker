-- =========================================================
-- SIA - INDICADORES DE TRAJETÓRIA DA EDUCAÇÃO SUPERIOR
-- Fonte: Inep
-- Coorte 2015 - acompanhamento até 2024
-- =========================================================

BEGIN;


CREATE TABLE IF NOT EXISTS indicador_trajetoria_curso_inep
(
    id SERIAL PRIMARY KEY,

    universidade_id INTEGER NOT NULL,

    curso_id INTEGER NOT NULL,

    ano_ingresso INTEGER NOT NULL,

    ano_referencia INTEGER NOT NULL,

    codigo_uf_curso INTEGER,

    codigo_municipio_curso BIGINT,

    prazo_integralizacao INTEGER,

    ano_integralizacao INTEGER,

    prazo_acompanhamento INTEGER,

    ano_maximo_acompanhamento INTEGER,

    ingressantes INTEGER,

    permanencia_quantidade INTEGER,

    concluintes_quantidade INTEGER,

    desistentes_quantidade INTEGER,

    falecidos_quantidade INTEGER,

    taxa_permanencia NUMERIC(12,8),

    taxa_conclusao_acumulada NUMERIC(12,8),

    taxa_desistencia_acumulada NUMERIC(12,8),

    taxa_conclusao_anual NUMERIC(12,8),

    taxa_desistencia_anual NUMERIC(12,8),

    origem_dados VARCHAR(30)
        NOT NULL
        DEFAULT 'INEP',

    criado_em TIMESTAMP
        NOT NULL
        DEFAULT NOW(),

    atualizado_em TIMESTAMP
        NOT NULL
        DEFAULT NOW(),


    CONSTRAINT fk_trajetoria_universidade

        FOREIGN KEY (
            universidade_id
        )

        REFERENCES universidade(id)

        ON DELETE CASCADE,


    CONSTRAINT fk_trajetoria_curso_universidade

        FOREIGN KEY (
            curso_id,
            universidade_id
        )

        REFERENCES curso(
            id,
            universidade_id
        )

        ON DELETE CASCADE,


    CONSTRAINT uq_trajetoria_curso_periodo

        UNIQUE (
            curso_id,
            ano_ingresso,
            ano_referencia
        ),


    CONSTRAINT chk_trajetoria_tap

        CHECK (
            taxa_permanencia IS NULL
            OR
            taxa_permanencia
                BETWEEN 0 AND 100
        ),


    CONSTRAINT chk_trajetoria_tca

        CHECK (
            taxa_conclusao_acumulada IS NULL
            OR
            taxa_conclusao_acumulada
                BETWEEN 0 AND 100
        ),


    CONSTRAINT chk_trajetoria_tda

        CHECK (
            taxa_desistencia_acumulada IS NULL
            OR
            taxa_desistencia_acumulada
                BETWEEN 0 AND 100
        ),


    CONSTRAINT chk_trajetoria_tcan

        CHECK (
            taxa_conclusao_anual IS NULL
            OR
            taxa_conclusao_anual
                BETWEEN 0 AND 100
        ),


    CONSTRAINT chk_trajetoria_tdan

        CHECK (
            taxa_desistencia_anual IS NULL
            OR
            taxa_desistencia_anual
                BETWEEN 0 AND 100
        )
);


CREATE INDEX IF NOT EXISTS
idx_trajetoria_universidade
ON indicador_trajetoria_curso_inep(
    universidade_id
);


CREATE INDEX IF NOT EXISTS
idx_trajetoria_curso
ON indicador_trajetoria_curso_inep(
    curso_id
);


CREATE INDEX IF NOT EXISTS
idx_trajetoria_ano_referencia
ON indicador_trajetoria_curso_inep(
    ano_referencia
);


CREATE INDEX IF NOT EXISTS
idx_trajetoria_ano_ingresso
ON indicador_trajetoria_curso_inep(
    ano_ingresso
);


CREATE INDEX IF NOT EXISTS
idx_trajetoria_uf
ON indicador_trajetoria_curso_inep(
    codigo_uf_curso
);


CREATE INDEX IF NOT EXISTS
idx_trajetoria_municipio
ON indicador_trajetoria_curso_inep(
    codigo_municipio_curso
);


CREATE OR REPLACE VIEW
vw_trajetoria_curso_inep
AS

SELECT

    t.id,

    u.id
        AS universidade_id,

    u.codigo
        AS codigo_ies,

    u.nome
        AS instituicao,

    u.sigla,

    u.cidade,

    u.estado,

    u.organizacao_academica,

    u.categoria_administrativa,


    c.id
        AS curso_id,

    c.codigo_inep,

    c.nome
        AS curso,

    c.grau_academico,

    c.modalidade,


    t.ano_ingresso,

    t.ano_referencia,

    t.codigo_uf_curso,

    t.codigo_municipio_curso,

    t.prazo_integralizacao,

    t.ano_integralizacao,

    t.prazo_acompanhamento,

    t.ano_maximo_acompanhamento,


    t.ingressantes,

    t.permanencia_quantidade,

    t.concluintes_quantidade,

    t.desistentes_quantidade,

    t.falecidos_quantidade,


    t.taxa_permanencia,

    t.taxa_conclusao_acumulada,

    t.taxa_desistencia_acumulada,

    t.taxa_conclusao_anual,

    t.taxa_desistencia_anual,


    t.origem_dados


FROM indicador_trajetoria_curso_inep t


JOIN universidade u

    ON u.id =
        t.universidade_id


JOIN curso c

    ON c.id =
        t.curso_id

    AND c.universidade_id =
        t.universidade_id;


COMMIT;


-- =========================================================
-- CONFERÊNCIA
-- =========================================================

SELECT
    COUNT(*) AS registros_trajetoria
FROM indicador_trajetoria_curso_inep;