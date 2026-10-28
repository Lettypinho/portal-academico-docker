-- =========================================================
-- SIA
-- Solicitações de vínculo institucional
-- =========================================================


CREATE TABLE IF NOT EXISTS solicitacao_vinculo (

    id SERIAL PRIMARY KEY,

    usuario_id INT NOT NULL,

    universidade_id INT NOT NULL,

    tipo_vinculo VARCHAR(30) NOT NULL,

    email_institucional VARCHAR(200) NOT NULL,

    identificacao_institucional VARCHAR(100),

    matricula VARCHAR(100),

    curso_id INT,

    cargo VARCHAR(150),

    setor VARCHAR(150),

    status VARCHAR(30) NOT NULL
        DEFAULT 'pendente',

    observacao_analise TEXT,

    analisado_por INT,

    criado_em TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    atualizado_em TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    analisado_em TIMESTAMPTZ,


    CONSTRAINT fk_solicitacao_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id)
        ON DELETE CASCADE,


    CONSTRAINT fk_solicitacao_universidade
        FOREIGN KEY (universidade_id)
        REFERENCES universidade(id),


    CONSTRAINT fk_solicitacao_curso
        FOREIGN KEY (curso_id)
        REFERENCES curso(id)
        ON DELETE SET NULL,


    CONSTRAINT fk_solicitacao_analisado_por
        FOREIGN KEY (analisado_por)
        REFERENCES usuario(id)
        ON DELETE SET NULL,


    CONSTRAINT chk_solicitacao_tipo
        CHECK (
            tipo_vinculo IN (
                'aluno',
                'funcionario'
            )
        ),


    CONSTRAINT chk_solicitacao_status
        CHECK (
            status IN (
                'pendente',
                'aprovado',
                'rejeitado',
                'cancelado',
                'revogado'
            )
        )
);


CREATE INDEX IF NOT EXISTS
idx_solicitacao_vinculo_usuario
ON solicitacao_vinculo(usuario_id);


CREATE INDEX IF NOT EXISTS
idx_solicitacao_vinculo_universidade
ON solicitacao_vinculo(universidade_id);


CREATE INDEX IF NOT EXISTS
idx_solicitacao_vinculo_status
ON solicitacao_vinculo(status);


CREATE UNIQUE INDEX IF NOT EXISTS
uq_solicitacao_vinculo_pendente_usuario
ON solicitacao_vinculo(usuario_id)
WHERE status = 'pendente';