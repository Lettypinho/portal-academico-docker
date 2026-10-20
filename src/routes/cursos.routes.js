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

router.get("/", async (req, res) => {
    try {
        const {
            universidade_id,
            nome
        } = req.query;

        const parametros = [];
        const filtros = [
            "c.status = 'Ativo'",
            "u.ativo = TRUE"
        ];

        if (universidade_id) {
            parametros.push(universidade_id);

            filtros.push(
                `c.universidade_id = $${parametros.length}`
            );
        }

        if (nome) {
            parametros.push(`%${nome}%`);

            filtros.push(
                `c.nome ILIKE $${parametros.length}`
            );
        }

        const resultado = await pool.query(
            `
            SELECT
                c.id,
                c.nome,
                c.modalidade,
                c.duracao_semestres,
                c.status,

                u.id AS universidade_id,
                u.codigo AS universidade_codigo,
                u.nome AS universidade,
                u.sigla AS universidade_sigla,
                u.cidade,
                u.estado

            FROM curso c

            JOIN universidade u
                ON u.id = c.universidade_id

            WHERE ${filtros.join(" AND ")}

            ORDER BY
                c.nome,
                u.nome
            `,
            parametros
        );

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao consultar cursos"
        });
    }
});


// =========================================================
// CURSOS DA UNIVERSIDADE DO USUÁRIO
// =========================================================

router.get(
    "/minha-universidade",
    exigirLogin,
    async (req, res) => {

        try {
            const usuario = req.session.usuario;

            if (!usuario.universidade_id) {
                return res.status(400).json({
                    erro:
                        "O usuário não está vinculado a uma universidade"
                });
            }

            const resultado = await pool.query(
                `
                SELECT
                    id,
                    nome,
                    modalidade,
                    duracao_semestres,
                    status
                FROM curso
                WHERE universidade_id = $1
                ORDER BY nome
                `,
                [usuario.universidade_id]
            );

            res.json(resultado.rows);

        } catch (erro) {
            console.error(erro);

            res.status(500).json({
                erro: "Erro ao consultar cursos"
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
            const usuario = req.session.usuario;

            let {
                universidade_id,
                nome,
                modalidade,
                duracao_semestres
            } = req.body;

            if (
                !nome ||
                !modalidade ||
                !duracao_semestres
            ) {
                return res.status(400).json({
                    erro:
                        "Preencha os campos obrigatórios"
                });
            }

            // Admin de universidade não pode escolher
            // outra instituição.
            if (
                usuario.perfil ===
                "admin_universidade"
            ) {
                universidade_id =
                    usuario.universidade_id;
            }

            // Super admin precisa informar a instituição.
            if (
                usuario.perfil === "super_admin" &&
                !universidade_id
            ) {
                return res.status(400).json({
                    erro:
                        "Informe a universidade"
                });
            }

            const universidade =
                await pool.query(
                    `
                    SELECT id
                    FROM universidade
                    WHERE id = $1
                      AND ativo = TRUE
                    `,
                    [universidade_id]
                );

            if (
                universidade.rows.length === 0
            ) {
                return res.status(400).json({
                    erro:
                        "Universidade inválida"
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
                            duracao_semestres
                        )
                    VALUES
                        ($1, $2, $3, $4)

                    RETURNING *
                    `,
                    [
                        universidade_id,
                        nome.trim(),
                        modalidade,
                        duracao_semestres
                    ]
                );

            res.status(201).json(
                resultado.rows[0]
            );

        } catch (erro) {

            if (erro.code === "23505") {
                return res.status(409).json({
                    erro:
                        "Este curso já está cadastrado nesta universidade"
                });
            }

            if (erro.code === "23514") {
                return res.status(400).json({
                    erro:
                        "Dados do curso inválidos"
                });
            }

            console.error(erro);

            res.status(500).json({
                erro:
                    "Erro ao cadastrar curso"
            });
        }
    }
);


module.exports = router;