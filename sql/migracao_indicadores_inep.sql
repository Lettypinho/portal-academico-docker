-- =========================================================
-- SIA - INDICADORES OFICIAIS DO INEP
-- =========================================================
--
-- Indicadores institucionais:
--   IGC
--
-- Indicadores de cursos:
--   CPC
--   Conceito Enade
--   IDD
--
-- Os dados desta estrutura são oficiais do Inep.
-- =========================================================


BEGIN;


-- =========================================================
-- 1. INDICADORES DA INSTITUIÇÃO
-- =========================================================

CREATE TABLE IF NOT EXISTS indicador_ies_inep
(
    id SERIAL PRIMARY KEY,

    universidade_id INT NOT NULL,

    ano INT NOT NULL,

    cursos_com_cpc_trienio INT,

    proporcao_graduacao NUMERIC(12,6),

    conceito_medio_graduacao NUMERIC(12,6),

    proporcao_mestrado NUMERIC(12,6),

    conceito_medio_mestrado NUMERIC(12,6),

    proporcao_doutorado NUMERIC(12,6),

    conceito_medio_doutorado NUMERIC(12,6),

    igc_continuo NUMERIC(12,6),

    igc_faixa SMALLINT,

    origem_dados VARCHAR(30)
        NOT NULL
        DEFAULT 'INEP',

    criado_em TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    atualizado_em TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),


    CONSTRAINT fk_indicador_ies_universidade

        FOREIGN KEY (
            universidade_id
        )

        REFERENCES universidade(id)

        ON DELETE CASCADE,


    CONSTRAINT uq_indicador_ies_ano

        UNIQUE (
            universidade_id,
            ano
        ),


    CONSTRAINT chk_indicador_ies_ano

        CHECK (
            ano BETWEEN 2000 AND 2100
        ),


    CONSTRAINT chk_igc_faixa

        CHECK (
            igc_faixa IS NULL
            OR igc_faixa BETWEEN 1 AND 5
        )
);


-- =========================================================
-- 2. INDICADORES DOS CURSOS
-- =========================================================

CREATE TABLE IF NOT EXISTS indicador_curso_inep
(
    id SERIAL PRIMARY KEY,

    universidade_id INT NOT NULL,

    curso_id INT NOT NULL,

    ano INT NOT NULL,


    codigo_area VARCHAR(30),

    area_avaliacao VARCHAR(200),

    modalidade_inep VARCHAR(60),


    concluintes_inscritos INT,

    concluintes_participantes INT,


    conceito_enade_continuo NUMERIC(12,6),

    conceito_enade_faixa SMALLINT,


    idd_continuo NUMERIC(12,6),

    idd_faixa SMALLINT,


    cpc_continuo NUMERIC(12,6),

    cpc_faixa SMALLINT,


    origem_dados VARCHAR(30)
        NOT NULL
        DEFAULT 'INEP',

    criado_em TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    atualizado_em TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),


    CONSTRAINT fk_indicador_curso_curso

        FOREIGN KEY (
            curso_id,
            universidade_id
        )

        REFERENCES curso(
            id,
            universidade_id
        )

        ON DELETE CASCADE,


    CONSTRAINT uq_indicador_curso_ano

        UNIQUE (
            curso_id,
            ano
        ),


    CONSTRAINT chk_indicador_curso_ano

        CHECK (
            ano BETWEEN 2000 AND 2100
        ),


    CONSTRAINT chk_enade_faixa

        CHECK (
            conceito_enade_faixa IS NULL
            OR conceito_enade_faixa BETWEEN 1 AND 5
        ),


    CONSTRAINT chk_idd_faixa

        CHECK (
            idd_faixa IS NULL
            OR idd_faixa BETWEEN 1 AND 5
        ),


    CONSTRAINT chk_cpc_faixa

        CHECK (
            cpc_faixa IS NULL
            OR cpc_faixa BETWEEN 1 AND 5
        )
);


-- =========================================================
-- 3. ÍNDICES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_indicador_ies_ano

    ON indicador_ies_inep(
        ano
    );


CREATE INDEX IF NOT EXISTS idx_indicador_curso_ano

    ON indicador_curso_inep(
        ano
    );


CREATE INDEX IF NOT EXISTS idx_indicador_curso_universidade

    ON indicador_curso_inep(
        universidade_id
    );


-- =========================================================
-- 4. VIEW PÚBLICA - INSTITUIÇÕES
-- =========================================================

CREATE OR REPLACE VIEW vw_qualidade_ies_inep AS

SELECT

    u.id AS universidade_id,

    u.codigo AS codigo_ies,

    u.nome AS instituicao,

    u.sigla,

    u.cidade,

    u.estado,

    u.organizacao_academica,

    u.categoria_administrativa,


    i.ano,

    i.cursos_com_cpc_trienio,

    i.conceito_medio_graduacao,

    i.igc_continuo,

    i.igc_faixa,

    i.origem_dados

FROM indicador_ies_inep i

JOIN universidade u

    ON u.id =
        i.universidade_id;


-- =========================================================
-- 5. VIEW PÚBLICA - CURSOS
-- =========================================================

CREATE OR REPLACE VIEW vw_qualidade_curso_inep AS

SELECT

    u.id AS universidade_id,

    u.codigo AS codigo_ies,

    u.nome AS instituicao,

    u.sigla,


    c.id AS curso_id,

    c.codigo_inep,

    c.nome AS curso,

    c.grau_academico,

    c.modalidade,


    i.ano,

    i.codigo_area,

    i.area_avaliacao,

    i.modalidade_inep,

    i.concluintes_inscritos,

    i.concluintes_participantes,

    i.conceito_enade_continuo,

    i.conceito_enade_faixa,

    i.idd_continuo,

    i.idd_faixa,

    i.cpc_continuo,

    i.cpc_faixa,

    i.origem_dados


FROM indicador_curso_inep i


JOIN curso c

    ON c.id =
        i.curso_id


JOIN universidade u

    ON u.id =
        i.universidade_id;


COMMIT;


-- =========================================================
-- TESTES
-- =========================================================

SELECT
    COUNT(*)
        AS indicadores_ies

FROM indicador_ies_inep;


SELECT
    COUNT(*)
        AS indicadores_cursos

FROM indicador_curso_inep;