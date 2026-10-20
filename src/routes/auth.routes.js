const express = require("express");
const bcrypt = require("bcryptjs");

const pool = require("../config/database");
const { exigirLogin } = require("../middleware/auth");

const router = express.Router();


// =========================================================
// CADASTRO
// =========================================================

router.post("/cadastro", async (req, res) => {
    try {
        let {
            nome,
            email,
            senha,
            universidade_id
        } = req.body;

        if (!nome || !email || !senha || !universidade_id) {
            return res.status(400).json({
                erro: "Preencha todos os campos obrigatórios"
            });
        }

        nome = nome.trim();
        email = email.trim().toLowerCase();

        if (senha.length < 6) {
            return res.status(400).json({
                erro: "A senha deve possuir pelo menos 6 caracteres"
            });
        }

        // Verifica se a universidade existe e está ativa
        const universidade = await pool.query(
            `
            SELECT id
            FROM universidade
            WHERE id = $1
              AND ativo = TRUE
            `,
            [universidade_id]
        );

        if (universidade.rows.length === 0) {
            return res.status(400).json({
                erro: "Universidade inválida"
            });
        }

        // Verifica se o e-mail já existe
        const usuarioExistente = await pool.query(
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

        const senhaHash = await bcrypt.hash(senha, 10);

        const resultado = await pool.query(
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
                ($1, $2, $3, $4, 'consulta')
            RETURNING
                id,
                universidade_id,
                nome,
                email,
                perfil,
                ativo,
                criado_em
            `,
            [
                universidade_id,
                nome,
                email,
                senhaHash
            ]
        );

        res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso",
            usuario: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        if (erro.code === "23505") {
            return res.status(409).json({
                erro: "E-mail já cadastrado"
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
        let { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                erro: "Informe e-mail e senha"
            });
        }

        email = email.trim().toLowerCase();

        const resultado = await pool.query(
            `
            SELECT
                u.id,
                u.universidade_id,
                u.nome,
                u.email,
                u.senha_hash,
                u.perfil,
                u.ativo,
                uni.nome AS universidade,
                uni.sigla AS universidade_sigla
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

        const usuario = resultado.rows[0];

        if (!usuario.ativo) {
            return res.status(403).json({
                erro: "Usuário desativado"
            });
        }

        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha_hash
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                erro: "E-mail ou senha inválidos"
            });
        }

        req.session.usuario = {
            id: usuario.id,
            universidade_id: usuario.universidade_id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil,
            universidade: usuario.universidade,
            universidade_sigla: usuario.universidade_sigla
        };

        res.json({
            mensagem: "Login realizado com sucesso",
            usuario: req.session.usuario
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro interno no login"
        });
    }
});


// =========================================================
// USUÁRIO LOGADO
// =========================================================

router.get("/me", exigirLogin, (req, res) => {
    res.json(req.session.usuario);
});


// =========================================================
// LOGOUT
// =========================================================

router.post("/logout", exigirLogin, (req, res) => {
    req.session.destroy((erro) => {
        if (erro) {
            return res.status(500).json({
                erro: "Erro ao encerrar sessão"
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            mensagem: "Logout realizado com sucesso"
        });
    });
});


module.exports = router;