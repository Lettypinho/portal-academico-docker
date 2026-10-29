const express =
    require("express");

const bcrypt =
    require("bcryptjs");

const pool =
    require("../config/database");

const {
    exigirPerfil
} =
    require("../middleware/auth");


const router =
    express.Router();


// =========================================================
// SOMENTE SUPER ADMIN
// =========================================================

router.use(
    exigirPerfil(
        "super_admin"
    )
);


// =========================================================
// CRIAR NOVO ACESSO
// =========================================================

router.post(
    "/",
    async (req, res) => {

        try {

            let {
                nome,
                email,
                senha,
                perfil,
                universidade_id,
                ativo
            } =
                req.body;


            nome =
                String(
                    nome || ""
                )
                    .trim();


            email =
                String(
                    email || ""
                )
                    .trim()
                    .toLowerCase();


            senha =
                String(
                    senha || ""
                );


            perfil =
                String(
                    perfil || ""
                )
                    .trim();


            // =================================================
            // CAMPOS
            // =================================================

            if (
                !nome ||
                !email ||
                !senha ||
                !perfil
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Preencha todos os campos obrigatórios"
                    });
            }


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
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    .test(
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


            if (
                senha.length <
                6
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "A senha deve possuir pelo menos 6 caracteres"
                    });
            }


            if (
                senha.length >
                72
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "A senha deve possuir no máximo 72 caracteres"
                    });
            }


            // =================================================
            // PERFIS QUE O SUPER ADMIN PODE CRIAR
            // =================================================

            const perfisPermitidos = [

                "publico",

                "aluno",

                "consulta_institucional",

                "gestor",

                "admin_universidade"
            ];


            if (
                !perfisPermitidos.includes(
                    perfil
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Perfil inválido"
                    });
            }


            // =================================================
            // PERFIS QUE EXIGEM INSTITUIÇÃO
            // =================================================

            const perfisVinculados = [

                "aluno",

                "consulta_institucional",

                "gestor",

                "admin_universidade"
            ];


            if (
                perfisVinculados.includes(
                    perfil
                )
            ) {

                universidade_id =
                    Number(
                        universidade_id
                    );


                if (
                    !Number.isInteger(
                        universidade_id
                    ) ||
                    universidade_id <= 0
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Selecione uma instituição"
                        });
                }


                const instituicao =
                    await pool.query(
                        `
                        SELECT
                            id,
                            nome,
                            sigla,
                            ativo

                        FROM universidade

                        WHERE
                            id = $1

                        LIMIT 1
                        `,
                        [
                            universidade_id
                        ]
                    );


                if (
                    instituicao.rows.length ===
                    0
                ) {

                    return res
                        .status(404)
                        .json({
                            erro:
                                "Instituição não encontrada"
                        });
                }


                if (
                    instituicao.rows[0]
                        .ativo ===
                    false
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Não é possível criar acesso para uma instituição inativa"
                        });
                }


            } else {

                universidade_id =
                    null;
            }


            // =================================================
            // EMAIL DUPLICADO
            // =================================================

            const emailExistente =
                await pool.query(
                    `
                    SELECT id

                    FROM usuario

                    WHERE
                        LOWER(email) =
                        LOWER($1)

                    LIMIT 1
                    `,
                    [
                        email
                    ]
                );


            if (
                emailExistente
                    .rows
                    .length >
                0
            ) {

                return res
                    .status(409)
                    .json({
                        erro:
                            "Este e-mail já possui uma conta"
                    });
            }


            // =================================================
            // SENHA
            // =================================================

            const senhaHash =
                await bcrypt.hash(
                    senha,
                    10
                );


            const contaAtiva =
                typeof ativo ===
                    "boolean"
                    ? ativo
                    : true;


            // =================================================
            // CADASTRAR
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
                        perfil,
                        ativo
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6
                    )

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
                        senhaHash,
                        perfil,
                        contaAtiva
                    ]
                );


            res
                .status(201)
                .json({

                    mensagem:
                        "Acesso criado com sucesso",

                    usuario:
                        resultado.rows[0]
                });


        } catch (erro) {

            console.error(
                "Erro ao criar acesso:",
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
                            "Este e-mail já possui uma conta"
                    });
            }


            if (
                erro.code ===
                "23514"
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Perfil e instituição incompatíveis"
                    });
            }


            res.status(500).json({
                erro:
                    "Erro ao criar acesso"
            });
        }
    }
);


module.exports =
    router;