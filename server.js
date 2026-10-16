const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Permite entregar os arquivos do front-end
app.use(express.static(path.join(__dirname, "public")));

// API para buscar alunos
app.get("/api/alunos", async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                aluno.id,
                aluno.nome,
                aluno.email,
                aluno.data_nascimento,
                curso.nome AS curso
            FROM aluno
            LEFT JOIN curso
                ON aluno.curso_id = curso.id
            ORDER BY aluno.id
        `);

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao consultar alunos"
        });
    }
});

// API para buscar cursos
app.get("/api/cursos", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM curso ORDER BY id"
        );

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao consultar cursos"
        });
    }
});

app.listen(3000, "0.0.0.0", () => {
    console.log("Servidor rodando na porta 3000");
});
