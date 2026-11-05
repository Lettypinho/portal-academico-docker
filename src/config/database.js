const { Pool } = require("pg");

const configuracao = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL
    }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    };

const pool = new Pool(configuracao);

pool.on("error", (erro) => {
    console.error(
        "Erro inesperado no PostgreSQL:",
        erro
    );
});

module.exports = pool;