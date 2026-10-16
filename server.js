const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const path = require("path");

const app = express();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET || "segredo-laboratorio",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60
        }
    })
);

app.use(
    express.static(path.join(__dirname, "public"), {
        index: false
    })
);

function exigirLogin(req, res, next) {
    if (!req.session.usuario) {
        return res.status(401).json({
            erro: "Usuário não autenticado"
        });
    }

    next();
}

/* LOGIN */

app.post("/api/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        const resultado = await pool.query(
            `
            SELECT
                id,
                nome,
                email,
                senha_hash,
                perfil,
                ativo
            FROM usuarios
            WHERE email = $1
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
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil
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

/* USUÁRIO LOGADO */

app.get("/api/me", exigirLogin, (req, res) => {
    res.json(req.session.usuario);
});

/* LOGOUT */

app.post("/api/logout", exigirLogin, (req, res) => {
    req.session.destroy(() => {
        res.json({
            mensagem: "Logout realizado"
        });
    });
});

/* CURSOS */

app.get("/api/cursos", exigirLogin, async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT id, nome
            FROM curso
            ORDER BY nome
        `);

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao consultar cursos"
        });
    }
});

/* ALUNOS */

app.get("/api/alunos", exigirLogin, async (req, res) => {
    try {
        const busca = req.query.busca || "";

        const resultado = await pool.query(
            `
            SELECT
                aluno.id,
                aluno.nome,
                aluno.email,
                aluno.data_nascimento,
                aluno.curso_id,
                curso.nome AS curso
            FROM aluno
            LEFT JOIN curso
                ON curso.id = aluno.curso_id
            WHERE
                aluno.nome ILIKE $1
                OR aluno.email ILIKE $1
                OR curso.nome ILIKE $1
            ORDER BY aluno.nome
            `,
            [`%${busca}%`]
        );

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao consultar alunos"
        });
    }
});

/* ADICIONAR ALUNO */

app.post("/api/alunos", exigirLogin, async (req, res) => {
    try {
        const {
            nome,
            email,
            data_nascimento,
            curso_id
        } = req.body;

        const resultado = await pool.query(
            `
            INSERT INTO aluno
                (nome, email, data_nascimento, curso_id)
            VALUES
                ($1, $2, $3, $4)
            RETURNING *
            `,
            [
                nome,
                email,
                data_nascimento,
                curso_id || null
            ]
        );

        res.status(201).json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao cadastrar aluno"
        });
    }
});

/* EDITAR ALUNO */

app.put("/api/alunos/:id", exigirLogin, async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nome,
            email,
            data_nascimento,
            curso_id
        } = req.body;

        const resultado = await pool.query(
            `
            UPDATE aluno
            SET
                nome = $1,
                email = $2,
                data_nascimento = $3,
                curso_id = $4
            WHERE id = $5
            RETURNING *
            `,
            [
                nome,
                email,
                data_nascimento,
                curso_id || null,
                id
            ]
        );

        res.json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao editar aluno"
        });
    }
});

/* EXCLUIR ALUNO */

app.delete("/api/alunos/:id", exigirLogin, async (req, res) => {
    try {
        await pool.query(
            "DELETE FROM aluno WHERE id = $1",
            [req.params.id]
        );

        res.json({
            mensagem: "Aluno excluído"
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao excluir aluno"
        });
    }
});

app.get("/", (req, res) => {
    res.redirect("/login.html");
});

app.listen(3000, "0.0.0.0", () => {
    console.log("Servidor rodando na porta 3000");
});