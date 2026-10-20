-- =========================================================
-- SIA - Sistema de Indicadores Acadêmicos
-- Views e consultas para geração de indicadores
-- =========================================================


-- =========================================================
-- 1. INDICADORES POR CURSO E PERÍODO
-- =========================================================

CREATE OR REPLACE VIEW vw_indicadores_curso_periodo AS

SELECT
    u.id AS universidade_id,
    u.codigo AS universidade_codigo,
    u.nome AS universidade,
    u.sigla,

    c.id AS curso_id,
    c.nome AS curso,
    c.modalidade,

    d.ano,
    d.semestre,

    COUNT(d.id) AS total_resultados,

    COUNT(DISTINCT d.aluno_id) AS alunos_avaliados,

    ROUND(
        AVG(d.nota),
        2
    ) AS media_geral,

    COUNT(*) FILTER (
        WHERE d.situacao = 'Aprovado'
    ) AS aprovados,

    COUNT(*) FILTER (
        WHERE d.situacao = 'Reprovado'
    ) AS reprovados,

    ROUND(
        (
            COUNT(*) FILTER (
                WHERE d.situacao = 'Aprovado'
            )::NUMERIC
            /
            NULLIF(
                COUNT(*) FILTER (
                    WHERE d.situacao IN (
                        'Aprovado',
                        'Reprovado'
                    )
                ),
                0
            )
        ) * 100,
        2
    ) AS taxa_aprovacao,

    ROUND(
        (
            COUNT(*) FILTER (
                WHERE d.situacao = 'Reprovado'
            )::NUMERIC
            /
            NULLIF(
                COUNT(*) FILTER (
                    WHERE d.situacao IN (
                        'Aprovado',
                        'Reprovado'
                    )
                ),
                0
            )
        ) * 100,
        2
    ) AS taxa_reprovacao,

    ROUND(
        AVG(d.frequencia),
        2
    ) AS frequencia_media

FROM desempenho d

JOIN universidade u
    ON u.id = d.universidade_id

JOIN aluno a
    ON a.id = d.aluno_id

JOIN curso c
    ON c.id = a.curso_id

GROUP BY
    u.id,
    u.codigo,
    u.nome,
    u.sigla,
    c.id,
    c.nome,
    c.modalidade,
    d.ano,
    d.semestre;


-- =========================================================
-- 2. INDICADORES GERAIS DA UNIVERSIDADE
-- =========================================================

CREATE OR REPLACE VIEW vw_indicadores_universidade_periodo AS

SELECT
    u.id AS universidade_id,
    u.codigo AS universidade_codigo,
    u.nome AS universidade,
    u.sigla,

    d.ano,
    d.semestre,

    COUNT(DISTINCT d.aluno_id)
        AS alunos_avaliados,

    COUNT(DISTINCT a.curso_id)
        AS cursos_com_resultados,

    ROUND(
        AVG(d.nota),
        2
    ) AS media_geral,

    COUNT(*) FILTER (
        WHERE d.situacao = 'Aprovado'
    ) AS aprovados,

    COUNT(*) FILTER (
        WHERE d.situacao = 'Reprovado'
    ) AS reprovados,

    ROUND(
        (
            COUNT(*) FILTER (
                WHERE d.situacao = 'Aprovado'
            )::NUMERIC
            /
            NULLIF(
                COUNT(*) FILTER (
                    WHERE d.situacao IN (
                        'Aprovado',
                        'Reprovado'
                    )
                ),
                0
            )
        ) * 100,
        2
    ) AS taxa_aprovacao,

    ROUND(
        (
            COUNT(*) FILTER (
                WHERE d.situacao = 'Reprovado'
            )::NUMERIC
            /
            NULLIF(
                COUNT(*) FILTER (
                    WHERE d.situacao IN (
                        'Aprovado',
                        'Reprovado'
                    )
                ),
                0
            )
        ) * 100,
        2
    ) AS taxa_reprovacao,

    ROUND(
        AVG(d.frequencia),
        2
    ) AS frequencia_media

FROM desempenho d

JOIN universidade u
    ON u.id = d.universidade_id

JOIN aluno a
    ON a.id = d.aluno_id

GROUP BY
    u.id,
    u.codigo,
    u.nome,
    u.sigla,
    d.ano,
    d.semestre;


-- =========================================================
-- 3. SITUAÇÃO ATUAL DOS ALUNOS POR UNIVERSIDADE
-- =========================================================

CREATE OR REPLACE VIEW vw_situacao_alunos_universidade AS

SELECT
    u.id AS universidade_id,
    u.codigo AS universidade_codigo,
    u.nome AS universidade,

    COUNT(a.id) AS total_alunos,

    COUNT(*) FILTER (
        WHERE a.status = 'Ativo'
    ) AS ativos,

    COUNT(*) FILTER (
        WHERE a.status = 'Trancado'
    ) AS trancados,

    COUNT(*) FILTER (
        WHERE a.status = 'Formado'
    ) AS formados,

    COUNT(*) FILTER (
        WHERE a.status = 'Evadido'
    ) AS evadidos,

    COUNT(*) FILTER (
        WHERE a.status = 'Inativo'
    ) AS inativos,

    ROUND(
        (
            COUNT(*) FILTER (
                WHERE a.status = 'Evadido'
            )::NUMERIC
            /
            NULLIF(COUNT(a.id), 0)
        ) * 100,
        2
    ) AS taxa_evasao_atual

FROM universidade u

LEFT JOIN aluno a
    ON a.universidade_id = u.id

GROUP BY
    u.id,
    u.codigo,
    u.nome;


-- =========================================================
-- 4. SITUAÇÃO ATUAL DOS ALUNOS POR CURSO
-- =========================================================

CREATE OR REPLACE VIEW vw_situacao_alunos_curso AS

SELECT
    u.id AS universidade_id,
    u.codigo AS universidade_codigo,
    u.nome AS universidade,

    c.id AS curso_id,
    c.nome AS curso,
    c.modalidade,

    COUNT(a.id) AS total_alunos,

    COUNT(*) FILTER (
        WHERE a.status = 'Ativo'
    ) AS ativos,

    COUNT(*) FILTER (
        WHERE a.status = 'Trancado'
    ) AS trancados,

    COUNT(*) FILTER (
        WHERE a.status = 'Formado'
    ) AS formados,

    COUNT(*) FILTER (
        WHERE a.status = 'Evadido'
    ) AS evadidos,

    ROUND(
        (
            COUNT(*) FILTER (
                WHERE a.status = 'Evadido'
            )::NUMERIC
            /
            NULLIF(COUNT(a.id), 0)
        ) * 100,
        2
    ) AS taxa_evasao_atual

FROM curso c

JOIN universidade u
    ON u.id = c.universidade_id

LEFT JOIN aluno a
    ON a.curso_id = c.id
    AND a.universidade_id = u.id

GROUP BY
    u.id,
    u.codigo,
    u.nome,
    c.id,
    c.nome,
    c.modalidade;


-- =========================================================
-- 5. INDICADORES POR DISCIPLINA
-- =========================================================

CREATE OR REPLACE VIEW vw_indicadores_disciplina AS

SELECT
    u.id AS universidade_id,
    u.nome AS universidade,

    c.id AS curso_id,
    c.nome AS curso,

    disc.id AS disciplina_id,
    disc.nome AS disciplina,

    d.ano,
    d.semestre,

    COUNT(d.id) AS total_resultados,

    ROUND(
        AVG(d.nota),
        2
    ) AS media,

    ROUND(
        AVG(d.frequencia),
        2
    ) AS frequencia_media,

    COUNT(*) FILTER (
        WHERE d.situacao = 'Aprovado'
    ) AS aprovados,

    COUNT(*) FILTER (
        WHERE d.situacao = 'Reprovado'
    ) AS reprovados,

    ROUND(
        (
            COUNT(*) FILTER (
                WHERE d.situacao = 'Aprovado'
            )::NUMERIC
            /
            NULLIF(
                COUNT(*) FILTER (
                    WHERE d.situacao IN (
                        'Aprovado',
                        'Reprovado'
                    )
                ),
                0
            )
        ) * 100,
        2
    ) AS taxa_aprovacao,

    ROUND(
        (
            COUNT(*) FILTER (
                WHERE d.situacao = 'Reprovado'
            )::NUMERIC
            /
            NULLIF(
                COUNT(*) FILTER (
                    WHERE d.situacao IN (
                        'Aprovado',
                        'Reprovado'
                    )
                ),
                0
            )
        ) * 100,
        2
    ) AS taxa_reprovacao

FROM desempenho d

JOIN universidade u
    ON u.id = d.universidade_id

JOIN disciplina disc
    ON disc.id = d.disciplina_id

JOIN curso c
    ON c.id = disc.curso_id

GROUP BY
    u.id,
    u.nome,
    c.id,
    c.nome,
    disc.id,
    disc.nome,
    d.ano,
    d.semestre;


-- =========================================================
-- 6. COMPARAÇÃO PÚBLICA ENTRE CURSOS
-- =========================================================
-- Esta view contém apenas dados agregados.
-- Nenhum aluno, matrícula, e-mail ou nota individual
-- é disponibilizado para comparação.
-- =========================================================

CREATE OR REPLACE VIEW vw_comparacao_publica_cursos AS

SELECT
    universidade_id,
    universidade_codigo,
    universidade,
    sigla,

    curso_id,
    curso,
    modalidade,

    ano,
    semestre,

    alunos_avaliados,
    media_geral,
    taxa_aprovacao,
    taxa_reprovacao,
    frequencia_media

FROM vw_indicadores_curso_periodo;


-- =========================================================
-- 7. RESUMO PARA O DASHBOARD
-- =========================================================

CREATE OR REPLACE VIEW vw_dashboard_universidade AS

SELECT
    u.id AS universidade_id,
    u.codigo,
    u.nome AS universidade,
    u.sigla,

    COUNT(
        DISTINCT c.id
    ) AS total_cursos,

    COUNT(
        DISTINCT disc.id
    ) AS total_disciplinas,

    COUNT(
        DISTINCT a.id
    ) AS total_alunos,

    COUNT(
        DISTINCT a.id
    ) FILTER (
        WHERE a.status = 'Ativo'
    ) AS alunos_ativos,

    COUNT(
        DISTINCT a.id
    ) FILTER (
        WHERE a.status = 'Evadido'
    ) AS alunos_evadidos,

    COUNT(
        DISTINCT a.id
    ) FILTER (
        WHERE a.status = 'Trancado'
    ) AS alunos_trancados,

    COUNT(
        DISTINCT a.id
    ) FILTER (
        WHERE a.status = 'Formado'
    ) AS alunos_formados

FROM universidade u

LEFT JOIN curso c
    ON c.universidade_id = u.id

LEFT JOIN disciplina disc
    ON disc.universidade_id = u.id

LEFT JOIN aluno a
    ON a.universidade_id = u.id

GROUP BY
    u.id,
    u.codigo,
    u.nome,
    u.sigla;


-- =========================================================
-- CONSULTAS DE TESTE
-- =========================================================


-- Indicadores de todos os cursos

SELECT *
FROM vw_indicadores_curso_periodo
ORDER BY
    curso,
    universidade;


-- =========================================================
-- Comparar Ciência da Computação
-- =========================================================

SELECT
    universidade,
    curso,
    media_geral,
    taxa_aprovacao,
    taxa_reprovacao,
    frequencia_media
FROM vw_comparacao_publica_cursos
WHERE
    curso = 'Ciência da Computação'
    AND ano = 2026
    AND semestre = 1
ORDER BY
    media_geral DESC;


-- =========================================================
-- Dashboard das universidades
-- =========================================================

SELECT *
FROM vw_dashboard_universidade
ORDER BY universidade;


-- =========================================================
-- Situação dos alunos
-- =========================================================

SELECT *
FROM vw_situacao_alunos_universidade
ORDER BY universidade;


-- =========================================================
-- Disciplinas com maior reprovação
-- =========================================================

SELECT
    universidade,
    curso,
    disciplina,
    taxa_reprovacao
FROM vw_indicadores_disciplina
WHERE ano = 2026
  AND semestre = 1
ORDER BY taxa_reprovacao DESC NULLS LAST;