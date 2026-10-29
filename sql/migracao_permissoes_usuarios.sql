-- =========================================================
-- SIA - SISTEMA DE PERMISSÕES POR USUÁRIO
-- =========================================================
--
-- Nesta primeira etapa:
-- - mantém os perfis atuais;
-- - cria permissões individuais;
-- - migra os acessos atuais para permissões equivalentes;
-- - NÃO remove consulta_institucional, gestor ou
--   admin_universidade ainda.
--
-- =========================================================

BEGIN;


-- =========================================================
-- CATÁLOGO DE PERMISSÕES
-- =========================================================

CREATE TABLE IF NOT EXISTS permissao (

    id SERIAL PRIMARY KEY,

    codigo VARCHAR(100)
        UNIQUE
        NOT NULL,

    nome VARCHAR(150)
        NOT NULL,

    descricao VARCHAR(500),

    categoria VARCHAR(100)
        NOT NULL,

    exige_universidade BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    ativo BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    criado_em TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW()
);


-- =========================================================
-- PERMISSÕES DO USUÁRIO
-- =========================================================

CREATE TABLE IF NOT EXISTS usuario_permissao (

    usuario_id INT NOT NULL,

    permissao_id INT NOT NULL,

    concedido_por INT,

    criado_em TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    CONSTRAINT pk_usuario_permissao
        PRIMARY KEY (
            usuario_id,
            permissao_id
        ),

    CONSTRAINT fk_usuario_permissao_usuario
        FOREIGN KEY (
            usuario_id
        )
        REFERENCES usuario(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_usuario_permissao_permissao
        FOREIGN KEY (
            permissao_id
        )
        REFERENCES permissao(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_usuario_permissao_concedido_por
        FOREIGN KEY (
            concedido_por
        )
        REFERENCES usuario(id)
        ON DELETE SET NULL
);


-- =========================================================
-- ÍNDICES
-- =========================================================

CREATE INDEX IF NOT EXISTS
    idx_usuario_permissao_usuario
ON usuario_permissao(
    usuario_id
);


CREATE INDEX IF NOT EXISTS
    idx_usuario_permissao_permissao
ON usuario_permissao(
    permissao_id
);


-- =========================================================
-- CATÁLOGO INICIAL
-- =========================================================

INSERT INTO permissao
(
    codigo,
    nome,
    descricao,
    categoria,
    exige_universidade
)
VALUES

(
    'VISUALIZAR_DADOS_INSTITUCIONAIS',
    'Visualizar dados institucionais',
    'Permite acessar indicadores e informações internas agregadas da instituição.',
    'Dados institucionais',
    TRUE
),

(
    'EDITAR_DADOS_INSTITUCIONAIS',
    'Alterar dados institucionais',
    'Permite cadastrar e alterar informações acadêmicas internas da instituição.',
    'Dados institucionais',
    TRUE
),

(
    'GERENCIAR_CURSOS',
    'Gerenciar cursos',
    'Permite cadastrar e alterar cursos da instituição.',
    'Acadêmico',
    TRUE
),

(
    'GERENCIAR_DISCIPLINAS',
    'Gerenciar disciplinas',
    'Permite cadastrar e alterar disciplinas da instituição.',
    'Acadêmico',
    TRUE
),

(
    'GERENCIAR_ALUNOS',
    'Gerenciar alunos',
    'Permite cadastrar e alterar registros acadêmicos de alunos.',
    'Acadêmico',
    TRUE
),

(
    'GERENCIAR_USUARIOS',
    'Gerenciar usuários',
    'Permite administrar contas vinculadas à instituição.',
    'Administração',
    TRUE
),

(
    'GERENCIAR_VINCULOS',
    'Gerenciar vínculos',
    'Permite aprovar ou rejeitar solicitações de vínculo institucional.',
    'Administração',
    TRUE
)

ON CONFLICT (codigo)
DO UPDATE SET

    nome =
        EXCLUDED.nome,

    descricao =
        EXCLUDED.descricao,

    categoria =
        EXCLUDED.categoria,

    exige_universidade =
        EXCLUDED.exige_universidade,

    ativo =
        TRUE;


-- =========================================================
-- MIGRAÇÃO DAS PERMISSÕES ATUAIS
-- =========================================================


-- ---------------------------------------------------------
-- CONSULTA INSTITUCIONAL
-- somente leitura
-- ---------------------------------------------------------

INSERT INTO usuario_permissao
(
    usuario_id,
    permissao_id
)

SELECT

    u.id,

    p.id

FROM usuario u

JOIN permissao p
    ON p.codigo =
        'VISUALIZAR_DADOS_INSTITUCIONAIS'

WHERE
    u.perfil =
        'consulta_institucional'

ON CONFLICT
    DO NOTHING;


-- ---------------------------------------------------------
-- GESTOR
-- leitura + edição acadêmica
-- ---------------------------------------------------------

INSERT INTO usuario_permissao
(
    usuario_id,
    permissao_id
)

SELECT

    u.id,

    p.id

FROM usuario u

CROSS JOIN permissao p

WHERE
    u.perfil =
        'gestor'

    AND p.codigo IN (

        'VISUALIZAR_DADOS_INSTITUCIONAIS',

        'EDITAR_DADOS_INSTITUCIONAIS',

        'GERENCIAR_CURSOS',

        'GERENCIAR_DISCIPLINAS',

        'GERENCIAR_ALUNOS'
    )

ON CONFLICT
    DO NOTHING;


-- ---------------------------------------------------------
-- ADMINISTRADOR DA INSTITUIÇÃO
-- todas as permissões institucionais
-- ---------------------------------------------------------

INSERT INTO usuario_permissao
(
    usuario_id,
    permissao_id
)

SELECT

    u.id,

    p.id

FROM usuario u

CROSS JOIN permissao p

WHERE
    u.perfil =
        'admin_universidade'

    AND p.ativo =
        TRUE

ON CONFLICT
    DO NOTHING;


-- =========================================================
-- SUPER ADMIN
-- =========================================================
--
-- Não precisamos inserir registros.
-- O backend considera super_admin como possuidor
-- de todas as permissões automaticamente.
--
-- =========================================================


COMMIT;