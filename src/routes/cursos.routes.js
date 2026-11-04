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


// =========================================================
// NORMALIZAR CAMPI
// =========================================================

function normalizarCampusIds(
    corpo
) {

    let valores =
        [];


    if (
        Array.isArray(
            corpo.campus_ids
        )
    ) {

        valores =
            corpo.campus_ids;

    } else if (
        corpo.campus_id !==
            undefined &&
        corpo.campus_id !==
            null &&
        corpo.campus_id !==
            ""
    ) {

        valores = [
            corpo.campus_id
        ];
    }


    const resultado =
        [];


    for (
        const valor
        of valores
    ) {

        const id =
            Number(
                valor
            );


        if (
            !idValido(
                id
            )
        ) {

            return null;
        }


        if (
            !resultado.includes(
                id
            )
        ) {

            resultado.push(
                id
            );
        }
    }


    return resultado;
}


// =========================================================
// VALIDAR CAMPI DA INSTITUIÇÃO
// =========================================================

async function validarCampiInstituicao(
    cliente,
    universidadeId,
    campusIds
) {

    if (
        campusIds.length ===
        0
    ) {

        return true;
    }


    const resultado =
        await cliente.query(
            `
            SELECT
                id

            FROM campus

            WHERE
                universidade_id = $1

                AND ativo = TRUE

                AND id =
                    ANY(
                        $2::int[]
                    )
            `,
            [
                universidadeId,
                campusIds
            ]
        );


    return (
        resultado.rows.length ===
        campusIds.length
    );
}


// =========================================================
// SUBSTITUIR VÍNCULOS CURSO -> CAMPI
// =========================================================

async function substituirCampiCurso(
    cliente,
    cursoId,
    universidadeId,
    campusIds
) {

    await cliente.query(
        `
        UPDATE curso_campus

        SET
            ativo = FALSE,
            atualizado_em = NOW()

        WHERE
            curso_id = $1
        `,
        [
            cursoId
        ]
    );


    for (
        const campusId
        of campusIds
    ) {

        await cliente.query(
            `
            INSERT INTO curso_campus
            (
                universidade_id,
                curso_id,
                campus_id,
                ativo,
                criado_em,
                atualizado_em
            )

            VALUES
            (
                $1,
                $2,
                $3,
                TRUE,
                NOW(),
                NOW()
            )

            ON CONFLICT
            (
                curso_id,
                campus_id
            )

            DO UPDATE SET

                universidade_id =
                    EXCLUDED.universidade_id,

                ativo =
                    TRUE,

                atualizado_em =
                    NOW()
            `,
            [
                universidadeId,
                cursoId,
                campusId
            ]
        );
    }


    // =====================================================
    // COMPATIBILIDADE TEMPORÁRIA
    //
    // curso.campus_id ainda existe durante a migração.
    // Guardamos o primeiro campus selecionado.
    // =====================================================

    await cliente.query(
        `
        UPDATE curso

        SET
            campus_id = $1

        WHERE
            id = $2
        `,
        [
            campusIds[0] ||
                null,

            cursoId
        ]
    );
}


// =========================================================
// CAMPOS DE CAMPI
//
// O LATERAL devolve:
// - campus_ids
// - campi
// - primeiro campus para compatibilidade com telas antigas
// =========================================================

const lateralCampi = `

    LEFT JOIN LATERAL
    (
        SELECT

            ARRAY_AGG(
                ca.id

                ORDER BY
                    ca.principal DESC,
                    ca.nome
            )
                AS campus_ids,


            JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'id',
                    ca.id,

                    'nome',
                    ca.nome,

                    'endereco',
                    ca.endereco,

                    'numero',
                    ca.numero,

                    'bairro',
                    ca.bairro,

                    'cidade',
                    ca.cidade,

                    'estado',
                    ca.estado,

                    'cep',
                    ca.cep,

                    'latitude',
                    ca.latitude,

                    'longitude',
                    ca.longitude,

                    'principal',
                    ca.principal
                )

                ORDER BY
                    ca.principal DESC,
                    ca.nome
            )
                AS campi,


            (
                ARRAY_AGG(
                    ca.id

                    ORDER BY
                        ca.principal DESC,
                        ca.nome
                )
            )[1]
                AS campus_id,


            (
                ARRAY_AGG(
                    ca.nome

                    ORDER BY
                        ca.principal DESC,
                        ca.nome
                )
            )[1]
                AS campus_nome,


            (
                ARRAY_AGG(
                    ca.endereco

                    ORDER BY
                        ca.principal DESC,
                        ca.nome
                )
            )[1]
                AS campus_endereco,


            (
                ARRAY_AGG(
                    ca.numero

                    ORDER BY
                        ca.principal DESC,
                        ca.nome
                )
            )[1]
                AS campus_numero,


            (
                ARRAY_AGG(
                    ca.bairro

                    ORDER BY
                        ca.principal DESC,
                        ca.nome
                )
            )[1]
                AS campus_bairro,


            (
                ARRAY_AGG(
                    ca.cidade

                    ORDER BY
                        ca.principal DESC,
                        ca.nome
                )
            )[1]
                AS campus_cidade,


            (
                ARRAY_AGG(
                    ca.estado

                    ORDER BY
                        ca.principal DESC,
                        ca.nome
                )
            )[1]
                AS campus_estado,


            (
                ARRAY_AGG(
                    ca.cep

                    ORDER BY
                        ca.principal DESC,
                        ca.nome
                )
            )[1]
                AS campus_cep,


            (
                ARRAY_AGG(
                    ca.latitude

                    ORDER BY
                        ca.principal DESC,
                        ca.nome
                )
            )[1]
                AS campus_latitude,


            (
                ARRAY_AGG(
                    ca.longitude

                    ORDER BY
                        ca.principal DESC,
                        ca.nome
                )
            )[1]
                AS campus_longitude


        FROM curso_campus cc

        INNER JOIN campus ca
            ON ca.id =
                cc.campus_id

        WHERE
            cc.curso_id =
                c.id

            AND cc.ativo =
                TRUE

            AND ca.ativo =
                TRUE

    ) vinculos
        ON TRUE
`;


// =========================================================
// LISTAGEM PÚBLICA
// =========================================================

router.get(
    "/",

    async (req, res) => {

        try {

            const {
                universidade_id,
                campus_id,
                nome,
                modalidade,
                grau,
                estado,
                cidade,
                limite
            } =
                req.query;


            let limiteConsulta =
                Number.parseInt(
                    limite,
                    10
                );


            if (
                !Number.isInteger(
                    limiteConsulta
                ) ||
                limiteConsulta <= 0
            ) {

                limiteConsulta =
                    nome
                        ? 100
                        : 500;
            }


            limiteConsulta =
                Math.min(
                    limiteConsulta,
                    500
                );


            const parametros =
                [];


            const filtros = [
                "c.status = 'Ativo'",
                "u.ativo = TRUE"
            ];


            // =================================================
            // INSTITUIÇÃO
            // =================================================

            if (
                universidade_id
            ) {

                const universidadeId =
                    Number(
                        universidade_id
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
                                "Instituição inválida"
                        });
                }


                parametros.push(
                    universidadeId
                );


                filtros.push(
                    `c.universidade_id = $${parametros.length}`
                );
            }


            // =================================================
            // CAMPUS
            // =================================================

            if (
                campus_id
            ) {

                const campusId =
                    Number(
                        campus_id
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


                parametros.push(
                    campusId
                );


                filtros.push(
                    `
                    EXISTS
                    (
                        SELECT 1

                        FROM curso_campus cc_filtro

                        INNER JOIN campus ca_filtro
                            ON ca_filtro.id =
                                cc_filtro.campus_id

                        WHERE
                            cc_filtro.curso_id =
                                c.id

                            AND cc_filtro.campus_id =
                                $${parametros.length}

                            AND cc_filtro.ativo =
                                TRUE

                            AND ca_filtro.ativo =
                                TRUE
                    )
                    `
                );
            }


            // =================================================
            // NOME
            // =================================================

            if (
                nome &&
                String(
                    nome
                ).trim()
            ) {

                parametros.push(
                    `%${String(
                        nome
                    ).trim()}%`
                );


                filtros.push(
                    `c.nome ILIKE $${parametros.length}`
                );
            }


            // =================================================
            // ESTADO
            // =================================================

            if (
                estado &&
                String(
                    estado
                ).trim()
            ) {

                parametros.push(
                    String(
                        estado
                    )
                        .trim()
                        .toUpperCase()
                );


                filtros.push(
                    `u.estado = $${parametros.length}`
                );
            }


            // =================================================
            // CIDADE
            // =================================================

            if (
                cidade &&
                String(
                    cidade
                ).trim()
            ) {

                parametros.push(
                    String(
                        cidade
                    ).trim()
                );


                filtros.push(
                    `LOWER(u.cidade) = LOWER($${parametros.length})`
                );
            }


            // =================================================
            // MODALIDADE
            // =================================================

            if (
                modalidade &&
                String(
                    modalidade
                ).trim()
            ) {

                parametros.push(
                    String(
                        modalidade
                    ).trim()
                );


                filtros.push(
                    `c.modalidade = $${parametros.length}`
                );
            }


            // =================================================
            // GRAU
            // =================================================

            if (
                grau &&
                String(
                    grau
                ).trim()
            ) {

                parametros.push(
                    String(
                        grau
                    ).trim()
                );


                filtros.push(
                    `c.grau_academico = $${parametros.length}`
                );
            }


            parametros.push(
                limiteConsulta
            );


            const indiceLimite =
                parametros.length;


            const resultado =
                await pool.query(
                    `
                    SELECT

                        c.id,

                        c.codigo_inep,

                        c.nome,

                        c.grau_academico,

                        c.nivel_academico,

                        c.modalidade,

                        c.duracao_semestres,

                        c.carga_horaria,

                        c.situacao_inep,

                        c.status,

                        c.ano_censo,

                        c.origem_dados,


                        u.id
                            AS universidade_id,

                        u.codigo
                            AS universidade_codigo,

                        u.nome
                            AS universidade,

                        u.sigla
                            AS universidade_sigla,

                        u.cidade,

                        u.estado,

                        u.organizacao_academica,

                        u.categoria_administrativa,


                        COALESCE(
                            vinculos.campus_ids,
                            ARRAY[]::INTEGER[]
                        )
                            AS campus_ids,


                        COALESCE(
                            vinculos.campi,
                            '[]'::JSONB
                        )
                            AS campi,


                        vinculos.campus_id,

                        vinculos.campus_nome,

                        vinculos.campus_endereco,

                        vinculos.campus_numero,

                        vinculos.campus_bairro,

                        vinculos.campus_cidade,

                        vinculos.campus_estado,

                        vinculos.campus_cep,

                        vinculos.campus_latitude,

                        vinculos.campus_longitude


                    FROM curso c

                    INNER JOIN universidade u
                        ON u.id =
                            c.universidade_id


                    ${lateralCampi}


                    WHERE
                        ${filtros.join(
                            " AND "
                        )}


                    ORDER BY
                        c.nome,
                        u.estado,
                        u.cidade,
                        u.nome


                    LIMIT
                        $${indiceLimite}
                    `,
                    parametros
                );


            res.json(
                resultado.rows
            );


        } catch (erro) {

            console.error(
                "Erro ao consultar cursos:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao consultar cursos"
                });
        }
    }
);


// =========================================================
// CURSOS DA PRÓPRIA INSTITUIÇÃO
// =========================================================

router.get(
    "/minha-universidade",

    exigirPermissao(
        "VISUALIZAR_DADOS_INSTITUCIONAIS"
    ),

    async (req, res) => {

        try {

            const usuario =
                req.session.usuario;


            const universidadeId =
                Number(
                    usuario.universidade_id
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
                            "O usuário não está vinculado a uma instituição"
                    });
            }


            const resultado =
                await pool.query(
                    `
                    SELECT

                        c.id,

                        c.codigo_inep,

                        c.nome,

                        c.grau_academico,

                        c.nivel_academico,

                        c.modalidade,

                        c.duracao_semestres,

                        c.carga_horaria,

                        c.situacao_inep,

                        c.status,

                        c.ano_censo,

                        c.origem_dados,


                        COALESCE(
                            vinculos.campus_ids,
                            ARRAY[]::INTEGER[]
                        )
                            AS campus_ids,


                        COALESCE(
                            vinculos.campi,
                            '[]'::JSONB
                        )
                            AS campi,


                        vinculos.campus_id,

                        vinculos.campus_nome,

                        vinculos.campus_cidade,

                        vinculos.campus_estado


                    FROM curso c


                    ${lateralCampi}


                    WHERE
                        c.universidade_id =
                            $1


                    ORDER BY
                        c.nome,
                        c.modalidade
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
                "Erro ao consultar cursos da instituição:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao consultar cursos"
                });
        }
    }
);


// =========================================================
// CADASTRAR CURSO
// =========================================================

router.post(
    "/",

    exigirPermissao(
        "GERENCIAR_CURSOS"
    ),

    async (req, res) => {

        const cliente =
            await pool.connect();


        try {

            const usuario =
                req.session.usuario;


            let {
                universidade_id,
                nome,
                modalidade,
                duracao_semestres,
                grau_academico,
                carga_horaria
            } =
                req.body;


            const campusIds =
                normalizarCampusIds(
                    req.body
                );


            if (
                campusIds ===
                null
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Campus inválido"
                    });
            }


            if (
                !nome ||
                !String(
                    nome
                ).trim() ||
                !modalidade
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Preencha os campos obrigatórios"
                    });
            }


            // =================================================
            // INSTITUIÇÃO
            // =================================================

            if (
                usuario.perfil !==
                "super_admin"
            ) {

                universidade_id =
                    usuario.universidade_id;
            }


            if (
                usuario.perfil ===
                    "super_admin" &&
                !universidade_id
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe a instituição"
                    });
            }


            universidade_id =
                Number(
                    universidade_id
                );


            if (
                !idValido(
                    universidade_id
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Instituição inválida"
                    });
            }


            const instituicao =
                await cliente.query(
                    `
                    SELECT
                        id

                    FROM universidade

                    WHERE
                        id = $1

                        AND ativo = TRUE

                    LIMIT 1
                    `,
                    [
                        universidade_id
                    ]
                );


            if (
                instituicao.rows.length ===
                0
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Instituição inválida"
                    });
            }


            // =================================================
            // CAMPI
            // =================================================

            const campiValidos =
                await validarCampiInstituicao(
                    cliente,
                    universidade_id,
                    campusIds
                );


            if (
                !campiValidos
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Um ou mais campi não pertencem à instituição"
                    });
            }


            // =================================================
            // MODALIDADE
            // =================================================

            const modalidadesPermitidas = [
                "Presencial",
                "EAD"
            ];


            if (
                !modalidadesPermitidas.includes(
                    modalidade
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Modalidade inválida"
                    });
            }


            // =================================================
            // GRAU
            // =================================================

            if (
                grau_academico &&
                ![
                    "Bacharelado",
                    "Licenciatura",
                    "Tecnológico"
                ].includes(
                    grau_academico
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Grau acadêmico inválido"
                    });
            }


            // =================================================
            // DURAÇÃO
            // =================================================

            let duracaoSemestres =
                null;


            if (
                duracao_semestres !==
                    undefined &&
                duracao_semestres !==
                    null &&
                duracao_semestres !==
                    ""
            ) {

                duracaoSemestres =
                    Number(
                        duracao_semestres
                    );


                if (
                    !Number.isInteger(
                        duracaoSemestres
                    ) ||
                    duracaoSemestres <= 0
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Duração do curso inválida"
                        });
                }
            }


            // =================================================
            // CARGA HORÁRIA
            // =================================================

            let cargaHoraria =
                null;


            if (
                carga_horaria !==
                    undefined &&
                carga_horaria !==
                    null &&
                carga_horaria !==
                    ""
            ) {

                cargaHoraria =
                    Number(
                        carga_horaria
                    );


                if (
                    !Number.isFinite(
                        cargaHoraria
                    ) ||
                    cargaHoraria <= 0
                ) {

                    return res
                        .status(400)
                        .json({
                            erro:
                                "Carga horária inválida"
                        });
                }
            }


            await cliente.query(
                "BEGIN"
            );


            // =================================================
            // CURSO
            // =================================================

            const resultado =
                await cliente.query(
                    `
                    INSERT INTO curso
                    (
                        universidade_id,

                        campus_id,

                        nome,

                        modalidade,

                        duracao_semestres,

                        grau_academico,

                        nivel_academico,

                        carga_horaria,

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
                        'Graduação',
                        $7,
                        'SIA'
                    )

                    RETURNING
                        *
                    `,
                    [
                        universidade_id,

                        campusIds[0] ||
                            null,

                        String(
                            nome
                        ).trim(),

                        modalidade,

                        duracaoSemestres,

                        grau_academico ||
                            null,

                        cargaHoraria
                    ]
                );


            const curso =
                resultado.rows[0];


            // =================================================
            // VÍNCULOS
            // =================================================

            await substituirCampiCurso(
                cliente,
                curso.id,
                universidade_id,
                campusIds
            );


            await cliente.query(
                "COMMIT"
            );


            res
                .status(201)
                .json({

                    ...curso,

                    campus_ids:
                        campusIds
                });


        } catch (erro) {

            await cliente.query(
                "ROLLBACK"
            );


            if (
                erro.code ===
                "23505"
            ) {

                return res
                    .status(409)
                    .json({
                        erro:
                            "Este curso já está cadastrado"
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
                            "Dados do curso inválidos"
                    });
            }


            console.error(
                "Erro ao cadastrar curso:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao cadastrar curso"
                });


        } finally {

            cliente.release();
        }
    }
);


// =========================================================
// ALTERAR VÁRIOS CAMPI DE UM CURSO
// =========================================================

router.patch(
    "/:id/campi",

    exigirPermissao(
        "GERENCIAR_CURSOS"
    ),

    async (req, res) => {

        const cliente =
            await pool.connect();


        try {

            const usuario =
                req.session.usuario;


            const cursoId =
                Number(
                    req.params.id
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


            if (
                !Array.isArray(
                    req.body.campus_ids
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe campus_ids como uma lista"
                    });
            }


            const campusIds =
                normalizarCampusIds(
                    req.body
                );


            if (
                campusIds ===
                null
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Um ou mais campi são inválidos"
                    });
            }


            const cursoResultado =
                await cliente.query(
                    `
                    SELECT
                        id,
                        universidade_id,
                        nome,
                        modalidade

                    FROM curso

                    WHERE
                        id = $1

                    LIMIT 1
                    `,
                    [
                        cursoId
                    ]
                );


            if (
                cursoResultado.rows.length ===
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
                cursoResultado.rows[0];


            // =================================================
            // ESCOPO INSTITUCIONAL
            // =================================================

            if (
                usuario.perfil !==
                    "super_admin" &&
                Number(
                    usuario.universidade_id
                ) !==
                    Number(
                        curso.universidade_id
                    )
            ) {

                return res
                    .status(403)
                    .json({
                        erro:
                            "Você só pode alterar cursos da sua instituição"
                    });
            }


            // =================================================
            // VALIDAR CAMPI
            // =================================================

            const campiValidos =
                await validarCampiInstituicao(
                    cliente,
                    curso.universidade_id,
                    campusIds
                );


            if (
                !campiValidos
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Um ou mais campi não pertencem à instituição"
                    });
            }


            await cliente.query(
                "BEGIN"
            );


            await substituirCampiCurso(
                cliente,
                curso.id,
                curso.universidade_id,
                campusIds
            );


            await cliente.query(
                "COMMIT"
            );


            res.json({

                mensagem:
                    "Campi do curso atualizados com sucesso",

                curso: {

                    id:
                        curso.id,

                    universidade_id:
                        curso.universidade_id,

                    nome:
                        curso.nome,

                    modalidade:
                        curso.modalidade,

                    campus_ids:
                        campusIds
                }
            });


        } catch (erro) {

            await cliente.query(
                "ROLLBACK"
            );


            console.error(
                "Erro ao alterar campi do curso:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao alterar campi do curso"
                });


        } finally {

            cliente.release();
        }
    }
);


// =========================================================
// COMPATIBILIDADE COM ENDPOINT ANTIGO
//
// Continua aceitando:
// PATCH /api/cursos/:id/campus
//
// Porém substitui os vínculos pelo único campus informado.
// =========================================================

router.patch(
    "/:id/campus",

    exigirPermissao(
        "GERENCIAR_CURSOS"
    ),

    async (req, res) => {

        const cliente =
            await pool.connect();


        try {

            const usuario =
                req.session.usuario;


            const cursoId =
                Number(
                    req.params.id
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


            const cursoResultado =
                await cliente.query(
                    `
                    SELECT
                        id,
                        universidade_id,
                        nome,
                        modalidade

                    FROM curso

                    WHERE
                        id = $1

                    LIMIT 1
                    `,
                    [
                        cursoId
                    ]
                );


            if (
                cursoResultado.rows.length ===
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
                cursoResultado.rows[0];


            if (
                usuario.perfil !==
                    "super_admin" &&
                Number(
                    usuario.universidade_id
                ) !==
                    Number(
                        curso.universidade_id
                    )
            ) {

                return res
                    .status(403)
                    .json({
                        erro:
                            "Você só pode alterar cursos da sua instituição"
                    });
            }


            const campusIds =
                normalizarCampusIds({
                    campus_id:
                        req.body.campus_id
                });


            if (
                campusIds ===
                null
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Campus inválido"
                    });
            }


            const campiValidos =
                await validarCampiInstituicao(
                    cliente,
                    curso.universidade_id,
                    campusIds
                );


            if (
                !campiValidos
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "O campus informado não pertence à instituição"
                    });
            }


            await cliente.query(
                "BEGIN"
            );


            await substituirCampiCurso(
                cliente,
                curso.id,
                curso.universidade_id,
                campusIds
            );


            await cliente.query(
                "COMMIT"
            );


            res.json({

                mensagem:
                    "Campus do curso atualizado com sucesso",

                curso: {

                    id:
                        curso.id,

                    universidade_id:
                        curso.universidade_id,

                    nome:
                        curso.nome,

                    modalidade:
                        curso.modalidade,

                    campus_id:
                        campusIds[0] ||
                        null,

                    campus_ids:
                        campusIds
                }
            });


        } catch (erro) {

            await cliente.query(
                "ROLLBACK"
            );


            console.error(
                "Erro ao alterar campus do curso:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao alterar campus do curso"
                });


        } finally {

            cliente.release();
        }
    }
);


module.exports =
    router;