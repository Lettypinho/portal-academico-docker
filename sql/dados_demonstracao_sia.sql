-- =========================================================
-- SIA - DADOS ACADÊMICOS DE DEMONSTRAÇÃO
-- =========================================================
--
-- IMPORTANTE:
--
-- As instituições utilizadas neste arquivo são instituições
-- reais cadastradas a partir da base oficial do Inep.
--
-- Os alunos, disciplinas, notas, frequências e indicadores
-- abaixo são TOTALMENTE FICTÍCIOS e servem exclusivamente
-- para demonstração das funcionalidades do SIA.
--
-- Eles NÃO representam resultados oficiais das instituições.
--
-- =========================================================


BEGIN;


-- =========================================================
-- 1. VALIDAR INSTITUIÇÕES
-- =========================================================
--
-- 577 = UFAL
-- 580 = UFPE
-- 575 = UFMG
--
-- Os códigos precisam existir após a importação do Inep.
-- =========================================================


DO $$

DECLARE
    total_encontradas INT;

BEGIN

    SELECT COUNT(*)
    INTO total_encontradas

    FROM universidade

    WHERE codigo IN (
        '577',
        '580',
        '575'
    );


    IF total_encontradas <> 3 THEN

        RAISE EXCEPTION
            'UFAL, UFPE e UFMG precisam estar cadastradas antes dos dados demonstrativos. Encontradas: %',
            total_encontradas;

    END IF;

END
$$;


-- =========================================================
-- 2. CURSOS DE DEMONSTRAÇÃO
-- =========================================================
--
-- Não utilizamos codigo_inep nesses cursos demonstrativos.
-- Isso evita confundir o registro acadêmico fictício
-- utilizado pelo sistema com o cadastro oficial do Inep.
--
-- Como a restrição antiga universidade + nome + modalidade
-- foi removida, fazemos a verificação manual antes do INSERT.
-- =========================================================


-- ---------------------------------------------------------
-- UFAL
-- ---------------------------------------------------------

INSERT INTO curso
(
    universidade_id,
    nome,
    modalidade,
    duracao_semestres,
    status,
    grau_academico,
    nivel_academico,
    origem_dados
)

SELECT
    u.id,
    'Ciência da Computação',
    'Presencial',
    8,
    'Ativo',
    'Bacharelado',
    'Graduação',
    'DEMONSTRACAO'

FROM universidade u

WHERE
    u.codigo = '577'

    AND NOT EXISTS (

        SELECT 1

        FROM curso c

        WHERE
            c.universidade_id = u.id
            AND c.nome = 'Ciência da Computação'
            AND c.modalidade = 'Presencial'
            AND c.origem_dados = 'DEMONSTRACAO'
    );


-- ---------------------------------------------------------
-- UFPE
-- ---------------------------------------------------------

INSERT INTO curso
(
    universidade_id,
    nome,
    modalidade,
    duracao_semestres,
    status,
    grau_academico,
    nivel_academico,
    origem_dados
)

SELECT
    u.id,
    'Ciência da Computação',
    'Presencial',
    8,
    'Ativo',
    'Bacharelado',
    'Graduação',
    'DEMONSTRACAO'

FROM universidade u

WHERE
    u.codigo = '580'

    AND NOT EXISTS (

        SELECT 1

        FROM curso c

        WHERE
            c.universidade_id = u.id
            AND c.nome = 'Ciência da Computação'
            AND c.modalidade = 'Presencial'
            AND c.origem_dados = 'DEMONSTRACAO'
    );


-- ---------------------------------------------------------
-- UFMG
-- ---------------------------------------------------------

INSERT INTO curso
(
    universidade_id,
    nome,
    modalidade,
    duracao_semestres,
    status,
    grau_academico,
    nivel_academico,
    origem_dados
)

SELECT
    u.id,
    'Ciência da Computação',
    'Presencial',
    8,
    'Ativo',
    'Bacharelado',
    'Graduação',
    'DEMONSTRACAO'

FROM universidade u

WHERE
    u.codigo = '575'

    AND NOT EXISTS (

        SELECT 1

        FROM curso c

        WHERE
            c.universidade_id = u.id
            AND c.nome = 'Ciência da Computação'
            AND c.modalidade = 'Presencial'
            AND c.origem_dados = 'DEMONSTRACAO'
    );


-- =========================================================
-- 3. DISCIPLINAS
-- =========================================================


-- ---------------------------------------------------------
-- UFAL
-- ---------------------------------------------------------

INSERT INTO disciplina
(
    universidade_id,
    curso_id,
    nome,
    carga_horaria,
    periodo_recomendado,
    ativo
)

SELECT
    u.id,
    c.id,
    dados.nome,
    dados.carga_horaria,
    dados.periodo,
    TRUE

FROM universidade u

JOIN curso c
    ON c.universidade_id = u.id

CROSS JOIN (

    VALUES

        (
            'Algoritmos e Estruturas de Dados',
            80,
            2
        ),

        (
            'Banco de Dados',
            60,
            4
        )

) AS dados(
    nome,
    carga_horaria,
    periodo
)

WHERE
    u.codigo = '577'

    AND c.nome =
        'Ciência da Computação'

    AND c.modalidade =
        'Presencial'

    AND c.origem_dados =
        'DEMONSTRACAO'

    AND NOT EXISTS (

        SELECT 1

        FROM disciplina d

        WHERE
            d.curso_id = c.id
            AND d.nome = dados.nome
    );


-- ---------------------------------------------------------
-- UFPE
-- ---------------------------------------------------------

INSERT INTO disciplina
(
    universidade_id,
    curso_id,
    nome,
    carga_horaria,
    periodo_recomendado,
    ativo
)

SELECT
    u.id,
    c.id,
    dados.nome,
    dados.carga_horaria,
    dados.periodo,
    TRUE

FROM universidade u

JOIN curso c
    ON c.universidade_id = u.id

CROSS JOIN (

    VALUES

        (
            'Algoritmos e Estruturas de Dados',
            80,
            2
        ),

        (
            'Banco de Dados',
            60,
            4
        )

) AS dados(
    nome,
    carga_horaria,
    periodo
)

WHERE
    u.codigo = '580'

    AND c.nome =
        'Ciência da Computação'

    AND c.modalidade =
        'Presencial'

    AND c.origem_dados =
        'DEMONSTRACAO'

    AND NOT EXISTS (

        SELECT 1

        FROM disciplina d

        WHERE
            d.curso_id = c.id
            AND d.nome = dados.nome
    );


-- ---------------------------------------------------------
-- UFMG
-- ---------------------------------------------------------

INSERT INTO disciplina
(
    universidade_id,
    curso_id,
    nome,
    carga_horaria,
    periodo_recomendado,
    ativo
)

SELECT
    u.id,
    c.id,
    dados.nome,
    dados.carga_horaria,
    dados.periodo,
    TRUE

FROM universidade u

JOIN curso c
    ON c.universidade_id = u.id

CROSS JOIN (

    VALUES

        (
            'Algoritmos e Estruturas de Dados',
            80,
            2
        ),

        (
            'Banco de Dados',
            60,
            4
        )

) AS dados(
    nome,
    carga_horaria,
    periodo
)

WHERE
    u.codigo = '575'

    AND c.nome =
        'Ciência da Computação'

    AND c.modalidade =
        'Presencial'

    AND c.origem_dados =
        'DEMONSTRACAO'

    AND NOT EXISTS (

        SELECT 1

        FROM disciplina d

        WHERE
            d.curso_id = c.id
            AND d.nome = dados.nome
    );


-- =========================================================
-- 4. ALUNOS FICTÍCIOS
-- =========================================================


-- ---------------------------------------------------------
-- UFAL
-- ---------------------------------------------------------

INSERT INTO aluno
(
    universidade_id,
    curso_id,
    matricula,
    nome,
    email,
    status
)

SELECT
    u.id,
    c.id,
    dados.matricula,
    dados.nome,
    dados.email,
    dados.status

FROM universidade u

JOIN curso c
    ON c.universidade_id = u.id

CROSS JOIN (

    VALUES

        (
            'DEMO-UFAL-001',
            'Aluno Demo UFAL 01',
            'ufal01@demo.sia.invalid',
            'Ativo'
        ),

        (
            'DEMO-UFAL-002',
            'Aluno Demo UFAL 02',
            'ufal02@demo.sia.invalid',
            'Ativo'
        ),

        (
            'DEMO-UFAL-003',
            'Aluno Demo UFAL 03',
            'ufal03@demo.sia.invalid',
            'Ativo'
        ),

        (
            'DEMO-UFAL-004',
            'Aluno Demo UFAL 04',
            'ufal04@demo.sia.invalid',
            'Evadido'
        )

) AS dados(
    matricula,
    nome,
    email,
    status
)

WHERE
    u.codigo = '577'

    AND c.nome =
        'Ciência da Computação'

    AND c.modalidade =
        'Presencial'

    AND c.origem_dados =
        'DEMONSTRACAO'

ON CONFLICT (
    universidade_id,
    matricula
)

DO UPDATE SET

    curso_id =
        EXCLUDED.curso_id,

    nome =
        EXCLUDED.nome,

    email =
        EXCLUDED.email,

    status =
        EXCLUDED.status,

    atualizado_em =
        NOW();


-- ---------------------------------------------------------
-- UFPE
-- ---------------------------------------------------------

INSERT INTO aluno
(
    universidade_id,
    curso_id,
    matricula,
    nome,
    email,
    status
)

SELECT
    u.id,
    c.id,
    dados.matricula,
    dados.nome,
    dados.email,
    dados.status

FROM universidade u

JOIN curso c
    ON c.universidade_id = u.id

CROSS JOIN (

    VALUES

        (
            'DEMO-UFPE-001',
            'Aluno Demo UFPE 01',
            'ufpe01@demo.sia.invalid',
            'Ativo'
        ),

        (
            'DEMO-UFPE-002',
            'Aluno Demo UFPE 02',
            'ufpe02@demo.sia.invalid',
            'Ativo'
        ),

        (
            'DEMO-UFPE-003',
            'Aluno Demo UFPE 03',
            'ufpe03@demo.sia.invalid',
            'Ativo'
        ),

        (
            'DEMO-UFPE-004',
            'Aluno Demo UFPE 04',
            'ufpe04@demo.sia.invalid',
            'Ativo'
        )

) AS dados(
    matricula,
    nome,
    email,
    status
)

WHERE
    u.codigo = '580'

    AND c.nome =
        'Ciência da Computação'

    AND c.modalidade =
        'Presencial'

    AND c.origem_dados =
        'DEMONSTRACAO'

ON CONFLICT (
    universidade_id,
    matricula
)

DO UPDATE SET

    curso_id =
        EXCLUDED.curso_id,

    nome =
        EXCLUDED.nome,

    email =
        EXCLUDED.email,

    status =
        EXCLUDED.status,

    atualizado_em =
        NOW();


-- ---------------------------------------------------------
-- UFMG
-- ---------------------------------------------------------

INSERT INTO aluno
(
    universidade_id,
    curso_id,
    matricula,
    nome,
    email,
    status
)

SELECT
    u.id,
    c.id,
    dados.matricula,
    dados.nome,
    dados.email,
    dados.status

FROM universidade u

JOIN curso c
    ON c.universidade_id = u.id

CROSS JOIN (

    VALUES

        (
            'DEMO-UFMG-001',
            'Aluno Demo UFMG 01',
            'ufmg01@demo.sia.invalid',
            'Ativo'
        ),

        (
            'DEMO-UFMG-002',
            'Aluno Demo UFMG 02',
            'ufmg02@demo.sia.invalid',
            'Ativo'
        ),

        (
            'DEMO-UFMG-003',
            'Aluno Demo UFMG 03',
            'ufmg03@demo.sia.invalid',
            'Ativo'
        ),

        (
            'DEMO-UFMG-004',
            'Aluno Demo UFMG 04',
            'ufmg04@demo.sia.invalid',
            'Trancado'
        )

) AS dados(
    matricula,
    nome,
    email,
    status
)

WHERE
    u.codigo = '575'

    AND c.nome =
        'Ciência da Computação'

    AND c.modalidade =
        'Presencial'

    AND c.origem_dados =
        'DEMONSTRACAO'

ON CONFLICT (
    universidade_id,
    matricula
)

DO UPDATE SET

    curso_id =
        EXCLUDED.curso_id,

    nome =
        EXCLUDED.nome,

    email =
        EXCLUDED.email,

    status =
        EXCLUDED.status,

    atualizado_em =
        NOW();


-- =========================================================
-- 5. DESEMPENHOS FICTÍCIOS
-- =========================================================
--
-- Um desempenho por aluno na disciplina
-- "Algoritmos e Estruturas de Dados".
--
-- Período: 2026.1
--
-- Resultados propositais para demonstração:
--
-- UFPE = média aproximada 8,38 / 100% aprovação
-- UFAL = média aproximada 7,55 / 75% aprovação
-- UFMG = média aproximada 6,53 / 75% aprovação
--
-- =========================================================


-- ---------------------------------------------------------
-- UFAL
-- ---------------------------------------------------------

INSERT INTO desempenho
(
    universidade_id,
    aluno_id,
    disciplina_id,
    ano,
    semestre,
    nota,
    frequencia,
    situacao
)

SELECT
    u.id,
    a.id,
    d.id,
    2026,
    1,
    dados.nota,
    dados.frequencia,
    dados.situacao

FROM universidade u

JOIN curso c
    ON c.universidade_id = u.id

JOIN disciplina d
    ON d.curso_id = c.id
    AND d.universidade_id = u.id

JOIN aluno a
    ON a.curso_id = c.id
    AND a.universidade_id = u.id

JOIN (

    VALUES

        (
            'DEMO-UFAL-001',
            8.40::NUMERIC,
            92.00::NUMERIC,
            'Aprovado'
        ),

        (
            'DEMO-UFAL-002',
            8.30::NUMERIC,
            90.00::NUMERIC,
            'Aprovado'
        ),

        (
            'DEMO-UFAL-003',
            8.30::NUMERIC,
            88.00::NUMERIC,
            'Aprovado'
        ),

        (
            'DEMO-UFAL-004',
            5.20::NUMERIC,
            70.00::NUMERIC,
            'Reprovado'
        )

) AS dados(
    matricula,
    nota,
    frequencia,
    situacao
)

    ON dados.matricula =
        a.matricula

WHERE
    u.codigo = '577'

    AND c.nome =
        'Ciência da Computação'

    AND c.origem_dados =
        'DEMONSTRACAO'

    AND d.nome =
        'Algoritmos e Estruturas de Dados'

ON CONFLICT (
    aluno_id,
    disciplina_id,
    ano,
    semestre
)

DO UPDATE SET

    nota =
        EXCLUDED.nota,

    frequencia =
        EXCLUDED.frequencia,

    situacao =
        EXCLUDED.situacao,

    atualizado_em =
        NOW();


-- ---------------------------------------------------------
-- UFPE
-- ---------------------------------------------------------

INSERT INTO desempenho
(
    universidade_id,
    aluno_id,
    disciplina_id,
    ano,
    semestre,
    nota,
    frequencia,
    situacao
)

SELECT
    u.id,
    a.id,
    d.id,
    2026,
    1,
    dados.nota,
    dados.frequencia,
    dados.situacao

FROM universidade u

JOIN curso c
    ON c.universidade_id = u.id

JOIN disciplina d
    ON d.curso_id = c.id
    AND d.universidade_id = u.id

JOIN aluno a
    ON a.curso_id = c.id
    AND a.universidade_id = u.id

JOIN (

    VALUES

        (
            'DEMO-UFPE-001',
            8.50::NUMERIC,
            95.00::NUMERIC,
            'Aprovado'
        ),

        (
            'DEMO-UFPE-002',
            8.20::NUMERIC,
            91.00::NUMERIC,
            'Aprovado'
        ),

        (
            'DEMO-UFPE-003',
            8.40::NUMERIC,
            94.00::NUMERIC,
            'Aprovado'
        ),

        (
            'DEMO-UFPE-004',
            8.40::NUMERIC,
            93.00::NUMERIC,
            'Aprovado'
        )

) AS dados(
    matricula,
    nota,
    frequencia,
    situacao
)

    ON dados.matricula =
        a.matricula

WHERE
    u.codigo = '580'

    AND c.nome =
        'Ciência da Computação'

    AND c.origem_dados =
        'DEMONSTRACAO'

    AND d.nome =
        'Algoritmos e Estruturas de Dados'

ON CONFLICT (
    aluno_id,
    disciplina_id,
    ano,
    semestre
)

DO UPDATE SET

    nota =
        EXCLUDED.nota,

    frequencia =
        EXCLUDED.frequencia,

    situacao =
        EXCLUDED.situacao,

    atualizado_em =
        NOW();


-- ---------------------------------------------------------
-- UFMG
-- ---------------------------------------------------------

INSERT INTO desempenho
(
    universidade_id,
    aluno_id,
    disciplina_id,
    ano,
    semestre,
    nota,
    frequencia,
    situacao
)

SELECT
    u.id,
    a.id,
    d.id,
    2026,
    1,
    dados.nota,
    dados.frequencia,
    dados.situacao

FROM universidade u

JOIN curso c
    ON c.universidade_id = u.id

JOIN disciplina d
    ON d.curso_id = c.id
    AND d.universidade_id = u.id

JOIN aluno a
    ON a.curso_id = c.id
    AND a.universidade_id = u.id

JOIN (

    VALUES

        (
            'DEMO-UFMG-001',
            7.40::NUMERIC,
            88.00::NUMERIC,
            'Aprovado'
        ),

        (
            'DEMO-UFMG-002',
            7.10::NUMERIC,
            85.00::NUMERIC,
            'Aprovado'
        ),

        (
            'DEMO-UFMG-003',
            7.00::NUMERIC,
            84.00::NUMERIC,
            'Aprovado'
        ),

        (
            'DEMO-UFMG-004',
            4.60::NUMERIC,
            68.00::NUMERIC,
            'Reprovado'
        )

) AS dados(
    matricula,
    nota,
    frequencia,
    situacao
)

    ON dados.matricula =
        a.matricula

WHERE
    u.codigo = '575'

    AND c.nome =
        'Ciência da Computação'

    AND c.origem_dados =
        'DEMONSTRACAO'

    AND d.nome =
        'Algoritmos e Estruturas de Dados'

ON CONFLICT (
    aluno_id,
    disciplina_id,
    ano,
    semestre
)

DO UPDATE SET

    nota =
        EXCLUDED.nota,

    frequencia =
        EXCLUDED.frequencia,

    situacao =
        EXCLUDED.situacao,

    atualizado_em =
        NOW();


COMMIT;


-- =========================================================
-- 6. CONFERÊNCIA
-- =========================================================


SELECT
    u.codigo,
    u.sigla,
    u.nome,

    c.nome AS curso,

    c.grau_academico,

    c.modalidade,

    c.origem_dados

FROM universidade u

JOIN curso c
    ON c.universidade_id =
        u.id

WHERE
    u.codigo IN (
        '577',
        '580',
        '575'
    )

    AND c.origem_dados =
        'DEMONSTRACAO'

ORDER BY
    u.nome;


-- =========================================================
-- RESULTADO ESPERADO DA COMPARAÇÃO
-- =========================================================


SELECT
    universidade_codigo,
    universidade,
    sigla,
    curso,
    modalidade,
    ano,
    semestre,
    alunos_avaliados,
    media_geral,
    taxa_aprovacao,
    taxa_reprovacao,
    frequencia_media

FROM vw_comparacao_publica_cursos

WHERE
    curso =
        'Ciência da Computação'

    AND ano =
        2026

    AND semestre =
        1

ORDER BY
    media_geral DESC;