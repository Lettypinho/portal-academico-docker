-- =========================================================
-- SIA
-- Unificação dos perfis institucionais
-- =========================================================

BEGIN;


-- =========================================================
-- REMOVER CONSTRAINTS ANTIGAS
-- =========================================================

ALTER TABLE usuario
DROP CONSTRAINT IF EXISTS chk_usuario_perfil;


ALTER TABLE usuario
DROP CONSTRAINT IF EXISTS chk_usuario_universidade;


-- =========================================================
-- CONVERTER PERFIS ANTIGOS
--
-- As permissões não são perdidas porque ficam vinculadas
-- ao usuario_id na tabela usuario_permissao.
-- =========================================================

UPDATE usuario

SET
    perfil = 'institucional',
    atualizado_em = NOW()

WHERE
    perfil IN (
        'consulta_institucional',
        'gestor',
        'admin_universidade'
    );


-- =========================================================
-- NOVA REGRA DE PERFIS
-- =========================================================

ALTER TABLE usuario

ADD CONSTRAINT chk_usuario_perfil

CHECK (
    perfil IN (
        'publico',
        'aluno',
        'institucional',
        'super_admin'
    )
);


-- =========================================================
-- NOVA REGRA DE VÍNCULO
-- =========================================================

ALTER TABLE usuario

ADD CONSTRAINT chk_usuario_universidade

CHECK (

    (
        perfil IN (
            'publico',
            'super_admin'
        )

        AND universidade_id IS NULL
    )

    OR

    (
        perfil IN (
            'aluno',
            'institucional'
        )

        AND universidade_id IS NOT NULL
    )
);


COMMIT;