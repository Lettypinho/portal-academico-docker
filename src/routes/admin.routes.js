const express =
    require("express");

const bcrypt =
    require("bcryptjs");

const pool =
    require(
        "../config/database"
    );

const {
    exigirPerfil
} =
    require(
        "../middleware/auth"
    );


const router =
    express.Router();


// =========================================================
// TODAS AS ROTAS EXIGEM SUPER ADMIN
// =========================================================

router.use(
    exigirPerfil(
        "super_admin"
    )
);


// =========================================================
// UTILITÁRIOS
// =========================================================

function emailValido(
    email
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}


// =========================================================
// RESUMO
// =========================================================

router.get(
    "/resumo",
    async (req, res) => {

        try {

            const resumo =
                await pool.query(`
                    SELECT

                        (
                            SELECT COUNT(*)
                            FROM universidade
                        )
                            AS total_universidades,

                        (
                            SELECT COUNT(*)
                            FROM universidade
                            WHERE ativo = TRUE
                        )
                            AS universidades_ativas,

                        (
                            SELECT COUNT(*)
                            FROM usuario
                        )
                            AS total_usuarios,

                        (
                            SELECT COUNT(*)

                            FROM usuario

                            WHERE perfil IN (
                                'consulta_institucional',
                                'gestor',
                                'admin_universidade'
                            )
                        )
                            AS usuarios_institucionais,

                        (
                            SELECT COUNT(*)
                            FROM curso
                        )
                            AS total_cursos,

                        (
                            SELECT COUNT(*)
                            FROM aluno
                        )
                            AS total_alunos
                `);


            const universidadesRecentes =
                await pool.query(`
                    SELECT
                        id,
                        codigo,
                        nome,
                        sigla,
                        cidade,
                        estado,
                        organizacao_academica,
                        categoria_administrativa,
                        ativo,
                        criado_em

                    FROM universidade

                    ORDER BY
                        criado_em DESC

                    LIMIT 5
                `);


            const usuariosRecentes =
                await pool.query(`
                    SELECT
                        u.id,
                        u.nome,
                        u.email,
                        u.perfil,
                        u.ativo,
                        u.criado_em,

                        uni.nome
                            AS universidade,

                        uni.sigla
                            AS universidade_sigla

                    FROM usuario u

                    LEFT JOIN universidade uni
                        ON uni.id =
                            u.universidade_id

                    ORDER BY
                        u.criado_em DESC

                    LIMIT 5
                `);


            res.json({

                resumo:
                    resumo.rows[0],

                universidades_recentes:
                    universidadesRecentes.rows,

                usuarios_recentes:
                    usuariosRecentes.rows
            });


        } catch (erro) {

            console.error(
                "Erro no resumo administrativo:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao carregar resumo administrativo"
                });
        }
    }
);


// =========================================================
// LISTAR INSTITUIÇÕES
// =========================================================

router.get(
    "/universidades",
    async (req, res) => {

        try {

            const resultado =
                await pool.query(`
                    SELECT

                        u.id,
                        u.codigo,
                        u.nome,
                        u.sigla,
                        u.cidade,
                        u.estado,
                        u.organizacao_academica,
                        u.codigo_organizacao_academica,
                        u.categoria_administrativa,
                        u.codigo_categoria_administrativa,
                        u.ano_censo,
                        u.origem_dados,
                        u.ativo,
                        u.criado_em,

                        COUNT(
                            DISTINCT c.id
                        )
                            AS total_cursos,

                        COUNT(
                            DISTINCT us.id
                        )
                            AS total_usuarios

                    FROM universidade u

                    LEFT JOIN curso c
                        ON c.universidade_id =
                            u.id

                    LEFT JOIN usuario us
                        ON us.universidade_id =
                            u.id

                    GROUP BY
                        u.id,
                        u.codigo,
                        u.nome,
                        u.sigla,
                        u.cidade,
                        u.estado,
                        u.organizacao_academica,
                        u.codigo_organizacao_academica,
                        u.categoria_administrativa,
                        u.codigo_categoria_administrativa,
                        u.ano_censo,
                        u.origem_dados,
                        u.ativo,
                        u.criado_em

                    ORDER BY
                        u.nome
                `);


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro ao listar instituições:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao consultar instituições"
                });
        }
    }
);


// =========================================================
// ATIVAR / DESATIVAR INSTITUIÇÃO
// =========================================================

router.patch(
    "/universidades/:id/status",
    async (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            const {
                ativo
            } =
                req.body;


            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Instituição inválida"
                    });
            }


            if (
                typeof ativo !==
                "boolean"
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe o status da instituição"
                    });
            }


            const resultado =
                await pool.query(
                    `
                    UPDATE universidade

                    SET
                        ativo = $1

                    WHERE
                        id = $2

                    RETURNING
                        id,
                        codigo,
                        nome,
                        sigla,
                        cidade,
                        estado,
                        organizacao_academica,
                        categoria_administrativa,
                        ativo
                    `,
                    [
                        ativo,
                        id
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
                            "Instituição não encontrada"
                    });
            }


            res.json(
                resultado.rows[0]
            );


        } catch (erro) {

            console.error(
                "Erro ao atualizar instituição:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao atualizar instituição"
                });
        }
    }
);


// =========================================================
// LISTAR USUÁRIOS
// =========================================================

router.get(
    "/usuarios",
    async (req, res) => {

        try {

            const resultado =
                await pool.query(`
                    SELECT

                        u.id,
                        u.universidade_id,
                        u.nome,
                        u.email,
                        u.perfil,
                        u.ativo,
                        u.criado_em,
                        u.atualizado_em,

                        uni.nome
                            AS universidade,

                        uni.sigla
                            AS universidade_sigla,

                        uni.organizacao_academica

                    FROM usuario u

                    LEFT JOIN universidade uni
                        ON uni.id =
                            u.universidade_id

                    ORDER BY
                        u.criado_em DESC,
                        u.nome
                `);


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro ao listar usuários:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao consultar usuários"
                });
        }
    }
);


// =========================================================
// ALTERAR USUÁRIO
//
// SUPER ADMIN PODE ALTERAR:
// - nome
// - email
// - perfil
// - instituição
// - status
// - senha
//
// AO EDITAR A PRÓPRIA CONTA:
// - pode alterar nome
// - pode alterar email
// - pode alterar senha
// - NÃO pode remover o próprio super_admin
// - NÃO pode desativar a própria conta
// =========================================================

router.patch(
    "/usuarios/:id",
    async (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Usuário inválido"
                    });
            }


            let {
                nome,
                email,
                perfil,
                universidade_id,
                ativo,
                senha_atual,
                nova_senha,
                confirmar_nova_senha
            } =
                req.body;


            nome =
                String(
                    nome ||
                    ""
                )
                    .trim();


            email =
                String(
                    email ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            perfil =
                String(
                    perfil ||
                    ""
                )
                    .trim();


            senha_atual =
                String(
                    senha_atual ||
                    ""
                );


            nova_senha =
                String(
                    nova_senha ||
                    ""
                );


            confirmar_nova_senha =
                String(
                    confirmar_nova_senha ||
                    ""
                );


            const administradorId =
                Number(
                    req.session
                        .usuario
                        .id
                );


            const proprioUsuario =
                administradorId ===
                id;


            // =================================================
            // BUSCAR USUÁRIO ATUAL
            // =================================================

            const atual =
                await pool.query(
                    `
                    SELECT
                        id,
                        nome,
                        email,
                        perfil,
                        universidade_id,
                        ativo,
                        senha_hash

                    FROM usuario

                    WHERE
                        id = $1

                    LIMIT 1
                    `,
                    [
                        id
                    ]
                );


            if (
                atual.rows.length ===
                0
            ) {

                return res
                    .status(404)
                    .json({
                        erro:
                            "Usuário não encontrado"
                    });
            }


            const usuarioAtual =
                atual.rows[0];


            // =================================================
            // NOME
            // =================================================

            if (
                nome.length < 3
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe um nome válido"
                    });
            }


            if (
                nome.length > 150
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "O nome deve possuir no máximo 150 caracteres"
                    });
            }


            // =================================================
            // EMAIL
            // =================================================

            if (
                !emailValido(
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
                email.length > 150
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "O e-mail deve possuir no máximo 150 caracteres"
                    });
            }


            const emailExistente =
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
                        id
                    ]
                );


            if (
                emailExistente.rows.length >
                0
            ) {

                return res
                    .status(409)
                    .json({
                        erro:
                            "Este e-mail já está cadastrado em outra conta"
                    });
            }


            // =================================================
            // PERFIL
            // =================================================

            const perfisPermitidos = [
                "publico",
                "aluno",
                "consulta_institucional",
                "gestor",
                "admin_universidade",
                "super_admin"
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
            // STATUS
            // =================================================

            if (
                typeof ativo !==
                "boolean"
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Status inválido"
                    });
            }


            // =================================================
            // PROTEGER A PRÓPRIA CONTA SUPER ADMIN
            // =================================================

            if (
                proprioUsuario &&
                perfil !==
                    "super_admin"
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Você não pode remover o próprio acesso de Super Administrador"
                    });
            }


            if (
                proprioUsuario &&
                ativo ===
                    false
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Você não pode desativar a própria conta"
                    });
            }


            // =================================================
            // INSTITUIÇÃO
            // =================================================

            const perfisComInstituicao = [
                "aluno",
                "consulta_institucional",
                "gestor",
                "admin_universidade"
            ];


            if (
                perfisComInstituicao.includes(
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
                                "Não é possível vincular o usuário a uma instituição inativa"
                        });
                }


            } else {

                universidade_id =
                    null;
            }


            // =================================================
            // SENHA
            // =================================================

            const pretendeAlterarSenha =
                senha_atual.length > 0 ||
                nova_senha.length > 0 ||
                confirmar_nova_senha.length > 0;


            let novoHash =
                null;


            if (
                pretendeAlterarSenha
            ) {

                if (
                    !nova_senha ||
                    !confirmar_nova_senha
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Informe e confirme a nova senha"
                        });
                }


                if (
                    nova_senha.length < 6
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "A nova senha deve possuir pelo menos 6 caracteres"
                        });
                }


                if (
                    nova_senha.length > 72
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


                // =============================================
                // ALTERANDO A PRÓPRIA SENHA
                // =============================================

                if (
                    proprioUsuario
                ) {

                    if (
                        !senha_atual
                    ) {

                        return res
                            .status(400)
                            .json({
                                erro:
                                    "Informe sua senha atual"
                            });
                    }


                    const senhaCorreta =
                        await bcrypt.compare(
                            senha_atual,
                            usuarioAtual
                                .senha_hash
                        );


                    if (
                        !senhaCorreta
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
                            usuarioAtual
                                .senha_hash
                        );


                    if (
                        mesmaSenha
                    ) {

                        return res
                            .status(400)
                            .json({
                                erro:
                                    "A nova senha deve ser diferente da senha atual"
                            });
                    }
                }


                novoHash =
                    await bcrypt.hash(
                        nova_senha,
                        10
                    );
            }


            // =================================================
            // ATUALIZAR
            // =================================================

            const resultado =
                await pool.query(
                    `
                    UPDATE usuario

                    SET
                        nome = $1,
                        email = $2,
                        perfil = $3,
                        universidade_id = $4,
                        ativo = $5,

                        senha_hash =
                            COALESCE(
                                $6,
                                senha_hash
                            ),

                        atualizado_em =
                            NOW()

                    WHERE
                        id = $7

                    RETURNING
                        id,
                        universidade_id,
                        nome,
                        email,
                        perfil,
                        ativo,
                        atualizado_em
                    `,
                    [
                        nome,
                        email,
                        perfil,
                        universidade_id,
                        ativo,
                        novoHash,
                        id
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


            // =================================================
            // ATUALIZAR SESSÃO SE FOR O PRÓPRIO ADMIN
            // =================================================

            if (
                proprioUsuario
            ) {

                req.session.usuario.nome =
                    resultado.rows[0]
                        .nome;


                req.session.usuario.email =
                    resultado.rows[0]
                        .email;


                req.session.usuario.perfil =
                    resultado.rows[0]
                        .perfil;
            }


            res.json({

                mensagem:
                    pretendeAlterarSenha
                        ? "Usuário e senha atualizados com sucesso"
                        : "Usuário atualizado com sucesso",

                usuario:
                    resultado.rows[0]
            });


        } catch (erro) {

            console.error(
                "Erro ao atualizar usuário:",
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


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao atualizar usuário"
                });
        }
    }
);


module.exports =
    router;