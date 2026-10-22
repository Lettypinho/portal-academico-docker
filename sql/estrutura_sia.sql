-- =========================================================
-- SIA - Sistema de Indicadores Acadêmicos
-- Estrutura inicial do banco de dados
-- =========================================================


-- =========================================================
-- UNIVERSIDADES
-- =========================================================

CREATE TABLE universidade (
    id SERIAL PRIMARY KEY,

    codigo VARCHAR(30) UNIQUE NOT NULL,

    nome VARCHAR(200) NOT NULL,

    sigla VARCHAR(30),

    cidade VARCHAR(100) NOT NULL,

    estado CHAR(2) NOT NULL,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- CURSOS
-- =========================================================

CREATE TABLE curso (
    id SERIAL PRIMARY KEY,

    universidade_id INT NOT NULL,

    nome VARCHAR(500) NOT NULL,

    modalidade VARCHAR(20) NOT NULL DEFAULT 'Presencial',

    duracao_semestres INT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'Ativo',

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_curso_universidade
        FOREIGN KEY (universidade_id)
        REFERENCES universidade(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_modalidade
        CHECK (
            modalidade IN (
                'Presencial',
                'EAD',
                'Híbrido'
            )
        ),

    CONSTRAINT chk_curso_status
        CHECK (
            status IN (
                'Ativo',
                'Inativo'
            )
        ),

    CONSTRAINT chk_duracao_semestres
        CHECK (duracao_semestres > 0),

    CONSTRAINT uq_curso_universidade
        UNIQUE (universidade_id, nome, modalidade),

    CONSTRAINT uq_curso_id_universidade
        UNIQUE (id, universidade_id)
);


-- =========================================================
-- DISCIPLINAS
-- =========================================================

CREATE TABLE disciplina (
    id SERIAL PRIMARY KEY,

    universidade_id INT NOT NULL,

    curso_id INT NOT NULL,

    nome VARCHAR(150) NOT NULL,

    carga_horaria INT NOT NULL,

    periodo_recomendado INT,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_disciplina_curso
        FOREIGN KEY (curso_id, universidade_id)
        REFERENCES curso(id, universidade_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_carga_horaria
        CHECK (carga_horaria > 0),

    CONSTRAINT chk_periodo_recomendado
        CHECK (
            periodo_recomendado IS NULL
            OR periodo_recomendado > 0
        ),

    CONSTRAINT uq_disciplina_curso
        UNIQUE (curso_id, nome),

    CONSTRAINT uq_disciplina_id_universidade
        UNIQUE (id, universidade_id)
);


-- =========================================================
-- ALUNOS
-- =========================================================

CREATE TABLE aluno (
    id SERIAL PRIMARY KEY,

    universidade_id INT NOT NULL,

    curso_id INT NOT NULL,

    matricula VARCHAR(50) NOT NULL,

    nome VARCHAR(150) NOT NULL,

    email VARCHAR(150) NOT NULL,

    data_nascimento DATE,

    status VARCHAR(20) NOT NULL DEFAULT 'Ativo',

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_aluno_curso
        FOREIGN KEY (curso_id, universidade_id)
        REFERENCES curso(id, universidade_id),

    CONSTRAINT chk_aluno_status
        CHECK (
            status IN (
                'Ativo',
                'Trancado',
                'Formado',
                'Evadido',
                'Inativo'
            )
        ),

    CONSTRAINT uq_aluno_matricula
        UNIQUE (universidade_id, matricula),

    CONSTRAINT uq_aluno_email
        UNIQUE (universidade_id, email),

    CONSTRAINT uq_aluno_id_universidade
        UNIQUE (id, universidade_id)
);


-- =========================================================
-- USUÁRIOS DO SISTEMA
-- =========================================================

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,

    universidade_id INT,

    nome VARCHAR(150) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,

    senha_hash TEXT NOT NULL,

    perfil VARCHAR(30) NOT NULL,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_usuario_universidade
        FOREIGN KEY (universidade_id)
        REFERENCES universidade(id),

    CONSTRAINT chk_usuario_perfil
    CHECK (
        perfil IN (
            'publico',
            'consulta_institucional',
            'gestor',
            'admin_universidade',
            'super_admin'
        )
    ),

    CONSTRAINT chk_usuario_universidade
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
    )
);


-- =========================================================
-- DESEMPENHO ACADÊMICO
-- =========================================================

CREATE TABLE desempenho (
    id SERIAL PRIMARY KEY,

    universidade_id INT NOT NULL,

    aluno_id INT NOT NULL,

    disciplina_id INT NOT NULL,

    ano INT NOT NULL,

    semestre INT NOT NULL,

    nota NUMERIC(4,2),

    frequencia NUMERIC(5,2),

    situacao VARCHAR(20) NOT NULL DEFAULT 'Cursando',

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_desempenho_aluno
        FOREIGN KEY (aluno_id, universidade_id)
        REFERENCES aluno(id, universidade_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_desempenho_disciplina
        FOREIGN KEY (disciplina_id, universidade_id)
        REFERENCES disciplina(id, universidade_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_semestre
        CHECK (
            semestre IN (1, 2)
        ),

    CONSTRAINT chk_ano
        CHECK (
            ano >= 2000
        ),

    CONSTRAINT chk_nota
        CHECK (
            nota IS NULL
            OR nota BETWEEN 0 AND 10
        ),

    CONSTRAINT chk_frequencia
        CHECK (
            frequencia IS NULL
            OR frequencia BETWEEN 0 AND 100
        ),

    CONSTRAINT chk_desempenho_situacao
        CHECK (
            situacao IN (
                'Cursando',
                'Aprovado',
                'Reprovado',
                'Trancado'
            )
        ),

    CONSTRAINT uq_desempenho
        UNIQUE (
            aluno_id,
            disciplina_id,
            ano,
            semestre
        )
);


-- =========================================================
-- ÍNDICES
-- =========================================================

CREATE INDEX idx_curso_universidade
    ON curso(universidade_id);


CREATE INDEX idx_disciplina_universidade
    ON disciplina(universidade_id);


CREATE INDEX idx_disciplina_curso
    ON disciplina(curso_id);


CREATE INDEX idx_aluno_universidade
    ON aluno(universidade_id);


CREATE INDEX idx_aluno_curso
    ON aluno(curso_id);


CREATE INDEX idx_aluno_status
    ON aluno(status);


CREATE INDEX idx_usuario_universidade
    ON usuario(universidade_id);


CREATE INDEX idx_desempenho_universidade
    ON desempenho(universidade_id);


CREATE INDEX idx_desempenho_aluno
    ON desempenho(aluno_id);


CREATE INDEX idx_desempenho_disciplina
    ON desempenho(disciplina_id);


CREATE INDEX idx_desempenho_periodo
    ON desempenho(ano, semestre);