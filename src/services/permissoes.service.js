const pool =
    require(
        "../config/database"
    );


// =========================================================
// NORMALIZAR CÓDIGOS
// =========================================================

function normalizarCodigos(
    codigos
) {

    if (
        !Array.isArray(
            codigos
        )
    ) {

        return [];
    }


    return [
        ...new Set(
            codigos
                .map(
                    codigo =>
                        String(
                            codigo ||
                            ""
                        )
                            .trim()
                            .toUpperCase()
                )
                .filter(
                    Boolean
                )
        )
    ];
}


// =========================================================
// CATÁLOGO
// =========================================================

async function listarCatalogoPermissoes() {

    const resultado =
        await pool.query(
            `
            SELECT
                id,
                codigo,
                nome,
                descricao,
                categoria,
                exige_universidade,
                ativo

            FROM permissao

            WHERE
                ativo = TRUE

            ORDER BY
                categoria,
                id
            `
        );


    return resultado.rows;
}


// =========================================================
// PERFIL DO USUÁRIO
// =========================================================

async function obterUsuarioPermissoes(
    usuarioId
) {

    const resultado =
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


    return (
        resultado.rows[0] ||
        null
    );
}


// =========================================================
// LISTAR PERMISSÕES DO USUÁRIO
// =========================================================

async function listarPermissoesUsuario(
    usuarioId
) {

    const usuario =
        await obterUsuarioPermissoes(
            usuarioId
        );


    if (!usuario) {

        return [];
    }


    // =====================================================
    // SUPER ADMIN POSSUI TODAS
    // =====================================================

    if (
        usuario.perfil ===
        "super_admin"
    ) {

        const catalogo =
            await listarCatalogoPermissoes();


        return catalogo.map(
            permissao =>
                permissao.codigo
        );
    }


    const resultado =
        await pool.query(
            `
            SELECT
                p.codigo

            FROM usuario_permissao up

            JOIN permissao p
                ON p.id =
                    up.permissao_id

            WHERE
                up.usuario_id = $1
                AND p.ativo = TRUE

            ORDER BY
                p.codigo
            `,
            [
                usuarioId
            ]
        );


    return resultado.rows.map(
        linha =>
            linha.codigo
    );
}


// =========================================================
// POSSUI PERMISSÃO
// =========================================================

async function usuarioPossuiPermissao(
    usuarioId,
    codigo
) {

    const usuario =
        await obterUsuarioPermissoes(
            usuarioId
        );


    if (
        !usuario ||
        !usuario.ativo
    ) {

        return false;
    }


    if (
        usuario.perfil ===
        "super_admin"
    ) {

        return true;
    }


    const codigoNormalizado =
        String(
            codigo ||
            ""
        )
            .trim()
            .toUpperCase();


    if (!codigoNormalizado) {

        return false;
    }


    const resultado =
        await pool.query(
            `
            SELECT
                1

            FROM usuario_permissao up

            JOIN permissao p
                ON p.id =
                    up.permissao_id

            WHERE
                up.usuario_id = $1

                AND p.codigo = $2

                AND p.ativo = TRUE

            LIMIT 1
            `,
            [
                usuarioId,
                codigoNormalizado
            ]
        );


    return (
        resultado.rows.length >
        0
    );
}


// =========================================================
// POSSUI TODAS
// =========================================================

async function usuarioPossuiTodasPermissoes(
    usuarioId,
    codigos
) {

    const lista =
        normalizarCodigos(
            codigos
        );


    if (
        lista.length ===
        0
    ) {

        return true;
    }


    const usuario =
        await obterUsuarioPermissoes(
            usuarioId
        );


    if (
        !usuario ||
        !usuario.ativo
    ) {

        return false;
    }


    if (
        usuario.perfil ===
        "super_admin"
    ) {

        return true;
    }


    const resultado =
        await pool.query(
            `
            SELECT
                COUNT(
                    DISTINCT p.codigo
                )::INT
                    AS quantidade

            FROM usuario_permissao up

            JOIN permissao p
                ON p.id =
                    up.permissao_id

            WHERE
                up.usuario_id = $1

                AND p.codigo =
                    ANY($2::VARCHAR[])

                AND p.ativo = TRUE
            `,
            [
                usuarioId,
                lista
            ]
        );


    return (
        Number(
            resultado.rows[0]
                .quantidade
        ) ===
        lista.length
    );
}


// =========================================================
// POSSUI PELO MENOS UMA
// =========================================================

async function usuarioPossuiUmaDasPermissoes(
    usuarioId,
    codigos
) {

    const lista =
        normalizarCodigos(
            codigos
        );


    if (
        lista.length ===
        0
    ) {

        return false;
    }


    const usuario =
        await obterUsuarioPermissoes(
            usuarioId
        );


    if (
        !usuario ||
        !usuario.ativo
    ) {

        return false;
    }


    if (
        usuario.perfil ===
        "super_admin"
    ) {

        return true;
    }


    const resultado =
        await pool.query(
            `
            SELECT
                1

            FROM usuario_permissao up

            JOIN permissao p
                ON p.id =
                    up.permissao_id

            WHERE
                up.usuario_id = $1

                AND p.codigo =
                    ANY($2::VARCHAR[])

                AND p.ativo = TRUE

            LIMIT 1
            `,
            [
                usuarioId,
                lista
            ]
        );


    return (
        resultado.rows.length >
        0
    );
}


// =========================================================
// VALIDAR CÓDIGOS
// =========================================================

async function validarCodigosPermissoes(
    codigos,
    client = pool
) {

    const lista =
        normalizarCodigos(
            codigos
        );


    if (
        lista.length ===
        0
    ) {

        return [];
    }


    const resultado =
        await client.query(
            `
            SELECT
                codigo,
                exige_universidade

            FROM permissao

            WHERE
                codigo =
                    ANY($1::VARCHAR[])

                AND ativo = TRUE
            `,
            [
                lista
            ]
        );


    if (
        resultado.rows.length !==
        lista.length
    ) {

        const encontrados =
            new Set(
                resultado.rows.map(
                    linha =>
                        linha.codigo
                )
            );


        const invalidos =
            lista.filter(
                codigo =>
                    !encontrados.has(
                        codigo
                    )
            );


        const erro =
            new Error(
                `Permissão inválida: ${invalidos.join(", ")}`
            );


        erro.statusCode =
            400;


        throw erro;
    }


    return resultado.rows;
}


// =========================================================
// VERIFICAR SE ALGUMA PERMISSÃO EXIGE IES
// =========================================================

async function permissoesExigemUniversidade(
    codigos,
    client = pool
) {

    const permissoes =
        await validarCodigosPermissoes(
            codigos,
            client
        );


    return permissoes.some(
        permissao =>
            permissao
                .exige_universidade ===
            true
    );
}


// =========================================================
// SUBSTITUIR PERMISSÕES
// =========================================================

async function substituirPermissoesUsuario(
    usuarioId,
    codigos,
    concedidoPor = null,
    clientExterno = null
) {

    const lista =
        normalizarCodigos(
            codigos
        );


    const client =
        clientExterno ||
        await pool.connect();


    const controlaTransacao =
        !clientExterno;


    try {

        if (
            controlaTransacao
        ) {

            await client.query(
                "BEGIN"
            );
        }


        await validarCodigosPermissoes(
            lista,
            client
        );


        await client.query(
            `
            DELETE FROM usuario_permissao

            WHERE
                usuario_id = $1
            `,
            [
                usuarioId
            ]
        );


        if (
            lista.length >
            0
        ) {

            await client.query(
                `
                INSERT INTO usuario_permissao
                (
                    usuario_id,
                    permissao_id,
                    concedido_por
                )

                SELECT
                    $1,
                    p.id,
                    $2

                FROM permissao p

                WHERE
                    p.codigo =
                        ANY($3::VARCHAR[])

                    AND p.ativo = TRUE
                `,
                [
                    usuarioId,
                    concedidoPor,
                    lista
                ]
            );
        }


        if (
            controlaTransacao
        ) {

            await client.query(
                "COMMIT"
            );
        }


        return await listarPermissoesUsuario(
            usuarioId
        );


    } catch (erro) {

        if (
            controlaTransacao
        ) {

            try {

                await client.query(
                    "ROLLBACK"
                );

            } catch {
                // nenhuma ação necessária
            }
        }


        throw erro;


    } finally {

        if (
            controlaTransacao
        ) {

            client.release();
        }
    }
}


module.exports = {

    normalizarCodigos,

    listarCatalogoPermissoes,

    listarPermissoesUsuario,

    usuarioPossuiPermissao,

    usuarioPossuiTodasPermissoes,

    usuarioPossuiUmaDasPermissoes,

    validarCodigosPermissoes,

    permissoesExigemUniversidade,

    substituirPermissoesUsuario
};