const express = require("express");
const bcrypt = require("bcryptjs");

const pool = require("../config/database");
const { exigirLogin } = require("../middleware/auth");

const router = express.Router();


// =========================================================
// CADASTRO DE USUÁRIO PÚBLICO
// =========================================================

router.post("/cadastro", async (req, res) => {
    try {

        let {
            nome,
            email,
            senha
        } = req.body;


        // =================================================
        // VALIDAÇÕES
        // =================================================

        if (!nome || !email || !senha) {
            return res.status(400).json({
                erro: "Preencha todos os campos obrigatórios"
            });
        }


        nome = nome.trim();
        email = email.trim().toLowerCase();


        if (nome.length < 3) {
            return res.status(400).json({
                erro: "Informe um nome válido"
            });
        }


        if (senha.length < 6) {
            return res.status(400).json({
                erro: "A senha deve possuir pelo menos 6 caracteres"
            });
        }


        // =================================================
        // VERIFICAR E-MAIL EXISTENTE
        // =================================================

        const usuarioExistente =
            await pool.query(
                `
                SELECT id
                FROM usuario
                WHERE LOWER(email) = LOWER($1)
                `,
                [email]
            );


        if (usuarioExistente.rows.length > 0) {
            return res.status(409).json({
                erro: "E-mail já cadastrado"
            });
        }


        // =================================================
        // HASH DA SENHA
        // =================================================

        const senhaHash =
            await bcrypt.hash(
                senha,
                10
            );


        // =================================================
        // CADASTRO
        // =================================================
        //
        // Usuário criado pelo cadastro público:
        //
        // universidade_id = NULL
        // perfil = publico
        //
        // =================================================

        const resultado =
            await pool.query(
                `
                INSERT INTO usuario
                    (
                        universidade_id,
                        nome,
                        email,
                        senha_hash,
                        perfil
                    )
                VALUES
                    (
                        NULL,
                        $1,
                        $2,
                        $3,
                        'publico'
                    )

                RETURNING
                    id,
                    nome,
                    email,
                    perfil,
                    ativo,
                    criado_em
                `,
                [
                    nome,
                    email,
                    senhaHash
                ]
            );


        res.status(201).json({
            mensagem:
                "Usuário cadastrado com sucesso",

            usuario:
                resultado.rows[0]
        });


    } catch (erro) {

        console.error(
            "Erro no cadastro:",
            erro
        );


        if (erro.code === "23505") {
            return res.status(409).json({
                erro: "E-mail já cadastrado"
            });
        }


        if (erro.code === "23514") {
            return res.status(400).json({
                erro: "Dados de cadastro inválidos"
            });
        }


        res.status(500).json({
            erro: "Erro ao cadastrar usuário"
        });
    }
});


// =========================================================
// LOGIN
// =========================================================

router.post("/login", async (req, res) => {
    try {

        let {
            email,
            senha
        } = req.body;


        // =================================================
        // VALIDAÇÃO
        // =================================================

        if (!email || !senha) {
            return res.status(400).json({
                erro: "Informe e-mail e senha"
            });
        }


        email =
            email.trim().toLowerCase();


        // =================================================
        // BUSCAR USUÁRIO
        // =================================================

        const resultado =
            await pool.query(
                `
                SELECT
                    u.id,
                    u.universidade_id,
                    u.nome,
                    u.email,
                    u.senha_hash,
                    u.perfil,
                    u.ativo,

                    uni.nome
                        AS universidade,

                    uni.sigla
                        AS universidade_sigla,

                    uni.ativo
                        AS universidade_ativa

                FROM usuario u

                LEFT JOIN universidade uni
                    ON uni.id = u.universidade_id

                WHERE LOWER(u.email) = LOWER($1)
                `,
                [email]
            );


        if (resultado.rows.length === 0) {
            return res.status(401).json({
                erro: "E-mail ou senha inválidos"
            });
        }


        const usuario =
            resultado.rows[0];


        // =================================================
        // USUÁRIO DESATIVADO
        // =================================================

        if (!usuario.ativo) {
            return res.status(403).json({
                erro: "Usuário desativado"
            });
        }


        // =================================================
        // UNIVERSIDADE DESATIVADA
        // =================================================
        //
        // Usuário público e super_admin não possuem
        // universidade_id.
        //
        // Usuários institucionais precisam pertencer a uma
        // instituição ativa.
        //
        // =================================================

        if (
            usuario.universidade_id &&
            usuario.universidade_ativa === false
        ) {
            return res.status(403).json({
                erro:
                    "A universidade vinculada a este usuário está desativada"
            });
        }


        // =================================================
        // VERIFICAR SENHA
        // =================================================

        const senhaCorreta =
            await bcrypt.compare(
                senha,
                usuario.senha_hash
            );


        if (!senhaCorreta) {
            return res.status(401).json({
                erro: "E-mail ou senha inválidos"
            });
        }


        // =================================================
        // CRIAR SESSÃO
        // =================================================

        req.session.usuario = {

            id:
                usuario.id,

            universidade_id:
                usuario.universidade_id,

            nome:
                usuario.nome,

            email:
                usuario.email,

            perfil:
                usuario.perfil,

            universidade:
                usuario.universidade,

            universidade_sigla:
                usuario.universidade_sigla
        };


        res.json({

            mensagem:
                "Login realizado com sucesso",

            usuario:
                req.session.usuario
        });


    } catch (erro) {

        console.error(
            "Erro no login:",
            erro
        );


        res.status(500).json({
            erro: "Erro interno no login"
        });
    }
});


// =========================================================
// USUÁRIO LOGADO
// =========================================================

router.get(
    "/me",
    exigirLogin,
    (req, res) => {

        res.json(
            req.session.usuario
        );
    }
);


// =========================================================
// LOGOUT
// =========================================================

router.post(
    "/logout",
    exigirLogin,
    (req, res) => {

        req.session.destroy(
            (erro) => {

                if (erro) {

                    console.error(
                        "Erro ao encerrar sessão:",
                        erro
                    );

                    return res.status(500).json({
                        erro:
                            "Erro ao encerrar sessão"
                    });
                }


                res.clearCookie(
                    "connect.sid"
                );


                res.json({
                    mensagem:
                        "Logout realizado com sucesso"
                });
            }
        );
    }
);


module.exports = router;