const express =
    require("express");

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

const {
    listarCatalogoPermissoes,
    listarPermissoesUsuario,
    substituirPermissoesUsuario
} =
    require(
        "../services/permissoes.service"
    );


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
// UTILITÁRIO
// =========================================================

function idValido(
    valor
) {

    const id =
        Number(
            valor
        );


    return (
        Number.isInteger(id) &&
        id > 0
    );
}


// =========================================================
// CATÁLOGO DE PERMISSÕES
// =========================================================

router.get(
    "/catalogo",
    async (req, res) => {

        try {

            const permissoes =
                await listarCatalogoPermissoes();


            res.json(
                permissoes
            );


        } catch (erro) {

            console.error(
                "Erro ao listar permissões:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao consultar permissões"
                });
        }
    }
);


// =========================================================
// PERMISSÕES DE UM USUÁRIO
// =========================================================

router.get(
    "/usuarios/:id",
    async (req, res) => {

        try {

            if (
                !idValido(
                    req.params.id
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Usuário inválido"
                    });
            }


            const usuarioId =
                Number(
                    req.params.id
                );


            const resultado =
                await pool.query(
                    `
                    SELECT
                        id,
                        nome,
                        email,
                        perfil,
                        universidade_id,
                        ativo

                    FROM usuario

                    WHERE
                        id = $1

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


            const usuario =
                resultado.rows[0];


            const permissoes =
                await listarPermissoesUsuario(
                    usuarioId
                );


            res.json({

                usuario,

                permissoes,

                permissoes_automaticas:
                    usuario.perfil ===
                    "super_admin"
            });


        } catch (erro) {

            console.error(
                "Erro ao consultar permissões do usuário:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao consultar permissões do usuário"
                });
        }
    }
);


// =========================================================
// SUBSTITUIR PERMISSÕES DO USUÁRIO
// =========================================================

router.put(
    "/usuarios/:id",
    async (req, res) => {

        try {

            if (
                !idValido(
                    req.params.id
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Usuário inválido"
                    });
            }


            const usuarioId =
                Number(
                    req.params.id
                );


            const {
                permissoes
            } =
                req.body;


            if (
                !Array.isArray(
                    permissoes
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe a lista de permissões"
                    });
            }


            const usuarioResultado =
                await pool.query(
                    `
                    SELECT
                        id,
                        perfil,
                        universidade_id,
                        ativo

                    FROM usuario

                    WHERE
                        id = $1

                    LIMIT 1
                    `,
                    [
                        usuarioId
                    ]
                );


            if (
                usuarioResultado
                    .rows
                    .length ===
                0
            ) {

                return res
                    .status(404)
                    .json({
                        erro:
                            "Usuário não encontrado"
                    });
            }


            const usuario =
                usuarioResultado
                    .rows[0];


            // =================================================
            // SUPER ADMIN TEM TODAS AUTOMATICAMENTE
            // =================================================

            if (
                usuario.perfil ===
                "super_admin"
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "As permissões do Super Administrador são automáticas e não podem ser removidas"
                    });
            }


            const permissoesAtualizadas =
                await substituirPermissoesUsuario(
                    usuarioId,
                    permissoes,
                    req.session.usuario.id
                );


            res.json({

                mensagem:
                    "Permissões atualizadas com sucesso",

                permissoes:
                    permissoesAtualizadas
            });


        } catch (erro) {

            console.error(
                "Erro ao atualizar permissões:",
                erro
            );


            if (
                erro.statusCode
            ) {

                return res
                    .status(
                        erro.statusCode
                    )
                    .json({
                        erro:
                            erro.message
                    });
            }


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao atualizar permissões"
                });
        }
    }
);


module.exports =
    router;