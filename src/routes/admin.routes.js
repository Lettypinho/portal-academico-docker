const express =
    require("express");

const pool =
    require(
        "../config/database"
    );

const {
    exigirPerfil
} =
    require(
        "../middleware/auth"
    );


const router =
    express.Router();


// =========================================================
// TODAS AS ROTAS EXIGEM SUPER ADMIN
// =========================================================

router.use(
    exigirPerfil(
        "super_admin"
    )
);


// =========================================================
// RESUMO
// =========================================================

router.get(
    "/resumo",
    async (req, res) => {

        try {

            const resumo =
                await pool.query(`
                    SELECT

                        (
                            SELECT COUNT(*)
                            FROM universidade
                        )
                            AS total_universidades,

                        (
                            SELECT COUNT(*)
                            FROM universidade
                            WHERE ativo = TRUE
                        )
                            AS universidades_ativas,

                        (
                            SELECT COUNT(*)
                            FROM usuario
                        )
                            AS total_usuarios,

                        (
                            SELECT COUNT(*)

                            FROM usuario

                            WHERE perfil IN (
                                'consulta_institucional',
                                'gestor',
                                'admin_universidade'
                            )
                        )
                            AS usuarios_institucionais,

                        (
                            SELECT COUNT(*)
                            FROM curso
                        )
                            AS total_cursos,

                        (
                            SELECT COUNT(*)
                            FROM aluno
                        )
                            AS total_alunos
                `);


            const universidadesRecentes =
                await pool.query(`
                    SELECT

                        id,

                        codigo,

                        nome,

                        sigla,

                        cidade,

                        estado,

                        organizacao_academica,

                        categoria_administrativa,

                        ativo,

                        criado_em

                    FROM universidade

                    ORDER BY
                        criado_em DESC

                    LIMIT 5
                `);


            const usuariosRecentes =
                await pool.query(`
                    SELECT

                        u.id,

                        u.nome,

                        u.email,

                        u.perfil,

                        u.ativo,

                        u.criado_em,

                        uni.nome
                            AS universidade,

                        uni.sigla
                            AS universidade_sigla

                    FROM usuario u

                    LEFT JOIN universidade uni
                        ON uni.id =
                            u.universidade_id

                    ORDER BY
                        u.criado_em DESC

                    LIMIT 5
                `);


            res.json({

                resumo:
                    resumo.rows[0],

                universidades_recentes:
                    universidadesRecentes.rows,

                usuarios_recentes:
                    usuariosRecentes.rows
            });


        } catch (erro) {

            console.error(
                "Erro no resumo administrativo:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao carregar resumo administrativo"
                });
        }
    }
);


// =========================================================
// LISTAR INSTITUIÇÕES
// =========================================================

router.get(
    "/universidades",
    async (req, res) => {

        try {

            const resultado =
                await pool.query(`
                    SELECT

                        u.id,

                        u.codigo,

                        u.nome,

                        u.sigla,

                        u.cidade,

                        u.estado,

                        u.organizacao_academica,

                        u.codigo_organizacao_academica,

                        u.categoria_administrativa,

                        u.codigo_categoria_administrativa,

                        u.ano_censo,

                        u.origem_dados,

                        u.ativo,

                        u.criado_em,

                        COUNT(
                            DISTINCT c.id
                        )
                            AS total_cursos,

                        COUNT(
                            DISTINCT us.id
                        )
                            AS total_usuarios

                    FROM universidade u

                    LEFT JOIN curso c
                        ON c.universidade_id =
                            u.id

                    LEFT JOIN usuario us
                        ON us.universidade_id =
                            u.id

                    GROUP BY

                        u.id,

                        u.codigo,

                        u.nome,

                        u.sigla,

                        u.cidade,

                        u.estado,

                        u.organizacao_academica,

                        u.codigo_organizacao_academica,

                        u.categoria_administrativa,

                        u.codigo_categoria_administrativa,

                        u.ano_censo,

                        u.origem_dados,

                        u.ativo,

                        u.criado_em

                    ORDER BY
                        u.nome
                `);


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro ao listar instituições:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao consultar instituições"
                });
        }
    }
);


// =========================================================
// ATIVAR / DESATIVAR INSTITUIÇÃO
// =========================================================

router.patch(
    "/universidades/:id/status",
    async (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            const {
                ativo
            } =
                req.body;


            if (
                !Number.isInteger(
                    id
                ) ||
                id <= 0
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Instituição inválida"
                    });
            }


            if (
                typeof ativo !==
                "boolean"
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe o status da instituição"
                    });
            }


            const resultado =
                await pool.query(
                    `
                    UPDATE universidade

                    SET
                        ativo = $1

                    WHERE
                        id = $2

                    RETURNING

                        id,

                        codigo,

                        nome,

                        sigla,

                        cidade,

                        estado,

                        organizacao_academica,

                        categoria_administrativa,

                        ativo
                    `,
                    [
                        ativo,
                        id
                    ]
                );


            if (
                resultado.rows.length ===
                0
            ) {

                return res
                    .status(404)
                    .json({
                        erro:
                            "Instituição não encontrada"
                    });
            }


            res.json(
                resultado.rows[0]
            );


        } catch (erro) {

            console.error(
                "Erro ao atualizar instituição:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao atualizar instituição"
                });
        }
    }
);


// =========================================================
// LISTAR USUÁRIOS
// =========================================================

router.get(
    "/usuarios",
    async (req, res) => {

        try {

            const resultado =
                await pool.query(`
                    SELECT

                        u.id,

                        u.universidade_id,

                        u.nome,

                        u.email,

                        u.perfil,

                        u.ativo,

                        u.criado_em,

                        u.atualizado_em,

                        uni.nome
                            AS universidade,

                        uni.sigla
                            AS universidade_sigla,

                        uni.organizacao_academica

                    FROM usuario u

                    LEFT JOIN universidade uni
                        ON uni.id =
                            u.universidade_id

                    ORDER BY

                        u.criado_em DESC,

                        u.nome
                `);


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro ao listar usuários:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao consultar usuários"
                });
        }
    }
);


// =========================================================
// ALTERAR USUÁRIO
// =========================================================

router.patch(
    "/usuarios/:id",
    async (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            let {
                perfil,
                universidade_id,
                ativo
            } =
                req.body;


            if (
                !Number.isInteger(
                    id
                ) ||
                id <= 0
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Usuário inválido"
                    });
            }


            // =================================================
            // PERFIS
            // =================================================

            const perfisPermitidos = [

                "publico",

                "aluno",

                "consulta_institucional",

                "gestor",

                "admin_universidade",

                "super_admin"
            ];


            if (
                !perfisPermitidos
                    .includes(
                        perfil
                    )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Perfil inválido"
                    });
            }


            if (
                typeof ativo !==
                "boolean"
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Status inválido"
                    });
            }


            // =================================================
            // PROTEGER O PRÓPRIO SUPER ADMIN
            // =================================================

            if (
                Number(
                    req.session
                        .usuario
                        .id
                ) ===
                    id &&
                (
                    perfil !==
                        "super_admin" ||
                    ativo ===
                        false
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Você não pode remover o próprio acesso de super administrador"
                    });
            }


            // =================================================
            // PERFIS QUE EXIGEM INSTITUIÇÃO
            // =================================================

            const perfisComInstituicao = [

                "aluno",

                "consulta_institucional",

                "gestor",

                "admin_universidade"
            ];


            if (
                perfisComInstituicao
                    .includes(
                        perfil
                    )
            ) {

                universidade_id =
                    Number(
                        universidade_id
                    );


                if (
                    !Number.isInteger(
                        universidade_id
                    ) ||
                    universidade_id <=
                        0
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Selecione uma instituição"
                        });
                }


                const instituicao =
                    await pool.query(
                        `
                        SELECT

                            id,

                            ativo

                        FROM universidade

                        WHERE
                            id = $1

                        LIMIT 1
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
                        .status(404)
                        .json({
                            erro:
                                "Instituição não encontrada"
                        });
                }


                if (
                    instituicao
                        .rows[0]
                        .ativo ===
                    false
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Não é possível vincular o usuário a uma instituição inativa"
                        });
                }


            } else {

                universidade_id =
                    null;
            }


            // =================================================
            // ALTERAR
            // =================================================

            const resultado =
                await pool.query(
                    `
                    UPDATE usuario

                    SET

                        perfil = $1,

                        universidade_id = $2,

                        ativo = $3,

                        atualizado_em = NOW()

                    WHERE
                        id = $4

                    RETURNING

                        id,

                        universidade_id,

                        nome,

                        email,

                        perfil,

                        ativo,

                        atualizado_em
                    `,
                    [
                        perfil,
                        universidade_id,
                        ativo,
                        id
                    ]
                );


            if (
                resultado.rows.length ===
                0
            ) {

                return res
                    .status(404)
                    .json({
                        erro:
                            "Usuário não encontrado"
                    });
            }


            res.json({

                mensagem:
                    "Usuário atualizado com sucesso",

                usuario:
                    resultado.rows[0]
            });


        } catch (erro) {

            console.error(
                "Erro ao atualizar usuário:",
                erro
            );


            if (
                erro.code ===
                "23514"
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Perfil e instituição incompatíveis"
                    });
            }


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao atualizar usuário"
                });
        }
    }
);


module.exports =
    router;