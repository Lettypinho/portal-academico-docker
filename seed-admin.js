const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

async function criarAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const senha = process.env.ADMIN_PASSWORD;

    if (!email || !senha) {
        console.error("Defina ADMIN_EMAIL e ADMIN_PASSWORD.");
        process.exit(1);
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        await pool.query(
            `
            INSERT INTO usuarios
                (nome, email, senha_hash, perfil)
            VALUES
                ($1, $2, $3, $4)
            ON CONFLICT (email) DO NOTHING
            `,
            [
                "Administrador",
                email,
                senhaHash,
                "admin"
            ]
        );

        console.log("Administrador criado com sucesso.");

    } catch (erro) {
        console.error("Erro:", erro);

    } finally {
        await pool.end();
    }
}

criarAdmin();