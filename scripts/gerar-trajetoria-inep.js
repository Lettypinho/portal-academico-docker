const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { once } = require("events");


// =========================================================
// CONFIGURAÇÃO
// =========================================================

const RAIZ =
    path.join(__dirname, "..");


const ARQUIVO =
    path.join(
        RAIZ,
        "dados",
        "raw",
        "indicadores_trajetoria_educacao_superior_2015_2024.csv"
    );


const SAIDA =
    path.join(
        RAIZ,
        "sql",
        "indicadores_trajetoria_inep.sql"
    );


// =========================================================
// UTILITÁRIOS
// =========================================================

function limpar(valor) {

    return String(
        valor ?? ""
    )
        .replace(/^\uFEFF/, "")
        .trim();
}


function parseLinhaCSV(
    linha,
    separador = ";"
) {

    const campos = [];

    let atual = "";
    let dentroAspas = false;


    for (
        let i = 0;
        i < linha.length;
        i++
    ) {

        const caractere =
            linha[i];


        if (
            caractere === '"'
        ) {

            if (
                dentroAspas &&
                linha[i + 1] === '"'
            ) {

                atual += '"';

                i++;

            } else {

                dentroAspas =
                    !dentroAspas;
            }


            continue;
        }


        if (
            caractere === separador &&
            !dentroAspas
        ) {

            campos.push(
                atual
            );

            atual = "";

            continue;
        }


        atual +=
            caractere;
    }


    campos.push(
        atual
    );


    return campos;
}


function criarIndice(
    cabecalho
) {

    const indice = {};


    cabecalho.forEach(
        (
            coluna,
            posicao
        ) => {

            const nome =
                limpar(coluna);


            if (nome) {

                indice[nome] =
                    posicao;
            }
        }
    );


    return indice;
}


function colunaObrigatoria(
    indice,
    ...nomes
) {

    for (
        const nome
        of nomes
    ) {

        if (
            indice[nome] !==
            undefined
        ) {

            return indice[nome];
        }
    }


    throw new Error(
        `Coluna não encontrada: ${nomes.join(" / ")}`
    );
}


function obter(
    linha,
    posicao
) {

    if (
        posicao === null ||
        posicao === undefined
    ) {

        return "";
    }


    return limpar(
        linha[posicao]
    );
}


function codigo(
    valor
) {

    const texto =
        limpar(valor);


    if (!texto) {
        return "";
    }


    if (
        /^\d+\.0+$/.test(
            texto
        )
    ) {

        return texto.replace(
            /\.0+$/,
            ""
        );
    }


    return texto;
}


function numero(
    valor
) {

    const texto =
        limpar(valor);


    if (
        !texto ||
        texto === "-"
    ) {

        return "";
    }


    const convertido =
        Number(
            texto.replace(
                ",",
                "."
            )
        );


    if (
        !Number.isFinite(
            convertido
        )
    ) {

        return "";
    }


    return String(
        convertido
    );
}


function inteiro(
    valor
) {

    const convertido =
        numero(valor);


    if (!convertido) {
        return "";
    }


    return String(
        Math.trunc(
            Number(convertido)
        )
    );
}


// =========================================================
// ESCREVER RESPEITANDO BACKPRESSURE
// =========================================================

async function escrever(
    stream,
    conteudo
) {

    if (
        !stream.write(
            conteudo
        )
    ) {

        await once(
            stream,
            "drain"
        );
    }
}


// =========================================================
// EXECUÇÃO
// =========================================================

async function executar() {

    console.log(
        "=============================================="
    );

    console.log(
        "SIA - Indicadores de Trajetória do Inep"
    );

    console.log(
        "=============================================="
    );


    if (
        !fs.existsSync(
            ARQUIVO
        )
    ) {

        throw new Error(
            `Arquivo não encontrado: ${ARQUIVO}`
        );
    }


    fs.mkdirSync(
        path.dirname(
            SAIDA
        ),
        {
            recursive: true
        }
    );


    const entrada =
        fs.createReadStream(
            ARQUIVO,
            {
                encoding: "utf8"
            }
        );


    const leitor =
        readline.createInterface({
            input: entrada,
            crlfDelay: Infinity
        });


    const saida =
        fs.createWriteStream(
            SAIDA,
            {
                encoding: "utf8"
            }
        );


    console.log(
        "\nLendo CSV em modo streaming..."
    );


    // =====================================================
    // CABEÇALHO DO SQL
    // =====================================================

    await escrever(
        saida,
        `-- =========================================================
-- SIA - INDICADORES DE TRAJETÓRIA
-- Fonte: Inep
-- Coorte 2015 - acompanhamento até 2024
--
-- Gerado automaticamente.
-- NÃO editar manualmente.
-- =========================================================


BEGIN;


CREATE TEMP TABLE tmp_trajetoria_inep
(
    codigo_ies TEXT,
    codigo_curso TEXT,

    codigo_uf INTEGER,
    codigo_municipio BIGINT,

    ano_ingresso INTEGER,
    ano_referencia INTEGER,

    prazo_integralizacao INTEGER,
    ano_integralizacao INTEGER,

    prazo_acompanhamento INTEGER,
    ano_maximo_acompanhamento INTEGER,

    ingressantes INTEGER,

    permanencia_quantidade INTEGER,
    concluintes_quantidade INTEGER,
    desistentes_quantidade INTEGER,
    falecidos_quantidade INTEGER,

    taxa_permanencia NUMERIC(12,8),
    taxa_conclusao_acumulada NUMERIC(12,8),
    taxa_desistencia_acumulada NUMERIC(12,8),

    taxa_conclusao_anual NUMERIC(12,8),
    taxa_desistencia_anual NUMERIC(12,8)
);


COPY tmp_trajetoria_inep
(
    codigo_ies,
    codigo_curso,

    codigo_uf,
    codigo_municipio,

    ano_ingresso,
    ano_referencia,

    prazo_integralizacao,
    ano_integralizacao,

    prazo_acompanhamento,
    ano_maximo_acompanhamento,

    ingressantes,

    permanencia_quantidade,
    concluintes_quantidade,
    desistentes_quantidade,
    falecidos_quantidade,

    taxa_permanencia,
    taxa_conclusao_acumulada,
    taxa_desistencia_acumulada,

    taxa_conclusao_anual,
    taxa_desistencia_anual
)

FROM STDIN

WITH
(
    FORMAT csv,
    DELIMITER ';',
    NULL ''
);
`
    );


    let indice =
        null;


    let colunas =
        null;


    let cabecalhoEncontrado =
        false;


    let total =
        0;


    let ignorados =
        0;


    let numeroLinha =
        0;


    // =====================================================
    // LEITURA LINHA A LINHA
    // =====================================================

    for await (
        const linhaTexto
        of leitor
    ) {

        numeroLinha++;


        if (
            !linhaTexto.trim()
        ) {

            continue;
        }


        const linha =
            parseLinhaCSV(
                linhaTexto
            );


        // =================================================
        // ENCONTRAR CABEÇALHO TÉCNICO
        // =================================================

        if (
            !cabecalhoEncontrado
        ) {

            const primeira =
                limpar(
                    linha[0]
                );


            if (
                primeira !==
                "CO_IES"
            ) {

                continue;
            }


            indice =
                criarIndice(
                    linha
                );


            colunas = {

                ies:
                    colunaObrigatoria(
                        indice,
                        "CO_IES"
                    ),

                curso:
                    colunaObrigatoria(
                        indice,
                        "CO_CURSO"
                    ),

                uf:
                    colunaObrigatoria(
                        indice,
                        "CO_UF"
                    ),

                municipio:
                    colunaObrigatoria(
                        indice,
                        "CO_MUNICIPIO"
                    ),

                anoIngresso:
                    colunaObrigatoria(
                        indice,
                        "NU_ANO_INGRESSO"
                    ),

                anoReferencia:
                    colunaObrigatoria(
                        indice,
                        "NU_ANO_REFERENCIA"
                    ),

                prazoIntegralizacao:
                    colunaObrigatoria(
                        indice,
                        "NU_PRAZO_INTEGRALIZACAO"
                    ),

                anoIntegralizacao:
                    colunaObrigatoria(
                        indice,
                        "NU_ANO_INTEGRALIZACAO"
                    ),

                prazoAcompanhamento:
                    colunaObrigatoria(
                        indice,
                        "NU_PRAZO_ACOMPANHAMENTO"
                    ),

                anoMaximo:
                    colunaObrigatoria(
                        indice,
                        "NU_ANO_MAXIMO_ACOMPANHAMENTO"
                    ),

                ingressantes:
                    colunaObrigatoria(
                        indice,
                        "QT_INGRESSANTE"
                    ),

                permanencia:
                    colunaObrigatoria(
                        indice,
                        "QT_PERMANENCIA"
                    ),

                concluintes:
                    colunaObrigatoria(
                        indice,
                        "QT_CONCLUINTE"
                    ),

                desistentes:
                    colunaObrigatoria(
                        indice,
                        "QT_DESISTENCIA"
                    ),

                falecidos:
                    colunaObrigatoria(
                        indice,
                        "QT_FALECIDO"
                    ),

                tap:
                    colunaObrigatoria(
                        indice,
                        "TAP"
                    ),

                tca:
                    colunaObrigatoria(
                        indice,
                        "TCA"
                    ),

                tda:
                    colunaObrigatoria(
                        indice,
                        "TDA"
                    ),

                tcan:
                    colunaObrigatoria(
                        indice,
                        "TCAN"
                    ),

                tdan:
                    colunaObrigatoria(
                        indice,
                        "TADA",
                        "TDAN"
                    )
            };


            cabecalhoEncontrado =
                true;


            console.log(
                `Cabeçalho encontrado na linha ${numeroLinha}.`
            );


            continue;
        }


        // =================================================
        // DADOS
        // =================================================

        const codigoIes =
            codigo(
                obter(
                    linha,
                    colunas.ies
                )
            );


        const codigoCurso =
            codigo(
                obter(
                    linha,
                    colunas.curso
                )
            );


        const anoIngresso =
            inteiro(
                obter(
                    linha,
                    colunas.anoIngresso
                )
            );


        const anoReferencia =
            inteiro(
                obter(
                    linha,
                    colunas.anoReferencia
                )
            );


        if (
            !codigoIes ||
            !codigoCurso ||
            !anoIngresso ||
            !anoReferencia
        ) {

            ignorados++;

            continue;
        }


        const valores = [

            codigoIes,

            codigoCurso,

            inteiro(
                obter(
                    linha,
                    colunas.uf
                )
            ),

            inteiro(
                obter(
                    linha,
                    colunas.municipio
                )
            ),

            anoIngresso,

            anoReferencia,

            inteiro(
                obter(
                    linha,
                    colunas.prazoIntegralizacao
                )
            ),

            inteiro(
                obter(
                    linha,
                    colunas.anoIntegralizacao
                )
            ),

            inteiro(
                obter(
                    linha,
                    colunas.prazoAcompanhamento
                )
            ),

            inteiro(
                obter(
                    linha,
                    colunas.anoMaximo
                )
            ),

            inteiro(
                obter(
                    linha,
                    colunas.ingressantes
                )
            ),

            inteiro(
                obter(
                    linha,
                    colunas.permanencia
                )
            ),

            inteiro(
                obter(
                    linha,
                    colunas.concluintes
                )
            ),

            inteiro(
                obter(
                    linha,
                    colunas.desistentes
                )
            ),

            inteiro(
                obter(
                    linha,
                    colunas.falecidos
                )
            ),

            numero(
                obter(
                    linha,
                    colunas.tap
                )
            ),

            numero(
                obter(
                    linha,
                    colunas.tca
                )
            ),

            numero(
                obter(
                    linha,
                    colunas.tda
                )
            ),

            numero(
                obter(
                    linha,
                    colunas.tcan
                )
            ),

            numero(
                obter(
                    linha,
                    colunas.tdan
                )
            )
        ];


        await escrever(
            saida,
            valores.join(";") +
            "\n"
        );


        total++;


        if (
            total % 50000 ===
            0
        ) {

            console.log(
                `${total} registros processados...`
            );
        }
    }


    if (
        !cabecalhoEncontrado
    ) {

        throw new Error(
            "Cabeçalho CO_IES não encontrado no CSV."
        );
    }


    // =====================================================
    // FINAL DO SQL
    // =====================================================

    await escrever(
        saida,
        `\\.


INSERT INTO indicador_trajetoria_curso_inep
(
    universidade_id,
    curso_id,

    ano_ingresso,
    ano_referencia,

    codigo_uf_curso,
    codigo_municipio_curso,

    prazo_integralizacao,
    ano_integralizacao,

    prazo_acompanhamento,
    ano_maximo_acompanhamento,

    ingressantes,

    permanencia_quantidade,
    concluintes_quantidade,
    desistentes_quantidade,
    falecidos_quantidade,

    taxa_permanencia,
    taxa_conclusao_acumulada,
    taxa_desistencia_acumulada,

    taxa_conclusao_anual,
    taxa_desistencia_anual,

    origem_dados,
    atualizado_em
)


SELECT DISTINCT ON
(
    c.id,
    t.ano_ingresso,
    t.ano_referencia
)

    u.id,

    c.id,

    t.ano_ingresso,

    t.ano_referencia,

    t.codigo_uf,

    t.codigo_municipio,

    t.prazo_integralizacao,

    t.ano_integralizacao,

    t.prazo_acompanhamento,

    t.ano_maximo_acompanhamento,

    t.ingressantes,

    t.permanencia_quantidade,

    t.concluintes_quantidade,

    t.desistentes_quantidade,

    t.falecidos_quantidade,

    t.taxa_permanencia,

    t.taxa_conclusao_acumulada,

    t.taxa_desistencia_acumulada,

    t.taxa_conclusao_anual,

    t.taxa_desistencia_anual,

    'INEP',

    NOW()


FROM tmp_trajetoria_inep t


JOIN universidade u

    ON u.codigo =
        t.codigo_ies


JOIN curso c

    ON c.codigo_inep =
        t.codigo_curso

    AND c.universidade_id =
        u.id


ORDER BY

    c.id,

    t.ano_ingresso,

    t.ano_referencia


ON CONFLICT
(
    curso_id,
    ano_ingresso,
    ano_referencia
)

DO UPDATE SET

    codigo_uf_curso =
        EXCLUDED.codigo_uf_curso,

    codigo_municipio_curso =
        EXCLUDED.codigo_municipio_curso,

    prazo_integralizacao =
        EXCLUDED.prazo_integralizacao,

    ano_integralizacao =
        EXCLUDED.ano_integralizacao,

    prazo_acompanhamento =
        EXCLUDED.prazo_acompanhamento,

    ano_maximo_acompanhamento =
        EXCLUDED.ano_maximo_acompanhamento,

    ingressantes =
        EXCLUDED.ingressantes,

    permanencia_quantidade =
        EXCLUDED.permanencia_quantidade,

    concluintes_quantidade =
        EXCLUDED.concluintes_quantidade,

    desistentes_quantidade =
        EXCLUDED.desistentes_quantidade,

    falecidos_quantidade =
        EXCLUDED.falecidos_quantidade,

    taxa_permanencia =
        EXCLUDED.taxa_permanencia,

    taxa_conclusao_acumulada =
        EXCLUDED.taxa_conclusao_acumulada,

    taxa_desistencia_acumulada =
        EXCLUDED.taxa_desistencia_acumulada,

    taxa_conclusao_anual =
        EXCLUDED.taxa_conclusao_anual,

    taxa_desistencia_anual =
        EXCLUDED.taxa_desistencia_anual,

    origem_dados =
        'INEP',

    atualizado_em =
        NOW();


COMMIT;


-- =========================================================
-- CONFERÊNCIA
-- =========================================================


SELECT

    COUNT(*) AS registros_trajetoria,

    COUNT(
        DISTINCT curso_id
    ) AS cursos_com_trajetoria,

    MIN(
        ano_referencia
    ) AS primeiro_ano,

    MAX(
        ano_referencia
    ) AS ultimo_ano

FROM indicador_trajetoria_curso_inep;


SELECT

    ano_referencia,

    COUNT(*) AS registros

FROM indicador_trajetoria_curso_inep

GROUP BY
    ano_referencia

ORDER BY
    ano_referencia;


SELECT

    instituicao,

    sigla,

    cidade,

    estado,

    curso,

    modalidade,

    ano_ingresso,

    ano_referencia,

    taxa_permanencia,

    taxa_conclusao_acumulada,

    taxa_desistencia_acumulada

FROM vw_trajetoria_curso_inep

WHERE
    sigla = 'IFAL'

    AND ano_referencia = 2024

ORDER BY
    curso

LIMIT 20;
`
    );


    saida.end();


    await once(
        saida,
        "finish"
    );


    const tamanho =
        fs.statSync(
            SAIDA
        ).size;


    console.log(
        "\n=============================================="
    );

    console.log(
        "PROCESSAMENTO CONCLUÍDO"
    );

    console.log(
        "=============================================="
    );


    console.log(
        `Registros processados: ${total}`
    );


    console.log(
        `Registros ignorados: ${ignorados}`
    );


    console.log(
        `Arquivo: ${SAIDA}`
    );


    console.log(
        `Tamanho: ${(tamanho / 1024 / 1024).toFixed(2)} MB`
    );
}


// =========================================================
// INICIAR
// =========================================================

executar()
    .catch(
        erro => {

            console.error(
                "\nERRO:"
            );

            console.error(
                erro
            );

            process.exit(1);
        }
    );