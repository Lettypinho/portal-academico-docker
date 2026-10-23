const express = require("express");
const bcrypt = require("bcryptjs");

const pool = require("../config/database");
const { exigirLogin } = require("../middleware/auth");

const router = express.Router();


// =========================================================
// CONSULTAR PERFIL LOGADO
// =========================================================

router.get(
    "/",
    exigirLogin,
    async (req, res) => {

        try {

            const usuarioId =
                req.session.usuario.id;


            const resultado =
                await pool.query(
                    `
                    SELECT
                        u.id,
                        u.nome,
                        u.email,
                        u.perfil,
                        u.universidade_id,

                        uni.codigo
                            AS universidade_codigo,

                        uni.nome
                            AS universidade,

                        uni.sigla
                            AS universidade_sigla,

                        uni.cidade
                            AS universidade_cidade,

                        uni.estado
                            AS universidade_estado

                    FROM usuario u

                    LEFT JOIN universidade uni
                        ON uni.id =
                            u.universidade_id

                    WHERE
                        u.id = $1

                    LIMIT 1
                    `,
                    [
                        usuarioId
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


            res.json(
                resultado.rows[0]
            );


        } catch (erro) {

            console.error(
                "Erro ao carregar perfil:",
                erro
            );


            res.status(500).json({
                erro:
                    "Erro ao carregar perfil"
            });
        }
    }
);


// =========================================================
// ATUALIZAR NOME E E-MAIL
// =========================================================

router.put(
    "/dados",
    exigirLogin,
    async (req, res) => {

        try {

            let {
                nome,
                email
            } = req.body;


            if (
                !nome ||
                !email
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe nome e e-mail"
                    });
            }


            nome =
                String(nome)
                    .trim();


            email =
                String(email)
                    .trim()
                    .toLowerCase();


            if (
                nome.length <
                3
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe um nome válido"
                    });
            }


            if (
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                    email
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe um e-mail válido"
                    });
            }


            const usuarioId =
                req.session.usuario.id;


            const existente =
                await pool.query(
                    `
                    SELECT id

                    FROM usuario

                    WHERE
                        LOWER(email) =
                            LOWER($1)

                        AND id <> $2

                    LIMIT 1
                    `,
                    [
                        email,
                        usuarioId
                    ]
                );


            if (
                existente.rows.length >
                0
            ) {

                return res
                    .status(409)
                    .json({
                        erro:
                            "Este e-mail já está cadastrado em outra conta"
                    });
            }


            const resultado =
                await pool.query(
                    `
                    UPDATE usuario

                    SET
                        nome = $1,
                        email = $2

                    WHERE id = $3

                    RETURNING
                        id,
                        nome,
                        email,
                        perfil,
                        universidade_id
                    `,
                    [
                        nome,
                        email,
                        usuarioId
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


            req.session.usuario.nome =
                resultado.rows[0].nome;


            req.session.usuario.email =
                resultado.rows[0].email;


            res.json({

                mensagem:
                    "Perfil atualizado com sucesso",

                usuario: {
                    ...req.session.usuario
                }
            });


        } catch (erro) {

            console.error(
                "Erro ao atualizar perfil:",
                erro
            );


            if (
                erro.code ===
                "23505"
            ) {

                return res
                    .status(409)
                    .json({
                        erro:
                            "Este e-mail já está cadastrado"
                    });
            }


            res.status(500).json({
                erro:
                    "Erro ao atualizar perfil"
            });
        }
    }
);


// =========================================================
// ALTERAR SENHA
// =========================================================

router.put(
    "/senha",
    exigirLogin,
    async (req, res) => {

        try {

            const {
                senha_atual,
                nova_senha,
                confirmar_nova_senha
            } = req.body;


            if (
                !senha_atual ||
                !nova_senha ||
                !confirmar_nova_senha
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Preencha todos os campos de senha"
                    });
            }


            if (
                nova_senha.length <
                6
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "A nova senha deve possuir pelo menos 6 caracteres"
                    });
            }


            if (
                nova_senha.length >
                72
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "A nova senha deve possuir no máximo 72 caracteres"
                    });
            }


            if (
                nova_senha !==
                confirmar_nova_senha
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "A confirmação da nova senha não confere"
                    });
            }


            const usuarioId =
                req.session.usuario.id;


            const resultado =
                await pool.query(
                    `
                    SELECT
                        senha_hash

                    FROM usuario

                    WHERE id = $1

                    LIMIT 1
                    `,
                    [
                        usuarioId
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


            const senhaAtualCorreta =
                await bcrypt.compare(
                    senha_atual,
                    resultado.rows[0]
                        .senha_hash
                );


            if (
                !senhaAtualCorreta
            ) {

                return res
                    .status(401)
                    .json({
                        erro:
                            "A senha atual está incorreta"
                    });
            }


            const mesmaSenha =
                await bcrypt.compare(
                    nova_senha,
                    resultado.rows[0]
                        .senha_hash
                );


            if (mesmaSenha) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "A nova senha deve ser diferente da senha atual"
                    });
            }


            const novoHash =
                await bcrypt.hash(
                    nova_senha,
                    10
                );


            await pool.query(
                `
                UPDATE usuario

                SET senha_hash = $1

                WHERE id = $2
                `,
                [
                    novoHash,
                    usuarioId
                ]
            );


            res.json({
                mensagem:
                    "Senha alterada com sucesso"
            });


        } catch (erro) {

            console.error(
                "Erro ao alterar senha:",
                erro
            );


            res.status(500).json({
                erro:
                    "Erro ao alterar senha"
            });
        }
    }
);


module.exports = router;