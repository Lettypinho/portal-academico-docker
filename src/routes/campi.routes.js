const express =
    require("express");

const pool =
    require("../config/database");

const {
    exigirPermissao
} =
    require("../middleware/auth");


const router =
    express.Router();


// =========================================================
// UTILITÁRIOS
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


function texto(
    valor
) {

    return String(
        valor ??
        ""
    )
        .trim();
}


function numero(
    valor
) {

    const convertido =
        Number(
            valor
        );


    return Number.isFinite(
        convertido
    )
        ? convertido
        : null;
}


function booleano(
    valor,
    padrao = false
) {

    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {

        return padrao;
    }


    if (
        valor === true ||
        valor === "true" ||
        valor === 1 ||
        valor === "1"
    ) {

        return true;
    }


    if (
        valor === false ||
        valor === "false" ||
        valor === 0 ||
        valor === "0"
    ) {

        return false;
    }


    return padrao;
}


// =========================================================
// LISTAGEM PÚBLICA
// =========================================================

router.get(
    "/",

    async (req, res) => {

        try {

            const universidadeId =
                Number(
                    req.query
                        .universidade_id
                );


            if (
                !idValido(
                    universidadeId
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe uma instituição válida"
                    });
            }


            const resultado =
                await pool.query(
                    `
                    SELECT

                        id,

                        universidade_id,

                        nome,

                        endereco,

                        numero,

                        complemento,

                        bairro,

                        cidade,

                        estado,

                        cep,

                        latitude,

                        longitude,

                        principal

                    FROM campus

                    WHERE
                        universidade_id = $1

                        AND ativo = TRUE

                    ORDER BY
                        principal DESC,
                        nome
                    `,
                    [
                        universidadeId
                    ]
                );


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro ao consultar campi:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao consultar campi"
                });
        }
    }
);


// =========================================================
// CAMPI DA PRÓPRIA INSTITUIÇÃO
// =========================================================

router.get(
    "/minha-instituicao",

    exigirPermissao(
        "VISUALIZAR_DADOS_INSTITUCIONAIS"
    ),

    async (req, res) => {

        try {

            const universidadeId =
                Number(
                    req.session.usuario
                        .universidade_id
                );


            if (
                !idValido(
                    universidadeId
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Usuário não vinculado a uma instituição"
                    });
            }


            const resultado =
                await pool.query(
                    `
                    SELECT

                        id,

                        universidade_id,

                        nome,

                        endereco,

                        numero,

                        complemento,

                        bairro,

                        cidade,

                        estado,

                        cep,

                        latitude,

                        longitude,

                        principal,

                        ativo,

                        origem_dados,

                        criado_em,

                        atualizado_em

                    FROM campus

                    WHERE
                        universidade_id = $1

                    ORDER BY
                        principal DESC,
                        ativo DESC,
                        nome
                    `,
                    [
                        universidadeId
                    ]
                );


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro ao consultar campi da instituição:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao consultar campi da instituição"
                });
        }
    }
);


// =========================================================
// CADASTRAR CAMPUS
// =========================================================

router.post(
    "/",

    exigirPermissao(
        "GERENCIAR_CAMPI"
    ),

    async (req, res) => {

        const client =
            await pool.connect();


        try {

            const usuario =
                req.session.usuario;


            let universidadeId =
                Number(
                    req.body
                        .universidade_id
                );


            if (
                usuario.perfil !==
                "super_admin"
            ) {

                universidadeId =
                    Number(
                        usuario
                            .universidade_id
                    );
            }


            if (
                !idValido(
                    universidadeId
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Instituição inválida"
                    });
            }


            const nome =
                texto(
                    req.body.nome
                );


            const endereco =
                texto(
                    req.body.endereco
                );


            const numeroEndereco =
                texto(
                    req.body.numero
                ) ||
                null;


            const complemento =
                texto(
                    req.body.complemento
                ) ||
                null;


            const bairro =
                texto(
                    req.body.bairro
                ) ||
                null;


            const cidade =
                texto(
                    req.body.cidade
                );


            const estado =
                texto(
                    req.body.estado
                )
                    .toUpperCase();


            const cep =
                texto(
                    req.body.cep
                ) ||
                null;


            const latitude =
                numero(
                    req.body.latitude
                );


            const longitude =
                numero(
                    req.body.longitude
                );


            const principal =
                booleano(
                    req.body.principal
                );


            if (
                !nome ||
                !endereco ||
                !cidade ||
                estado.length !== 2
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Preencha nome, endereço, cidade e estado"
                    });
            }


            if (
                latitude === null ||
                latitude < -90 ||
                latitude > 90
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Latitude inválida"
                    });
            }


            if (
                longitude === null ||
                longitude < -180 ||
                longitude > 180
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Longitude inválida"
                    });
            }


            const instituicao =
                await client.query(
                    `
                    SELECT id

                    FROM universidade

                    WHERE
                        id = $1
                        AND ativo = TRUE

                    LIMIT 1
                    `,
                    [
                        universidadeId
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


            await client.query(
                "BEGIN"
            );


            if (
                principal
            ) {

                await client.query(
                    `
                    UPDATE campus

                    SET
                        principal = FALSE,
                        atualizado_em = NOW()

                    WHERE
                        universidade_id = $1
                        AND principal = TRUE
                    `,
                    [
                        universidadeId
                    ]
                );
            }


            const resultado =
                await client.query(
                    `
                    INSERT INTO campus
                    (
                        universidade_id,

                        nome,

                        endereco,

                        numero,

                        complemento,

                        bairro,

                        cidade,

                        estado,

                        cep,

                        latitude,

                        longitude,

                        principal,

                        origem_dados
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        $8,
                        $9,
                        $10,
                        $11,
                        $12,
                        'SIA'
                    )

                    RETURNING *
                    `,
                    [
                        universidadeId,

                        nome,

                        endereco,

                        numeroEndereco,

                        complemento,

                        bairro,

                        cidade,

                        estado,

                        cep,

                        latitude,

                        longitude,

                        principal
                    ]
                );


            await client.query(
                "COMMIT"
            );


            res
                .status(201)
                .json(
                    resultado.rows[0]
                );


        } catch (erro) {

            try {

                await client.query(
                    "ROLLBACK"
                );

            } catch {
                // nenhuma ação
            }


            if (
                erro.code ===
                "23505"
            ) {

                return res
                    .status(409)
                    .json({
                        erro:
                            "Já existe um campus com este nome nesta instituição"
                    });
            }


            console.error(
                "Erro ao cadastrar campus:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao cadastrar campus"
                });


        } finally {

            client.release();
        }
    }
);


// =========================================================
// EDITAR CAMPUS
// =========================================================

router.patch(
    "/:id",

    exigirPermissao(
        "GERENCIAR_CAMPI"
    ),

    async (req, res) => {

        const client =
            await pool.connect();


        try {

            const usuario =
                req.session.usuario;


            const campusId =
                Number(
                    req.params.id
                );


            if (
                !idValido(
                    campusId
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Campus inválido"
                    });
            }


            const atualResultado =
                await client.query(
                    `
                    SELECT *

                    FROM campus

                    WHERE
                        id = $1

                    LIMIT 1
                    `,
                    [
                        campusId
                    ]
                );


            if (
                atualResultado.rows
                    .length ===
                0
            ) {

                return res
                    .status(404)
                    .json({
                        erro:
                            "Campus não encontrado"
                    });
            }


            const atual =
                atualResultado.rows[0];


            if (
                usuario.perfil !==
                    "super_admin" &&
                Number(
                    usuario.universidade_id
                ) !==
                Number(
                    atual.universidade_id
                )
            ) {

                return res
                    .status(403)
                    .json({
                        erro:
                            "Você só pode alterar campi da sua instituição"
                    });
            }


            const nome =
                req.body.nome !== undefined
                    ? texto(
                        req.body.nome
                    )
                    : atual.nome;


            const endereco =
                req.body.endereco !== undefined
                    ? texto(
                        req.body.endereco
                    )
                    : atual.endereco;


            const numeroEndereco =
                req.body.numero !== undefined
                    ? (
                        texto(
                            req.body.numero
                        ) ||
                        null
                    )
                    : atual.numero;


            const complemento =
                req.body.complemento !== undefined
                    ? (
                        texto(
                            req.body.complemento
                        ) ||
                        null
                    )
                    : atual.complemento;


            const bairro =
                req.body.bairro !== undefined
                    ? (
                        texto(
                            req.body.bairro
                        ) ||
                        null
                    )
                    : atual.bairro;


            const cidade =
                req.body.cidade !== undefined
                    ? texto(
                        req.body.cidade
                    )
                    : atual.cidade;


            const estado =
                req.body.estado !== undefined
                    ? texto(
                        req.body.estado
                    )
                        .toUpperCase()
                    : atual.estado;


            const cep =
                req.body.cep !== undefined
                    ? (
                        texto(
                            req.body.cep
                        ) ||
                        null
                    )
                    : atual.cep;


            const latitude =
                req.body.latitude !== undefined
                    ? numero(
                        req.body.latitude
                    )
                    : Number(
                        atual.latitude
                    );


            const longitude =
                req.body.longitude !== undefined
                    ? numero(
                        req.body.longitude
                    )
                    : Number(
                        atual.longitude
                    );


            const ativo =
                req.body.ativo !== undefined
                    ? booleano(
                        req.body.ativo,
                        atual.ativo
                    )
                    : atual.ativo;


            let principal =
                req.body.principal !== undefined
                    ? booleano(
                        req.body.principal,
                        atual.principal
                    )
                    : atual.principal;


            if (
                !ativo
            ) {

                principal =
                    false;
            }


            if (
                !nome ||
                !endereco ||
                !cidade ||
                estado.length !== 2
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Dados do campus inválidos"
                    });
            }


            if (
                latitude === null ||
                latitude < -90 ||
                latitude > 90
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Latitude inválida"
                    });
            }


            if (
                longitude === null ||
                longitude < -180 ||
                longitude > 180
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Longitude inválida"
                    });
            }


            await client.query(
                "BEGIN"
            );


            if (
                principal
            ) {

                await client.query(
                    `
                    UPDATE campus

                    SET
                        principal = FALSE,
                        atualizado_em = NOW()

                    WHERE
                        universidade_id = $1

                        AND id <> $2

                        AND principal = TRUE
                    `,
                    [
                        atual.universidade_id,
                        campusId
                    ]
                );
            }


            const resultado =
                await client.query(
                    `
                    UPDATE campus

                    SET

                        nome = $1,

                        endereco = $2,

                        numero = $3,

                        complemento = $4,

                        bairro = $5,

                        cidade = $6,

                        estado = $7,

                        cep = $8,

                        latitude = $9,

                        longitude = $10,

                        principal = $11,

                        ativo = $12,

                        atualizado_em = NOW()

                    WHERE
                        id = $13

                    RETURNING *
                    `,
                    [
                        nome,

                        endereco,

                        numeroEndereco,

                        complemento,

                        bairro,

                        cidade,

                        estado,

                        cep,

                        latitude,

                        longitude,

                        principal,

                        ativo,

                        campusId
                    ]
                );


            await client.query(
                "COMMIT"
            );


            res.json(
                resultado.rows[0]
            );


        } catch (erro) {

            try {

                await client.query(
                    "ROLLBACK"
                );

            } catch {
                // nenhuma ação
            }


            if (
                erro.code ===
                "23505"
            ) {

                return res
                    .status(409)
                    .json({
                        erro:
                            "Já existe um campus com este nome nesta instituição"
                    });
            }


            console.error(
                "Erro ao editar campus:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao editar campus"
                });


        } finally {

            client.release();
        }
    }
);


module.exports =
    router;