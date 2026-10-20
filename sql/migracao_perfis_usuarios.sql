-- =========================================================
-- SIA - Migração dos perfis de usuários
-- =========================================================


-- Perfis antigos "consulta" passam a ser
-- "consulta_institucional"

UPDATE usuario
SET perfil = 'consulta_institucional'
WHERE perfil = 'consulta';


-- Remove as constraints antigas

ALTER TABLE usuario
DROP CONSTRAINT IF EXISTS chk_usuario_perfil;

ALTER TABLE usuario
DROP CONSTRAINT IF EXISTS chk_usuario_universidade;


-- Novos perfis

ALTER TABLE usuario
ADD CONSTRAINT chk_usuario_perfil
CHECK (
    perfil IN (
        'publico',
        'consulta_institucional',
        'gestor',
        'admin_universidade',
        'super_admin'
    )
);


-- Regras de vínculo com universidade

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
            'consulta_institucional',
            'gestor',
            'admin_universidade'
        )
        AND universidade_id IS NOT NULL
    )
);