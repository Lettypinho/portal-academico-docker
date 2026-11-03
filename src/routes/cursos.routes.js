const express =
    require("express");

const pool =
    require("../config/database");

const {
    exigirPermissao
} =
    require("../middleware/auth");


const router =
    express.Router();


// =========================================================
// UTILITÁRIOS
// =========================================================

function idValido(
    valor
) {

    const id =
        Number(
            valor
        );


    return (
        Number.isInteger(id) &&
        id > 0
    );
}


// =========================================================
// LISTAGEM PÚBLICA
// =========================================================

router.get(
    "/",

    async (req, res) => {

        try {

            const {
                universidade_id,
                campus_id,
                nome,
                modalidade,
                grau,
                estado,
                cidade,
                limite
            } =
                req.query;


            let limiteConsulta =
                Number.parseInt(
                    limite,
                    10
                );


            if (
                !Number.isInteger(
                    limiteConsulta
                ) ||
                limiteConsulta <= 0
            ) {

                limiteConsulta =
                    nome
                        ? 100
                        : 500;
            }


            limiteConsulta =
                Math.min(
                    limiteConsulta,
                    500
                );


            const parametros =
                [];


            const filtros = [
                "c.status = 'Ativo'",
                "u.ativo = TRUE"
            ];


            if (
                universidade_id
            ) {

                const universidadeId =
                    Number.parseInt(
                        universidade_id,
                        10
                    );


                if (
                    Number.isInteger(
                        universidadeId
                    )
                ) {

                    parametros.push(
                        universidadeId
                    );


                    filtros.push(
                        `c.universidade_id = $${parametros.length}`
                    );
                }
            }


            if (
                campus_id
            ) {

                const campusId =
                    Number.parseInt(
                        campus_id,
                        10
                    );


                if (
                    Number.isInteger(
                        campusId
                    )
                ) {

                    parametros.push(
                        campusId
                    );


                    filtros.push(
                        `c.campus_id = $${parametros.length}`
                    );
                }
            }


            if (
                nome &&
                String(nome).trim()
            ) {

                parametros.push(
                    `%${String(nome).trim()}%`
                );


                filtros.push(
                    `c.nome ILIKE $${parametros.length}`
                );
            }


            if (
                estado &&
                String(estado).trim()
            ) {

                parametros.push(
                    String(estado)
                        .trim()
                        .toUpperCase()
                );


                filtros.push(
                    `u.estado = $${parametros.length}`
                );
            }


            if (
                cidade &&
                String(cidade).trim()
            ) {

                parametros.push(
                    String(cidade)
                        .trim()
                );


                filtros.push(
                    `LOWER(u.cidade) = LOWER($${parametros.length})`
                );
            }


            if (
                modalidade &&
                String(modalidade).trim()
            ) {

                parametros.push(
                    String(modalidade)
                        .trim()
                );


                filtros.push(
                    `c.modalidade = $${parametros.length}`
                );
            }


            if (
                grau &&
                String(grau).trim()
            ) {

                parametros.push(
                    String(grau)
                        .trim()
                );


                filtros.push(
                    `c.grau_academico = $${parametros.length}`
                );
            }


            parametros.push(
                limiteConsulta
            );


            const indiceLimite =
                parametros.length;


            const resultado =
                await pool.query(
                    `
                    SELECT

                        c.id,

                        c.codigo_inep,

                        c.nome,

                        c.grau_academico,

                        c.nivel_academico,

                        c.modalidade,

                        c.duracao_semestres,

                        c.carga_horaria,

                        c.situacao_inep,

                        c.status,

                        c.ano_censo,

                        c.origem_dados,

                        c.campus_id,


                        u.id
                            AS universidade_id,

                        u.codigo
                            AS universidade_codigo,

                        u.nome
                            AS universidade,

                        u.sigla
                            AS universidade_sigla,

                        u.cidade,

                        u.estado,

                        u.organizacao_academica,

                        u.categoria_administrativa,


                        ca.nome
                            AS campus_nome,

                        ca.endereco
                            AS campus_endereco,

                        ca.numero
                            AS campus_numero,

                        ca.bairro
                            AS campus_bairro,

                        ca.cidade
                            AS campus_cidade,

                        ca.estado
                            AS campus_estado,

                        ca.cep
                            AS campus_cep,

                        ca.latitude
                            AS campus_latitude,

                        ca.longitude
                            AS campus_longitude

                    FROM curso c

                    JOIN universidade u
                        ON u.id =
                            c.universidade_id

                    LEFT JOIN campus ca
                        ON ca.id =
                            c.campus_id

                    WHERE
                        ${filtros.join(
                            " AND "
                        )}

                    ORDER BY
                        c.nome,
                        u.estado,
                        u.cidade,
                        u.nome

                    LIMIT $${indiceLimite}
                    `,
                    parametros
                );


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro ao consultar cursos:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao consultar cursos"
                });
        }
    }
);


// =========================================================
// CURSOS DA PRÓPRIA INSTITUIÇÃO
// =========================================================

router.get(
    "/minha-universidade",

    exigirPermissao(
        "VISUALIZAR_DADOS_INSTITUCIONAIS"
    ),

    async (req, res) => {

        try {

            const usuario =
                req.session.usuario;


            if (
                !usuario.universidade_id
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "O usuário não está vinculado a uma instituição"
                    });
            }


            const resultado =
                await pool.query(
                    `
                    SELECT

                        c.id,

                        c.codigo_inep,

                        c.nome,

                        c.grau_academico,

                        c.nivel_academico,

                        c.modalidade,

                        c.duracao_semestres,

                        c.carga_horaria,

                        c.situacao_inep,

                        c.status,

                        c.ano_censo,

                        c.origem_dados,

                        c.campus_id,

                        ca.nome
                            AS campus_nome,

                        ca.cidade
                            AS campus_cidade,

                        ca.estado
                            AS campus_estado

                    FROM curso c

                    LEFT JOIN campus ca
                        ON ca.id =
                            c.campus_id

                    WHERE
                        c.universidade_id = $1

                    ORDER BY
                        c.nome,
                        c.modalidade
                    `,
                    [
                        usuario
                            .universidade_id
                    ]
                );


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro ao consultar cursos da instituição:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao consultar cursos"
                });
        }
    }
);


// =========================================================
// CADASTRAR CURSO
// =========================================================

router.post(
    "/",

    exigirPermissao(
        "GERENCIAR_CURSOS"
    ),

    async (req, res) => {

        try {

            const usuario =
                req.session.usuario;


            let {
                universidade_id,
                campus_id,
                nome,
                modalidade,
                duracao_semestres,
                grau_academico,
                carga_horaria
            } =
                req.body;


            if (
                !nome ||
                !modalidade
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Preencha os campos obrigatórios"
                    });
            }


            if (
                usuario.perfil !==
                "super_admin"
            ) {

                universidade_id =
                    usuario
                        .universidade_id;
            }


            if (
                usuario.perfil ===
                    "super_admin" &&
                !universidade_id
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe a instituição"
                    });
            }


            universidade_id =
                Number(
                    universidade_id
                );


            if (
                !idValido(
                    universidade_id
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Instituição inválida"
                    });
            }


            const instituicao =
                await pool.query(
                    `
                    SELECT id

                    FROM universidade

                    WHERE
                        id = $1
                        AND ativo = TRUE
                    `,
                    [
                        universidade_id
                    ]
                );


            if (
                instituicao.rows.length ===
                0
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Instituição inválida"
                    });
            }


            let campusId =
                null;


            if (
                campus_id !== undefined &&
                campus_id !== null &&
                campus_id !== ""
            ) {

                campusId =
                    Number(
                        campus_id
                    );


                if (
                    !idValido(
                        campusId
                    )
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Campus inválido"
                        });
                }


                const campus =
                    await pool.query(
                        `
                        SELECT id

                        FROM campus

                        WHERE
                            id = $1

                            AND universidade_id = $2

                            AND ativo = TRUE

                        LIMIT 1
                        `,
                        [
                            campusId,
                            universidade_id
                        ]
                    );


                if (
                    campus.rows.length ===
                    0
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "O campus informado não pertence à instituição"
                        });
                }
            }


            const modalidadesPermitidas = [
                "Presencial",
                "EAD"
            ];


            if (
                !modalidadesPermitidas.includes(
                    modalidade
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Modalidade inválida"
                    });
            }


            if (
                grau_academico &&
                ![
                    "Bacharelado",
                    "Licenciatura",
                    "Tecnológico"
                ].includes(
                    grau_academico
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Grau acadêmico inválido"
                    });
            }


            let duracaoSemestres =
                null;


            if (
                duracao_semestres !==
                    undefined &&
                duracao_semestres !==
                    null &&
                duracao_semestres !==
                    ""
            ) {

                duracaoSemestres =
                    Number(
                        duracao_semestres
                    );


                if (
                    !Number.isInteger(
                        duracaoSemestres
                    ) ||
                    duracaoSemestres <= 0
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Duração do curso inválida"
                        });
                }
            }


            let cargaHoraria =
                null;


            if (
                carga_horaria !==
                    undefined &&
                carga_horaria !==
                    null &&
                carga_horaria !==
                    ""
            ) {

                cargaHoraria =
                    Number(
                        carga_horaria
                    );


                if (
                    !Number.isFinite(
                        cargaHoraria
                    ) ||
                    cargaHoraria <= 0
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Carga horária inválida"
                        });
                }
            }


            const resultado =
                await pool.query(
                    `
                    INSERT INTO curso
                    (
                        universidade_id,

                        campus_id,

                        nome,

                        modalidade,

                        duracao_semestres,

                        grau_academico,

                        nivel_academico,

                        carga_horaria,

                        origem_dados
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        'Graduação',
                        $7,
                        'SIA'
                    )

                    RETURNING *
                    `,
                    [
                        universidade_id,

                        campusId,

                        String(nome)
                            .trim(),

                        modalidade,

                        duracaoSemestres,

                        grau_academico ||
                            null,

                        cargaHoraria
                    ]
                );


            res
                .status(201)
                .json(
                    resultado.rows[0]
                );


        } catch (erro) {

            if (
                erro.code ===
                "23505"
            ) {

                return res
                    .status(409)
                    .json({
                        erro:
                            "Este curso já está cadastrado"
                    });
            }


            if (
                erro.code ===
                "23514"
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Dados do curso inválidos"
                    });
            }


            console.error(
                "Erro ao cadastrar curso:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao cadastrar curso"
                });
        }
    }
);


// =========================================================
// ALTERAR CAMPUS DE UM CURSO
// =========================================================

router.patch(
    "/:id/campus",

    exigirPermissao(
        "GERENCIAR_CURSOS"
    ),

    async (req, res) => {

        try {

            const usuario =
                req.session.usuario;


            const cursoId =
                Number(
                    req.params.id
                );


            if (
                !idValido(
                    cursoId
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Curso inválido"
                    });
            }


            const cursoResultado =
                await pool.query(
                    `
                    SELECT
                        id,
                        universidade_id

                    FROM curso

                    WHERE
                        id = $1

                    LIMIT 1
                    `,
                    [
                        cursoId
                    ]
                );


            if (
                cursoResultado.rows
                    .length ===
                0
            ) {

                return res
                    .status(404)
                    .json({
                        erro:
                            "Curso não encontrado"
                    });
            }


            const curso =
                cursoResultado.rows[0];


            if (
                usuario.perfil !==
                    "super_admin" &&
                Number(
                    usuario.universidade_id
                ) !==
                Number(
                    curso.universidade_id
                )
            ) {

                return res
                    .status(403)
                    .json({
                        erro:
                            "Você só pode alterar cursos da sua instituição"
                    });
            }


            let campusId =
                null;


            if (
                req.body.campus_id !==
                    undefined &&
                req.body.campus_id !==
                    null &&
                req.body.campus_id !==
                    ""
            ) {

                campusId =
                    Number(
                        req.body
                            .campus_id
                    );


                if (
                    !idValido(
                        campusId
                    )
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Campus inválido"
                        });
                }


                const campus =
                    await pool.query(
                        `
                        SELECT id

                        FROM campus

                        WHERE
                            id = $1

                            AND universidade_id = $2

                            AND ativo = TRUE

                        LIMIT 1
                        `,
                        [
                            campusId,
                            curso.universidade_id
                        ]
                    );


                if (
                    campus.rows.length ===
                    0
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "O campus informado não pertence à instituição"
                        });
                }
            }


            const resultado =
                await pool.query(
                    `
                    UPDATE curso

                    SET
                        campus_id = $1

                    WHERE
                        id = $2

                    RETURNING
                        id,
                        universidade_id,
                        campus_id,
                        nome,
                        modalidade
                    `,
                    [
                        campusId,
                        cursoId
                    ]
                );


            res.json({

                mensagem:
                    "Campus do curso atualizado com sucesso",

                curso:
                    resultado.rows[0]
            });


        } catch (erro) {

            console.error(
                "Erro ao alterar campus do curso:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao alterar campus do curso"
                });
        }
    }
);


module.exports =
    router;