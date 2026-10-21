-- =========================================================
-- SIA - Sistema de Indicadores Acadêmicos
--
-- Migração para suporte a:
-- - todas as Instituições de Educação Superior (IES)
-- - Universidades
-- - Centros Universitários
-- - Faculdades
-- - Institutos Federais
-- - Cefets
--
-- Cursos:
-- - Bacharelado
-- - Licenciatura
-- - Tecnológico
--
-- Fonte dos dados oficiais:
-- Censo da Educação Superior 2024 - Inep
-- =========================================================


BEGIN;


-- =========================================================
-- 1. AMPLIAR TABELA UNIVERSIDADE
--
-- Por compatibilidade com o sistema atual, a tabela continua
-- se chamando "universidade", mas passa a representar
-- qualquer Instituição de Educação Superior - IES.
-- =========================================================


ALTER TABLE universidade

ADD COLUMN IF NOT EXISTS
    organizacao_academica VARCHAR(100);


ALTER TABLE universidade

ADD COLUMN IF NOT EXISTS
    codigo_organizacao_academica SMALLINT;


ALTER TABLE universidade

ADD COLUMN IF NOT EXISTS
    categoria_administrativa VARCHAR(100);


ALTER TABLE universidade

ADD COLUMN IF NOT EXISTS
    codigo_categoria_administrativa SMALLINT;


ALTER TABLE universidade

ADD COLUMN IF NOT EXISTS
    ano_censo INT;


ALTER TABLE universidade

ADD COLUMN IF NOT EXISTS
    origem_dados VARCHAR(30)
        NOT NULL
        DEFAULT 'SIA';


-- =========================================================
-- 2. AMPLIAR TABELA CURSO
-- =========================================================


ALTER TABLE curso

ADD COLUMN IF NOT EXISTS
    codigo_inep VARCHAR(30);


ALTER TABLE curso

ADD COLUMN IF NOT EXISTS
    grau_academico VARCHAR(30);


ALTER TABLE curso

ADD COLUMN IF NOT EXISTS
    nivel_academico VARCHAR(50);


ALTER TABLE curso

ADD COLUMN IF NOT EXISTS
    carga_horaria INT;


ALTER TABLE curso

ADD COLUMN IF NOT EXISTS
    situacao_inep VARCHAR(50);


ALTER TABLE curso

ADD COLUMN IF NOT EXISTS
    ano_censo INT;


ALTER TABLE curso

ADD COLUMN IF NOT EXISTS
    origem_dados VARCHAR(30)
        NOT NULL
        DEFAULT 'SIA';


-- =========================================================
-- 3. DURAÇÃO EM SEMESTRES
--
-- O Censo não fornece necessariamente a duração em
-- semestres da forma usada originalmente pelo SIA.
--
-- Por isso o campo deixa de ser obrigatório.
-- =========================================================


ALTER TABLE curso

ALTER COLUMN duracao_semestres
DROP NOT NULL;


-- =========================================================
-- 4. REMOVER RESTRIÇÃO ANTIGA
--
-- Antes o sistema considerava único:
--
-- universidade + nome + modalidade
--
-- Isso não serve para a base nacional, pois uma mesma IES
-- pode possuir códigos de cursos distintos com nomes iguais.
--
-- O código oficial do Inep será a identificação principal
-- para os cursos importados.
-- =========================================================


ALTER TABLE curso

DROP CONSTRAINT IF EXISTS
    uq_curso_universidade;


-- =========================================================
-- 5. CÓDIGO INEP ÚNICO
-- =========================================================


DO $$

BEGIN

    IF NOT EXISTS (

        SELECT 1

        FROM pg_constraint

        WHERE conname =
            'uq_curso_codigo_inep'

    ) THEN

        ALTER TABLE curso

        ADD CONSTRAINT
            uq_curso_codigo_inep

        UNIQUE (
            codigo_inep
        );

    END IF;

END
$$;


-- =========================================================
-- 6. GRAU ACADÊMICO
-- =========================================================


DO $$

BEGIN

    IF NOT EXISTS (

        SELECT 1

        FROM pg_constraint

        WHERE conname =
            'chk_curso_grau_academico'

    ) THEN

        ALTER TABLE curso

        ADD CONSTRAINT
            chk_curso_grau_academico

        CHECK (

            grau_academico IS NULL

            OR

            grau_academico IN (
                'Bacharelado',
                'Licenciatura',
                'Tecnológico'
            )

        );

    END IF;

END
$$;


-- =========================================================
-- 7. NÍVEL ACADÊMICO
-- =========================================================


DO $$

BEGIN

    IF NOT EXISTS (

        SELECT 1

        FROM pg_constraint

        WHERE conname =
            'chk_curso_nivel_academico'

    ) THEN

        ALTER TABLE curso

        ADD CONSTRAINT
            chk_curso_nivel_academico

        CHECK (

            nivel_academico IS NULL

            OR

            nivel_academico IN (
                'Graduação',
                'Sequencial'
            )

        );

    END IF;

END
$$;


-- =========================================================
-- 8. CARGA HORÁRIA
-- =========================================================


DO $$

BEGIN

    IF NOT EXISTS (

        SELECT 1

        FROM pg_constraint

        WHERE conname =
            'chk_curso_carga_horaria'

    ) THEN

        ALTER TABLE curso

        ADD CONSTRAINT
            chk_curso_carga_horaria

        CHECK (

            carga_horaria IS NULL

            OR

            carga_horaria > 0

        );

    END IF;

END
$$;


-- =========================================================
-- 9. MARCAR DADOS ANTIGOS DE TESTE
-- =========================================================


UPDATE universidade

SET origem_dados =
    'DEMONSTRACAO'

WHERE codigo IN (
    'UAL-001',
    'UTN-002',
    'UMS-003'
);


UPDATE curso c

SET
    origem_dados =
        'DEMONSTRACAO',

    nivel_academico =
        COALESCE(
            nivel_academico,
            'Graduação'
        )

FROM universidade u

WHERE
    u.id =
        c.universidade_id

    AND u.codigo IN (
        'UAL-001',
        'UTN-002',
        'UMS-003'
    );


-- =========================================================
-- 10. ÍNDICES
-- =========================================================


CREATE INDEX IF NOT EXISTS
    idx_universidade_org_academica

ON universidade(
    codigo_organizacao_academica
);


CREATE INDEX IF NOT EXISTS
    idx_universidade_categoria

ON universidade(
    codigo_categoria_administrativa
);


CREATE INDEX IF NOT EXISTS
    idx_universidade_estado_ies

ON universidade(
    estado
);


CREATE INDEX IF NOT EXISTS
    idx_curso_grau_academico

ON curso(
    grau_academico
);


CREATE INDEX IF NOT EXISTS
    idx_curso_nivel_academico

ON curso(
    nivel_academico
);


CREATE INDEX IF NOT EXISTS
    idx_curso_modalidade_inep

ON curso(
    modalidade
);


COMMIT;


-- =========================================================
-- CONFERÊNCIA
-- =========================================================


SELECT
    column_name,
    data_type,
    is_nullable

FROM information_schema.columns

WHERE table_name IN (
    'universidade',
    'curso'
)

ORDER BY
    table_name,
    ordinal_position;