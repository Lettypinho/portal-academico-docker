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
// EXCLUIR CAMPUS
//
// Exclusão lógica:
// - desativa campus;
// - remove condição de campus principal;
// - desativa vínculos curso <-> campus;
// - limpa coluna antiga curso.campus_id;
// - preserva histórico.
// =========================================================

router.delete(
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


            const resultadoCampus =
                await client.query(
                    `
                    SELECT

                        id,

                        universidade_id,

                        nome,

                        ativo,

                        principal

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
                resultadoCampus.rows.length ===
                0
            ) {

                return res
                    .status(404)
                    .json({
                        erro:
                            "Campus não encontrado"
                    });
            }


            const campus =
                resultadoCampus.rows[0];


            // =================================================
            // ESCOPO DA INSTITUIÇÃO
            // =================================================

            if (
                usuario.perfil !==
                    "super_admin" &&
                Number(
                    usuario.universidade_id
                ) !==
                    Number(
                        campus.universidade_id
                    )
            ) {

                return res
                    .status(403)
                    .json({
                        erro:
                            "Você só pode excluir campi da sua instituição"
                    });
            }


            if (
                campus.ativo ===
                false
            ) {

                return res.json({

                    mensagem:
                        "Campus já está excluído",

                    campus
                });
            }


            await client.query(
                "BEGIN"
            );


            // =================================================
            // DESATIVAR VÍNCULOS COM CURSOS
            // =================================================

            await client.query(
                `
                UPDATE curso_campus

                SET
                    ativo = FALSE,

                    atualizado_em =
                        NOW()

                WHERE
                    campus_id = $1

                    AND ativo = TRUE
                `,
                [
                    campusId
                ]
            );


            // =================================================
            // COMPATIBILIDADE COM MODELO ANTIGO
            // =================================================

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


            // =================================================
            // DESATIVAR CAMPUS
            // =================================================

            const resultado =
                await client.query(
                    `
                    UPDATE campus

                    SET

                        ativo = FALSE,

                        principal = FALSE,

                        atualizado_em =
                            NOW()

                    WHERE
                        id = $1

                    RETURNING

                        id,

                        universidade_id,

                        nome,

                        ativo,

                        principal,

                        atualizado_em
                    `,
                    [
                        campusId
                    ]
                );


            await client.query(
                "COMMIT"
            );


            res.json({

                mensagem:
                    "Campus excluído com sucesso",

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


            console.error(
                "Erro ao excluir campus:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao excluir campus"
                });


        } finally {

            client.release();
        }
    }
);


module.exports =
    router;