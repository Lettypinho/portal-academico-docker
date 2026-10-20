-- =========================================================
-- SIA - Migração dos perfis de usuários
-- =========================================================

BEGIN;


-- =========================================================
-- 1. REMOVER CONSTRAINTS ANTIGAS
-- =========================================================

ALTER TABLE usuario
DROP CONSTRAINT IF EXISTS chk_usuario_perfil;

ALTER TABLE usuario
DROP CONSTRAINT IF EXISTS chk_usuario_universidade;


-- =========================================================
-- 2. ATUALIZAR PERFIS ANTIGOS
-- =========================================================

UPDATE usuario
SET perfil = 'consulta_institucional'
WHERE perfil = 'consulta';


-- =========================================================
-- 3. CRIAR NOVA REGRA DE PERFIS
-- =========================================================

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


-- =========================================================
-- 4. CRIAR NOVA REGRA DE UNIVERSIDADE
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
            'consulta_institucional',
            'gestor',
            'admin_universidade'
        )
        AND universidade_id IS NOT NULL
    )
);


COMMIT;