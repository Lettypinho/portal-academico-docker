const express =
    require("express");

const pool =
    require("../config/database");

const {
    exigirPermissao,
    exigirPerfil
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

    const numero =
        Number(
            valor
        );


    return (
        Number.isInteger(
            numero
        ) &&
        numero > 0
    );
}


function texto(
    valor
) {

    return String(
        valor ??
        ""
    ).trim();
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


    return (
        valor === true ||
        valor === "true" ||
        valor === 1 ||
        valor === "1"
    );
}


// =========================================================
// LISTAGEM PÚBLICA
//
// Apenas campi aprovados e ativos.
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

                        AND status_aprovacao =
                            'aprovado'

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
//
// Mostra:
// - aprovados ativos;
// - pendentes;
// - rejeitados.
//
// Não mostra excluídos.
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

                        status_aprovacao,

                        solicitado_em,

                        aprovado_em,

                        rejeitado_em,

                        motivo_rejeicao,

                        criado_em,

                        atualizado_em

                    FROM campus

                    WHERE
                        universidade_id = $1

                        AND
                        (
                            (
                                ativo = TRUE

                                AND status_aprovacao =
                                    'aprovado'
                            )

                            OR status_aprovacao IN
                            (
                                'pendente',
                                'rejeitado'
                            )
                        )

                    ORDER BY

                        CASE status_aprovacao

                            WHEN 'pendente'
                                THEN 1

                            WHEN 'aprovado'
                                THEN 2

                            WHEN 'rejeitado'
                                THEN 3

                            ELSE 4

                        END,

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
// CADASTRAR / SOLICITAR CAMPUS
//
// Institucional:
// pendente + inativo.
//
// Super Admin:
// aprovado + ativo.
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
                        usuario.universidade_id
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


            // =================================================
            // EVITAR DUPLICIDADE ATIVA/PENDENTE
            // =================================================

            const existente =
                await client.query(
                    `
                    SELECT id

                    FROM campus

                    WHERE
                        universidade_id = $1

                        AND LOWER(
                            TRIM(nome)
                        ) =
                        LOWER(
                            TRIM($2)
                        )

                        AND status_aprovacao IN
                        (
                            'aprovado',
                            'pendente'
                        )

                        AND
                        (
                            ativo = TRUE

                            OR status_aprovacao =
                                'pendente'
                        )

                    LIMIT 1
                    `,
                    [
                        universidadeId,
                        nome
                    ]
                );


            if (
                existente.rows.length >
                0
            ) {

                return res
                    .status(409)
                    .json({
                        erro:
                            "Já existe um campus ativo ou aguardando aprovação com este nome"
                    });
            }


            const superAdmin =
                usuario.perfil ===
                "super_admin";


            const statusAprovacao =
                superAdmin
                    ? "aprovado"
                    : "pendente";


            const ativo =
                superAdmin;


            await client.query(
                "BEGIN"
            );


            if (
                superAdmin &&
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

                        ativo,

                        origem_dados,

                        status_aprovacao,

                        solicitado_por,

                        solicitado_em,

                        aprovado_por,

                        aprovado_em
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
                        $13,
                        'SIA',
                        $14,
                        $15,
                        NOW(),
                        $16,
                        $17
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

                        principal,

                        ativo,

                        statusAprovacao,

                        usuario.id,

                        superAdmin
                            ? usuario.id
                            : null,

                        superAdmin
                            ? new Date()
                            : null
                    ]
                );


            await client.query(
                "COMMIT"
            );


            res
                .status(201)
                .json({

                    mensagem:
                        superAdmin
                            ? "Campus cadastrado com sucesso"
                            : "Campus enviado para aprovação do Super Admin",

                    campus:
                        resultado.rows[0]
                });


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


            if (
                erro.code ===
                "23514"
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "O nome informado não pode ser utilizado para esta instituição"
                    });
            }


            console.error(
                "Erro ao solicitar campus:",
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
// EDITAR CAMPUS PELO PERFIL INSTITUCIONAL
//
// Qualquer alteração volta para análise.
// Super Admin continua usando a rota administrativa normal.
// =========================================================

router.patch(
    "/:id",

    exigirPermissao(
        "GERENCIAR_CAMPI"
    ),

    async (
        req,
        res,
        next
    ) => {

        const usuario =
            req.session.usuario;


        if (
            usuario.perfil ===
            "super_admin"
        ) {

            return next();
        }


        const client =
            await pool.connect();


        try {

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


            const resultadoAtual =
                await client.query(
                    `
                    SELECT *

                    FROM campus

                    WHERE
                        id = $1

                        AND universidade_id = $2

                        AND status_aprovacao <>
                            'excluido'

                    LIMIT 1
                    `,
                    [
                        campusId,
                        usuario.universidade_id
                    ]
                );


            if (
                resultadoAtual.rows.length ===
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
                resultadoAtual.rows[0];


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
                    ).toUpperCase()
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


            const principal =
                req.body.principal !== undefined
                    ? booleano(
                        req.body.principal
                    )
                    : atual.principal;


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
                latitude > 90 ||
                longitude === null ||
                longitude < -180 ||
                longitude > 180
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Coordenadas inválidas"
                    });
            }


            await client.query(
                "BEGIN"
            );


            // Enquanto aguarda nova aprovação, não pode ser
            // utilizado em cursos nem publicamente.
            await client.query(
                `
                UPDATE curso_campus

                SET
                    ativo = FALSE,

                    atualizado_em =
                        NOW()

                WHERE
                    campus_id = $1
                `,
                [
                    campusId
                ]
            );


            await client.query(
                `
                UPDATE curso

                SET
                    campus_id = NULL

                WHERE
                    campus_id = $1
                `,
                [
                    campusId
                ]
            );


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

                        ativo = FALSE,

                        status_aprovacao =
                            'pendente',

                        solicitado_por = $12,

                        solicitado_em =
                            NOW(),

                        aprovado_por =
                            NULL,

                        aprovado_em =
                            NULL,

                        rejeitado_por =
                            NULL,

                        rejeitado_em =
                            NULL,

                        motivo_rejeicao =
                            NULL,

                        atualizado_em =
                            NOW()

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

                        usuario.id,

                        campusId
                    ]
                );


            await client.query(
                "COMMIT"
            );


            res.json({

                mensagem:
                    "Alterações enviadas para aprovação do Super Admin",

                campus:
                    resultado.rows[0]
            });


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
                "23514"
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "O nome informado não pode ser utilizado para esta instituição"
                    });
            }


            console.error(
                "Erro ao atualizar solicitação de campus:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao atualizar campus"
                });


        } finally {

            client.release();
        }
    }
);


// =========================================================
// LISTAR PENDENTES - SUPER ADMIN
// =========================================================

router.get(
    "/pendentes",

    exigirPerfil(
        "super_admin"
    ),

    async (req, res) => {

        try {

            const resultado =
                await pool.query(
                    `
                    SELECT

                        c.*,

                        u.nome
                            AS universidade,

                        u.sigla
                            AS universidade_sigla,

                        solicitante.nome
                            AS solicitado_por_nome,

                        solicitante.email
                            AS solicitado_por_email

                    FROM campus c

                    INNER JOIN universidade u
                        ON u.id =
                            c.universidade_id

                    LEFT JOIN usuario solicitante
                        ON solicitante.id =
                            c.solicitado_por

                    WHERE
                        c.status_aprovacao =
                            'pendente'

                    ORDER BY
                        c.solicitado_em ASC,
                        c.id ASC
                    `
                );


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro ao listar campi pendentes:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao carregar solicitações de campus"
                });
        }
    }
);


// =========================================================
// APROVAR - SUPER ADMIN
// =========================================================

router.patch(
    "/:id/aprovar",

    exigirPerfil(
        "super_admin"
    ),

    async (req, res) => {

        const client =
            await pool.connect();


        try {

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


            const consulta =
                await client.query(
                    `
                    SELECT *

                    FROM campus

                    WHERE
                        id = $1

                        AND status_aprovacao =
                            'pendente'

                    LIMIT 1
                    `,
                    [
                        campusId
                    ]
                );


            if (
                consulta.rows.length ===
                0
            ) {

                return res
                    .status(404)
                    .json({
                        erro:
                            "Solicitação pendente não encontrada"
                    });
            }


            const campus =
                consulta.rows[0];


            await client.query(
                "BEGIN"
            );


            if (
                campus.principal
            ) {

                await client.query(
                    `
                    UPDATE campus

                    SET
                        principal = FALSE,

                        atualizado_em =
                            NOW()

                    WHERE
                        universidade_id = $1

                        AND id <> $2

                        AND ativo = TRUE

                        AND principal = TRUE
                    `,
                    [
                        campus.universidade_id,
                        campusId
                    ]
                );
            }


            const resultado =
                await client.query(
                    `
                    UPDATE campus

                    SET
                        ativo = TRUE,

                        status_aprovacao =
                            'aprovado',

                        aprovado_por = $1,

                        aprovado_em =
                            NOW(),

                        rejeitado_por =
                            NULL,

                        rejeitado_em =
                            NULL,

                        motivo_rejeicao =
                            NULL,

                        atualizado_em =
                            NOW()

                    WHERE
                        id = $2

                    RETURNING *
                    `,
                    [
                        req.session.usuario.id,
                        campusId
                    ]
                );


            await client.query(
                "COMMIT"
            );


            res.json({

                mensagem:
                    "Campus aprovado com sucesso",

                campus:
                    resultado.rows[0]
            });


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
                            "Já existe um campus ativo com este nome na instituição"
                    });
            }


            console.error(
                "Erro ao aprovar campus:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao aprovar campus"
                });


        } finally {

            client.release();
        }
    }
);


// =========================================================
// REJEITAR - SUPER ADMIN
// =========================================================

router.patch(
    "/:id/rejeitar",

    exigirPerfil(
        "super_admin"
    ),

    async (req, res) => {

        try {

            const campusId =
                Number(
                    req.params.id
                );


            const motivo =
                texto(
                    req.body.motivo
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


            if (
                motivo.length < 3
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe o motivo da rejeição"
                    });
            }


            const resultado =
                await pool.query(
                    `
                    UPDATE campus

                    SET
                        ativo = FALSE,

                        principal = FALSE,

                        status_aprovacao =
                            'rejeitado',

                        rejeitado_por = $1,

                        rejeitado_em =
                            NOW(),

                        motivo_rejeicao = $2,

                        atualizado_em =
                            NOW()

                    WHERE
                        id = $3

                        AND status_aprovacao =
                            'pendente'

                    RETURNING *
                    `,
                    [
                        req.session.usuario.id,

                        motivo,

                        campusId
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
                            "Solicitação pendente não encontrada"
                    });
            }


            res.json({

                mensagem:
                    "Solicitação rejeitada",

                campus:
                    resultado.rows[0]
            });


        } catch (erro) {

            console.error(
                "Erro ao rejeitar campus:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao rejeitar campus"
                });
        
        }
    }
);


module.exports =
    router;