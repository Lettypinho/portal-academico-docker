const {
    usuarioPossuiTodasPermissoes,
    usuarioPossuiUmaDasPermissoes
} =
    require(
        "../services/permissoes.service"
    );


// =========================================================
// LOGIN
// =========================================================

function exigirLogin(
    req,
    res,
    next
) {

    if (
        !req.session.usuario
    ) {

        return res
            .status(401)
            .json({
                erro:
                    "Usuário não autenticado"
            });
    }


    next();
}


// =========================================================
// PERFIL
//
// Mantido por compatibilidade durante a migração.
// Depois vamos reduzir os perfis.
// =========================================================

function exigirPerfil(
    ...perfisPermitidos
) {

    return (
        req,
        res,
        next
    ) => {

        if (
            !req.session.usuario
        ) {

            return res
                .status(401)
                .json({
                    erro:
                        "Usuário não autenticado"
                });
        }


        if (
            !perfisPermitidos.includes(
                req.session.usuario.perfil
            )
        ) {

            return res
                .status(403)
                .json({
                    erro:
                        "Você não possui permissão para realizar esta operação"
                });
        }


        next();
    };
}


// =========================================================
// EXIGIR TODAS AS PERMISSÕES
// =========================================================

function exigirPermissao(
    ...codigos
) {

    return async (
        req,
        res,
        next
    ) => {

        try {

            if (
                !req.session.usuario
            ) {

                return res
                    .status(401)
                    .json({
                        erro:
                            "Usuário não autenticado"
                    });
            }


            // =============================================
            // SUPER ADMIN POSSUI TODAS
            // =============================================

            if (
                req.session.usuario
                    .perfil ===
                "super_admin"
            ) {

                return next();
            }


            const permitido =
                await usuarioPossuiTodasPermissoes(
                    req.session.usuario.id,
                    codigos
                );


            if (!permitido) {

                return res
                    .status(403)
                    .json({
                        erro:
                            "Você não possui a permissão necessária para realizar esta operação"
                    });
            }


            next();


        } catch (erro) {

            console.error(
                "Erro ao validar permissão:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao validar permissões do usuário"
                });
        }
    };
}


// =========================================================
// EXIGIR PELO MENOS UMA DAS PERMISSÕES
// =========================================================

function exigirUmaDasPermissoes(
    ...codigos
) {

    return async (
        req,
        res,
        next
    ) => {

        try {

            if (
                !req.session.usuario
            ) {

                return res
                    .status(401)
                    .json({
                        erro:
                            "Usuário não autenticado"
                    });
            }


            if (
                req.session.usuario
                    .perfil ===
                "super_admin"
            ) {

                return next();
            }


            const permitido =
                await usuarioPossuiUmaDasPermissoes(
                    req.session.usuario.id,
                    codigos
                );


            if (!permitido) {

                return res
                    .status(403)
                    .json({
                        erro:
                            "Você não possui permissão para realizar esta operação"
                    });
            }


            next();


        } catch (erro) {

            console.error(
                "Erro ao validar permissões:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao validar permissões do usuário"
                });
        }
    };
}


module.exports = {

    exigirLogin,

    exigirPerfil,

    exigirPermissao,

    exigirUmaDasPermissoes
};