-- =========================================================
-- SIA - Sistema de Indicadores Acadêmicos
-- Dados fictícios para desenvolvimento e demonstração
-- =========================================================


-- =========================================================
-- UNIVERSIDADES
-- =========================================================

INSERT INTO universidade
    (codigo, nome, sigla, cidade, estado)
VALUES
    (
        'UAL-001',
        'Universidade Acadêmica do Litoral',
        'UAL',
        'Maceió',
        'AL'
    ),
    (
        'UTN-002',
        'Universidade Tecnológica do Nordeste',
        'UTN',
        'Recife',
        'PE'
    ),
    (
        'UMS-003',
        'Universidade Metropolitana do Sudeste',
        'UMS',
        'Belo Horizonte',
        'MG'
    );


-- =========================================================
-- CURSOS
-- =========================================================

-- Universidade Acadêmica do Litoral

INSERT INTO curso
    (
        universidade_id,
        nome,
        modalidade,
        duracao_semestres
    )
VALUES
    (
        (SELECT id FROM universidade WHERE codigo = 'UAL-001'),
        'Ciência da Computação',
        'Presencial',
        8
    ),
    (
        (SELECT id FROM universidade WHERE codigo = 'UAL-001'),
        'Administração',
        'Presencial',
        8
    );


-- Universidade Tecnológica do Nordeste

INSERT INTO curso
    (
        universidade_id,
        nome,
        modalidade,
        duracao_semestres
    )
VALUES
    (
        (SELECT id FROM universidade WHERE codigo = 'UTN-002'),
        'Ciência da Computação',
        'Presencial',
        8
    ),
    (
        (SELECT id FROM universidade WHERE codigo = 'UTN-002'),
        'Administração',
        'Presencial',
        8
    );


-- Universidade Metropolitana do Sudeste

INSERT INTO curso
    (
        universidade_id,
        nome,
        modalidade,
        duracao_semestres
    )
VALUES
    (
        (SELECT id FROM universidade WHERE codigo = 'UMS-003'),
        'Ciência da Computação',
        'Presencial',
        8
    ),
    (
        (SELECT id FROM universidade WHERE codigo = 'UMS-003'),
        'Administração',
        'Presencial',
        8
    );


-- =========================================================
-- DISCIPLINAS
-- =========================================================


-- =========================================================
-- UAL - CIÊNCIA DA COMPUTAÇÃO
-- =========================================================

INSERT INTO disciplina
    (
        universidade_id,
        curso_id,
        nome,
        carga_horaria,
        periodo_recomendado
    )
VALUES
    (
        (SELECT id FROM universidade WHERE codigo = 'UAL-001'),

        (
            SELECT c.id
            FROM curso c
            JOIN universidade u
                ON u.id = c.universidade_id
            WHERE
                u.codigo = 'UAL-001'
                AND c.nome = 'Ciência da Computação'
        ),

        'Algoritmos e Estruturas de Dados',
        80,
        2
    ),
    (
        (SELECT id FROM universidade WHERE codigo = 'UAL-001'),

        (
            SELECT c.id
            FROM curso c
            JOIN universidade u
                ON u.id = c.universidade_id
            WHERE
                u.codigo = 'UAL-001'
                AND c.nome = 'Ciência da Computação'
        ),

        'Banco de Dados',
        60,
        4
    );


-- =========================================================
-- UAL - ADMINISTRAÇÃO
-- =========================================================

INSERT INTO disciplina
    (
        universidade_id,
        curso_id,
        nome,
        carga_horaria,
        periodo_recomendado
    )
VALUES
    (
        (SELECT id FROM universidade WHERE codigo = 'UAL-001'),

        (
            SELECT c.id
            FROM curso c
            JOIN universidade u
                ON u.id = c.universidade_id
            WHERE
                u.codigo = 'UAL-001'
                AND c.nome = 'Administração'
        ),

        'Gestão Financeira',
        60,
        4
    ),
    (
        (SELECT id FROM universidade WHERE codigo = 'UAL-001'),

        (
            SELECT c.id
            FROM curso c
            JOIN universidade u
                ON u.id = c.universidade_id
            WHERE
                u.codigo = 'UAL-001'
                AND c.nome = 'Administração'
        ),

        'Marketing',
        60,
        3
    );


-- =========================================================
-- UTN - CIÊNCIA DA COMPUTAÇÃO
-- =========================================================

INSERT INTO disciplina
    (
        universidade_id,
        curso_id,
        nome,
        carga_horaria,
        periodo_recomendado
    )
VALUES
    (
        (SELECT id FROM universidade WHERE codigo = 'UTN-002'),

        (
            SELECT c.id
            FROM curso c
            JOIN universidade u
                ON u.id = c.universidade_id
            WHERE
                u.codigo = 'UTN-002'
                AND c.nome = 'Ciência da Computação'
        ),

        'Algoritmos e Estruturas de Dados',
        80,
        2
    ),
    (
        (SELECT id FROM universidade WHERE codigo = 'UTN-002'),

        (
            SELECT c.id
            FROM curso c
            JOIN universidade u
                ON u.id = c.universidade_id
            WHERE
                u.codigo = 'UTN-002'
                AND c.nome = 'Ciência da Computação'
        ),

        'Banco de Dados',
        60,
        4
    );


-- =========================================================
-- UTN - ADMINISTRAÇÃO
-- =========================================================

INSERT INTO disciplina
    (
        universidade_id,
        curso_id,
        nome,
        carga_horaria,
        periodo_recomendado
    )
VALUES
    (
        (SELECT id FROM universidade WHERE codigo = 'UTN-002'),

        (
            SELECT c.id
            FROM curso c
            JOIN universidade u
                ON u.id = c.universidade_id
            WHERE
                u.codigo = 'UTN-002'
                AND c.nome = 'Administração'
        ),

        'Gestão Financeira',
        60,
        4
    ),
    (
        (SELECT id FROM universidade WHERE codigo = 'UTN-002'),

        (
            SELECT c.id
            FROM curso c
            JOIN universidade u
                ON u.id = c.universidade_id
            WHERE
                u.codigo = 'UTN-002'
                AND c.nome = 'Administração'
        ),

        'Marketing',
        60,
        3
    );


-- =========================================================
-- UMS - CIÊNCIA DA COMPUTAÇÃO
-- =========================================================

INSERT INTO disciplina
    (
        universidade_id,
        curso_id,
        nome,
        carga_horaria,
        periodo_recomendado
    )
VALUES
    (
        (SELECT id FROM universidade WHERE codigo = 'UMS-003'),

        (
            SELECT c.id
            FROM curso c
            JOIN universidade u
                ON u.id = c.universidade_id
            WHERE
                u.codigo = 'UMS-003'
                AND c.nome = 'Ciência da Computação'
        ),

        'Algoritmos e Estruturas de Dados',
        80,
        2
    ),
    (
        (SELECT id FROM universidade WHERE codigo = 'UMS-003'),

        (
            SELECT c.id
            FROM curso c
            JOIN universidade u
                ON u.id = c.universidade_id
            WHERE
                u.codigo = 'UMS-003'
                AND c.nome = 'Ciência da Computação'
        ),

        'Banco de Dados',
        60,
        4
    );


-- =========================================================
-- UMS - ADMINISTRAÇÃO
-- =========================================================

INSERT INTO disciplina
    (
        universidade_id,
        curso_id,
        nome,
        carga_horaria,
        periodo_recomendado
    )
VALUES
    (
        (SELECT id FROM universidade WHERE codigo = 'UMS-003'),

        (
            SELECT c.id
            FROM curso c
            JOIN universidade u
                ON u.id = c.universidade_id
            WHERE
                u.codigo = 'UMS-003'
                AND c.nome = 'Administração'
        ),

        'Gestão Financeira',
        60,
        4
    ),
    (
        (SELECT id FROM universidade WHERE codigo = 'UMS-003'),

        (
            SELECT c.id
            FROM curso c
            JOIN universidade u
                ON u.id = c.universidade_id
            WHERE
                u.codigo = 'UMS-003'
                AND c.nome = 'Administração'
        ),

        'Marketing',
        60,
        3
    );


-- =========================================================
-- ALUNOS - UAL
-- =========================================================

INSERT INTO aluno
    (
        universidade_id,
        curso_id,
        matricula,
        nome,
        email,
        data_nascimento,
        status
    )
VALUES

(
    (SELECT id FROM universidade WHERE codigo = 'UAL-001'),

    (
        SELECT c.id
        FROM curso c
        JOIN universidade u
            ON u.id = c.universidade_id
        WHERE
            u.codigo = 'UAL-001'
            AND c.nome = 'Ciência da Computação'
    ),

    'UAL2026001',
    'Ana Clara Silva',
    'ana.silva@ual.edu.br',
    '2003-05-12',
    'Ativo'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UAL-001'),

    (
        SELECT c.id
        FROM curso c
        JOIN universidade u
            ON u.id = c.universidade_id
        WHERE
            u.codigo = 'UAL-001'
            AND c.nome = 'Ciência da Computação'
    ),

    'UAL2026002',
    'Bruno Souza',
    'bruno.souza@ual.edu.br',
    '2002-09-20',
    'Ativo'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UAL-001'),

    (
        SELECT c.id
        FROM curso c
        JOIN universidade u
            ON u.id = c.universidade_id
        WHERE
            u.codigo = 'UAL-001'
            AND c.nome = 'Ciência da Computação'
    ),

    'UAL2026003',
    'Carlos Eduardo Lima',
    'carlos.lima@ual.edu.br',
    '2003-01-15',
    'Evadido'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UAL-001'),

    (
        SELECT c.id
        FROM curso c
        JOIN universidade u
            ON u.id = c.universidade_id
        WHERE
            u.codigo = 'UAL-001'
            AND c.nome = 'Administração'
    ),

    'UAL2026004',
    'Daniela Santos',
    'daniela.santos@ual.edu.br',
    '2002-03-25',
    'Ativo'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UAL-001'),

    (
        SELECT c.id
        FROM curso c
        JOIN universidade u
            ON u.id = c.universidade_id
        WHERE
            u.codigo = 'UAL-001'
            AND c.nome = 'Administração'
    ),

    'UAL2026005',
    'Fernanda Costa',
    'fernanda.costa@ual.edu.br',
    '2003-07-08',
    'Ativo'
);


-- =========================================================
-- ALUNOS - UTN
-- =========================================================

INSERT INTO aluno
    (
        universidade_id,
        curso_id,
        matricula,
        nome,
        email,
        data_nascimento,
        status
    )
VALUES

(
    (SELECT id FROM universidade WHERE codigo = 'UTN-002'),

    (
        SELECT c.id
        FROM curso c
        JOIN universidade u
            ON u.id = c.universidade_id
        WHERE
            u.codigo = 'UTN-002'
            AND c.nome = 'Ciência da Computação'
    ),

    'UTN2026001',
    'Gabriel Oliveira',
    'gabriel.oliveira@utn.edu.br',
    '2003-06-18',
    'Ativo'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UTN-002'),

    (
        SELECT c.id
        FROM curso c
        JOIN universidade u
            ON u.id = c.universidade_id
        WHERE
            u.codigo = 'UTN-002'
            AND c.nome = 'Ciência da Computação'
    ),

    'UTN2026002',
    'Helena Ribeiro',
    'helena.ribeiro@utn.edu.br',
    '2002-12-05',
    'Ativo'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UTN-002'),

    (
        SELECT c.id
        FROM curso c
        JOIN universidade u
            ON u.id = c.universidade_id
        WHERE
            u.codigo = 'UTN-002'
            AND c.nome = 'Ciência da Computação'
    ),

    'UTN2026003',
    'Igor Martins',
    'igor.martins@utn.edu.br',
    '2003-04-22',
    'Ativo'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UTN-002'),

    (
        SELECT c.id
        FROM curso c
        JOIN universidade u
            ON u.id = c.universidade_id
        WHERE
            u.codigo = 'UTN-002'
            AND c.nome = 'Administração'
    ),

    'UTN2026004',
    'Julia Almeida',
    'julia.almeida@utn.edu.br',
    '2002-08-14',
    'Ativo'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UTN-002'),

    (
        SELECT c.id
        FROM curso c
        JOIN universidade u
            ON u.id = c.universidade_id
        WHERE
            u.codigo = 'UTN-002'
            AND c.nome = 'Administração'
    ),

    'UTN2026005',
    'Kaique Barbosa',
    'kaique.barbosa@utn.edu.br',
    '2004-02-10',
    'Trancado'
);


-- =========================================================
-- ALUNOS - UMS
-- =========================================================

INSERT INTO aluno
    (
        universidade_id,
        curso_id,
        matricula,
        nome,
        email,
        data_nascimento,
        status
    )
VALUES

(
    (SELECT id FROM universidade WHERE codigo = 'UMS-003'),

    (
        SELECT c.id
        FROM curso c
        JOIN universidade u
            ON u.id = c.universidade_id
        WHERE
            u.codigo = 'UMS-003'
            AND c.nome = 'Ciência da Computação'
    ),

    'UMS2026001',
    'Larissa Mendes',
    'larissa.mendes@ums.edu.br',
    '2002-10-01',
    'Ativo'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UMS-003'),

    (
        SELECT c.id
        FROM curso c
        JOIN universidade u
            ON u.id = c.universidade_id
        WHERE
            u.codigo = 'UMS-003'
            AND c.nome = 'Ciência da Computação'
    ),

    'UMS2026002',
    'Matheus Rocha',
    'matheus.rocha@ums.edu.br',
    '2003-06-29',
    'Ativo'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UMS-003'),

    (
        SELECT c.id
        FROM curso c
        JOIN universidade u
            ON u.id = c.universidade_id
        WHERE
            u.codigo = 'UMS-003'
            AND c.nome = 'Ciência da Computação'
    ),

    'UMS2026003',
    'Natalia Farias',
    'natalia.farias@ums.edu.br',
    '2002-01-19',
    'Ativo'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UMS-003'),

    (
        SELECT c.id
        FROM curso c
        JOIN universidade u
            ON u.id = c.universidade_id
        WHERE
            u.codigo = 'UMS-003'
            AND c.nome = 'Administração'
    ),

    'UMS2026004',
    'Otavio Ramos',
    'otavio.ramos@ums.edu.br',
    '2003-09-03',
    'Ativo'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UMS-003'),

    (
        SELECT c.id
        FROM curso c
        JOIN universidade u
            ON u.id = c.universidade_id
        WHERE
            u.codigo = 'UMS-003'
            AND c.nome = 'Administração'
    ),

    'UMS2026005',
    'Priscila Nogueira',
    'priscila.nogueira@ums.edu.br',
    '2002-05-27',
    'Formado'
);


-- =========================================================
-- DESEMPENHO - CIÊNCIA DA COMPUTAÇÃO
-- =========================================================

-- Ana Clara - UAL

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
VALUES
(
    (SELECT id FROM universidade WHERE codigo = 'UAL-001'),

    (
        SELECT id
        FROM aluno
        WHERE matricula = 'UAL2026001'
    ),

    (
        SELECT d.id
        FROM disciplina d
        JOIN universidade u
            ON u.id = d.universidade_id
        WHERE
            u.codigo = 'UAL-001'
            AND d.nome = 'Algoritmos e Estruturas de Dados'
    ),

    2026,
    1,
    8.50,
    92.00,
    'Aprovado'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UAL-001'),

    (
        SELECT id
        FROM aluno
        WHERE matricula = 'UAL2026001'
    ),

    (
        SELECT d.id
        FROM disciplina d
        JOIN universidade u
            ON u.id = d.universidade_id
        WHERE
            u.codigo = 'UAL-001'
            AND d.nome = 'Banco de Dados'
    ),

    2026,
    1,
    9.00,
    95.00,
    'Aprovado'
);


-- Bruno Souza - UAL

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
VALUES
(
    (SELECT id FROM universidade WHERE codigo = 'UAL-001'),

    (
        SELECT id FROM aluno
        WHERE matricula = 'UAL2026002'
    ),

    (
        SELECT d.id
        FROM disciplina d
        JOIN universidade u
            ON u.id = d.universidade_id
        WHERE
            u.codigo = 'UAL-001'
            AND d.nome = 'Algoritmos e Estruturas de Dados'
    ),

    2026,
    1,
    7.20,
    88.00,
    'Aprovado'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UAL-001'),

    (
        SELECT id FROM aluno
        WHERE matricula = 'UAL2026002'
    ),

    (
        SELECT d.id
        FROM disciplina d
        JOIN universidade u
            ON u.id = d.universidade_id
        WHERE
            u.codigo = 'UAL-001'
            AND d.nome = 'Banco de Dados'
    ),

    2026,
    1,
    5.50,
    70.00,
    'Reprovado'
);


-- UTN

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
VALUES

(
    (SELECT id FROM universidade WHERE codigo = 'UTN-002'),

    (
        SELECT id FROM aluno
        WHERE matricula = 'UTN2026001'
    ),

    (
        SELECT d.id
        FROM disciplina d
        JOIN universidade u
            ON u.id = d.universidade_id
        WHERE
            u.codigo = 'UTN-002'
            AND d.nome = 'Algoritmos e Estruturas de Dados'
    ),

    2026,
    1,
    9.00,
    96.00,
    'Aprovado'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UTN-002'),

    (
        SELECT id FROM aluno
        WHERE matricula = 'UTN2026001'
    ),

    (
        SELECT d.id
        FROM disciplina d
        JOIN universidade u
            ON u.id = d.universidade_id
        WHERE
            u.codigo = 'UTN-002'
            AND d.nome = 'Banco de Dados'
    ),

    2026,
    1,
    8.70,
    94.00,
    'Aprovado'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UTN-002'),

    (
        SELECT id FROM aluno
        WHERE matricula = 'UTN2026002'
    ),

    (
        SELECT d.id
        FROM disciplina d
        JOIN universidade u
            ON u.id = d.universidade_id
        WHERE
            u.codigo = 'UTN-002'
            AND d.nome = 'Algoritmos e Estruturas de Dados'
    ),

    2026,
    1,
    8.00,
    90.00,
    'Aprovado'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UTN-002'),

    (
        SELECT id FROM aluno
        WHERE matricula = 'UTN2026002'
    ),

    (
        SELECT d.id
        FROM disciplina d
        JOIN universidade u
            ON u.id = d.universidade_id
        WHERE
            u.codigo = 'UTN-002'
            AND d.nome = 'Banco de Dados'
    ),

    2026,
    1,
    7.80,
    86.00,
    'Aprovado'
);


-- UMS

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
VALUES

(
    (SELECT id FROM universidade WHERE codigo = 'UMS-003'),

    (
        SELECT id FROM aluno
        WHERE matricula = 'UMS2026001'
    ),

    (
        SELECT d.id
        FROM disciplina d
        JOIN universidade u
            ON u.id = d.universidade_id
        WHERE
            u.codigo = 'UMS-003'
            AND d.nome = 'Algoritmos e Estruturas de Dados'
    ),

    2026,
    1,
    7.80,
    89.00,
    'Aprovado'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UMS-003'),

    (
        SELECT id FROM aluno
        WHERE matricula = 'UMS2026001'
    ),

    (
        SELECT d.id
        FROM disciplina d
        JOIN universidade u
            ON u.id = d.universidade_id
        WHERE
            u.codigo = 'UMS-003'
            AND d.nome = 'Banco de Dados'
    ),

    2026,
    1,
    7.50,
    85.00,
    'Aprovado'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UMS-003'),

    (
        SELECT id FROM aluno
        WHERE matricula = 'UMS2026002'
    ),

    (
        SELECT d.id
        FROM disciplina d
        JOIN universidade u
            ON u.id = d.universidade_id
        WHERE
            u.codigo = 'UMS-003'
            AND d.nome = 'Algoritmos e Estruturas de Dados'
    ),

    2026,
    1,
    6.00,
    81.00,
    'Aprovado'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UMS-003'),

    (
        SELECT id FROM aluno
        WHERE matricula = 'UMS2026002'
    ),

    (
        SELECT d.id
        FROM disciplina d
        JOIN universidade u
            ON u.id = d.universidade_id
        WHERE
            u.codigo = 'UMS-003'
            AND d.nome = 'Banco de Dados'
    ),

    2026,
    1,
    4.80,
    68.00,
    'Reprovado'
);


-- =========================================================
-- DESEMPENHO - ADMINISTRAÇÃO
-- =========================================================

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
VALUES

-- UAL

(
    (SELECT id FROM universidade WHERE codigo = 'UAL-001'),

    (
        SELECT id FROM aluno
        WHERE matricula = 'UAL2026004'
    ),

    (
        SELECT d.id
        FROM disciplina d
        JOIN universidade u
            ON u.id = d.universidade_id
        WHERE
            u.codigo = 'UAL-001'
            AND d.nome = 'Gestão Financeira'
    ),

    2026,
    1,
    8.00,
    91.00,
    'Aprovado'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UAL-001'),

    (
        SELECT id FROM aluno
        WHERE matricula = 'UAL2026004'
    ),

    (
        SELECT d.id
        FROM disciplina d
        JOIN universidade u
            ON u.id = d.universidade_id
        WHERE
            u.codigo = 'UAL-001'
            AND d.nome = 'Marketing'
    ),

    2026,
    1,
    8.70,
    94.00,
    'Aprovado'
),

-- UTN

(
    (SELECT id FROM universidade WHERE codigo = 'UTN-002'),

    (
        SELECT id FROM aluno
        WHERE matricula = 'UTN2026004'
    ),

    (
        SELECT d.id
        FROM disciplina d
        JOIN universidade u
            ON u.id = d.universidade_id
        WHERE
            u.codigo = 'UTN-002'
            AND d.nome = 'Gestão Financeira'
    ),

    2026,
    1,
    7.30,
    87.00,
    'Aprovado'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UTN-002'),

    (
        SELECT id FROM aluno
        WHERE matricula = 'UTN2026004'
    ),

    (
        SELECT d.id
        FROM disciplina d
        JOIN universidade u
            ON u.id = d.universidade_id
        WHERE
            u.codigo = 'UTN-002'
            AND d.nome = 'Marketing'
    ),

    2026,
    1,
    6.80,
    84.00,
    'Aprovado'
),

-- UMS

(
    (SELECT id FROM universidade WHERE codigo = 'UMS-003'),

    (
        SELECT id FROM aluno
        WHERE matricula = 'UMS2026004'
    ),

    (
        SELECT d.id
        FROM disciplina d
        JOIN universidade u
            ON u.id = d.universidade_id
        WHERE
            u.codigo = 'UMS-003'
            AND d.nome = 'Gestão Financeira'
    ),

    2026,
    1,
    9.20,
    97.00,
    'Aprovado'
),

(
    (SELECT id FROM universidade WHERE codigo = 'UMS-003'),

    (
        SELECT id FROM aluno
        WHERE matricula = 'UMS2026004'
    ),

    (
        SELECT d.id
        FROM disciplina d
        JOIN universidade u
            ON u.id = d.universidade_id
        WHERE
            u.codigo = 'UMS-003'
            AND d.nome = 'Marketing'
    ),

    2026,
    1,
    8.90,
    95.00,
    'Aprovado'
);