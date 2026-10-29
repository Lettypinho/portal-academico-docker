const express = require("express");
const bcrypt = require("bcryptjs");

const pool = require("../config/database");

const {
    exigirPerfil
} = require("../middleware/auth");


const router = express.Router();


// =========================================================
// TODAS AS ROTAS EXIGEM ADMIN DA INSTITUIÇÃO
// =========================================================

router.use(
    exigirPerfil(
        "admin_universidade"
    )
);


// =========================================================
// UTILITÁRIOS
// =========================================================

function idValido(valor) {

    const id = Number(valor);

    return (
        Number.isInteger(id) &&
        id > 0
    );
}


function emailValido(email) {

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


            res.status(500).json({
                erro:
                    "Erro ao carregar resumo administrativo"
            });
        }
    }
);


// =========================================================
// LISTAR SOLICITAÇÕES
// =========================================================

router.get(
    "/solicitacoes",
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
                "Erro ao listar solicitações da instituição:",
                erro
            );


            res.status(500).json({
                erro:
                    "Erro ao consultar solicitações"
            });
        }
    }
);


// =========================================================
// APROVAR SOLICITAÇÃO
// =========================================================

router.patch(
    "/solicitacoes/:id/aprovar",
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
                resultadoSolicitacao
                    .rows
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

                    WHERE id = $1

                    FOR UPDATE
                    `,
                    [
                        solicitacao.usuario_id
                    ]
                );


            if (
                resultadoUsuario
                    .rows
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
                resultadoUsuario.rows[0];


            if (!usuario.ativo) {

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
                    String(
                        req.body
                            .perfil_funcionario ||
                        ""
                    )
                        .trim();


                const perfisFuncionario = [
                    "consulta_institucional",
                    "gestor",
                    "admin_universidade"
                ];


                if (
                    !perfisFuncionario.includes(
                        novoPerfil
                    )
                ) {

                    await client.query(
                        "ROLLBACK"
                    );


                    return res
                        .status(400)
                        .json({
                            erro:
                                "Selecione a permissão do funcionário"
                        });
                }


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

                    WHERE id = $3

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


            await client.query(
                `
                UPDATE solicitacao_vinculo

                SET
                    status = 'aprovado',
                    analisado_por = $1,
                    analisado_em = NOW(),
                    atualizado_em = NOW(),
                    observacao_analise = NULL

                WHERE id = $2
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
                // nenhuma ação necessária
            }


            console.error(
                "Erro ao aprovar solicitação:",
                erro
            );


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


            res.status(500).json({
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


            res.status(500).json({
                erro:
                    "Erro ao rejeitar solicitação"
            });
        }
    }
);


// =========================================================
// USUÁRIOS DA PRÓPRIA INSTITUIÇÃO
// =========================================================

router.get(
    "/usuarios",
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


            res.status(500).json({
                erro:
                    "Erro ao consultar usuários vinculados"
            });
        }
    }
);


// =========================================================
// EDITAR CONTA
//
// Permite ao admin:
// - nome
// - e-mail
// - perfil de outros funcionários
// - redefinir senha de outro usuário
//
// Na própria conta:
// - nome
// - e-mail
// - senha, exigindo a senha atual
// - NÃO permite remover o próprio perfil de administrador
// =========================================================

router.patch(
    "/usuarios/:id/conta",
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


            let nome =
                String(
                    req.body.nome ||
                    ""
                )
                    .trim();


            let email =
                String(
                    req.body.email ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const perfil =
                String(
                    req.body.perfil ||
                    ""
                )
                    .trim();


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


            // =================================================
            // DADOS BÁSICOS
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


            // =================================================
            // GARANTIR QUE A CONTA PERTENCE À MESMA IES
            // =================================================

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


            // =================================================
            // PERFIL
            // =================================================

            if (
                usuarioAtual.perfil ===
                "aluno"
            ) {

                if (
                    perfil !==
                    "aluno"
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "O perfil de aluno não pode ser convertido por esta operação"
                        });
                }


            } else {

                const perfisFuncionario = [
                    "consulta_institucional",
                    "gestor",
                    "admin_universidade"
                ];


                if (
                    !perfisFuncionario.includes(
                        perfil
                    )
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Permissão inválida"
                        });
                }
            }


            // =================================================
            // NÃO DEIXAR ADMIN REMOVER O PRÓPRIO ACESSO
            // =================================================

            if (
                ehProprioUsuario &&
                perfil !==
                "admin_universidade"
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Você não pode remover o próprio acesso de administrador. Essa alteração deve ser feita pelo super administrador."
                    });
            }


            // =================================================
            // E-MAIL ÚNICO
            // =================================================

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


            // =================================================
            // SENHA
            // =================================================

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


                // =============================================
                // NA PRÓPRIA CONTA, EXIGIR SENHA ATUAL
                // =============================================

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
                                    "Informe sua senha atual para alterar a própria senha"
                            });
                    }


                    const senhaCorreta =
                        await bcrypt.compare(
                            senhaAtual,
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
                            novaSenha,
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
                        novaSenha,
                        10
                    );
            }


            // =================================================
            // ATUALIZAR CONTA
            // =================================================

            let resultado;


            if (
                novoHash
            ) {

                resultado =
                    await pool.query(
                        `
                        UPDATE usuario

                        SET
                            nome = $1,
                            email = $2,
                            perfil = $3,
                            senha_hash = $4,
                            atualizado_em = NOW()

                        WHERE
                            id = $5
                            AND universidade_id = $6

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
                            novoHash,
                            usuarioId,
                            universidadeId
                        ]
                    );


            } else {

                resultado =
                    await pool.query(
                        `
                        UPDATE usuario

                        SET
                            nome = $1,
                            email = $2,
                            perfil = $3,
                            atualizado_em = NOW()

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
                            perfil,
                            usuarioId,
                            universidadeId
                        ]
                    );
            }


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
            // SE EDITOU A PRÓPRIA CONTA,
            // ATUALIZAR A SESSÃO
            // =================================================

            if (
                ehProprioUsuario
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


            res.status(500).json({
                erro:
                    "Erro ao atualizar a conta"
            });
        }
    }
);


// =========================================================
// ROTA ANTIGA DE PERFIL
//
// Mantida para compatibilidade com versões anteriores
// do frontend.
// =========================================================

router.patch(
    "/usuarios/:id/perfil",
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


            const novoPerfil =
                String(
                    req.body.perfil ||
                    ""
                )
                    .trim();


            const perfisPermitidos = [
                "consulta_institucional",
                "gestor",
                "admin_universidade"
            ];


            if (
                !perfisPermitidos.includes(
                    novoPerfil
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Permissão inválida"
                    });
            }


            const atual =
                await pool.query(
                    `
                    SELECT

                        id,
                        perfil,
                        universidade_id

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


            if (
                atual.rows[0].perfil ===
                "aluno"
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "O perfil de aluno não pode ser convertido em perfil administrativo"
                    });
            }


            if (
                administradorId ===
                    usuarioId &&
                novoPerfil !==
                    "admin_universidade"
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Você não pode remover o próprio acesso de administrador"
                    });
            }


            const resultado =
                await pool.query(
                    `
                    UPDATE usuario

                    SET
                        perfil = $1,
                        atualizado_em = NOW()

                    WHERE
                        id = $2
                        AND universidade_id = $3

                    RETURNING

                        id,
                        nome,
                        email,
                        perfil,
                        ativo,
                        atualizado_em
                    `,
                    [
                        novoPerfil,
                        usuarioId,
                        universidadeId
                    ]
                );


            res.json({

                mensagem:
                    "Permissão atualizada com sucesso",

                usuario:
                    resultado.rows[0]
            });


        } catch (erro) {

            console.error(
                "Erro ao alterar permissão institucional:",
                erro
            );


            res.status(500).json({
                erro:
                    "Erro ao alterar permissão"
            });
        }
    }
);


module.exports =
    router;