-- =========================================================
-- SIA
-- NOTAS DE CORTE + COMPROVANTES OFICIAIS
-- =========================================================

BEGIN;


-- =========================================================
-- NOVA PERMISSÃO
-- =========================================================

INSERT INTO permissao
(
    codigo,
    nome,
    descricao,
    categoria,
    exige_universidade,
    ativo
)

VALUES
(
    'GERENCIAR_NOTAS_CORTE',
    'Gerenciar notas de corte',
    'Permite enviar notas de corte acompanhadas de comprovante oficial para validação.',
    'Acadêmico',
    TRUE,
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
-- TABELA DE NOTAS DE CORTE
-- =========================================================

CREATE TABLE IF NOT EXISTS nota_corte
(
    id SERIAL PRIMARY KEY,


    -- =====================================================
    -- CURSO
    -- =====================================================

    curso_id INT NOT NULL,

    CONSTRAINT fk_nota_corte_curso
        FOREIGN KEY (curso_id)
        REFERENCES curso(id)
        ON DELETE RESTRICT,


    -- =====================================================
    -- PROCESSO SELETIVO
    -- =====================================================

    ano INT NOT NULL,

    edicao VARCHAR(50)
        NOT NULL
        DEFAULT 'Regular',

    processo_seletivo VARCHAR(100)
        NOT NULL
        DEFAULT 'SISU',

    turno VARCHAR(50)
        NOT NULL
        DEFAULT 'Não informado',


    -- =====================================================
    -- MODALIDADE DE CONCORRÊNCIA
    -- =====================================================

    grupo_concorrencia VARCHAR(30)
        NOT NULL,

    modalidade_nome VARCHAR(200)
        NOT NULL,


    -- =====================================================
    -- NOTA
    -- =====================================================

    tipo_nota VARCHAR(30)
        NOT NULL,

    nota NUMERIC(6,2)
        NOT NULL,

    vagas INT,


    -- =====================================================
    -- FONTE
    -- =====================================================

    fonte VARCHAR(30)
        NOT NULL,

    fonte_url TEXT,


    -- =====================================================
    -- COMPROVANTE
    -- =====================================================

    comprovante_nome VARCHAR(255)
        NOT NULL,

    comprovante_mime VARCHAR(100)
        NOT NULL,

    comprovante_tamanho INT
        NOT NULL,

    comprovante_hash CHAR(64)
        NOT NULL,

    comprovante_arquivo BYTEA
        NOT NULL,


    -- =====================================================
    -- VALIDAÇÃO
    -- =====================================================

    status VARCHAR(20)
        NOT NULL
        DEFAULT 'pendente',

    vigente BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    observacao_validacao TEXT,


    -- =====================================================
    -- AUDITORIA
    -- =====================================================

    enviado_por INT,

    validado_por INT,

    criado_em TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    atualizado_em TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    validado_em TIMESTAMPTZ,


    CONSTRAINT fk_nota_corte_enviado_por
        FOREIGN KEY (enviado_por)
        REFERENCES usuario(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_nota_corte_validado_por
        FOREIGN KEY (validado_por)
        REFERENCES usuario(id)
        ON DELETE SET NULL,


    -- =====================================================
    -- CHECKS
    -- =====================================================

    CONSTRAINT chk_nota_corte_ano
        CHECK (
            ano BETWEEN 2000 AND 2100
        ),

    CONSTRAINT chk_nota_corte_nota
        CHECK (
            nota >= 0
            AND nota <= 1000
        ),

    CONSTRAINT chk_nota_corte_vagas
        CHECK (
            vagas IS NULL
            OR vagas >= 0
        ),

    CONSTRAINT chk_nota_corte_grupo
        CHECK (
            grupo_concorrencia IN
            (
                'ampla',
                'cota',
                'acao_afirmativa',
                'outro'
            )
        ),

    CONSTRAINT chk_nota_corte_tipo
        CHECK (
            tipo_nota IN
            (
                'parcial',
                'encerramento',
                'chamada_regular'
            )
        ),

    CONSTRAINT chk_nota_corte_fonte
        CHECK (
            fonte IN
            (
                'mec_sisu',
                'inep',
                'ies',
                'outra_oficial'
            )
        ),

    CONSTRAINT chk_nota_corte_status
        CHECK (
            status IN
            (
                'pendente',
                'aprovada',
                'rejeitada'
            )
        )
);


-- =========================================================
-- ÍNDICES
-- =========================================================

CREATE INDEX IF NOT EXISTS
    idx_nota_corte_curso
ON nota_corte
(
    curso_id
);


CREATE INDEX IF NOT EXISTS
    idx_nota_corte_curso_ano
ON nota_corte
(
    curso_id,
    ano
);


CREATE INDEX IF NOT EXISTS
    idx_nota_corte_status
ON nota_corte
(
    status
);


CREATE INDEX IF NOT EXISTS
    idx_nota_corte_publica
ON nota_corte
(
    curso_id,
    ano,
    vigente
)

WHERE
    status = 'aprovada';


COMMIT;