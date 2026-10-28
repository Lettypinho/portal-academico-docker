const express =
    require("express");

const pool =
    require("../config/database");

const {
    exigirLogin
} =
    require("../middleware/auth");


const router =
    express.Router();


// =========================================================
// UTILITÁRIOS
// =========================================================

function emailValido(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            String(email || "")
        );
}


// =========================================================
// CONSULTAR MINHA SOLICITAÇÃO MAIS RECENTE
// =========================================================

router.get(
    "/minha",
    exigirLogin,
    async (req, res) => {

        try {

            const usuarioId =
                req.session.usuario.id;


            const resultado =
                await pool.query(
                    `
                    SELECT

                        s.id,
                        s.usuario_id,
                        s.universidade_id,
                        s.tipo_vinculo,
                        s.email_institucional,
                        s.identificacao_institucional,
                        s.matricula,
                        s.curso_id,
                        s.cargo,
                        s.setor,
                        s.status,
                        s.observacao_analise,
                        s.criado_em,
                        s.atualizado_em,
                        s.analisado_em,

                        u.codigo
                            AS universidade_codigo,

                        u.nome
                            AS universidade,

                        u.sigla
                            AS universidade_sigla,

                        u.cidade
                            AS universidade_cidade,

                        u.estado
                            AS universidade_estado,

                        c.nome
                            AS curso

                    FROM solicitacao_vinculo s

                    JOIN universidade u
                        ON u.id =
                            s.universidade_id

                    LEFT JOIN curso c
                        ON c.id =
                            s.curso_id

                    WHERE
                        s.usuario_id = $1

                    ORDER BY
                        s.criado_em DESC

                    LIMIT 1
                    `,
                    [
                        usuarioId
                    ]
                );


            res.json(
                resultado.rows[0] ||
                null
            );


        } catch (erro) {

            console.error(
                "Erro ao consultar solicitação de vínculo:",
                erro
            );


            res.status(500).json({
                erro:
                    "Erro ao consultar solicitação de vínculo"
            });
        }
    }
);


// =========================================================
// CRIAR SOLICITAÇÃO
// =========================================================

router.post(
    "/",
    exigirLogin,
    async (req, res) => {

        try {

            const usuario =
                req.session.usuario;


            // Somente conta pública sem vínculo atual.
            if (
                usuario.perfil !==
                    "publico" ||
                usuario.universidade_id
            ) {

                return res
                    .status(403)
                    .json({
                        erro:
                            "Sua conta já possui um vínculo institucional"
                    });
            }


            const {
                universidade_id,
                tipo_vinculo,
                email_institucional,
                identificacao_institucional,
                matricula,
                curso_id,
                cargo,
                setor
            } = req.body;


            // =================================================
            // TIPO
            // =================================================

            if (
                ![
                    "aluno",
                    "funcionario"
                ].includes(
                    tipo_vinculo
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Selecione um tipo de vínculo válido"
                    });
            }


            // =================================================
            // UNIVERSIDADE
            // =================================================

            const universidadeId =
                Number.parseInt(
                    universidade_id,
                    10
                );


            if (
                !Number.isInteger(
                    universidadeId
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Selecione uma instituição"
                    });
            }


            const universidade =
                await pool.query(
                    `
                    SELECT
                        id,
                        nome,
                        sigla

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
                universidade.rows.length ===
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
            // EMAIL INSTITUCIONAL
            // =================================================

            const emailInstitucional =
                String(
                    email_institucional ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            if (
                !emailValido(
                    emailInstitucional
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe um e-mail institucional válido"
                    });
            }


            // =================================================
            // VERIFICAR SOLICITAÇÃO PENDENTE
            // =================================================

            const pendente =
                await pool.query(
                    `
                    SELECT id

                    FROM solicitacao_vinculo

                    WHERE
                        usuario_id = $1
                        AND status = 'pendente'

                    LIMIT 1
                    `,
                    [
                        usuario.id
                    ]
                );


            if (
                pendente.rows.length >
                0
            ) {

                return res
                    .status(409)
                    .json({
                        erro:
                            "Você já possui uma solicitação de vínculo pendente"
                    });
            }


            let cursoId =
                null;

            let matriculaFinal =
                null;

            let cargoFinal =
                null;

            let setorFinal =
                null;

            let identificacaoFinal =
                null;


            // =================================================
            // ALUNO
            // =================================================

            if (
                tipo_vinculo ===
                "aluno"
            ) {

                matriculaFinal =
                    String(
                        matricula ||
                        ""
                    )
                        .trim();


                if (!matriculaFinal) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Informe sua matrícula"
                        });
                }


                cursoId =
                    Number.parseInt(
                        curso_id,
                        10
                    );


                if (
                    !Number.isInteger(
                        cursoId
                    )
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Selecione seu curso"
                        });
                }


                const curso =
                    await pool.query(
                        `
                        SELECT id

                        FROM curso

                        WHERE
                            id = $1
                            AND universidade_id = $2
                            AND status = 'Ativo'

                        LIMIT 1
                        `,
                        [
                            cursoId,
                            universidadeId
                        ]
                    );


                if (
                    curso.rows.length ===
                    0
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "O curso selecionado não pertence à instituição informada"
                        });
                }
            }


            // =================================================
            // FUNCIONÁRIO
            // =================================================

            if (
                tipo_vinculo ===
                "funcionario"
            ) {

                cargoFinal =
                    String(
                        cargo ||
                        ""
                    )
                        .trim();


                setorFinal =
                    String(
                        setor ||
                        ""
                    )
                        .trim();


                identificacaoFinal =
                    String(
                        identificacao_institucional ||
                        ""
                    )
                        .trim() ||
                    null;


                if (!cargoFinal) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Informe seu cargo ou função"
                        });
                }


                if (!setorFinal) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Informe seu setor"
                        });
                }
            }


            // =================================================
            // INSERIR
            // =================================================

            const resultado =
                await pool.query(
                    `
                    INSERT INTO solicitacao_vinculo
                    (
                        usuario_id,
                        universidade_id,
                        tipo_vinculo,
                        email_institucional,
                        identificacao_institucional,
                        matricula,
                        curso_id,
                        cargo,
                        setor,
                        status
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
                        'pendente'
                    )

                    RETURNING
                        id,
                        usuario_id,
                        universidade_id,
                        tipo_vinculo,
                        status,
                        criado_em
                    `,
                    [
                        usuario.id,
                        universidadeId,
                        tipo_vinculo,
                        emailInstitucional,
                        identificacaoFinal,
                        matriculaFinal,
                        cursoId,
                        cargoFinal,
                        setorFinal
                    ]
                );


            res
                .status(201)
                .json({

                    mensagem:
                        "Solicitação de vínculo enviada com sucesso",

                    solicitacao:
                        resultado.rows[0]
                });


        } catch (erro) {

            console.error(
                "Erro ao criar solicitação de vínculo:",
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
                            "Você já possui uma solicitação pendente"
                    });
            }


            res.status(500).json({
                erro:
                    "Erro ao enviar solicitação de vínculo"
            });
        }
    }
);


// =========================================================
// CANCELAR SOLICITAÇÃO
// =========================================================

router.delete(
    "/:id",
    exigirLogin,
    async (req, res) => {

        try {

            const solicitacaoId =
                Number.parseInt(
                    req.params.id,
                    10
                );


            if (
                !Number.isInteger(
                    solicitacaoId
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Solicitação inválida"
                    });
            }


            const resultado =
                await pool.query(
                    `
                    UPDATE solicitacao_vinculo

                    SET
                        status = 'cancelado',
                        atualizado_em = NOW()

                    WHERE
                        id = $1
                        AND usuario_id = $2
                        AND status = 'pendente'

                    RETURNING id
                    `,
                    [
                        solicitacaoId,
                        req.session.usuario.id
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
                    "Solicitação cancelada com sucesso"
            });


        } catch (erro) {

            console.error(
                "Erro ao cancelar solicitação:",
                erro
            );


            res.status(500).json({
                erro:
                    "Erro ao cancelar solicitação"
            });
        }
    }
);


module.exports =
    router;