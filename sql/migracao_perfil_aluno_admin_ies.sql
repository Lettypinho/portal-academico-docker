-- =========================================================
-- SIA
-- Adicionar perfil ALUNO
-- =========================================================


ALTER TABLE usuario
DROP CONSTRAINT IF EXISTS chk_usuario_perfil;


ALTER TABLE usuario
ADD CONSTRAINT chk_usuario_perfil
CHECK (
    perfil IN (
        'publico',
        'aluno',
        'consulta_institucional',
        'gestor',
        'admin_universidade',
        'super_admin'
    )
);


-- =========================================================
-- REGRA DE VÍNCULO COM UNIVERSIDADE
-- =========================================================

ALTER TABLE usuario
DROP CONSTRAINT IF EXISTS chk_usuario_universidade;


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
            'consulta_institucional',
            'gestor',
            'admin_universidade'
        )
        AND universidade_id IS NOT NULL
    )
);