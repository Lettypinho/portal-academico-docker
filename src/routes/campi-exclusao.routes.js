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


            const consulta =
                await client.query(
                    `
                    SELECT
                        id,
                        universidade_id,
                        nome,
                        status_aprovacao

                    FROM campus

                    WHERE
                        id = $1

                        AND status_aprovacao <>
                            'excluido'

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
                            "Campus não encontrado"
                    });
            }


            const campus =
                consulta.rows[0];


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


            await client.query(
                "BEGIN"
            );


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
                        ativo = FALSE,

                        principal = FALSE,

                        status_aprovacao =
                            'excluido',

                        atualizado_em =
                            NOW()

                    WHERE
                        id = $1

                    RETURNING *
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