const express = require("express");
const pool = require("../config/database");
const { exigirPerfil } = require("../middleware/auth");

const router = express.Router();


// =========================================================
// LISTAR UNIVERSIDADES
// Público
// =========================================================

router.get("/", async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                id,
                codigo,
                nome,
                sigla,
                cidade,
                estado
            FROM universidade
            WHERE ativo = TRUE
            ORDER BY nome
        `);

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao consultar universidades"
        });
    }
});


// =========================================================
// CADASTRAR UNIVERSIDADE
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
                estado
            } = req.body;

            if (!codigo || !nome || !cidade || !estado) {
                return res.status(400).json({
                    erro: "Preencha os campos obrigatórios"
                });
            }

            const resultado = await pool.query(
                `
                INSERT INTO universidade
                    (
                        codigo,
                        nome,
                        sigla,
                        cidade,
                        estado
                    )
                VALUES
                    ($1, $2, $3, $4, $5)
                RETURNING *
                `,
                [
                    codigo,
                    nome,
                    sigla || null,
                    cidade,
                    estado.toUpperCase()
                ]
            );

            res.status(201).json(resultado.rows[0]);

        } catch (erro) {

            if (erro.code === "23505") {
                return res.status(409).json({
                    erro: "Código da universidade já cadastrado"
                });
            }

            console.error(erro);

            res.status(500).json({
                erro: "Erro ao cadastrar universidade"
            });
        }
    }
);

module.exports = router;