const express = require("express");
const pool = require("../config/database");
const { exigirPerfil } = require("../middleware/auth");

const router = express.Router();


// =========================================================
// LISTAR INSTITUIÇÕES
// Público
//
// A tabela continua se chamando "universidade"
// por compatibilidade com a estrutura atual do SIA.
// =========================================================

router.get("/", async (req, res) => {

    try {

        const resultado =
            await pool.query(`
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

                WHERE ativo = TRUE

                ORDER BY nome
            `);


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
});


// =========================================================
// CADASTRAR INSTITUIÇÃO
// Somente super administrador
// =========================================================

router.post(
    "/",
    exigirPerfil("super_admin"),
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

                return res.status(400).json({
                    erro:
                        "Preencha os campos obrigatórios"
                });
            }


            const estadoNormalizado =
                String(estado)
                    .trim()
                    .toUpperCase();


            if (
                estadoNormalizado.length !== 2
            ) {

                return res.status(400).json({
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
                        String(codigo).trim(),
                        String(nome).trim(),

                        sigla
                            ? String(sigla).trim()
                            : null,

                        String(cidade).trim(),

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


            res.status(201).json(
                resultado.rows[0]
            );


        } catch (erro) {

            if (
                erro.code === "23505"
            ) {

                return res.status(409).json({
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