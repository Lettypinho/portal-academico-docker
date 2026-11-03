-- =========================================================
-- SIA
-- CAMPI / LOCAIS DE OFERTA
-- =========================================================

BEGIN;


-- =========================================================
-- PERMISSÃO
-- =========================================================

INSERT INTO permissao
(
    codigo,
    nome,
    descricao,
    categoria,
    exige_universidade,
    ativo
)
VALUES
(
    'GERENCIAR_CAMPI',
    'Gerenciar campi',
    'Permite cadastrar e editar campi e locais de oferta da instituição.',
    'Instituição',
    TRUE,
    TRUE
)
ON CONFLICT (codigo)
DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    categoria = EXCLUDED.categoria,
    exige_universidade = EXCLUDED.exige_universidade,
    ativo = TRUE;


-- =========================================================
-- CAMPI
-- =========================================================

CREATE TABLE IF NOT EXISTS campus
(
    id SERIAL PRIMARY KEY,

    universidade_id INT NOT NULL,

    nome VARCHAR(200) NOT NULL,

    endereco VARCHAR(200) NOT NULL,

    numero VARCHAR(30),

    complemento VARCHAR(100),

    bairro VARCHAR(100),

    cidade VARCHAR(100) NOT NULL,

    estado CHAR(2) NOT NULL,

    cep VARCHAR(15),

    latitude NUMERIC(10,7) NOT NULL,

    longitude NUMERIC(10,7) NOT NULL,

    principal BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    ativo BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    origem_dados VARCHAR(30)
        NOT NULL
        DEFAULT 'SIA',

    criado_em TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    atualizado_em TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    CONSTRAINT fk_campus_universidade
        FOREIGN KEY (universidade_id)
        REFERENCES universidade(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_campus_latitude
        CHECK (
            latitude BETWEEN -90 AND 90
        ),

    CONSTRAINT chk_campus_longitude
        CHECK (
            longitude BETWEEN -180 AND 180
        ),

    CONSTRAINT uq_campus_nome
        UNIQUE (
            universidade_id,
            nome
        ),

    CONSTRAINT uq_campus_id_universidade
        UNIQUE (
            id,
            universidade_id
        )
);


-- =========================================================
-- APENAS UM CAMPUS PRINCIPAL ATIVO POR IES
-- =========================================================

CREATE UNIQUE INDEX IF NOT EXISTS
    uq_campus_principal_universidade
ON campus
(
    universidade_id
)
WHERE
    principal = TRUE
    AND ativo = TRUE;


-- =========================================================
-- LIGAR CURSO AO CAMPUS
-- =========================================================

ALTER TABLE curso

ADD COLUMN IF NOT EXISTS
    campus_id INT;


-- =========================================================
-- FK COMPOSTA
--
-- Garante que o campus realmente pertence à mesma
-- instituição do curso.
-- =========================================================

DO $$

BEGIN

    IF NOT EXISTS
    (
        SELECT 1

        FROM pg_constraint

        WHERE conname =
            'fk_curso_campus'
    )
    THEN

        ALTER TABLE curso

        ADD CONSTRAINT
            fk_curso_campus

        FOREIGN KEY
        (
            campus_id,
            universidade_id
        )

        REFERENCES campus
        (
            id,
            universidade_id
        )

        ON DELETE SET NULL;

    END IF;

END

$$;


-- =========================================================
-- ÍNDICES
-- =========================================================

CREATE INDEX IF NOT EXISTS
    idx_campus_universidade
ON campus
(
    universidade_id
);


CREATE INDEX IF NOT EXISTS
    idx_campus_localizacao
ON campus
(
    estado,
    cidade
);


CREATE INDEX IF NOT EXISTS
    idx_curso_campus
ON curso
(
    campus_id
);


COMMIT;