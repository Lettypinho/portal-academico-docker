-- =========================================================
-- SIA - REMOÇÃO DAS INSTITUIÇÕES ANTIGAS DE TESTE
-- =========================================================
--
-- Remove:
--
-- UAL-001
-- UTN-002
-- UMS-003
--
-- Antes da remoção, usuários institucionais eventualmente
-- vinculados às instituições fictícias são migrados para
-- instituições reais utilizadas na demonstração.
--
-- =========================================================


BEGIN;


-- =========================================================
-- 1. GARANTIR QUE AS IES DE DESTINO EXISTEM
-- =========================================================


DO $$

DECLARE
    total_destino INT;

BEGIN

    SELECT COUNT(*)
    INTO total_destino

    FROM universidade

    WHERE codigo IN (
        '577',
        '580',
        '575'
    );


    IF total_destino <> 3 THEN

        RAISE EXCEPTION
            'As instituições reais de destino precisam existir antes da remoção das instituições de teste. Encontradas: %',
            total_destino;

    END IF;

END
$$;


-- =========================================================
-- 2. MIGRAR USUÁRIOS INSTITUCIONAIS
-- =========================================================
--
-- UAL -> UFAL
-- UTN -> UFPE
-- UMS -> UFMG
--
-- =========================================================


UPDATE usuario us

SET
    universidade_id =
        destino.id,

    atualizado_em =
        NOW()

FROM universidade origem

JOIN universidade destino
    ON destino.codigo = '577'

WHERE
    us.universidade_id =
        origem.id

    AND origem.codigo =
        'UAL-001';


UPDATE usuario us

SET
    universidade_id =
        destino.id,

    atualizado_em =
        NOW()

FROM universidade origem

JOIN universidade destino
    ON destino.codigo = '580'

WHERE
    us.universidade_id =
        origem.id

    AND origem.codigo =
        'UTN-002';


UPDATE usuario us

SET
    universidade_id =
        destino.id,

    atualizado_em =
        NOW()

FROM universidade origem

JOIN universidade destino
    ON destino.codigo = '575'

WHERE
    us.universidade_id =
        origem.id

    AND origem.codigo =
        'UMS-003';


-- =========================================================
-- 3. VALIDAR VÍNCULOS
-- =========================================================


DO $$

DECLARE
    usuarios_restantes INT;

BEGIN

    SELECT COUNT(*)
    INTO usuarios_restantes

    FROM usuario us

    JOIN universidade u
        ON u.id =
            us.universidade_id

    WHERE
        u.codigo IN (
            'UAL-001',
            'UTN-002',
            'UMS-003'
        );


    IF usuarios_restantes > 0 THEN

        RAISE EXCEPTION
            'Ainda existem % usuários vinculados às instituições fictícias.',
            usuarios_restantes;

    END IF;

END
$$;


-- =========================================================
-- 4. EXCLUIR INSTITUIÇÕES DE TESTE
-- =========================================================
--
-- Curso possui ON DELETE CASCADE com universidade.
--
-- As disciplinas vinculadas aos cursos possuem cascade.
--
-- Os desempenhos também serão removidos através de suas
-- relações.
--
-- Alunos não possuem ON DELETE CASCADE direto com curso,
-- então são removidos explicitamente antes dos cursos.
-- =========================================================


DELETE FROM aluno

WHERE universidade_id IN (

    SELECT id

    FROM universidade

    WHERE codigo IN (
        'UAL-001',
        'UTN-002',
        'UMS-003'
    )
);


DELETE FROM universidade

WHERE codigo IN (
    'UAL-001',
    'UTN-002',
    'UMS-003'
);


COMMIT;


-- =========================================================
-- 5. CONFERÊNCIA
-- =========================================================


SELECT
    codigo,
    nome,
    sigla

FROM universidade

WHERE codigo IN (
    'UAL-001',
    'UTN-002',
    'UMS-003'
);


-- Deve retornar 0.

SELECT
    COUNT(*) AS instituicoes_teste_restantes

FROM universidade

WHERE codigo IN (
    'UAL-001',
    'UTN-002',
    'UMS-003'
);


-- Conferir usuários institucionais.

SELECT
    us.id,
    us.nome,
    us.email,
    us.perfil,

    u.codigo
        AS codigo_ies,

    u.nome
        AS instituicao,

    u.sigla

FROM usuario us

LEFT JOIN universidade u
    ON u.id =
        us.universidade_id

WHERE
    us.perfil IN (
        'consulta_institucional',
        'gestor',
        'admin_universidade'
    )

ORDER BY
    us.nome;