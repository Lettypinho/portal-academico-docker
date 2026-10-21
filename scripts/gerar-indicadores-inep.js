const fs = require("fs");

const path = require("path");

const XLSX = require("xlsx");


// =========================================================
// CAMINHOS
// =========================================================

const ROOT =
    path.join(
        __dirname,
        ".."
    );


const RAW =
    path.join(
        ROOT,
        "dados",
        "raw"
    );


const OUTPUT =
    path.join(
        ROOT,
        "sql",
        "indicadores_qualidade_inep.sql"
    );


// =========================================================
// ARQUIVOS
// =========================================================

const ARQUIVOS = {

    enade:
        path.join(
            RAW,
            "conceito_enade_2023.xlsx"
        ),

    cpc:
        path.join(
            RAW,
            "CPC_2023.xlsx"
        ),

    idd:
        path.join(
            RAW,
            "IDD_2023.xlsx"
        ),

    igc:
        path.join(
            RAW,
            "IGC_2023.xlsx"
        )
};


// =========================================================
// AUXILIARES
// =========================================================

function normalizarCabecalho(
    valor
) {

    return String(
        valor ?? ""
    )
        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .toLowerCase()

        .replace(
            /[^a-z0-9]+/g,
            " "
        )

        .trim()

        .replace(
            /\s+/g,
            " "
        );
}


// =========================================================
// CONVERTER LINHA PARA CHAVES NORMALIZADAS
// =========================================================

function normalizarLinha(
    linha
) {

    const resultado = {};


    for (
        const [
            chave,
            valor
        ]
        of Object.entries(
            linha
        )
    ) {

        resultado[
            normalizarCabecalho(
                chave
            )
        ] =
            valor;
    }


    return resultado;
}


// =========================================================
// PEGAR CAMPO
// =========================================================

function campo(
    linha,
    ...nomes
) {

    for (
        const nome
        of nomes
    ) {

        const chave =
            normalizarCabecalho(
                nome
            );


        if (
            Object.prototype
                .hasOwnProperty
                .call(
                    linha,
                    chave
                )
        ) {

            return linha[
                chave
            ];
        }
    }


    return null;
}


// =========================================================
// CÓDIGO
// =========================================================

function codigo(
    valor
) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return null;
    }


    if (
        typeof valor ===
        "number"
    ) {

        return String(
            Math.trunc(
                valor
            )
        );
    }


    const texto =
        String(valor)
            .trim();


    if (
        /^\d+\.0+$/.test(
            texto
        )
    ) {

        return texto
            .replace(
                /\.0+$/,
                ""
            );
    }


    return texto;
}


// =========================================================
// NÚMERO
// =========================================================

function numero(
    valor
) {

    if (
        valor === null ||
        valor === undefined ||
        valor === "" ||
        valor === "-"
    ) {

        return null;
    }


    if (
        typeof valor ===
        "number"
    ) {

        return Number.isFinite(
            valor
        )
            ? valor
            : null;
    }


    let texto =
        String(valor)
            .trim();


    if (
        !texto ||
        texto === "-"
    ) {

        return null;
    }


    texto =
        texto.replace(
            ",",
            "."
        );


    const convertido =
        Number(texto);


    return Number.isFinite(
        convertido
    )
        ? convertido
        : null;
}


// =========================================================
// INTEIRO
// =========================================================

function inteiro(
    valor
) {

    const convertido =
        numero(
            valor
        );


    if (
        convertido === null
    ) {

        return null;
    }


    return Math.trunc(
        convertido
    );
}


// =========================================================
// TEXTO
// =========================================================

function texto(
    valor
) {

    if (
        valor === null ||
        valor === undefined ||
        valor === "" ||
        valor === "-"
    ) {

        return null;
    }


    return String(
        valor
    ).trim();
}


// =========================================================
// SQL
// =========================================================

function sqlTexto(
    valor
) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "NULL";
    }


    return (
        "'" +
        String(valor)
            .replaceAll(
                "'",
                "''"
            ) +
        "'"
    );
}


function sqlNumero(
    valor
) {

    if (
        valor === null ||
        valor === undefined ||
        !Number.isFinite(
            Number(valor)
        )
    ) {

        return "NULL";
    }


    return String(
        Number(valor)
    );
}


// =========================================================
// LER PLANILHA
// =========================================================

function lerAba(
    arquivo,
    aba
) {

    if (
        !fs.existsSync(
            arquivo
        )
    ) {

        throw new Error(
            `Arquivo não encontrado: ${arquivo}`
        );
    }


    const workbook =
        XLSX.readFile(
            arquivo,
            {
                raw:
                    true
            }
        );


    const worksheet =
        workbook.Sheets[
            aba
        ];


    if (
        !worksheet
    ) {

        throw new Error(
            `Aba "${aba}" não encontrada em ${path.basename(
                arquivo
            )}`
        );
    }


    const linhas =
        XLSX.utils.sheet_to_json(
            worksheet,
            {
                defval:
                    null,

                raw:
                    true
            }
        );


    return linhas.map(
        normalizarLinha
    );
}


// =========================================================
// IGC
// =========================================================

function processarIGC() {

    const linhas =
        lerAba(
            ARQUIVOS.igc,
            "IGC"
        );


    const indicadores = [];


    for (
        const linha
        of linhas
    ) {

        const ano =
            inteiro(
                campo(
                    linha,
                    "Ano"
                )
            );


        const codigoIes =
            codigo(
                campo(
                    linha,
                    "Código da IES"
                )
            );


        if (
            !ano ||
            !codigoIes
        ) {

            continue;
        }


        indicadores.push({

            ano,

            codigoIes,


            cursosComCpc:
                inteiro(
                    campo(
                        linha,
                        "Nº de Cursos com CPC no triênio"
                    )
                ),


            proporcaoGraduacao:
                numero(
                    campo(
                        linha,
                        "Alfa (Proporção de Graduação)"
                    )
                ),


            conceitoGraduacao:
                numero(
                    campo(
                        linha,
                        "Conceito Médio de Graduação"
                    )
                ),


            proporcaoMestrado:
                numero(
                    campo(
                        linha,
                        "Beta (Proporção de Mestrado - Equivalente)"
                    )
                ),


            conceitoMestrado:
                numero(
                    campo(
                        linha,
                        "Conceito Médio de Mestrado"
                    )
                ),


            proporcaoDoutorado:
                numero(
                    campo(
                        linha,
                        "Gama (Proporção de Doutorandos – Equivalente)"
                    )
                ),


            conceitoDoutorado:
                numero(
                    campo(
                        linha,
                        "Conceito Médio do doutorado"
                    )
                ),


            igcContinuo:
                numero(
                    campo(
                        linha,
                        "IGC (Contínuo)"
                    )
                ),


            igcFaixa:
                inteiro(
                    campo(
                        linha,
                        "IGC (Faixa)"
                    )
                )
        });
    }


    return indicadores;
}


// =========================================================
// CRIAR / RECUPERAR CURSO NO MAP
// =========================================================

function obterCurso(
    mapa,
    ano,
    codigoCurso,
    codigoIes
) {

    const chave =
        `${ano}|${codigoCurso}`;


    if (
        !mapa.has(
            chave
        )
    ) {

        mapa.set(
            chave,
            {

                ano,

                codigoCurso,

                codigoIes,

                codigoArea:
                    null,

                areaAvaliacao:
                    null,

                modalidade:
                    null,

                concluintesInscritos:
                    null,

                concluintesParticipantes:
                    null,

                enadeContinuo:
                    null,

                enadeFaixa:
                    null,

                iddContinuo:
                    null,

                iddFaixa:
                    null,

                cpcContinuo:
                    null,

                cpcFaixa:
                    null
            }
        );
    }


    const item =
        mapa.get(
            chave
        );


    if (
        !item.codigoIes
    ) {

        item.codigoIes =
            codigoIes;
    }


    return item;
}


// =========================================================
// ENADE
// =========================================================

function processarEnade(
    mapa
) {

    const linhas =
        lerAba(
            ARQUIVOS.enade,
            "PLANILHA_ENADE"
        );


    let processados =
        0;


    for (
        const linha
        of linhas
    ) {

        const ano =
            inteiro(
                campo(
                    linha,
                    "Ano"
                )
            );


        const codigoCurso =
            codigo(
                campo(
                    linha,
                    "Código do Curso"
                )
            );


        const codigoIes =
            codigo(
                campo(
                    linha,
                    "Código da IES"
                )
            );


        if (
            !ano ||
            !codigoCurso ||
            !codigoIes
        ) {

            continue;
        }


        const item =
            obterCurso(
                mapa,
                ano,
                codigoCurso,
                codigoIes
            );


        item.codigoArea =
            codigo(
                campo(
                    linha,
                    "Código da Área"
                )
            );


        item.areaAvaliacao =
            texto(
                campo(
                    linha,
                    "Área de Avaliação"
                )
            );


        item.modalidade =
            texto(
                campo(
                    linha,
                    "Modalidade de Ensino"
                )
            );


        item.concluintesInscritos =
            inteiro(
                campo(
                    linha,
                    "Nº de Concluintes Inscritos"
                )
            );


        item.concluintesParticipantes =
            inteiro(
                campo(
                    linha,
                    "Nº de Concluintes Participantes"
                )
            );


        item.enadeContinuo =
            numero(
                campo(
                    linha,
                    "Conceito Enade (Contínuo)"
                )
            );


        item.enadeFaixa =
            inteiro(
                campo(
                    linha,
                    "Conceito Enade (Faixa)"
                )
            );


        processados++;
    }


    return processados;
}


// =========================================================
// IDD
// =========================================================

function processarIDD(
    mapa
) {

    const linhas =
        lerAba(
            ARQUIVOS.idd,
            "IDD_2023"
        );


    let processados =
        0;


    for (
        const linha
        of linhas
    ) {

        const ano =
            inteiro(
                campo(
                    linha,
                    "Ano"
                )
            );


        const codigoCurso =
            codigo(
                campo(
                    linha,
                    "Código do Curso"
                )
            );


        const codigoIes =
            codigo(
                campo(
                    linha,
                    "Código da IES"
                )
            );


        if (
            !ano ||
            !codigoCurso ||
            !codigoIes
        ) {

            continue;
        }


        const item =
            obterCurso(
                mapa,
                ano,
                codigoCurso,
                codigoIes
            );


        if (
            !item.codigoArea
        ) {

            item.codigoArea =
                codigo(
                    campo(
                        linha,
                        "Código da Área"
                    )
                );
        }


        if (
            !item.areaAvaliacao
        ) {

            item.areaAvaliacao =
                texto(
                    campo(
                        linha,
                        "Área de Avaliação"
                    )
                );
        }


        if (
            !item.modalidade
        ) {

            item.modalidade =
                texto(
                    campo(
                        linha,
                        "Modalidade de Ensino"
                    )
                );
        }


        item.iddContinuo =
            numero(
                campo(
                    linha,
                    "IDD (Contínuo)"
                )
            );


        item.iddFaixa =
            inteiro(
                campo(
                    linha,
                    "IDD (Faixa)"
                )
            );


        processados++;
    }


    return processados;
}


// =========================================================
// CPC
// =========================================================

function processarCPC(
    mapa
) {

    const linhas =
        lerAba(
            ARQUIVOS.cpc,
            "CPC_2023"
        );


    let processados =
        0;


    for (
        const linha
        of linhas
    ) {

        const ano =
            inteiro(
                campo(
                    linha,
                    "Ano"
                )
            );


        const codigoCurso =
            codigo(
                campo(
                    linha,
                    "Código do Curso"
                )
            );


        const codigoIes =
            codigo(
                campo(
                    linha,
                    "Código da IES"
                )
            );


        if (
            !ano ||
            !codigoCurso ||
            !codigoIes
        ) {

            continue;
        }


        const item =
            obterCurso(
                mapa,
                ano,
                codigoCurso,
                codigoIes
            );


        if (
            !item.codigoArea
        ) {

            item.codigoArea =
                codigo(
                    campo(
                        linha,
                        "Código da Área"
                    )
                );
        }


        if (
            !item.areaAvaliacao
        ) {

            item.areaAvaliacao =
                texto(
                    campo(
                        linha,
                        "Área de Avaliação"
                    )
                );
        }


        if (
            !item.modalidade
        ) {

            item.modalidade =
                texto(
                    campo(
                        linha,
                        "Modalidade de Ensino"
                    )
                );
        }


        if (
            item.concluintesInscritos ===
            null
        ) {

            item.concluintesInscritos =
                inteiro(
                    campo(
                        linha,
                        "Nº de Concluintes Inscritos"
                    )
                );
        }


        if (
            item.concluintesParticipantes ===
            null
        ) {

            item.concluintesParticipantes =
                inteiro(
                    campo(
                        linha,
                        "Nº de Concluintes Participantes"
                    )
                );
        }


        item.cpcContinuo =
            numero(
                campo(
                    linha,
                    "CPC (Contínuo)"
                )
            );


        item.cpcFaixa =
            inteiro(
                campo(
                    linha,
                    "CPC (Faixa)"
                )
            );


        processados++;
    }


    return processados;
}


// =========================================================
// GERAR SQL DO IGC
// =========================================================

function gerarSqlIGC(
    indicadores
) {

    let sql = "";


    sql += `
-- =========================================================
-- INDICADORES IGC
-- Fonte: Inep
-- =========================================================

`;


    for (
        const item
        of indicadores
    ) {

        sql += `
INSERT INTO indicador_ies_inep
(
    universidade_id,
    ano,
    cursos_com_cpc_trienio,
    proporcao_graduacao,
    conceito_medio_graduacao,
    proporcao_mestrado,
    conceito_medio_mestrado,
    proporcao_doutorado,
    conceito_medio_doutorado,
    igc_continuo,
    igc_faixa,
    origem_dados,
    atualizado_em
)

SELECT
    u.id,
    ${sqlNumero(item.ano)},
    ${sqlNumero(item.cursosComCpc)},
    ${sqlNumero(item.proporcaoGraduacao)},
    ${sqlNumero(item.conceitoGraduacao)},
    ${sqlNumero(item.proporcaoMestrado)},
    ${sqlNumero(item.conceitoMestrado)},
    ${sqlNumero(item.proporcaoDoutorado)},
    ${sqlNumero(item.conceitoDoutorado)},
    ${sqlNumero(item.igcContinuo)},
    ${sqlNumero(item.igcFaixa)},
    'INEP',
    NOW()

FROM universidade u

WHERE
    u.codigo =
        ${sqlTexto(item.codigoIes)}

ON CONFLICT (
    universidade_id,
    ano
)

DO UPDATE SET

    cursos_com_cpc_trienio =
        EXCLUDED.cursos_com_cpc_trienio,

    proporcao_graduacao =
        EXCLUDED.proporcao_graduacao,

    conceito_medio_graduacao =
        EXCLUDED.conceito_medio_graduacao,

    proporcao_mestrado =
        EXCLUDED.proporcao_mestrado,

    conceito_medio_mestrado =
        EXCLUDED.conceito_medio_mestrado,

    proporcao_doutorado =
        EXCLUDED.proporcao_doutorado,

    conceito_medio_doutorado =
        EXCLUDED.conceito_medio_doutorado,

    igc_continuo =
        EXCLUDED.igc_continuo,

    igc_faixa =
        EXCLUDED.igc_faixa,

    origem_dados =
        'INEP',

    atualizado_em =
        NOW();

`;
    }


    return sql;
}


// =========================================================
// GERAR SQL DOS CURSOS
// =========================================================

function gerarSqlCursos(
    cursos
) {

    let sql = "";


    sql += `
-- =========================================================
-- INDICADORES DE QUALIDADE DOS CURSOS
-- Enade + IDD + CPC
-- Fonte: Inep
-- =========================================================

`;


    for (
        const item
        of cursos
    ) {

        sql += `
INSERT INTO indicador_curso_inep
(
    universidade_id,
    curso_id,
    ano,
    codigo_area,
    area_avaliacao,
    modalidade_inep,
    concluintes_inscritos,
    concluintes_participantes,
    conceito_enade_continuo,
    conceito_enade_faixa,
    idd_continuo,
    idd_faixa,
    cpc_continuo,
    cpc_faixa,
    origem_dados,
    atualizado_em
)

SELECT
    u.id,
    c.id,
    ${sqlNumero(item.ano)},
    ${sqlTexto(item.codigoArea)},
    ${sqlTexto(item.areaAvaliacao)},
    ${sqlTexto(item.modalidade)},
    ${sqlNumero(item.concluintesInscritos)},
    ${sqlNumero(item.concluintesParticipantes)},
    ${sqlNumero(item.enadeContinuo)},
    ${sqlNumero(item.enadeFaixa)},
    ${sqlNumero(item.iddContinuo)},
    ${sqlNumero(item.iddFaixa)},
    ${sqlNumero(item.cpcContinuo)},
    ${sqlNumero(item.cpcFaixa)},
    'INEP',
    NOW()

FROM curso c

JOIN universidade u

    ON u.id =
        c.universidade_id

WHERE
    c.codigo_inep =
        ${sqlTexto(item.codigoCurso)}

    AND u.codigo =
        ${sqlTexto(item.codigoIes)}

ON CONFLICT (
    curso_id,
    ano
)

DO UPDATE SET

    codigo_area =
        EXCLUDED.codigo_area,

    area_avaliacao =
        EXCLUDED.area_avaliacao,

    modalidade_inep =
        EXCLUDED.modalidade_inep,

    concluintes_inscritos =
        EXCLUDED.concluintes_inscritos,

    concluintes_participantes =
        EXCLUDED.concluintes_participantes,

    conceito_enade_continuo =
        EXCLUDED.conceito_enade_continuo,

    conceito_enade_faixa =
        EXCLUDED.conceito_enade_faixa,

    idd_continuo =
        EXCLUDED.idd_continuo,

    idd_faixa =
        EXCLUDED.idd_faixa,

    cpc_continuo =
        EXCLUDED.cpc_continuo,

    cpc_faixa =
        EXCLUDED.cpc_faixa,

    origem_dados =
        'INEP',

    atualizado_em =
        NOW();

`;
    }


    return sql;
}


// =========================================================
// EXECUÇÃO
// =========================================================

function executar() {

    console.log(
        "=============================================="
    );

    console.log(
        "SIA - Indicadores oficiais do Inep"
    );

    console.log(
        "=============================================="
    );


    console.log(
        "\nLendo IGC..."
    );


    const indicadoresIGC =
        processarIGC();


    console.log(
        `IGC encontrados: ${indicadoresIGC.length}`
    );


    const mapaCursos =
        new Map();


    console.log(
        "\nLendo Conceito Enade..."
    );


    const totalEnade =
        processarEnade(
            mapaCursos
        );


    console.log(
        `Registros Enade: ${totalEnade}`
    );


    console.log(
        "\nLendo IDD..."
    );


    const totalIDD =
        processarIDD(
            mapaCursos
        );


    console.log(
        `Registros IDD: ${totalIDD}`
    );


    console.log(
        "\nLendo CPC..."
    );


    const totalCPC =
        processarCPC(
            mapaCursos
        );


    console.log(
        `Registros CPC: ${totalCPC}`
    );


    const cursos =
        Array.from(
            mapaCursos.values()
        );


    console.log(
        `\nCursos únicos consolidados: ${cursos.length}`
    );


    let sql = `
-- =========================================================
-- SIA - INDICADORES OFICIAIS DE QUALIDADE
-- Fonte: Inep
--
-- Gerado automaticamente.
--
-- NÃO editar manualmente.
-- =========================================================


BEGIN;

`;


    sql +=
        gerarSqlIGC(
            indicadoresIGC
        );


    sql +=
        gerarSqlCursos(
            cursos
        );


    sql += `

COMMIT;


-- =========================================================
-- CONFERÊNCIA
-- =========================================================


SELECT
    ano,
    COUNT(*) AS total_ies

FROM indicador_ies_inep

GROUP BY ano

ORDER BY ano DESC;


SELECT
    ano,
    COUNT(*) AS total_cursos

FROM indicador_curso_inep

GROUP BY ano

ORDER BY ano DESC;


-- =========================================================
-- IFAL
-- =========================================================

SELECT
    *

FROM vw_qualidade_ies_inep

WHERE
    sigla = 'IFAL'

ORDER BY ano DESC;


SELECT
    instituicao,
    sigla,
    curso,
    grau_academico,
    modalidade,
    ano,
    conceito_enade_faixa,
    idd_faixa,
    cpc_faixa

FROM vw_qualidade_curso_inep

WHERE
    sigla = 'IFAL'

ORDER BY
    curso,
    ano DESC;


-- =========================================================
-- AMOSTRA NACIONAL
-- =========================================================

SELECT
    instituicao,
    sigla,
    estado,
    ano,
    igc_continuo,
    igc_faixa

FROM vw_qualidade_ies_inep

WHERE
    igc_faixa IS NOT NULL

ORDER BY
    igc_continuo DESC NULLS LAST

LIMIT 20;
`;


    fs.writeFileSync(
        OUTPUT,
        sql,
        "utf8"
    );


    const tamanho =
        fs.statSync(
            OUTPUT
        ).size;


    console.log();
    console.log(
        "=============================================="
    );

    console.log(
        "GERAÇÃO CONCLUÍDA"
    );

    console.log(
        "=============================================="
    );


    console.log(
        `Arquivo: ${OUTPUT}`
    );


    console.log(
        `Tamanho: ${(tamanho / 1024 / 1024).toFixed(2)} MB`
    );
}


try {

    executar();


} catch (erro) {

    console.error();
    console.error(
        "ERRO:"
    );

    console.error(
        erro
    );


    process.exit(1);
}