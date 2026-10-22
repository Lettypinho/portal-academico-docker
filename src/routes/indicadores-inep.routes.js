const express = require("express");
const pool = require("../config/database");

const router = express.Router();


// =========================================================
// AUXILIARES
// =========================================================

function limiteSeguro(valor, padrao = 100, maximo = 500) {

    const numero =
        Number.parseInt(
            valor,
            10
        );

    if (
        !Number.isInteger(numero) ||
        numero <= 0
    ) {
        return padrao;
    }

    return Math.min(
        numero,
        maximo
    );
}


function offsetSeguro(valor) {

    const numero =
        Number.parseInt(
            valor,
            10
        );

    if (
        !Number.isInteger(numero) ||
        numero < 0
    ) {
        return 0;
    }

    return numero;
}


function inteiroSeguro(valor) {

    const numero =
        Number.parseInt(
            valor,
            10
        );

    return Number.isInteger(numero)
        ? numero
        : null;
}


// =========================================================
// RESUMO DAS BASES OFICIAIS
// =========================================================

router.get(
    "/resumo",
    async (req, res) => {

        try {

            const [
                ies,
                cursos,
                trajetoria
            ] =
                await Promise.all([

                    pool.query(`
                        SELECT
                            COUNT(*)::INT
                                AS registros,

                            COUNT(
                                DISTINCT universidade_id
                            )::INT
                                AS instituicoes,

                            MIN(ano)::INT
                                AS ano_inicial,

                            MAX(ano)::INT
                                AS ano_final

                        FROM indicador_ies_inep
                    `),


                    pool.query(`
                        SELECT
                            COUNT(*)::INT
                                AS registros,

                            COUNT(
                                DISTINCT curso_id
                            )::INT
                                AS cursos,

                            MIN(ano)::INT
                                AS ano_inicial,

                            MAX(ano)::INT
                                AS ano_final

                        FROM indicador_curso_inep
                    `),


                    pool.query(`
                        SELECT
                            COUNT(*)::INT
                                AS registros,

                            COUNT(
                                DISTINCT curso_id
                            )::INT
                                AS cursos,

                            MIN(ano_ingresso)::INT
                                AS coorte_inicial,

                            MAX(ano_ingresso)::INT
                                AS coorte_final,

                            MIN(ano_referencia)::INT
                                AS ano_inicial,

                            MAX(ano_referencia)::INT
                                AS ano_final

                        FROM indicador_trajetoria_curso_inep
                    `)
                ]);


            res.json({

                fonte:
                    "Inep",

                instituicoes:
                    ies.rows[0],

                cursos:
                    cursos.rows[0],

                trajetoria:
                    trajetoria.rows[0]
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
// FILTROS - ESTADOS
// =========================================================

router.get(
    "/filtros/estados",
    async (req, res) => {

        try {

            const resultado =
                await pool.query(`
                    SELECT DISTINCT
                        u.estado

                    FROM universidade u

                    JOIN curso c
                        ON c.universidade_id =
                            u.id

                    JOIN indicador_trajetoria_curso_inep t
                        ON t.curso_id =
                            c.id

                    WHERE
                        u.ativo = TRUE

                        AND u.origem_dados =
                            'INEP'

                    ORDER BY
                        u.estado
                `);


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro ao listar estados:",
                erro
            );


            res.status(500).json({
                erro:
                    "Erro ao carregar estados"
            });
        }
    }
);


// =========================================================
// FILTROS - CIDADES
// =========================================================

router.get(
    "/filtros/cidades",
    async (req, res) => {

        try {

            const estado =
                String(
                    req.query.estado || ""
                )
                    .trim()
                    .toUpperCase();


            const parametros = [];
            const filtros = [
                "u.ativo = TRUE",
                "u.origem_dados = 'INEP'"
            ];


            if (estado) {

                parametros.push(
                    estado
                );

                filtros.push(
                    `u.estado = $${parametros.length}`
                );
            }


            const resultado =
                await pool.query(
                    `
                    SELECT DISTINCT
                        u.cidade,
                        u.estado

                    FROM universidade u

                    JOIN curso c
                        ON c.universidade_id =
                            u.id

                    JOIN indicador_trajetoria_curso_inep t
                        ON t.curso_id =
                            c.id

                    WHERE
                        ${filtros.join(" AND ")}

                    ORDER BY
                        u.estado,
                        u.cidade
                    `,
                    parametros
                );


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro ao listar cidades:",
                erro
            );


            res.status(500).json({
                erro:
                    "Erro ao carregar cidades"
            });
        }
    }
);


// =========================================================
// FILTROS - INSTITUIÇÕES
// =========================================================

router.get(
    "/filtros/instituicoes",
    async (req, res) => {

        try {

            const estado =
                String(
                    req.query.estado || ""
                )
                    .trim()
                    .toUpperCase();


            const cidade =
                String(
                    req.query.cidade || ""
                )
                    .trim();


            const busca =
                String(
                    req.query.busca || ""
                )
                    .trim();


            const parametros = [];

            const filtros = [
                "u.ativo = TRUE",
                "u.origem_dados = 'INEP'"
            ];


            if (estado) {

                parametros.push(
                    estado
                );

                filtros.push(
                    `u.estado = $${parametros.length}`
                );
            }


            if (cidade) {

                parametros.push(
                    cidade
                );

                filtros.push(
                    `LOWER(u.cidade) =
                     LOWER($${parametros.length})`
                );
            }


            if (busca) {

                parametros.push(
                    `%${busca}%`
                );

                filtros.push(`
                    (
                        u.nome ILIKE $${parametros.length}
                        OR
                        COALESCE(
                            u.sigla,
                            ''
                        ) ILIKE $${parametros.length}
                    )
                `);
            }


            const resultado =
                await pool.query(
                    `
                    SELECT DISTINCT
                        u.id,
                        u.codigo,
                        u.nome,
                        u.sigla,
                        u.cidade,
                        u.estado

                    FROM universidade u

                    JOIN curso c
                        ON c.universidade_id =
                            u.id

                    JOIN indicador_trajetoria_curso_inep t
                        ON t.curso_id =
                            c.id

                    WHERE
                        ${filtros.join(" AND ")}

                    ORDER BY
                        u.nome

                    LIMIT 500
                    `,
                    parametros
                );


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro ao listar instituições:",
                erro
            );


            res.status(500).json({
                erro:
                    "Erro ao carregar instituições"
            });
        }
    }
);


// =========================================================
// INSTITUIÇÕES COM INDICADORES DE QUALIDADE
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
            } =
                req.query;


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
                        OR
                        q.sigla ILIKE $${parametros.length}
                        OR
                        q.codigo_ies ILIKE $${parametros.length}
                        OR
                        q.cidade ILIKE $${parametros.length}
                    )
                `);
            }


            if (estado) {

                parametros.push(
                    estado
                        .trim()
                        .toUpperCase()
                );

                filtros.push(
                    `q.estado = $${parametros.length}`
                );
            }


            if (ano) {

                const anoNumero =
                    inteiroSeguro(
                        ano
                    );


                if (anoNumero !== null) {

                    parametros.push(
                        anoNumero
                    );

                    filtros.push(
                        `q.ano = $${parametros.length}`
                    );
                }
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

                const faixa =
                    inteiroSeguro(
                        igc_faixa
                    );


                if (faixa !== null) {

                    parametros.push(
                        faixa
                    );

                    filtros.push(
                        `q.igc_faixa = $${parametros.length}`
                    );
                }
            }


            const where =
                filtros.length
                    ? `WHERE ${filtros.join(" AND ")}`
                    : "";


            const total =
                await pool.query(
                    `
                    SELECT
                        COUNT(*)::INT
                            AS total

                    FROM vw_qualidade_ies_inep q

                    ${where}
                    `,
                    parametros
                );


            const parametrosDados =
                [...parametros];


            parametrosDados.push(
                limite
            );

            const indiceLimite =
                parametrosDados.length;


            parametrosDados.push(
                offset
            );

            const indiceOffset =
                parametrosDados.length;


            const resultado =
                await pool.query(
                    `
                    SELECT
                        q.*

                    FROM vw_qualidade_ies_inep q

                    ${where}

                    ORDER BY
                        q.igc_faixa
                            DESC NULLS LAST,

                        q.igc_continuo
                            DESC NULLS LAST,

                        q.instituicao

                    LIMIT
                        $${indiceLimite}

                    OFFSET
                        $${indiceOffset}
                    `,
                    parametrosDados
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
// OPÇÕES DE CURSO PARA COMPARAÇÃO
// Busca dinâmica - elimina o antigo limite visual de 500.
// =========================================================

router.get(
    "/cursos/opcoes",
    async (req, res) => {

        try {

            const busca =
                String(
                    req.query.busca || ""
                )
                    .trim();


            if (
                busca.length < 2
            ) {

                return res.json([]);
            }


            const estado =
                String(
                    req.query.estado || ""
                )
                    .trim()
                    .toUpperCase();


            const cidade =
                String(
                    req.query.cidade || ""
                )
                    .trim();


            const modalidade =
                String(
                    req.query.modalidade || ""
                )
                    .trim();


            const grau =
                String(
                    req.query.grau || ""
                )
                    .trim();


            const universidadeId =
                inteiroSeguro(
                    req.query.universidade_id
                );


            const parametros = [
                `%${busca}%`
            ];


            const filtros = [
                "c.origem_dados = 'INEP'",
                `
                (
                    c.nome ILIKE $1
                    OR
                    c.codigo_inep ILIKE $1
                )
                `
            ];


            if (estado) {

                parametros.push(
                    estado
                );

                filtros.push(
                    `u.estado = $${parametros.length}`
                );
            }


            if (cidade) {

                parametros.push(
                    cidade
                );

                filtros.push(
                    `LOWER(u.cidade) =
                     LOWER($${parametros.length})`
                );
            }


            if (
                universidadeId !== null
            ) {

                parametros.push(
                    universidadeId
                );

                filtros.push(
                    `u.id = $${parametros.length}`
                );
            }


            if (modalidade) {

                parametros.push(
                    modalidade
                );

                filtros.push(
                    `c.modalidade = $${parametros.length}`
                );
            }


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
                    SELECT DISTINCT
                        c.nome
                            AS curso,

                        c.grau_academico

                    FROM curso c

                    JOIN universidade u
                        ON u.id =
                            c.universidade_id

                    JOIN indicador_trajetoria_curso_inep t
                        ON t.curso_id =
                            c.id

                    WHERE
                        ${filtros.join(" AND ")}

                    ORDER BY
                        c.nome,
                        c.grau_academico

                    LIMIT 100
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
                    "Erro ao carregar cursos para comparação"
            });
        }
    }
);


// =========================================================
// LISTAR INDICADORES DE QUALIDADE DOS CURSOS
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
            } =
                req.query;


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
                        OR
                        q.instituicao ILIKE $${parametros.length}
                        OR
                        q.sigla ILIKE $${parametros.length}
                        OR
                        q.area_avaliacao ILIKE $${parametros.length}
                    )
                `);
            }


            const universidadeId =
                inteiroSeguro(
                    universidade_id
                );


            if (
                universidadeId !== null
            ) {

                parametros.push(
                    universidadeId
                );

                filtros.push(
                    `q.universidade_id = $${parametros.length}`
                );
            }


            const anoNumero =
                inteiroSeguro(
                    ano
                );


            if (
                anoNumero !== null
            ) {

                parametros.push(
                    anoNumero
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


            const cpcFaixa =
                inteiroSeguro(
                    cpc_faixa
                );


            if (
                cpcFaixa !== null
            ) {

                parametros.push(
                    cpcFaixa
                );

                filtros.push(
                    `q.cpc_faixa = $${parametros.length}`
                );
            }


            const where =
                filtros.length
                    ? `WHERE ${filtros.join(" AND ")}`
                    : "";


            const total =
                await pool.query(
                    `
                    SELECT
                        COUNT(*)::INT
                            AS total

                    FROM vw_qualidade_curso_inep q

                    ${where}
                    `,
                    parametros
                );


            const parametrosDados =
                [...parametros];


            parametrosDados.push(
                limite
            );

            const indiceLimite =
                parametrosDados.length;


            parametrosDados.push(
                offset
            );

            const indiceOffset =
                parametrosDados.length;


            const resultado =
                await pool.query(
                    `
                    SELECT
                        q.*

                    FROM vw_qualidade_curso_inep q

                    ${where}

                    ORDER BY
                        q.cpc_faixa
                            DESC NULLS LAST,

                        q.cpc_continuo
                            DESC NULLS LAST,

                        q.curso,

                        q.instituicao

                    LIMIT
                        $${indiceLimite}

                    OFFSET
                        $${indiceOffset}
                    `,
                    parametrosDados
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
// DETALHE DE INSTITUIÇÃO
// =========================================================

router.get(
    "/instituicoes/:id",
    async (req, res) => {

        try {

            const universidadeId =
                inteiroSeguro(
                    req.params.id
                );


            if (
                universidadeId === null
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
                        q.universidade_id =
                            $1

                    ORDER BY
                        q.ano DESC
                    `,
                    [
                        universidadeId
                    ]
                );


            if (
                instituicao.rows.length ===
                0
            ) {

                return res.status(404).json({
                    erro:
                        "Indicadores da instituição não encontrados"
                });
            }


            const cursos =
                await pool.query(
                    `
                    SELECT
                        q.*

                    FROM vw_qualidade_curso_inep q

                    WHERE
                        q.universidade_id =
                            $1

                    ORDER BY
                        q.ano DESC,
                        q.cpc_faixa DESC NULLS LAST,
                        q.curso

                    LIMIT 500
                    `,
                    [
                        universidadeId
                    ]
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
                    "Erro ao carregar a instituição"
            });
        }
    }
);


// =========================================================
// DETALHE DE CURSO
// =========================================================

router.get(
    "/cursos/:id",
    async (req, res) => {

        try {

            const cursoId =
                inteiroSeguro(
                    req.params.id
                );


            if (
                cursoId === null
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
                        q.curso_id =
                            $1

                    ORDER BY
                        q.ano DESC
                    `,
                    [
                        cursoId
                    ]
                );


            if (
                resultado.rows.length ===
                0
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
                    "Erro ao carregar indicadores do curso"
            });
        }
    }
);


// =========================================================
// COMPARAÇÃO PÚBLICA
//
// Indicadores principais:
// - conclusão acumulada
// - desistência acumulada
// - permanência
// - participação no Enade
//
// Complementares:
// - CPC
// - Enade
// - IDD
// - IGC
//
// Trajetória:
// coorte 2015, último ano disponível.
//
// Qualidade:
// último ano disponível para cada curso.
// =========================================================

router.get(
    "/comparacao",
    async (req, res) => {

        try {

            const curso =
                String(
                    req.query.curso || ""
                )
                    .trim();


            if (!curso) {

                return res.status(400).json({
                    erro:
                        "Informe o curso que deseja comparar"
                });
            }


            const estado =
                String(
                    req.query.estado || ""
                )
                    .trim()
                    .toUpperCase();


            const cidade =
                String(
                    req.query.cidade || ""
                )
                    .trim();


            const modalidade =
                String(
                    req.query.modalidade || ""
                )
                    .trim();


            const grau =
                String(
                    req.query.grau || ""
                )
                    .trim();


            const universidadeId =
                inteiroSeguro(
                    req.query.universidade_id
                );


            const parametros = [
                curso
            ];


            const filtros = [
                "LOWER(c.nome) = LOWER($1)",
                "c.origem_dados = 'INEP'"
            ];


            if (estado) {

                parametros.push(
                    estado
                );

                filtros.push(
                    `u.estado = $${parametros.length}`
                );
            }


            if (cidade) {

                parametros.push(
                    cidade
                );

                filtros.push(
                    `LOWER(u.cidade) =
                     LOWER($${parametros.length})`
                );
            }


            if (
                universidadeId !== null
            ) {

                parametros.push(
                    universidadeId
                );

                filtros.push(
                    `u.id = $${parametros.length}`
                );
            }


            if (modalidade) {

                parametros.push(
                    modalidade
                );

                filtros.push(
                    `c.modalidade =
                     $${parametros.length}`
                );
            }


            if (grau) {

                parametros.push(
                    grau
                );

                filtros.push(
                    `c.grau_academico =
                     $${parametros.length}`
                );
            }


            const resultado =
                await pool.query(
                    `
                    SELECT

                        u.id
                            AS universidade_id,

                        u.codigo
                            AS codigo_ies,

                        u.nome
                            AS instituicao,

                        u.sigla,

                        u.cidade,

                        u.estado,

                        u.organizacao_academica,

                        u.categoria_administrativa,


                        c.id
                            AS curso_id,

                        c.codigo_inep,

                        c.nome
                            AS curso,

                        c.grau_academico,

                        c.modalidade,


                        traj.ano_ingresso,

                        traj.ano_referencia
                            AS ano_trajetoria,

                        traj.ingressantes,

                        traj.permanencia_quantidade,

                        traj.concluintes_quantidade,

                        traj.desistentes_quantidade,

                        traj.taxa_permanencia,

                        traj.taxa_conclusao_acumulada,

                        traj.taxa_desistencia_acumulada,

                        traj.taxa_conclusao_anual,

                        traj.taxa_desistencia_anual,


                        qual.ano
                            AS ano_qualidade,

                        qual.concluintes_inscritos,

                        qual.concluintes_participantes,


                        CASE

                            WHEN
                                qual.concluintes_inscritos
                                    IS NULL

                                OR
                                qual.concluintes_inscritos = 0

                            THEN NULL

                            ELSE

                                ROUND(
                                    (
                                        qual.concluintes_participantes::NUMERIC
                                        /
                                        qual.concluintes_inscritos
                                    )
                                    * 100,
                                    2
                                )

                        END
                            AS taxa_participacao_enade,


                        qual.conceito_enade_continuo,

                        qual.conceito_enade_faixa,

                        qual.idd_continuo,

                        qual.idd_faixa,

                        qual.cpc_continuo,

                        qual.cpc_faixa,


                        igc.igc_continuo,

                        igc.igc_faixa,


                        'INEP'
                            AS fonte


                    FROM curso c


                    JOIN universidade u

                        ON u.id =
                            c.universidade_id


                    JOIN LATERAL
                    (
                        SELECT
                            t.*

                        FROM indicador_trajetoria_curso_inep t

                        WHERE
                            t.curso_id =
                                c.id

                            AND
                            t.ano_ingresso =
                                2015

                        ORDER BY
                            t.ano_referencia
                                DESC

                        LIMIT 1

                    ) traj
                        ON TRUE


                    LEFT JOIN LATERAL
                    (
                        SELECT
                            q.*

                        FROM indicador_curso_inep q

                        WHERE
                            q.curso_id =
                                c.id

                        ORDER BY
                            q.ano
                                DESC

                        LIMIT 1

                    ) qual
                        ON TRUE


                    LEFT JOIN indicador_ies_inep igc

                        ON igc.universidade_id =
                            u.id

                        AND igc.ano =
                            qual.ano


                    WHERE
                        ${filtros.join(" AND ")}


                    ORDER BY

                        traj.taxa_conclusao_acumulada
                            DESC NULLS LAST,

                        traj.taxa_desistencia_acumulada
                            ASC NULLS LAST,

                        qual.cpc_continuo
                            DESC NULLS LAST,

                        u.nome,

                        c.codigo_inep
                    `,
                    parametros
                );


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro na comparação pública Inep:",
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