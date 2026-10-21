const express = require("express");

const pool = require("../config/database");

const {
    exigirLogin,
    exigirPerfil
} = require("../middleware/auth");


const router = express.Router();


// =========================================================
// LISTAR CURSOS
// Público
// =========================================================

router.get(
    "/",
    async (req, res) => {

        try {

            const {
                universidade_id,
                nome,
                modalidade,
                grau
            } = req.query;


            const parametros = [];


            const filtros = [
                "c.status = 'Ativo'",
                "u.ativo = TRUE"
            ];


            // ---------------------------------------------
            // INSTITUIÇÃO
            // ---------------------------------------------

            if (universidade_id) {

                parametros.push(
                    universidade_id
                );


                filtros.push(
                    `c.universidade_id = $${parametros.length}`
                );
            }


            // ---------------------------------------------
            // NOME DO CURSO
            // ---------------------------------------------

            if (nome) {

                parametros.push(
                    `%${nome}%`
                );


                filtros.push(
                    `c.nome ILIKE $${parametros.length}`
                );
            }


            // ---------------------------------------------
            // MODALIDADE
            // ---------------------------------------------

            if (modalidade) {

                parametros.push(
                    modalidade
                );


                filtros.push(
                    `c.modalidade = $${parametros.length}`
                );
            }


            // ---------------------------------------------
            // GRAU ACADÊMICO
            // ---------------------------------------------

            if (grau) {

                parametros.push(
                    grau
                );


                filtros.push(
                    `c.grau_academico = $${parametros.length}`
                );
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

                        u.categoria_administrativa


                    FROM curso c


                    JOIN universidade u
                        ON u.id =
                            c.universidade_id


                    WHERE
                        ${filtros.join(" AND ")}


                    ORDER BY
                        c.nome,
                        u.nome
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


            res.status(500).json({
                erro:
                    "Erro ao consultar cursos"
            });
        }
    }
);


// =========================================================
// CURSOS DA INSTITUIÇÃO DO USUÁRIO
// =========================================================

router.get(
    "/minha-universidade",
    exigirLogin,
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
                        id,
                        codigo_inep,
                        nome,
                        grau_academico,
                        nivel_academico,
                        modalidade,
                        duracao_semestres,
                        carga_horaria,
                        situacao_inep,
                        status,
                        ano_censo,
                        origem_dados

                    FROM curso

                    WHERE
                        universidade_id = $1

                    ORDER BY
                        nome,
                        modalidade
                    `,
                    [
                        usuario.universidade_id
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


            res.status(500).json({
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
    exigirPerfil(
        "super_admin",
        "admin_universidade"
    ),
    async (req, res) => {

        try {

            const usuario =
                req.session.usuario;


            let {
                universidade_id,
                nome,
                modalidade,
                duracao_semestres,
                grau_academico,
                carga_horaria
            } = req.body;


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


            // Admin institucional não pode escolher
            // outra instituição.

            if (
                usuario.perfil ===
                "admin_universidade"
            ) {

                universidade_id =
                    usuario.universidade_id;
            }


            // Super admin precisa informar instituição.

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


            const instituicao =
                await pool.query(
                    `
                    SELECT
                        id

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
                instituicao.rows.length === 0
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Instituição inválida"
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


            const resultado =
                await pool.query(
                    `
                    INSERT INTO curso
                    (
                        universidade_id,
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
                        'Graduação',
                        $6,
                        'SIA'
                    )

                    RETURNING *
                    `,
                    [
                        universidade_id,

                        String(nome)
                            .trim(),

                        modalidade,

                        duracao_semestres
                            ? Number(
                                duracao_semestres
                            )
                            : null,

                        grau_academico ||
                            null,

                        carga_horaria
                            ? Number(
                                carga_horaria
                            )
                            : null
                    ]
                );


            res.status(201).json(
                resultado.rows[0]
            );


        } catch (erro) {

            if (
                erro.code === "23505"
            ) {

                return res
                    .status(409)
                    .json({
                        erro:
                            "Este curso já está cadastrado nesta instituição"
                    });
            }


            if (
                erro.code === "23514"
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


            res.status(500).json({
                erro:
                    "Erro ao cadastrar curso"
            });
        }
    }
);


module.exports = router;