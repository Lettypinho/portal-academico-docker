const express = require("express");

const pool = require("../config/database");

const {
    exigirPerfil
} = require("../middleware/auth");


const router = express.Router();


// =========================================================
// LISTAR INSTITUIÇÕES
// Público
// =========================================================

router.get(
    "/",
    async (req, res) => {

        try {

            const resultado =
                await pool.query(
                    `
                    SELECT

                        id,

                        codigo,

                        nome,

                        sigla,

                        cidade,

                        estado,

                        organizacao_academica,

                        codigo_organizacao_academica,

                        categoria_administrativa,

                        codigo_categoria_administrativa,

                        ano_censo,

                        origem_dados

                    FROM universidade

                    WHERE
                        ativo = TRUE

                    ORDER BY
                        nome
                    `
                );


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro ao consultar instituições:",
                erro
            );


            res.status(500).json({
                erro:
                    "Erro ao consultar instituições"
            });
        }
    }
);


// =========================================================
// DETALHE PÚBLICO DA INSTITUIÇÃO
// Busca pelo código Inep exibido no card
// =========================================================

router.get(
    "/codigo/:codigo",
    async (req, res) => {

        try {

            const codigo =
                String(
                    req.params.codigo || ""
                )
                    .trim();


            if (!codigo) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Código da instituição inválido"
                    });
            }


            // =================================================
            // INSTITUIÇÃO
            // =================================================

            const resultadoInstituicao =
                await pool.query(
                    `
                    SELECT

                        id,

                        codigo,

                        nome,

                        sigla,

                        cidade,

                        estado,

                        organizacao_academica,

                        categoria_administrativa,

                        ano_censo,

                        origem_dados

                    FROM universidade

                    WHERE

                        codigo = $1

                        AND ativo = TRUE

                    LIMIT 1
                    `,
                    [
                        codigo
                    ]
                );


            if (
                resultadoInstituicao.rows.length ===
                0
            ) {

                return res
                    .status(404)
                    .json({
                        erro:
                            "Instituição não encontrada"
                    });
            }


            const instituicao =
                resultadoInstituicao.rows[0];


            const universidadeId =
                instituicao.id;


            // =================================================
            // CONTAGEM DE CURSOS
            // =================================================

            const resultadoCursosResumo =
                await pool.query(
                    `
                    SELECT

                        COUNT(*)::INT
                            AS total_cursos,

                        COUNT(*)
                            FILTER (
                                WHERE modalidade = 'Presencial'
                            )::INT
                            AS cursos_presenciais,

                        COUNT(*)
                            FILTER (
                                WHERE modalidade = 'EAD'
                            )::INT
                            AS cursos_ead

                    FROM curso

                    WHERE

                        universidade_id = $1

                        AND status = 'Ativo'
                    `,
                    [
                        universidadeId
                    ]
                );


            // =================================================
            // IGC MAIS RECENTE
            // =================================================

            const resultadoIgc =
                await pool.query(
                    `
                    SELECT

                        ano,

                        cursos_com_cpc_trienio,

                        conceito_medio_graduacao,

                        igc_continuo,

                        igc_faixa

                    FROM indicador_ies_inep

                    WHERE
                        universidade_id = $1

                    ORDER BY
                        ano DESC

                    LIMIT 1
                    `,
                    [
                        universidadeId
                    ]
                );


            // =================================================
            // TRAJETÓRIA DA COORTE 2015
            //
            // Média ponderada pelo número de ingressantes
            // entre os cursos da instituição.
            // =================================================

            const resultadoTrajetoria =
                await pool.query(
                    `
                    WITH ultima_trajetoria AS
                    (
                        SELECT DISTINCT ON
                        (
                            t.curso_id
                        )

                            t.curso_id,

                            t.ano_ingresso,

                            t.ano_referencia,

                            t.ingressantes,

                            t.taxa_permanencia,

                            t.taxa_conclusao_acumulada,

                            t.taxa_desistencia_acumulada

                        FROM indicador_trajetoria_curso_inep t

                        JOIN curso c

                            ON c.id =
                                t.curso_id

                        WHERE

                            c.universidade_id =
                                $1

                            AND t.ano_ingresso =
                                2015

                        ORDER BY

                            t.curso_id,

                            t.ano_referencia DESC
                    )

                    SELECT

                        COUNT(*)::INT
                            AS cursos_com_trajetoria,

                        MAX(
                            ano_referencia
                        )::INT
                            AS ano_referencia,

                        SUM(
                            ingressantes
                        )::INT
                            AS ingressantes,


                        ROUND(
                            SUM(
                                taxa_conclusao_acumulada
                                *
                                ingressantes
                            )
                            /
                            NULLIF(
                                SUM(
                                    ingressantes
                                ),
                                0
                            ),
                            1
                        )
                            AS taxa_conclusao_acumulada,


                        ROUND(
                            SUM(
                                taxa_desistencia_acumulada
                                *
                                ingressantes
                            )
                            /
                            NULLIF(
                                SUM(
                                    ingressantes
                                ),
                                0
                            ),
                            1
                        )
                            AS taxa_desistencia_acumulada,


                        ROUND(
                            SUM(
                                taxa_permanencia
                                *
                                ingressantes
                            )
                            /
                            NULLIF(
                                SUM(
                                    ingressantes
                                ),
                                0
                            ),
                            1
                        )
                            AS taxa_permanencia

                    FROM ultima_trajetoria
                    `,
                    [
                        universidadeId
                    ]
                );


            // =================================================
            // CURSOS
            // =================================================

            const resultadoCursos =
                await pool.query(
                    `
                    SELECT

                        c.id,

                        c.codigo_inep,

                        c.nome,

                        c.grau_academico,

                        c.modalidade,

                        c.carga_horaria,

                        c.ano_censo,


                        qualidade.ano
                            AS ano_qualidade,

                        qualidade.cpc_faixa,

                        qualidade.conceito_enade_faixa,

                        qualidade.idd_faixa


                    FROM curso c


                    LEFT JOIN LATERAL
                    (
                        SELECT

                            q.ano,

                            q.cpc_faixa,

                            q.conceito_enade_faixa,

                            q.idd_faixa

                        FROM indicador_curso_inep q

                        WHERE
                            q.curso_id =
                                c.id

                        ORDER BY
                            q.ano DESC

                        LIMIT 1

                    ) qualidade
                        ON TRUE


                    WHERE

                        c.universidade_id =
                            $1

                        AND c.status =
                            'Ativo'


                    ORDER BY

                        c.nome,

                        c.modalidade


                    LIMIT 100
                    `,
                    [
                        universidadeId
                    ]
                );


            res.json({

                instituicao,

                resumo_cursos:
                    resultadoCursosResumo.rows[0],

                igc:
                    resultadoIgc.rows[0] ||
                    null,

                trajetoria:
                    resultadoTrajetoria.rows[0] ||
                    null,

                cursos:
                    resultadoCursos.rows
            });


        } catch (erro) {

            console.error(
                "Erro ao carregar detalhes da instituição:",
                erro
            );


            res.status(500).json({
                erro:
                    "Erro ao carregar detalhes da instituição"
            });
        }
    }
);


// =========================================================
// CADASTRAR INSTITUIÇÃO
// Somente super administrador
// =========================================================

router.post(
    "/",
    exigirPerfil(
        "super_admin"
    ),
    async (req, res) => {

        try {

            const {
                codigo,
                nome,
                sigla,
                cidade,
                estado,
                organizacao_academica,
                categoria_administrativa
            } = req.body;


            if (
                !codigo ||
                !nome ||
                !cidade ||
                !estado
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Preencha os campos obrigatórios"
                    });
            }


            const estadoNormalizado =
                String(
                    estado
                )
                    .trim()
                    .toUpperCase();


            if (
                estadoNormalizado.length !==
                2
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe uma UF válida"
                    });
            }


            const resultado =
                await pool.query(
                    `
                    INSERT INTO universidade
                    (
                        codigo,

                        nome,

                        sigla,

                        cidade,

                        estado,

                        organizacao_academica,

                        categoria_administrativa,

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

                        $7,

                        'SIA'
                    )

                    RETURNING *
                    `,
                    [
                        String(
                            codigo
                        ).trim(),

                        String(
                            nome
                        ).trim(),

                        sigla

                            ? String(
                                sigla
                            ).trim()

                            : null,

                        String(
                            cidade
                        ).trim(),

                        estadoNormalizado,

                        organizacao_academica

                            ? String(
                                organizacao_academica
                            ).trim()

                            : null,

                        categoria_administrativa

                            ? String(
                                categoria_administrativa
                            ).trim()

                            : null
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
                            "Código da instituição já cadastrado"
                    });
            }


            console.error(
                "Erro ao cadastrar instituição:",
                erro
            );


            res.status(500).json({
                erro:
                    "Erro ao cadastrar instituição"
            });
        }
    }
);


module.exports = router;