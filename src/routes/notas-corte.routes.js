const express =
    require("express");

const multer =
    require("multer");

const crypto =
    require("crypto");

const pool =
    require("../config/database");

const {
    exigirLogin,
    exigirPerfil,
    exigirPermissao
} =
    require("../middleware/auth");

const {
    usuarioPossuiPermissao
} =
    require("../services/permissoes.service");


const router =
    express.Router();


// =========================================================
// UPLOAD
//
// O arquivo fica em memória somente durante a requisição.
// Depois é salvo no PostgreSQL.
// =========================================================

const upload =
    multer({

        storage:
            multer.memoryStorage(),

        limits: {

            fileSize:
                5 *
                1024 *
                1024
        },

        fileFilter:
            (
                req,
                file,
                callback
            ) => {

                const tiposPermitidos = [

                    "application/pdf",

                    "image/png",

                    "image/jpeg"

                ];


                if (
                    !tiposPermitidos.includes(
                        file.mimetype
                    )
                ) {

                    return callback(
                        new Error(
                            "O comprovante deve ser PDF, PNG, JPG ou JPEG"
                        )
                    );
                }


                callback(
                    null,
                    true
                );
            }
    });


// =========================================================
// RECEBER COMPROVANTE
// =========================================================

function receberComprovante(
    req,
    res,
    next
) {

    upload.single(
        "comprovante"
    )(
        req,
        res,
        erro => {

            if (!erro) {

                return next();
            }


            if (
                erro.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "O comprovante deve possuir no máximo 5 MB"
                    });
            }


            return res
                .status(400)
                .json({
                    erro:
                        erro.message ||
                        "Comprovante inválido"
                });
        }
    );
}


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
        valor ||
        ""
    )
        .trim();
}


function converterNota(
    valor
) {

    const normalizado =
        String(
            valor ??
            ""
        )
            .trim()
            .replace(
                ",",
                "."
            );


    return Number(
        normalizado
    );
}


function urlValida(
    valor
) {

    if (!valor) {

        return true;
    }


    try {

        const url =
            new URL(
                valor
            );


        return [
            "http:",
            "https:"
        ].includes(
            url.protocol
        );


    } catch {

        return false;
    }
}


// =========================================================
// CONSULTAR NOTAS PÚBLICAS DE UM CURSO
//
// Somente aprovadas e vigentes.
// =========================================================

router.get(
    "/curso/:cursoId",

    async (req, res) => {

        try {

            const cursoId =
                Number(
                    req.params
                        .cursoId
                );


            if (
                !idValido(
                    cursoId
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Curso inválido"
                    });
            }


            const parametros = [
                cursoId
            ];


            const filtros = [

                "nc.curso_id = $1",

                "nc.status = 'aprovada'",

                "nc.vigente = TRUE"

            ];


            if (
                req.query.ano
            ) {

                const ano =
                    Number(
                        req.query.ano
                    );


                if (
                    !Number.isInteger(
                        ano
                    )
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Ano inválido"
                        });
                }


                parametros.push(
                    ano
                );


                filtros.push(
                    `nc.ano = $${parametros.length}`
                );
            }


            const resultado =
                await pool.query(
                    `
                    SELECT

                        nc.id,

                        nc.curso_id,

                        nc.ano,

                        nc.edicao,

                        nc.processo_seletivo,

                        nc.turno,

                        nc.grupo_concorrencia,

                        nc.modalidade_nome,

                        nc.tipo_nota,

                        nc.nota,

                        nc.vagas,

                        nc.fonte,

                        nc.fonte_url,

                        nc.validado_em,

                        TRUE
                            AS possui_comprovante,

                        c.nome
                            AS curso,

                        c.grau_academico,

                        c.modalidade
                            AS modalidade_curso,

                        u.id
                            AS universidade_id,

                        u.nome
                            AS universidade,

                        u.sigla
                            AS universidade_sigla

                    FROM nota_corte nc

                    JOIN curso c
                        ON c.id =
                            nc.curso_id

                    JOIN universidade u
                        ON u.id =
                            c.universidade_id

                    WHERE
                        ${filtros.join(
                            " AND "
                        )}

                    ORDER BY

                        nc.ano DESC,

                        nc.processo_seletivo,

                        nc.edicao,

                        CASE
                            WHEN nc.grupo_concorrencia = 'ampla'
                            THEN 0
                            ELSE 1
                        END,

                        nc.modalidade_nome
                    `,
                    parametros
                );


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro ao consultar notas de corte:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao consultar notas de corte"
                });
        }
    }
);


// =========================================================
// ENVIAR NOTA PARA VALIDAÇÃO
// =========================================================

router.post(
    "/",

    exigirPermissao(
        "GERENCIAR_NOTAS_CORTE"
    ),

    receberComprovante,

    async (req, res) => {

        try {

            if (
                !req.file
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "O comprovante oficial é obrigatório"
                    });
            }


            const cursoId =
                Number(
                    req.body
                        .curso_id
                );


            const ano =
                Number(
                    req.body.ano
                );


            const nota =
                converterNota(
                    req.body.nota
                );


            const vagasTexto =
                texto(
                    req.body.vagas
                );


            const vagas =
                vagasTexto ===
                    ""
                    ? null
                    : Number(
                        vagasTexto
                    );


            const processoSeletivo =
                texto(
                    req.body
                        .processo_seletivo
                ) ||
                "SISU";


            const edicao =
                texto(
                    req.body.edicao
                ) ||
                "Regular";


            const turno =
                texto(
                    req.body.turno
                ) ||
                "Não informado";


            const grupoConcorrencia =
                texto(
                    req.body
                        .grupo_concorrencia
                )
                    .toLowerCase();


            const modalidadeNome =
                texto(
                    req.body
                        .modalidade_nome
                );


            const tipoNota =
                texto(
                    req.body
                        .tipo_nota
                )
                    .toLowerCase();


            const fonte =
                texto(
                    req.body.fonte
                )
                    .toLowerCase();


            const fonteUrl =
                texto(
                    req.body
                        .fonte_url
                ) ||
                null;


            // =================================================
            // VALIDAÇÕES
            // =================================================

            if (
                !idValido(
                    cursoId
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Selecione um curso válido"
                    });
            }


            if (
                !Number.isInteger(
                    ano
                ) ||
                ano < 2000 ||
                ano > 2100
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe um ano válido"
                    });
            }


            if (
                !Number.isFinite(
                    nota
                ) ||
                nota < 0 ||
                nota > 1000
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe uma nota válida entre 0 e 1000"
                    });
            }


            if (
                vagas !== null &&
                (
                    !Number.isInteger(
                        vagas
                    ) ||
                    vagas < 0
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe uma quantidade de vagas válida"
                    });
            }


            const gruposPermitidos = [

                "ampla",

                "cota",

                "acao_afirmativa",

                "outro"
            ];


            if (
                !gruposPermitidos.includes(
                    grupoConcorrencia
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Grupo de concorrência inválido"
                    });
            }


            if (
                !modalidadeNome
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe a modalidade de concorrência"
                    });
            }


            const tiposPermitidos = [

                "parcial",

                "encerramento",

                "chamada_regular"

            ];


            if (
                !tiposPermitidos.includes(
                    tipoNota
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Tipo de nota inválido"
                    });
            }


            const fontesPermitidas = [

                "mec_sisu",

                "inep",

                "ies",

                "outra_oficial"

            ];


            if (
                !fontesPermitidas.includes(
                    fonte
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Fonte oficial inválida"
                    });
            }


            if (
                fonteUrl &&
                !urlValida(
                    fonteUrl
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe um link oficial válido"
                    });
            }


            // =================================================
            // CURSO
            // =================================================

            const resultadoCurso =
                await pool.query(
                    `
                    SELECT

                        c.id,

                        c.nome,

                        c.universidade_id,

                        u.nome
                            AS universidade

                    FROM curso c

                    JOIN universidade u
                        ON u.id =
                            c.universidade_id

                    WHERE
                        c.id = $1
                        AND c.status = 'Ativo'
                        AND u.ativo = TRUE

                    LIMIT 1
                    `,
                    [
                        cursoId
                    ]
                );


            if (
                resultadoCurso.rows
                    .length ===
                0
            ) {

                return res
                    .status(404)
                    .json({
                        erro:
                            "Curso não encontrado"
                    });
            }


            const curso =
                resultadoCurso
                    .rows[0];


            // =================================================
            // INSTITUCIONAL SÓ PODE ENVIAR PARA SUA IES
            // =================================================

            if (
                req.session.usuario
                    .perfil !==
                    "super_admin"
            ) {

                if (
                    Number(
                        req.session.usuario
                            .universidade_id
                    ) !==
                    Number(
                        curso.universidade_id
                    )
                ) {

                    return res
                        .status(403)
                        .json({
                            erro:
                                "Você só pode enviar notas de corte dos cursos da sua instituição"
                        });
                }
            }


            // =================================================
            // HASH DO COMPROVANTE
            // =================================================

            const hash =
                crypto
                    .createHash(
                        "sha256"
                    )
                    .update(
                        req.file.buffer
                    )
                    .digest(
                        "hex"
                    );


            // =================================================
            // CADASTRAR COMO PENDENTE
            // =================================================

            const resultado =
                await pool.query(
                    `
                    INSERT INTO nota_corte
                    (
                        curso_id,

                        ano,

                        edicao,

                        processo_seletivo,

                        turno,

                        grupo_concorrencia,

                        modalidade_nome,

                        tipo_nota,

                        nota,

                        vagas,

                        fonte,

                        fonte_url,

                        comprovante_nome,

                        comprovante_mime,

                        comprovante_tamanho,

                        comprovante_hash,

                        comprovante_arquivo,

                        status,

                        vigente,

                        enviado_por
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
                        $14,
                        $15,
                        $16,
                        $17,
                        'pendente',
                        FALSE,
                        $18
                    )

                    RETURNING

                        id,

                        curso_id,

                        ano,

                        edicao,

                        processo_seletivo,

                        turno,

                        grupo_concorrencia,

                        modalidade_nome,

                        tipo_nota,

                        nota,

                        vagas,

                        fonte,

                        fonte_url,

                        status,

                        criado_em
                    `,
                    [
                        cursoId,

                        ano,

                        edicao,

                        processoSeletivo,

                        turno,

                        grupoConcorrencia,

                        modalidadeNome,

                        tipoNota,

                        nota,

                        vagas,

                        fonte,

                        fonteUrl,

                        req.file.originalname,

                        req.file.mimetype,

                        req.file.size,

                        hash,

                        req.file.buffer,

                        req.session.usuario.id
                    ]
                );


            res
                .status(201)
                .json({

                    mensagem:
                        "Nota de corte enviada para validação do Super Administrador",

                    nota_corte:
                        resultado.rows[0]
                });


        } catch (erro) {

            console.error(
                "Erro ao enviar nota de corte:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao enviar nota de corte"
                });
        }
    }
);


// =========================================================
// NOTAS DA PRÓPRIA INSTITUIÇÃO
// =========================================================

router.get(
    "/minha-instituicao",

    exigirPermissao(
        "GERENCIAR_NOTAS_CORTE"
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

                        nc.id,

                        nc.ano,

                        nc.edicao,

                        nc.processo_seletivo,

                        nc.turno,

                        nc.grupo_concorrencia,

                        nc.modalidade_nome,

                        nc.tipo_nota,

                        nc.nota,

                        nc.vagas,

                        nc.fonte,

                        nc.status,

                        nc.vigente,

                        nc.observacao_validacao,

                        nc.criado_em,

                        nc.validado_em,

                        c.id
                            AS curso_id,

                        c.nome
                            AS curso

                    FROM nota_corte nc

                    JOIN curso c
                        ON c.id =
                            nc.curso_id

                    WHERE
                        c.universidade_id = $1

                    ORDER BY
                        nc.criado_em DESC
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
                "Erro ao consultar notas da instituição:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao consultar notas de corte da instituição"
                });
        }
    }
);


// =========================================================
// SUPER ADMIN - PENDENTES
// =========================================================

router.get(
    "/admin/pendentes",

    exigirPerfil(
        "super_admin"
    ),

    async (req, res) => {

        try {

            const resultado =
                await pool.query(
                    `
                    SELECT

                        nc.id,

                        nc.ano,

                        nc.edicao,

                        nc.processo_seletivo,

                        nc.turno,

                        nc.grupo_concorrencia,

                        nc.modalidade_nome,

                        nc.tipo_nota,

                        nc.nota,

                        nc.vagas,

                        nc.fonte,

                        nc.fonte_url,

                        nc.comprovante_nome,

                        nc.comprovante_mime,

                        nc.comprovante_tamanho,

                        nc.comprovante_hash,

                        nc.status,

                        nc.criado_em,

                        c.id
                            AS curso_id,

                        c.nome
                            AS curso,

                        u.id
                            AS universidade_id,

                        u.nome
                            AS universidade,

                        u.sigla
                            AS universidade_sigla,

                        us.id
                            AS enviado_por_id,

                        us.nome
                            AS enviado_por_nome,

                        us.email
                            AS enviado_por_email

                    FROM nota_corte nc

                    JOIN curso c
                        ON c.id =
                            nc.curso_id

                    JOIN universidade u
                        ON u.id =
                            c.universidade_id

                    LEFT JOIN usuario us
                        ON us.id =
                            nc.enviado_por

                    WHERE
                        nc.status =
                            'pendente'

                    ORDER BY
                        nc.criado_em ASC
                    `
                );


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro ao listar notas pendentes:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao consultar notas pendentes"
                });
        }
    }
);


// =========================================================
// VISUALIZAR COMPROVANTE
// =========================================================

router.get(
    "/:id/comprovante",

    exigirLogin,

    async (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !idValido(
                    id
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Nota de corte inválida"
                    });
            }


            const resultado =
                await pool.query(
                    `
                    SELECT

                        nc.id,

                        nc.comprovante_nome,

                        nc.comprovante_mime,

                        nc.comprovante_tamanho,

                        nc.comprovante_arquivo,

                        c.universidade_id

                    FROM nota_corte nc

                    JOIN curso c
                        ON c.id =
                            nc.curso_id

                    WHERE
                        nc.id = $1

                    LIMIT 1
                    `,
                    [
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
                            "Comprovante não encontrado"
                    });
            }


            const nota =
                resultado.rows[0];


            let autorizado =
                req.session.usuario
                    .perfil ===
                "super_admin";


            if (
                !autorizado
            ) {

                const mesmaInstituicao =
                    Number(
                        req.session.usuario
                            .universidade_id
                    ) ===
                    Number(
                        nota.universidade_id
                    );


                if (
                    mesmaInstituicao
                ) {

                    autorizado =
                        await usuarioPossuiPermissao(
                            req.session.usuario.id,
                            "GERENCIAR_NOTAS_CORTE"
                        );
                }
            }


            if (
                !autorizado
            ) {

                return res
                    .status(403)
                    .json({
                        erro:
                            "Você não possui permissão para visualizar este comprovante"
                    });
            }


            res.setHeader(
                "Content-Type",
                nota.comprovante_mime
            );


            res.setHeader(
                "Content-Length",
                nota.comprovante_tamanho
            );


            res.setHeader(
                "Cache-Control",
                "private, no-store"
            );


            res.setHeader(
                "Content-Disposition",
                `inline; filename*=UTF-8''${encodeURIComponent(
                    nota.comprovante_nome
                )}`
            );


            res.send(
                nota.comprovante_arquivo
            );


        } catch (erro) {

            console.error(
                "Erro ao abrir comprovante:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao abrir comprovante"
                });
        }
    }
);


// =========================================================
// SUPER ADMIN - APROVAR
// =========================================================

router.patch(
    "/admin/:id/aprovar",

    exigirPerfil(
        "super_admin"
    ),

    async (req, res) => {

        const client =
            await pool.connect();


        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !idValido(
                    id
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Nota de corte inválida"
                    });
            }


            await client.query(
                "BEGIN"
            );


            const resultadoAtual =
                await client.query(
                    `
                    SELECT *

                    FROM nota_corte

                    WHERE
                        id = $1

                    FOR UPDATE
                    `,
                    [
                        id
                    ]
                );


            if (
                resultadoAtual.rows
                    .length ===
                0
            ) {

                await client.query(
                    "ROLLBACK"
                );


                return res
                    .status(404)
                    .json({
                        erro:
                            "Nota de corte não encontrada"
                    });
            }


            const nota =
                resultadoAtual.rows[0];


            if (
                nota.status !==
                "pendente"
            ) {

                await client.query(
                    "ROLLBACK"
                );


                return res
                    .status(409)
                    .json({
                        erro:
                            "Esta nota já foi analisada"
                    });
            }


            // =================================================
            // DESATIVAR VERSÃO APROVADA ANTERIOR
            //
            // Mesma oferta/modalidade/tipo.
            // =================================================

            await client.query(
                `
                UPDATE nota_corte

                SET
                    vigente = FALSE,
                    atualizado_em = NOW()

                WHERE
                    curso_id = $1

                    AND ano = $2

                    AND LOWER(
                        processo_seletivo
                    ) =
                    LOWER($3)

                    AND LOWER(
                        edicao
                    ) =
                    LOWER($4)

                    AND LOWER(
                        turno
                    ) =
                    LOWER($5)

                    AND LOWER(
                        modalidade_nome
                    ) =
                    LOWER($6)

                    AND tipo_nota = $7

                    AND status =
                        'aprovada'

                    AND vigente =
                        TRUE

                    AND id <> $8
                `,
                [
                    nota.curso_id,

                    nota.ano,

                    nota.processo_seletivo,

                    nota.edicao,

                    nota.turno,

                    nota.modalidade_nome,

                    nota.tipo_nota,

                    nota.id
                ]
            );


            const observacao =
                texto(
                    req.body
                        .observacao
                ) ||
                null;


            const resultado =
                await client.query(
                    `
                    UPDATE nota_corte

                    SET

                        status =
                            'aprovada',

                        vigente =
                            TRUE,

                        observacao_validacao =
                            $1,

                        validado_por =
                            $2,

                        validado_em =
                            NOW(),

                        atualizado_em =
                            NOW()

                    WHERE
                        id = $3

                    RETURNING

                        id,

                        curso_id,

                        ano,

                        modalidade_nome,

                        tipo_nota,

                        nota,

                        status,

                        vigente,

                        validado_em
                    `,
                    [
                        observacao,

                        req.session.usuario.id,

                        id
                    ]
                );


            await client.query(
                "COMMIT"
            );


            res.json({

                mensagem:
                    "Nota de corte aprovada e publicada com sucesso",

                nota_corte:
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


            console.error(
                "Erro ao aprovar nota de corte:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao aprovar nota de corte"
                });


        } finally {

            client.release();
        }
    }
);


// =========================================================
// SUPER ADMIN - REJEITAR
// =========================================================

router.patch(
    "/admin/:id/rejeitar",

    exigirPerfil(
        "super_admin"
    ),

    async (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !idValido(
                    id
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Nota de corte inválida"
                    });
            }


            const observacao =
                texto(
                    req.body
                        .observacao
                );


            if (
                !observacao
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
                    UPDATE nota_corte

                    SET

                        status =
                            'rejeitada',

                        vigente =
                            FALSE,

                        observacao_validacao =
                            $1,

                        validado_por =
                            $2,

                        validado_em =
                            NOW(),

                        atualizado_em =
                            NOW()

                    WHERE
                        id = $3

                        AND status =
                            'pendente'

                    RETURNING

                        id,

                        curso_id,

                        ano,

                        modalidade_nome,

                        nota,

                        status,

                        observacao_validacao,

                        validado_em
                    `,
                    [
                        observacao,

                        req.session.usuario.id,

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
                            "Nota pendente não encontrada"
                    });
            }


            res.json({

                mensagem:
                    "Nota de corte rejeitada",

                nota_corte:
                    resultado.rows[0]
            });


        } catch (erro) {

            console.error(
                "Erro ao rejeitar nota de corte:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao rejeitar nota de corte"
                });
        }
    }
);


module.exports =
    router;