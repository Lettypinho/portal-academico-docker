const express =
    require("express");

const pool =
    require("../config/database");

const {
    exigirPerfil
} =
    require("../middleware/auth");


const router =
    express.Router();


// =========================================================
// COMPARAÇÃO PÚBLICA ENTRE CURSOS
// =========================================================

router.get(
    "/comparacao/cursos",
    async (req, res) => {

        try {

            const {
                curso,
                ano,
                semestre,
                modalidade
            } =
                req.query;


            if (!curso) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe o curso que deseja comparar"
                    });
            }


            const parametros = [
                `%${curso}%`
            ];


            const filtros = [
                "curso ILIKE $1"
            ];


            if (ano) {

                parametros.push(
                    ano
                );


                filtros.push(
                    `ano = $${parametros.length}`
                );
            }


            if (semestre) {

                parametros.push(
                    semestre
                );


                filtros.push(
                    `semestre = $${parametros.length}`
                );
            }


            if (modalidade) {

                parametros.push(
                    modalidade
                );


                filtros.push(
                    `modalidade = $${parametros.length}`
                );
            }


            const resultado =
                await pool.query(
                    `
                    SELECT
                        universidade_id,
                        universidade_codigo,
                        universidade,
                        sigla,

                        curso_id,
                        curso,
                        modalidade,

                        ano,
                        semestre,

                        alunos_avaliados,
                        media_geral,
                        taxa_aprovacao,
                        taxa_reprovacao,
                        frequencia_media

                    FROM vw_comparacao_publica_cursos

                    WHERE
                        ${filtros.join(" AND ")}

                    ORDER BY
                        media_geral DESC NULLS LAST,
                        universidade
                    `,
                    parametros
                );


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro ao comparar cursos:",
                erro
            );


            res.status(500).json({
                erro:
                    "Erro ao comparar cursos"
            });
        }
    }
);


// =========================================================
// DASHBOARD DA UNIVERSIDADE LOGADA
//
// Somente usuários institucionais.
// Aluno NÃO possui acesso aos indicadores privados.
// =========================================================

router.get(
    "/dashboard",

    exigirPerfil(
        "consulta_institucional",
        "gestor",
        "admin_universidade",
        "super_admin"
    ),

    async (req, res) => {

        try {

            const usuario =
                req.session.usuario;


            let universidadeId =
                usuario.universidade_id;


            // =================================================
            // SUPER ADMIN
            // =================================================

            if (
                usuario.perfil ===
                "super_admin"
            ) {

                universidadeId =
                    req.query
                        .universidade_id;


                if (!universidadeId) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Informe a universidade que deseja visualizar"
                        });
                }
            }


            const {
                ano,
                semestre
            } =
                req.query;


            // =================================================
            // RESUMO
            // =================================================

            const resumo =
                await pool.query(
                    `
                    SELECT *

                    FROM vw_dashboard_universidade

                    WHERE
                        universidade_id = $1
                    `,
                    [
                        universidadeId
                    ]
                );


            if (
                resumo.rows.length ===
                0
            ) {

                return res
                    .status(404)
                    .json({
                        erro:
                            "Universidade não encontrada"
                    });
            }


            // =================================================
            // SITUAÇÃO ATUAL DOS ALUNOS
            // =================================================

            const situacao =
                await pool.query(
                    `
                    SELECT *

                    FROM vw_situacao_alunos_universidade

                    WHERE
                        universidade_id = $1
                    `,
                    [
                        universidadeId
                    ]
                );


            // =================================================
            // INDICADORES ACADÊMICOS DO PERÍODO
            // =================================================

            const parametros = [
                universidadeId
            ];


            const filtros = [
                "universidade_id = $1"
            ];


            if (ano) {

                parametros.push(
                    ano
                );


                filtros.push(
                    `ano = $${parametros.length}`
                );
            }


            if (semestre) {

                parametros.push(
                    semestre
                );


                filtros.push(
                    `semestre = $${parametros.length}`
                );
            }


            const indicadores =
                await pool.query(
                    `
                    SELECT *

                    FROM vw_indicadores_universidade_periodo

                    WHERE
                        ${filtros.join(" AND ")}

                    ORDER BY
                        ano DESC,
                        semestre DESC
                    `,
                    parametros
                );


            // =================================================
            // INDICADORES POR CURSO
            //
            // Todos os períodos são retornados porque o frontend
            // utiliza esses registros para descobrir os períodos
            // disponíveis no seletor global.
            // =================================================

            const cursos =
                await pool.query(
                    `
                    SELECT *

                    FROM vw_indicadores_curso_periodo

                    WHERE
                        universidade_id = $1

                    ORDER BY
                        ano DESC,
                        semestre DESC,
                        curso
                    `,
                    [
                        universidadeId
                    ]
                );


            res.json({

                universidade:
                    resumo.rows[0],

                situacao_alunos:
                    situacao.rows[0] ||
                    null,

                indicadores:
                    indicadores.rows,

                cursos:
                    cursos.rows
            });


        } catch (erro) {

            console.error(
                "Erro ao carregar dashboard:",
                erro
            );


            res.status(500).json({
                erro:
                    "Erro ao carregar dashboard"
            });
        }
    }
);


// =========================================================
// INDICADORES DE DISCIPLINAS
//
// Dados privados da instituição.
// Alunos não possuem acesso.
// =========================================================

router.get(
    "/disciplinas",

    exigirPerfil(
        "consulta_institucional",
        "gestor",
        "admin_universidade",
        "super_admin"
    ),

    async (req, res) => {

        try {

            const usuario =
                req.session.usuario;


            let universidadeId =
                usuario.universidade_id;


            // =================================================
            // SUPER ADMIN
            // =================================================

            if (
                usuario.perfil ===
                "super_admin"
            ) {

                universidadeId =
                    req.query
                        .universidade_id;


                if (!universidadeId) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Informe a universidade"
                        });
                }
            }


            const resultado =
                await pool.query(
                    `
                    SELECT
                        universidade,
                        curso,
                        disciplina,
                        ano,
                        semestre,
                        total_resultados,
                        media,
                        frequencia_media,
                        aprovados,
                        reprovados,
                        taxa_aprovacao,
                        taxa_reprovacao

                    FROM vw_indicadores_disciplina

                    WHERE
                        universidade_id = $1

                    ORDER BY
                        ano DESC,
                        semestre DESC,
                        taxa_reprovacao DESC NULLS LAST,
                        disciplina
                    `,
                    [
                        universidadeId
                    ]
                );


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro ao consultar indicadores das disciplinas:",
                erro
            );


            res.status(500).json({
                erro:
                    "Erro ao consultar indicadores das disciplinas"
            });
        }
    }
);


module.exports =
    router;