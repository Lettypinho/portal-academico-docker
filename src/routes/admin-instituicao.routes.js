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
                Number(
                    req.session.usuario
                        .universidade_id
                );


            const administradorId =
                Number(
                    req.session.usuario.id
                );


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


            // =================================================
            // ALUNO
            //
            // Ao aprovar uma solicitação de aluno, além de
            // atualizar o perfil do usuário, também criamos ou
            // reativamos o registro acadêmico na tabela aluno.
            // =================================================

            if (
                novoPerfil ===
                "aluno"
            ) {

                const matricula =
                    String(
                        solicitacao.matricula ||
                        ""
                    )
                        .trim();


                if (
                    !idValido(
                        solicitacao.curso_id
                    ) ||
                    !matricula
                ) {

                    await client.query(
                        "ROLLBACK"
                    );


                    return res
                        .status(400)
                        .json({
                            erro:
                                "A solicitação do aluno não possui curso ou matrícula válidos"
                        });
                }


                // ---------------------------------------------
                // O curso precisa pertencer à mesma instituição.
                // ---------------------------------------------

                const cursoValido =
                    await client.query(
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
                            solicitacao.curso_id,
                            universidadeId
                        ]
                    );


                if (
                    cursoValido.rows.length ===
                    0
                ) {

                    await client.query(
                        "ROLLBACK"
                    );


                    return res
                        .status(400)
                        .json({
                            erro:
                                "O curso informado não pertence à instituição ou está inativo"
                        });
                }


                // ---------------------------------------------
                // Procurar registro acadêmico existente.
                //
                // Pode ser um aluno já existente na base
                // acadêmica que ainda não tinha conta vinculada.
                // ---------------------------------------------

                const alunosExistentes =
                    await client.query(
                        `
                        SELECT

                            id,
                            usuario_id,
                            matricula,
                            email,
                            status

                        FROM aluno

                        WHERE
                            universidade_id = $1

                            AND (
                                matricula = $2
                                OR LOWER(email) = LOWER($3)
                                OR usuario_id = $4
                            )

                        FOR UPDATE
                        `,
                        [
                            universidadeId,
                            matricula,
                            usuario.email,
                            usuario.id
                        ]
                    );


                // ---------------------------------------------
                // Matrícula e e-mail apontando para alunos
                // diferentes representam conflito.
                // ---------------------------------------------

                if (
                    alunosExistentes.rows.length >
                    1
                ) {

                    await client.query(
                        "ROLLBACK"
                    );


                    return res
                        .status(409)
                        .json({
                            erro:
                                "Existem registros acadêmicos conflitantes para esta matrícula ou e-mail"
                        });
                }


                if (
                    alunosExistentes.rows.length ===
                    1
                ) {

                    const alunoExistente =
                        alunosExistentes.rows[0];


                    // -----------------------------------------
                    // Não permitir tomar o vínculo de outra conta.
                    // -----------------------------------------

                    if (
                        alunoExistente.usuario_id !==
                            null &&
                        Number(
                            alunoExistente.usuario_id
                        ) !==
                        Number(
                            usuario.id
                        )
                    ) {

                        await client.query(
                            "ROLLBACK"
                        );


                        return res
                            .status(409)
                            .json({
                                erro:
                                    "Este registro acadêmico já está vinculado a outra conta"
                            });
                    }


                    await client.query(
                        `
                        UPDATE aluno

                        SET
                            usuario_id = $1,
                            curso_id = $2,
                            matricula = $3,
                            nome = $4,
                            email = $5,
                            status = 'Ativo',
                            atualizado_em = NOW()

                        WHERE
                            id = $6
                        `,
                        [
                            usuario.id,
                            solicitacao.curso_id,
                            matricula,
                            usuario.nome,
                            usuario.email,
                            alunoExistente.id
                        ]
                    );


                } else {

                    await client.query(
                        `
                        INSERT INTO aluno
                        (
                            usuario_id,
                            universidade_id,
                            curso_id,
                            matricula,
                            nome,
                            email,
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
                            'Ativo'
                        )
                        `,
                        [
                            usuario.id,
                            universidadeId,
                            solicitacao.curso_id,
                            matricula,
                            usuario.nome,
                            usuario.email
                        ]
                    );
                }
            }


            // =================================================
            // ATUALIZAR PERFIL DO USUÁRIO
            // =================================================

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


            // =================================================
            // MARCAR SOLICITAÇÃO COMO APROVADA
            // =================================================

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


            if (
                erro.code ===
                "23505"
            ) {

                return res
                    .status(409)
                    .json({
                        erro:
                            "Já existe um aluno utilizando esta matrícula, e-mail ou conta"
                    });
            }


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

                        u.id,
                        u.nome,
                        u.email,
                        u.perfil,
                        u.ativo,
                        u.criado_em,
                        u.atualizado_em,

                        a.id
                            AS aluno_id,

                        a.matricula,

                        a.status
                            AS aluno_status,

                        a.curso_id,

                        c.nome
                            AS curso

                    FROM usuario u

                    LEFT JOIN aluno a
                        ON a.usuario_id =
                            u.id

                    LEFT JOIN curso c
                        ON c.id =
                            a.curso_id

                    WHERE
                        u.universidade_id = $1

                    ORDER BY
                        u.nome
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
// =========================================================

router.patch(
    "/usuarios/:id/conta",

    exigirPermissao(
        "GERENCIAR_USUARIOS"
    ),

    exigirUniversidade,

    async (req, res) => {

        const client =
            await pool.connect();


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
                await client.query(
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
                await client.query(
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


            await client.query(
                "BEGIN"
            );


            const resultado =
                await client.query(
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


            // =================================================
            // MANTER ALUNO ACADÊMICO SINCRONIZADO
            // =================================================

            if (
                usuarioAtual.perfil ===
                "aluno"
            ) {

                await client.query(
                    `
                    UPDATE aluno

                    SET
                        nome = $1,
                        email = $2,
                        atualizado_em = NOW()

                    WHERE
                        usuario_id = $3
                        AND universidade_id = $4
                    `,
                    [
                        nome,
                        email,
                        usuarioId,
                        universidadeId
                    ]
                );
            }


            await client.query(
                "COMMIT"
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

            try {

                await client.query(
                    "ROLLBACK"
                );

            } catch {
                // nenhuma ação
            }


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


        } finally {

            client.release();
        }
    }
);


// =========================================================
// DESVINCULAR ALUNO
//
// A conta NÃO é excluída.
// O usuário volta a ser público.
// O registro acadêmico fica inativo.
// O histórico da solicitação fica como revogado.
// =========================================================

router.patch(
    "/usuarios/:id/desvincular-aluno",

    exigirPermissao(
        "GERENCIAR_VINCULOS"
    ),

    exigirUniversidade,

    async (req, res) => {

        const client =
            await pool.connect();


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
                            "Aluno inválido"
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


            await client.query(
                "BEGIN"
            );


            const resultadoUsuario =
                await client.query(
                    `
                    SELECT

                        id,
                        nome,
                        email,
                        perfil,
                        universidade_id

                    FROM usuario

                    WHERE
                        id = $1
                        AND universidade_id = $2

                    FOR UPDATE
                    `,
                    [
                        usuarioId,
                        universidadeId
                    ]
                );


            if (
                resultadoUsuario.rows.length ===
                0
            ) {

                await client.query(
                    "ROLLBACK"
                );


                return res
                    .status(404)
                    .json({
                        erro:
                            "Aluno não encontrado nesta instituição"
                    });
            }


            const usuario =
                resultadoUsuario.rows[0];


            if (
                usuario.perfil !==
                "aluno"
            ) {

                await client.query(
                    "ROLLBACK"
                );


                return res
                    .status(400)
                    .json({
                        erro:
                            "Este usuário não possui perfil de aluno"
                    });
            }


            // =================================================
            // INATIVAR REGISTRO ACADÊMICO
            // =================================================

            await client.query(
                `
                UPDATE aluno

                SET
                    status = 'Inativo',
                    usuario_id = NULL,
                    atualizado_em = NOW()

                WHERE
                    usuario_id = $1
                    AND universidade_id = $2
                `,
                [
                    usuarioId,
                    universidadeId
                ]
            );


            // =================================================
            // USUÁRIO VOLTA A SER PÚBLICO
            // =================================================

            await client.query(
                `
                UPDATE usuario

                SET
                    perfil = 'publico',
                    universidade_id = NULL,
                    atualizado_em = NOW()

                WHERE
                    id = $1
                `,
                [
                    usuarioId
                ]
            );


            // =================================================
            // REVOGAR SOLICITAÇÕES APROVADAS
            // =================================================

            await client.query(
                `
                UPDATE solicitacao_vinculo

                SET
                    status = 'revogado',

                    observacao_analise =
                        'Vínculo de aluno revogado pela instituição',

                    analisado_por = $1,
                    analisado_em = NOW(),
                    atualizado_em = NOW()

                WHERE
                    usuario_id = $2
                    AND universidade_id = $3
                    AND tipo_vinculo = 'aluno'
                    AND status = 'aprovado'
                `,
                [
                    administradorId,
                    usuarioId,
                    universidadeId
                ]
            );


            await client.query(
                "COMMIT"
            );


            res.json({

                mensagem:
                    "Aluno desvinculado com sucesso"
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
                "Erro ao desvincular aluno:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao desvincular aluno"
                });


        } finally {

            client.release();
        }
    }
);


module.exports =
    router;