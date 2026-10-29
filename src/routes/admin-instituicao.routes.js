const express =
    require("express");

const bcrypt =
    require("bcryptjs");

const pool =
    require("../config/database");

const {
    exigirPermissao,
    exigirUmaDasPermissoes
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


function emailValido(
    email
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}


function exigirUniversidade(
    req,
    res,
    next
) {

    if (
        !req.session.usuario ||
        !req.session.usuario
            .universidade_id
    ) {

        return res
            .status(400)
            .json({
                erro:
                    "O usuário não está vinculado a uma instituição"
            });
    }


    next();
}


// =========================================================
// RESUMO
// =========================================================

router.get(
    "/resumo",

    exigirUmaDasPermissoes(
        "GERENCIAR_USUARIOS",
        "GERENCIAR_VINCULOS"
    ),

    exigirUniversidade,

    async (req, res) => {

        try {

            const universidadeId =
                req.session.usuario
                    .universidade_id;


            const resultado =
                await pool.query(
                    `
                    SELECT

                        (
                            SELECT COUNT(*)::INT

                            FROM solicitacao_vinculo

                            WHERE
                                universidade_id = $1
                                AND status = 'pendente'
                        )
                            AS solicitacoes_pendentes,

                        (
                            SELECT COUNT(*)::INT

                            FROM usuario

                            WHERE
                                universidade_id = $1
                                AND ativo = TRUE
                        )
                            AS usuarios_vinculados,

                        (
                            SELECT COUNT(*)::INT

                            FROM usuario

                            WHERE
                                universidade_id = $1
                                AND perfil = 'aluno'
                                AND ativo = TRUE
                        )
                            AS alunos_vinculados,

                        (
                            SELECT COUNT(*)::INT

                            FROM usuario

                            WHERE
                                universidade_id = $1

                                AND perfil IN (
                                    'institucional',
                                    'consulta_institucional',
                                    'gestor',
                                    'admin_universidade'
                                )

                                AND ativo = TRUE
                        )
                            AS funcionarios_vinculados
                    `,
                    [
                        universidadeId
                    ]
                );


            res.json(
                resultado.rows[0]
            );


        } catch (erro) {

            console.error(
                "Erro no resumo administrativo da instituição:",
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
// SOLICITAÇÕES
// =========================================================

router.get(
    "/solicitacoes",

    exigirPermissao(
        "GERENCIAR_VINCULOS"
    ),

    exigirUniversidade,

    async (req, res) => {

        try {

            const universidadeId =
                req.session.usuario
                    .universidade_id;


            const statusPermitidos = [
                "pendente",
                "aprovado",
                "rejeitado",
                "cancelado",
                "revogado"
            ];


            const status =
                String(
                    req.query.status ||
                    "pendente"
                )
                    .trim()
                    .toLowerCase();


            if (
                !statusPermitidos.includes(
                    status
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Status de solicitação inválido"
                    });
            }


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

                        us.nome
                            AS usuario_nome,

                        us.email
                            AS usuario_email,

                        us.perfil
                            AS usuario_perfil_atual,

                        us.ativo
                            AS usuario_ativo,

                        c.nome
                            AS curso,

                        c.modalidade
                            AS curso_modalidade

                    FROM solicitacao_vinculo s

                    JOIN usuario us
                        ON us.id =
                            s.usuario_id

                    LEFT JOIN curso c
                        ON c.id =
                            s.curso_id

                    WHERE
                        s.universidade_id = $1
                        AND s.status = $2

                    ORDER BY
                        s.criado_em ASC
                    `,
                    [
                        universidadeId,
                        status
                    ]
                );


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro ao listar solicitações:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao consultar solicitações"
                });
        }
    }
);


// =========================================================
// APROVAR VÍNCULO
// =========================================================

router.patch(
    "/solicitacoes/:id/aprovar",

    exigirPermissao(
        "GERENCIAR_VINCULOS"
    ),

    exigirUniversidade,

    async (req, res) => {

        const client =
            await pool.connect();


        try {

            const solicitacaoId =
                Number(
                    req.params.id
                );


            if (
                !idValido(
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


            const universidadeId =
                req.session.usuario
                    .universidade_id;


            const administradorId =
                req.session.usuario.id;


            await client.query(
                "BEGIN"
            );


            const resultadoSolicitacao =
                await client.query(
                    `
                    SELECT

                        id,
                        usuario_id,
                        universidade_id,
                        tipo_vinculo,
                        curso_id,
                        matricula,
                        cargo,
                        setor,
                        status

                    FROM solicitacao_vinculo

                    WHERE
                        id = $1
                        AND universidade_id = $2

                    FOR UPDATE
                    `,
                    [
                        solicitacaoId,
                        universidadeId
                    ]
                );


            if (
                resultadoSolicitacao.rows
                    .length === 0
            ) {

                await client.query(
                    "ROLLBACK"
                );


                return res
                    .status(404)
                    .json({
                        erro:
                            "Solicitação não encontrada"
                    });
            }


            const solicitacao =
                resultadoSolicitacao
                    .rows[0];


            if (
                solicitacao.status !==
                "pendente"
            ) {

                await client.query(
                    "ROLLBACK"
                );


                return res
                    .status(409)
                    .json({
                        erro:
                            "Esta solicitação já foi analisada"
                    });
            }


            const resultadoUsuario =
                await client.query(
                    `
                    SELECT

                        id,
                        universidade_id,
                        nome,
                        email,
                        perfil,
                        ativo

                    FROM usuario

                    WHERE
                        id = $1

                    FOR UPDATE
                    `,
                    [
                        solicitacao.usuario_id
                    ]
                );


            if (
                resultadoUsuario.rows
                    .length === 0
            ) {

                await client.query(
                    "ROLLBACK"
                );


                return res
                    .status(404)
                    .json({
                        erro:
                            "Usuário solicitante não encontrado"
                    });
            }


            const usuario =
                resultadoUsuario
                    .rows[0];


            if (
                !usuario.ativo
            ) {

                await client.query(
                    "ROLLBACK"
                );


                return res
                    .status(400)
                    .json({
                        erro:
                            "O usuário solicitante está desativado"
                    });
            }


            if (
                usuario.perfil !==
                    "publico" ||
                usuario.universidade_id !==
                    null
            ) {

                await client.query(
                    "ROLLBACK"
                );


                return res
                    .status(409)
                    .json({
                        erro:
                            "Este usuário já possui um vínculo institucional"
                    });
            }


            let novoPerfil;


            if (
                solicitacao.tipo_vinculo ===
                "aluno"
            ) {

                novoPerfil =
                    "aluno";


            } else if (
                solicitacao.tipo_vinculo ===
                "funcionario"
            ) {

                novoPerfil =
                    "institucional";


            } else {

                await client.query(
                    "ROLLBACK"
                );


                return res
                    .status(400)
                    .json({
                        erro:
                            "Tipo de vínculo inválido"
                    });
            }


            const usuarioAtualizado =
                await client.query(
                    `
                    UPDATE usuario

                    SET
                        universidade_id = $1,
                        perfil = $2,
                        atualizado_em = NOW()

                    WHERE
                        id = $3

                    RETURNING

                        id,
                        universidade_id,
                        nome,
                        email,
                        perfil,
                        ativo
                    `,
                    [
                        universidadeId,
                        novoPerfil,
                        usuario.id
                    ]
                );


            // =================================================
            // FUNCIONÁRIO RECEBE VISUALIZAÇÃO COMO PADRÃO.
            // PERMISSÕES EXTRAS SÃO DADAS PELO SUPER ADMIN.
            // =================================================

            if (
                novoPerfil ===
                "institucional"
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
                            'VISUALIZAR_DADOS_INSTITUCIONAIS'

                    ON CONFLICT
                        DO NOTHING
                    `,
                    [
                        usuario.id,
                        administradorId
                    ]
                );
            }


            await client.query(
                `
                UPDATE solicitacao_vinculo

                SET
                    status = 'aprovado',
                    analisado_por = $1,
                    analisado_em = NOW(),
                    atualizado_em = NOW(),
                    observacao_analise = NULL

                WHERE
                    id = $2
                `,
                [
                    administradorId,
                    solicitacaoId
                ]
            );


            await client.query(
                "COMMIT"
            );


            res.json({

                mensagem:
                    "Solicitação aprovada com sucesso",

                usuario:
                    usuarioAtualizado.rows[0]
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
                "Erro ao aprovar solicitação:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao aprovar solicitação"
                });


        } finally {

            client.release();
        }
    }
);


// =========================================================
// REJEITAR SOLICITAÇÃO
// =========================================================

router.patch(
    "/solicitacoes/:id/rejeitar",

    exigirPermissao(
        "GERENCIAR_VINCULOS"
    ),

    exigirUniversidade,

    async (req, res) => {

        try {

            const solicitacaoId =
                Number(
                    req.params.id
                );


            if (
                !idValido(
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


            const universidadeId =
                req.session.usuario
                    .universidade_id;


            const administradorId =
                req.session.usuario.id;


            const observacao =
                String(
                    req.body.observacao ||
                    ""
                )
                    .trim();


            if (
                observacao.length >
                1000
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "A observação deve possuir no máximo 1000 caracteres"
                    });
            }


            const resultado =
                await pool.query(
                    `
                    UPDATE solicitacao_vinculo

                    SET
                        status = 'rejeitado',
                        observacao_analise = $1,
                        analisado_por = $2,
                        analisado_em = NOW(),
                        atualizado_em = NOW()

                    WHERE
                        id = $3
                        AND universidade_id = $4
                        AND status = 'pendente'

                    RETURNING
                        id,
                        usuario_id,
                        status,
                        analisado_em
                    `,
                    [
                        observacao ||
                            null,

                        administradorId,
                        solicitacaoId,
                        universidadeId
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

                solicitacao:
                    resultado.rows[0]
            });


        } catch (erro) {

            console.error(
                "Erro ao rejeitar solicitação:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao rejeitar solicitação"
                });
        }
    }
);


// =========================================================
// USUÁRIOS DA IES
// =========================================================

router.get(
    "/usuarios",

    exigirPermissao(
        "GERENCIAR_USUARIOS"
    ),

    exigirUniversidade,

    async (req, res) => {

        try {

            const universidadeId =
                req.session.usuario
                    .universidade_id;


            const resultado =
                await pool.query(
                    `
                    SELECT

                        id,
                        nome,
                        email,
                        perfil,
                        ativo,
                        criado_em,
                        atualizado_em

                    FROM usuario

                    WHERE
                        universidade_id = $1

                    ORDER BY
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
                "Erro ao consultar usuários da instituição:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao consultar usuários vinculados"
                });
        }
    }
);


// =========================================================
// EDITAR CONTA DE USUÁRIO DA IES
//
// NÃO ALTERA PERFIL OU PERMISSÕES.
// ISSO É RESPONSABILIDADE DO SUPER ADMIN.
// =========================================================

router.patch(
    "/usuarios/:id/conta",

    exigirPermissao(
        "GERENCIAR_USUARIOS"
    ),

    exigirUniversidade,

    async (req, res) => {

        try {

            const usuarioId =
                Number(
                    req.params.id
                );


            if (
                !idValido(
                    usuarioId
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Usuário inválido"
                    });
            }


            const universidadeId =
                Number(
                    req.session.usuario
                        .universidade_id
                );


            const administradorId =
                Number(
                    req.session.usuario.id
                );


            const ehProprioUsuario =
                administradorId ===
                usuarioId;


            const nome =
                String(
                    req.body.nome ||
                    ""
                )
                    .trim();


            const email =
                String(
                    req.body.email ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const senhaAtual =
                String(
                    req.body.senha_atual ||
                    ""
                );


            const novaSenha =
                String(
                    req.body.nova_senha ||
                    ""
                );


            const confirmarNovaSenha =
                String(
                    req.body
                        .confirmar_nova_senha ||
                    ""
                );


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


            const atual =
                await pool.query(
                    `
                    SELECT

                        id,
                        universidade_id,
                        nome,
                        email,
                        perfil,
                        ativo,
                        senha_hash

                    FROM usuario

                    WHERE
                        id = $1
                        AND universidade_id = $2

                    LIMIT 1
                    `,
                    [
                        usuarioId,
                        universidadeId
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
                            "Usuário não encontrado nesta instituição"
                    });
            }


            const usuarioAtual =
                atual.rows[0];


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
                        usuarioId
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


            const pretendeAlterarSenha =
                senhaAtual.length > 0 ||
                novaSenha.length > 0 ||
                confirmarNovaSenha.length > 0;


            let novoHash =
                null;


            if (
                pretendeAlterarSenha
            ) {

                if (
                    !novaSenha ||
                    !confirmarNovaSenha
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Informe e confirme a nova senha"
                        });
                }


                if (
                    novaSenha.length < 6
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "A nova senha deve possuir pelo menos 6 caracteres"
                        });
                }


                if (
                    novaSenha.length > 72
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "A nova senha deve possuir no máximo 72 caracteres"
                        });
                }


                if (
                    novaSenha !==
                    confirmarNovaSenha
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "A confirmação da nova senha não confere"
                        });
                }


                if (
                    ehProprioUsuario
                ) {

                    if (
                        !senhaAtual
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
                            senhaAtual,
                            usuarioAtual.senha_hash
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
                }


                novoHash =
                    await bcrypt.hash(
                        novaSenha,
                        10
                    );
            }


            const resultado =
                await pool.query(
                    `
                    UPDATE usuario

                    SET
                        nome = $1,
                        email = $2,

                        senha_hash =
                            COALESCE(
                                $3,
                                senha_hash
                            ),

                        atualizado_em =
                            NOW()

                    WHERE
                        id = $4
                        AND universidade_id = $5

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
                        novoHash,
                        usuarioId,
                        universidadeId
                    ]
                );


            if (
                ehProprioUsuario
            ) {

                req.session.usuario.nome =
                    resultado.rows[0]
                        .nome;


                req.session.usuario.email =
                    resultado.rows[0]
                        .email;
            }


            res.json({

                mensagem:
                    pretendeAlterarSenha
                        ? "Conta e senha atualizadas com sucesso"
                        : "Conta atualizada com sucesso",

                usuario:
                    resultado.rows[0]
            });


        } catch (erro) {

            console.error(
                "Erro ao editar conta institucional:",
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


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao atualizar a conta"
                });
        }
    }
);


module.exports =
    router;