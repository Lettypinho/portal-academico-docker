-- =========================================================
-- SIA
-- RELACIONAMENTO CURSO <-> CAMPUS
--
-- Permite que um mesmo curso seja ofertado em vários
-- campi da mesma instituição.
--
-- IMPORTANTE:
-- A coluna curso.campus_id ainda não será removida nesta
-- etapa para manter compatibilidade durante a migração.
-- =========================================================

BEGIN;


-- =========================================================
-- GARANTIR CHAVE COMPOSTA EM CURSO
--
-- Necessária para garantir no próprio banco que curso
-- e campus pertencem à mesma universidade.
-- =========================================================

DO $$

BEGIN

    IF NOT EXISTS
    (
        SELECT
            1

        FROM pg_constraint

        WHERE
            conname =
                'uq_curso_id_universidade'
    )
    THEN

        ALTER TABLE curso

        ADD CONSTRAINT
            uq_curso_id_universidade

        UNIQUE
        (
            id,
            universidade_id
        );

    END IF;

END

$$;


-- =========================================================
-- CURSO <-> CAMPUS
-- =========================================================

CREATE TABLE IF NOT EXISTS curso_campus
(
    id SERIAL PRIMARY KEY,

    universidade_id INT NOT NULL,

    curso_id INT NOT NULL,

    campus_id INT NOT NULL,

    ativo BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    criado_em TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    atualizado_em TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),


    -- =====================================================
    -- CURSO
    --
    -- A FK composta garante que o curso realmente pertence
    -- à universidade informada.
    -- =====================================================

    CONSTRAINT fk_curso_campus_curso
        FOREIGN KEY
        (
            curso_id,
            universidade_id
        )

        REFERENCES curso
        (
            id,
            universidade_id
        )

        ON DELETE CASCADE,


    -- =====================================================
    -- CAMPUS
    --
    -- A FK composta garante que o campus também pertence
    -- à mesma universidade.
    -- =====================================================

    CONSTRAINT fk_curso_campus_campus
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

        ON DELETE CASCADE,


    -- =====================================================
    -- UM MESMO CURSO NÃO PODE SER VINCULADO DUAS VEZES
    -- AO MESMO CAMPUS
    -- =====================================================

    CONSTRAINT uq_curso_campus
        UNIQUE
        (
            curso_id,
            campus_id
        )
);


-- =========================================================
-- MIGRAR VÍNCULOS EXISTENTES
--
-- Tudo que hoje está salvo em curso.campus_id será copiado
-- para curso_campus.
-- =========================================================

INSERT INTO curso_campus
(
    universidade_id,

    curso_id,

    campus_id,

    ativo,

    criado_em,

    atualizado_em
)

SELECT

    c.universidade_id,

    c.id,

    c.campus_id,

    TRUE,

    NOW(),

    NOW()

FROM curso c

INNER JOIN campus ca
    ON ca.id =
        c.campus_id

    AND ca.universidade_id =
        c.universidade_id

WHERE
    c.campus_id IS NOT NULL

ON CONFLICT
(
    curso_id,
    campus_id
)

DO UPDATE SET

    universidade_id =
        EXCLUDED.universidade_id,

    ativo =
        TRUE,

    atualizado_em =
        NOW();


-- =========================================================
-- ÍNDICES
-- =========================================================

CREATE INDEX IF NOT EXISTS
    idx_curso_campus_universidade

ON curso_campus
(
    universidade_id
);


CREATE INDEX IF NOT EXISTS
    idx_curso_campus_curso

ON curso_campus
(
    curso_id
);


CREATE INDEX IF NOT EXISTS
    idx_curso_campus_campus

ON curso_campus
(
    campus_id
);


CREATE INDEX IF NOT EXISTS
    idx_curso_campus_curso_ativo

ON curso_campus
(
    curso_id,
    ativo
);


CREATE INDEX IF NOT EXISTS
    idx_curso_campus_campus_ativo

ON curso_campus
(
    campus_id,
    ativo
);


-- =========================================================
-- OBSERVAÇÃO
--
-- curso.campus_id continua existindo temporariamente.
--
-- Depois que:
-- 1. backend usar curso_campus;
-- 2. dashboard permitir múltiplos campi;
-- 3. listagem por campus estiver funcionando;
--
-- faremos uma segunda migração removendo:
-- - fk_curso_campus antiga;
-- - curso.campus_id;
-- - idx_curso_campus antigo.
-- =========================================================


COMMIT;