const bcrypt = require("bcryptjs");

const pool = require("./src/config/database");

async function criarSuperAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const senha = process.env.ADMIN_PASSWORD;

    if (!email || !senha) {
        console.error(
            "Defina ADMIN_EMAIL e ADMIN_PASSWORD."
        );

        process.exit(1);
    }

    try {
        const emailNormalizado = email
            .trim()
            .toLowerCase();

        const existente = await pool.query(
            `
            SELECT id
            FROM usuario
            WHERE LOWER(email) = LOWER($1)
            `,
            [emailNormalizado]
        );

        if (existente.rows.length > 0) {
            console.log(
                "O super administrador já está cadastrado."
            );

            return;
        }

        const senhaHash = await bcrypt.hash(
            senha,
            10
        );

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
                    'super_admin'
                )
            `,
            [
                "Administrador SIA",
                emailNormalizado,
                senhaHash
            ]
        );

        console.log(
            "Super administrador criado com sucesso."
        );

    } catch (erro) {
        console.error(
            "Erro ao criar super administrador:",
            erro
        );

        process.exitCode = 1;

    } finally {
        await pool.end();
    }
}

criarSuperAdmin();