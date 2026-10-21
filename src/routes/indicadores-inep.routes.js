const express = require("express");
const pool = require("../config/database");

const router = express.Router();


// =========================================================
// AUXILIARES
// =========================================================

function limiteSeguro(valor, padrao = 100, maximo = 500) {
    const numero = Number.parseInt(valor, 10);

    if (!Number.isInteger(numero) || numero <= 0) {
        return padrao;
    }

    return Math.min(numero, maximo);
}


function offsetSeguro(valor) {
    const numero = Number.parseInt(valor, 10);

    if (!Number.isInteger(numero) || numero < 0) {
        return 0;
    }

    return numero;
}


// =========================================================
// RESUMO DA BASE OFICIAL
// =========================================================

router.get(
    "/resumo",
    async (req, res) => {
        try {
            const [ies, cursos] =
                await Promise.all([
                    pool.query(`
                        SELECT
                            COUNT(*)::INT AS registros,
                            COUNT(DISTINCT universidade_id)::INT
                                AS instituicoes,
                            MIN(ano)::INT AS ano_inicial,
                            MAX(ano)::INT AS ano_final

                        FROM indicador_ies_inep
                    `),

                    pool.query(`
                        SELECT
                            COUNT(*)::INT AS registros,
                            COUNT(DISTINCT curso_id)::INT
                                AS cursos,
                            MIN(ano)::INT AS ano_inicial,
                            MAX(ano)::INT AS ano_final

                        FROM indicador_curso_inep
                    `)
                ]);

            res.json({
                fonte: "Inep",
                instituicoes: ies.rows[0],
                cursos: cursos.rows[0]
            });

        } catch (erro) {
            console.error(
                "Erro ao carregar resumo Inep:",
                erro
            );

            res.status(500).json({
                erro:
                    "Erro ao carregar os indicadores oficiais do Inep"
            });
        }
    }
);


// =========================================================
// LISTAR INSTITUIÇÕES COM INDICADORES
// =========================================================

router.get(
    "/instituicoes",
    async (req, res) => {
        try {
            const {
                busca,
                estado,
                ano,
                organizacao,
                categoria,
                igc_faixa
            } = req.query;

            const limite =
                limiteSeguro(
                    req.query.limite
                );

            const offset =
                offsetSeguro(
                    req.query.offset
                );


            const parametros = [];
            const filtros = [];


            if (busca) {
                parametros.push(
                    `%${busca.trim()}%`
                );

                filtros.push(`
                    (
                        q.instituicao ILIKE $${parametros.length}
                        OR q.sigla ILIKE $${parametros.length}
                        OR q.codigo_ies ILIKE $${parametros.length}
                        OR q.cidade ILIKE $${parametros.length}
                    )
                `);
            }


            if (estado) {
                parametros.push(
                    estado.trim().toUpperCase()
                );

                filtros.push(
                    `q.estado = $${parametros.length}`
                );
            }


            if (ano) {
                parametros.push(
                    Number(ano)
                );

                filtros.push(
                    `q.ano = $${parametros.length}`
                );
            }


            if (organizacao) {
                parametros.push(
                    `%${organizacao.trim()}%`
                );

                filtros.push(
                    `q.organizacao_academica ILIKE $${parametros.length}`
                );
            }


            if (categoria) {
                parametros.push(
                    `%${categoria.trim()}%`
                );

                filtros.push(
                    `q.categoria_administrativa ILIKE $${parametros.length}`
                );
            }


            if (igc_faixa) {
                parametros.push(
                    Number(igc_faixa)
                );

                filtros.push(
                    `q.igc_faixa = $${parametros.length}`
                );
            }


            const where =
                filtros.length > 0
                    ? `WHERE ${filtros.join(" AND ")}`
                    : "";


            const parametrosContagem =
                [...parametros];


            const resultadoTotal =
                await pool.query(
                    `
                    SELECT
                        COUNT(*)::INT AS total

                    FROM vw_qualidade_ies_inep q

                    ${where}
                    `,
                    parametrosContagem
                );


            parametros.push(
                limite
            );

            const indiceLimite =
                parametros.length;


            parametros.push(
                offset
            );

            const indiceOffset =
                parametros.length;


            const resultado =
                await pool.query(
                    `
                    SELECT
                        q.universidade_id,
                        q.codigo_ies,
                        q.instituicao,
                        q.sigla,
                        q.cidade,
                        q.estado,
                        q.organizacao_academica,
                        q.categoria_administrativa,

                        q.ano,

                        q.cursos_com_cpc_trienio,
                        q.conceito_medio_graduacao,

                        q.igc_continuo,
                        q.igc_faixa,

                        q.origem_dados

                    FROM vw_qualidade_ies_inep q

                    ${where}

                    ORDER BY
                        q.igc_faixa DESC NULLS LAST,
                        q.igc_continuo DESC NULLS LAST,
                        q.instituicao

                    LIMIT $${indiceLimite}
                    OFFSET $${indiceOffset}
                    `,
                    parametros
                );


            res.json({
                dados:
                    resultado.rows,

                total:
                    resultadoTotal.rows[0].total,

                limite,

                offset
            });

        } catch (erro) {
            console.error(
                "Erro ao listar indicadores das IES:",
                erro
            );

            res.status(500).json({
                erro:
                    "Erro ao consultar instituições no Inep"
            });
        }
    }
);


// =========================================================
// DETALHE DE UMA INSTITUIÇÃO
// =========================================================

router.get(
    "/instituicoes/:id",
    async (req, res) => {
        try {
            const universidadeId =
                Number.parseInt(
                    req.params.id,
                    10
                );


            if (
                !Number.isInteger(
                    universidadeId
                )
            ) {
                return res.status(400).json({
                    erro:
                        "Identificador da instituição inválido"
                });
            }


            const instituicao =
                await pool.query(
                    `
                    SELECT
                        q.*

                    FROM vw_qualidade_ies_inep q

                    WHERE
                        q.universidade_id = $1

                    ORDER BY
                        q.ano DESC
                    `,
                    [universidadeId]
                );


            if (
                instituicao.rows.length === 0
            ) {
                return res.status(404).json({
                    erro:
                        "Indicadores oficiais da instituição não encontrados"
                });
            }


            const cursos =
                await pool.query(
                    `
                    SELECT
                        q.curso_id,
                        q.codigo_inep,
                        q.curso,
                        q.grau_academico,
                        q.modalidade,

                        q.ano,

                        q.area_avaliacao,

                        q.conceito_enade_continuo,
                        q.conceito_enade_faixa,

                        q.idd_continuo,
                        q.idd_faixa,

                        q.cpc_continuo,
                        q.cpc_faixa

                    FROM vw_qualidade_curso_inep q

                    WHERE
                        q.universidade_id = $1

                    ORDER BY
                        q.ano DESC,
                        q.cpc_faixa DESC NULLS LAST,
                        q.curso

                    LIMIT 500
                    `,
                    [universidadeId]
                );


            res.json({
                instituicao:
                    instituicao.rows,

                cursos:
                    cursos.rows
            });

        } catch (erro) {
            console.error(
                "Erro ao carregar instituição Inep:",
                erro
            );

            res.status(500).json({
                erro:
                    "Erro ao carregar os indicadores da instituição"
            });
        }
    }
);


// =========================================================
// OPÇÕES DE CURSOS PARA COMPARAÇÃO
// =========================================================

router.get(
    "/cursos/opcoes",
    async (req, res) => {
        try {
            const busca =
                String(
                    req.query.busca || ""
                ).trim();


            const parametros = [];
            let where = "";


            if (busca) {
                parametros.push(
                    `%${busca}%`
                );

                where = `
                    WHERE
                        curso ILIKE $1
                        OR area_avaliacao ILIKE $1
                `;
            }


            const resultado =
                await pool.query(
                    `
                    SELECT DISTINCT
                        curso,
                        grau_academico

                    FROM vw_qualidade_curso_inep

                    ${where}

                    ORDER BY
                        curso,
                        grau_academico

                    LIMIT 500
                    `,
                    parametros
                );


            res.json(
                resultado.rows
            );

        } catch (erro) {
            console.error(
                "Erro ao listar opções de curso:",
                erro
            );

            res.status(500).json({
                erro:
                    "Erro ao carregar os cursos avaliados pelo Inep"
            });
        }
    }
);


// =========================================================
// LISTAR INDICADORES DE CURSOS
// =========================================================

router.get(
    "/cursos",
    async (req, res) => {
        try {
            const {
                busca,
                universidade_id,
                ano,
                modalidade,
                grau,
                cpc_faixa
            } = req.query;


            const limite =
                limiteSeguro(
                    req.query.limite
                );


            const offset =
                offsetSeguro(
                    req.query.offset
                );


            const parametros = [];
            const filtros = [];


            if (busca) {
                parametros.push(
                    `%${busca.trim()}%`
                );

                filtros.push(`
                    (
                        q.curso ILIKE $${parametros.length}
                        OR q.instituicao ILIKE $${parametros.length}
                        OR q.sigla ILIKE $${parametros.length}
                        OR q.area_avaliacao ILIKE $${parametros.length}
                    )
                `);
            }


            if (universidade_id) {
                parametros.push(
                    Number(
                        universidade_id
                    )
                );

                filtros.push(
                    `q.universidade_id = $${parametros.length}`
                );
            }


            if (ano) {
                parametros.push(
                    Number(ano)
                );

                filtros.push(
                    `q.ano = $${parametros.length}`
                );
            }


            if (modalidade) {
                parametros.push(
                    `%${modalidade.trim()}%`
                );

                filtros.push(
                    `q.modalidade ILIKE $${parametros.length}`
                );
            }


            if (grau) {
                parametros.push(
                    `%${grau.trim()}%`
                );

                filtros.push(
                    `q.grau_academico ILIKE $${parametros.length}`
                );
            }


            if (cpc_faixa) {
                parametros.push(
                    Number(
                        cpc_faixa
                    )
                );

                filtros.push(
                    `q.cpc_faixa = $${parametros.length}`
                );
            }


            const where =
                filtros.length > 0
                    ? `WHERE ${filtros.join(" AND ")}`
                    : "";


            const parametrosContagem =
                [...parametros];


            const total =
                await pool.query(
                    `
                    SELECT
                        COUNT(*)::INT AS total

                    FROM vw_qualidade_curso_inep q

                    ${where}
                    `,
                    parametrosContagem
                );


            parametros.push(
                limite
            );

            const indiceLimite =
                parametros.length;


            parametros.push(
                offset
            );

            const indiceOffset =
                parametros.length;


            const resultado =
                await pool.query(
                    `
                    SELECT
                        q.*

                    FROM vw_qualidade_curso_inep q

                    ${where}

                    ORDER BY
                        q.cpc_faixa DESC NULLS LAST,
                        q.cpc_continuo DESC NULLS LAST,
                        q.curso,
                        q.instituicao

                    LIMIT $${indiceLimite}
                    OFFSET $${indiceOffset}
                    `,
                    parametros
                );


            res.json({
                dados:
                    resultado.rows,

                total:
                    total.rows[0].total,

                limite,

                offset
            });

        } catch (erro) {
            console.error(
                "Erro ao listar cursos Inep:",
                erro
            );

            res.status(500).json({
                erro:
                    "Erro ao consultar indicadores de cursos"
            });
        }
    }
);


// =========================================================
// DETALHE DE UM CURSO
// =========================================================

router.get(
    "/cursos/:id",
    async (req, res) => {
        try {
            const cursoId =
                Number.parseInt(
                    req.params.id,
                    10
                );


            if (
                !Number.isInteger(
                    cursoId
                )
            ) {
                return res.status(400).json({
                    erro:
                        "Identificador do curso inválido"
                });
            }


            const resultado =
                await pool.query(
                    `
                    SELECT
                        q.*,

                        i.igc_continuo,
                        i.igc_faixa

                    FROM vw_qualidade_curso_inep q

                    LEFT JOIN indicador_ies_inep i
                        ON i.universidade_id =
                            q.universidade_id

                        AND i.ano =
                            q.ano

                    WHERE
                        q.curso_id = $1

                    ORDER BY
                        q.ano DESC
                    `,
                    [cursoId]
                );


            if (
                resultado.rows.length === 0
            ) {
                return res.status(404).json({
                    erro:
                        "Indicadores oficiais do curso não encontrados"
                });
            }


            res.json(
                resultado.rows
            );

        } catch (erro) {
            console.error(
                "Erro ao carregar curso Inep:",
                erro
            );

            res.status(500).json({
                erro:
                    "Erro ao carregar os indicadores do curso"
            });
        }
    }
);


// =========================================================
// COMPARAÇÃO PÚBLICA OFICIAL
// =========================================================

router.get(
    "/comparacao",
    async (req, res) => {
        try {
            const {
                curso,
                ano,
                modalidade,
                grau
            } = req.query;


            if (
                !curso ||
                !curso.trim()
            ) {
                return res.status(400).json({
                    erro:
                        "Informe o curso que deseja comparar"
                });
            }


            const parametros = [
                curso.trim()
            ];


            const filtros = [
                `LOWER(q.curso) = LOWER($1)`
            ];


            if (ano) {
                parametros.push(
                    Number(ano)
                );

                filtros.push(
                    `q.ano = $${parametros.length}`
                );
            }


            if (modalidade) {
                parametros.push(
                    `%${modalidade.trim()}%`
                );

                filtros.push(
                    `q.modalidade ILIKE $${parametros.length}`
                );
            }


            if (grau) {
                parametros.push(
                    `%${grau.trim()}%`
                );

                filtros.push(
                    `q.grau_academico ILIKE $${parametros.length}`
                );
            }


            const resultado =
                await pool.query(
                    `
                    SELECT
                        q.universidade_id,
                        q.codigo_ies,
                        q.instituicao,
                        q.sigla,

                        u.estado,
                        u.organizacao_academica,
                        u.categoria_administrativa,

                        q.curso_id,
                        q.codigo_inep,
                        q.curso,
                        q.grau_academico,
                        q.modalidade,

                        q.ano,

                        q.concluintes_inscritos,
                        q.concluintes_participantes,

                        q.conceito_enade_continuo,
                        q.conceito_enade_faixa,

                        q.idd_continuo,
                        q.idd_faixa,

                        q.cpc_continuo,
                        q.cpc_faixa,

                        igc.igc_continuo,
                        igc.igc_faixa,

                        'INEP' AS fonte

                    FROM vw_qualidade_curso_inep q

                    JOIN universidade u
                        ON u.id =
                            q.universidade_id

                    LEFT JOIN indicador_ies_inep igc
                        ON igc.universidade_id =
                            q.universidade_id

                        AND igc.ano =
                            q.ano

                    WHERE
                        ${filtros.join(" AND ")}

                    ORDER BY
                        q.cpc_faixa DESC NULLS LAST,
                        q.cpc_continuo DESC NULLS LAST,
                        q.conceito_enade_faixa DESC NULLS LAST,
                        igc.igc_faixa DESC NULLS LAST,
                        q.instituicao
                    `,
                    parametros
                );


            res.json(
                resultado.rows
            );

        } catch (erro) {
            console.error(
                "Erro na comparação oficial Inep:",
                erro
            );

            res.status(500).json({
                erro:
                    "Erro ao comparar os indicadores oficiais dos cursos"
            });
        }
    }
);


module.exports = router;