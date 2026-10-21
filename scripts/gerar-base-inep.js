const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { TextDecoder } = require("util");


// =========================================================
// CONFIGURAÇÃO
// =========================================================

const ANO_CENSO = 2024;

const RAIZ =
    path.join(__dirname, "..");

const PASTA_RAW =
    path.join(
        RAIZ,
        "dados",
        "raw"
    );

const PASTA_SQL =
    path.join(
        RAIZ,
        "sql"
    );

const ARQUIVO_IES =
    path.join(
        PASTA_RAW,
        "MICRODADOS_CADASTRO_IES_2024.csv"
    );

const ARQUIVO_CURSOS =
    path.join(
        PASTA_RAW,
        "MICRODADOS_CADASTRO_CURSOS_2024.csv"
    );

const SAIDA_IES =
    path.join(
        PASTA_SQL,
        "instituicoes_brasil.sql"
    );

const SAIDA_CURSOS =
    path.join(
        PASTA_SQL,
        "cursos_brasil.sql"
    );


// =========================================================
// MAPAS
// =========================================================

const ORGANIZACOES = {
    "1": "Universidade",
    "2": "Centro Universitário",
    "3": "Faculdade",
    "4": "Instituto Federal",
    "5": "Centro Federal de Educação Tecnológica"
};


const CATEGORIAS = {
    "1": "Pública Federal",
    "2": "Pública Estadual",
    "3": "Pública Municipal",
    "4": "Privada com fins lucrativos",
    "5": "Privada sem fins lucrativos",
    "7": "Especial"
};


const GRAUS = {
    "1": "Bacharelado",
    "2": "Licenciatura",
    "3": "Tecnológico"
};


const MODALIDADES = {
    "1": "Presencial",
    "2": "EAD"
};


// =========================================================
// UTILITÁRIOS
// =========================================================

function limpar(valor) {

    return String(
        valor ?? ""
    )
        .replace(
            /^\uFEFF/,
            ""
        )
        .trim();
}


function sqlTexto(valor) {

    const texto =
        limpar(valor);


    if (!texto) {
        return "NULL";
    }


    return `'${texto.replaceAll(
        "'",
        "''"
    )}'`;
}


function sqlNumero(valor) {

    const texto =
        limpar(valor)
            .replace(",", ".");


    if (!texto) {
        return "NULL";
    }


    const numero =
        Number(texto);


    if (
        !Number.isFinite(numero)
    ) {
        return "NULL";
    }


    return String(
        Math.round(numero)
    );
}


// =========================================================
// ENCODING
// =========================================================

function detectarEncoding(
    arquivo
) {

    const fd =
        fs.openSync(
            arquivo,
            "r"
        );


    const buffer =
        Buffer.alloc(
            65536
        );


    const quantidade =
        fs.readSync(
            fd,
            buffer,
            0,
            buffer.length,
            0
        );


    fs.closeSync(fd);


    const amostra =
        buffer.subarray(
            0,
            quantidade
        );


    try {

        const decoder =
            new TextDecoder(
                "utf-8",
                {
                    fatal: true
                }
            );


        decoder.decode(
            amostra
        );


        return "utf8";


    } catch {

        return "latin1";
    }
}


// =========================================================
// PARSER DE UMA LINHA CSV
// =========================================================

function parseLinhaCSV(
    linha,
    separador = ";"
) {

    const campos = [];

    let campo = "";

    let dentroAspas =
        false;


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

                campo += '"';

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
                campo
            );

            campo = "";

            continue;
        }


        campo +=
            caractere;
    }


    campos.push(
        campo
    );


    return campos;
}


// =========================================================
// CABEÇALHO
// =========================================================

function criarIndice(
    cabecalho
) {

    const indice = {};


    cabecalho.forEach(
        (
            coluna,
            posicao
        ) => {

            indice[
                limpar(coluna)
            ] =
                posicao;
        }
    );


    return indice;
}


function encontrarColuna(
    indice,
    candidatos,
    obrigatoria = true
) {

    for (
        const candidato
        of candidatos
    ) {

        if (
            indice[candidato] !==
            undefined
        ) {

            return indice[
                candidato
            ];
        }
    }


    if (obrigatoria) {

        throw new Error(
            `Coluna não encontrada: ${candidatos.join(" / ")}`
        );
    }


    return null;
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


// =========================================================
// VALIDAR ARQUIVOS
// =========================================================

function validarArquivos() {

    const faltando = [];


    if (
        !fs.existsSync(
            ARQUIVO_IES
        )
    ) {

        faltando.push(
            ARQUIVO_IES
        );
    }


    if (
        !fs.existsSync(
            ARQUIVO_CURSOS
        )
    ) {

        faltando.push(
            ARQUIVO_CURSOS
        );
    }


    if (
        faltando.length
    ) {

        console.error(
            "\nArquivos não encontrados:\n"
        );


        faltando.forEach(
            arquivo =>
                console.error(
                    arquivo
                )
        );


        process.exit(1);
    }
}


// =========================================================
// PROCESSAR IES
// =========================================================

async function processarIes() {

    console.log(
        "\nLendo instituições..."
    );


    const encoding =
        detectarEncoding(
            ARQUIVO_IES
        );


    const input =
        fs.createReadStream(
            ARQUIVO_IES,
            {
                encoding
            }
        );


    const rl =
        readline.createInterface({
            input,
            crlfDelay: Infinity
        });


    let primeiraLinha =
        true;

    let indice =
        null;

    let colCodigo;
    let colNome;
    let colSigla;
    let colOrganizacao;
    let colCategoria;
    let colCidade;
    let colEstado;


    const instituicoes =
        new Map();


    for await (
        const linhaTexto
        of rl
    ) {

        if (
            !linhaTexto.trim()
        ) {
            continue;
        }


        const linha =
            parseLinhaCSV(
                linhaTexto
            );


        if (primeiraLinha) {

            primeiraLinha =
                false;


            indice =
                criarIndice(
                    linha
                );


            colCodigo =
                encontrarColuna(
                    indice,
                    ["CO_IES"]
                );


            colNome =
                encontrarColuna(
                    indice,
                    ["NO_IES"]
                );


            colSigla =
                encontrarColuna(
                    indice,
                    ["SG_IES"],
                    false
                );


            colOrganizacao =
                encontrarColuna(
                    indice,
                    [
                        "TP_ORGANIZACAO_ACADEMICA"
                    ]
                );


            colCategoria =
                encontrarColuna(
                    indice,
                    [
                        "TP_CATEGORIA_ADMINISTRATIVA"
                    ]
                );


            colCidade =
                encontrarColuna(
                    indice,
                    [
                        "NO_MUNICIPIO_IES",
                        "NO_MUNICIPIO"
                    ]
                );


            colEstado =
                encontrarColuna(
                    indice,
                    [
                        "SG_UF_IES",
                        "SG_UF"
                    ]
                );


            continue;
        }


        const codigo =
            obter(
                linha,
                colCodigo
            );


        const nome =
            obter(
                linha,
                colNome
            );


        const sigla =
            obter(
                linha,
                colSigla
            );


        const codigoOrganizacao =
            obter(
                linha,
                colOrganizacao
            );


        const codigoCategoria =
            obter(
                linha,
                colCategoria
            );


        const cidade =
            obter(
                linha,
                colCidade
            );


        const estado =
            obter(
                linha,
                colEstado
            )
                .toUpperCase();


        if (
            !codigo ||
            !nome ||
            !cidade ||
            estado.length !== 2
        ) {

            continue;
        }


        instituicoes.set(
            codigo,
            {
                codigo,
                nome,
                sigla,
                cidade,
                estado,

                codigoOrganizacao,

                organizacao:
                    ORGANIZACOES[
                        codigoOrganizacao
                    ] || null,

                codigoCategoria,

                categoria:
                    CATEGORIAS[
                        codigoCategoria
                    ] || null
            }
        );
    }


    return Array.from(
        instituicoes.values()
    );
}


// =========================================================
// GERAR SQL IES
// =========================================================

function gerarSqlIes(
    instituicoes
) {

    instituicoes.sort(
        (
            a,
            b
        ) =>
            a.nome.localeCompare(
                b.nome,
                "pt-BR"
            )
    );


    const valores =
        instituicoes.map(
            ies => `(
    ${sqlTexto(ies.codigo)},
    ${sqlTexto(ies.nome)},
    ${sqlTexto(ies.sigla)},
    ${sqlTexto(ies.cidade)},
    ${sqlTexto(ies.estado)},
    ${sqlNumero(ies.codigoOrganizacao)},
    ${sqlTexto(ies.organizacao)},
    ${sqlNumero(ies.codigoCategoria)},
    ${sqlTexto(ies.categoria)},
    ${ANO_CENSO},
    'INEP',
    TRUE
)`
        )
        .join(",\n");


    const sql = `-- =========================================================
-- SIA - Instituições de Educação Superior
-- Fonte: Censo da Educação Superior ${ANO_CENSO} - Inep
-- =========================================================

BEGIN;

INSERT INTO universidade
(
    codigo,
    nome,
    sigla,
    cidade,
    estado,
    codigo_organizacao_academica,
    organizacao_academica,
    codigo_categoria_administrativa,
    categoria_administrativa,
    ano_censo,
    origem_dados,
    ativo
)
VALUES

${valores}

ON CONFLICT (codigo)
DO UPDATE SET

    nome =
        EXCLUDED.nome,

    sigla =
        EXCLUDED.sigla,

    cidade =
        EXCLUDED.cidade,

    estado =
        EXCLUDED.estado,

    codigo_organizacao_academica =
        EXCLUDED.codigo_organizacao_academica,

    organizacao_academica =
        EXCLUDED.organizacao_academica,

    codigo_categoria_administrativa =
        EXCLUDED.codigo_categoria_administrativa,

    categoria_administrativa =
        EXCLUDED.categoria_administrativa,

    ano_censo =
        EXCLUDED.ano_censo,

    origem_dados =
        'INEP',

    ativo =
        TRUE;

COMMIT;


-- =========================================================
-- CONFERÊNCIA
-- =========================================================

SELECT
    COUNT(*) AS total_ies
FROM universidade
WHERE origem_dados = 'INEP';


SELECT
    organizacao_academica,
    COUNT(*) AS quantidade
FROM universidade
WHERE origem_dados = 'INEP'
GROUP BY organizacao_academica
ORDER BY quantidade DESC;


-- Conferência do IFAL

SELECT
    codigo,
    nome,
    sigla,
    organizacao_academica,
    categoria_administrativa,
    cidade,
    estado

FROM universidade

WHERE
    UPPER(
        COALESCE(
            sigla,
            ''
        )
    ) = 'IFAL'

    OR

    UPPER(nome)
        LIKE '%INSTITUTO FEDERAL DE ALAGOAS%';
`;


    fs.writeFileSync(
        SAIDA_IES,
        sql,
        "utf8"
    );
}


// =========================================================
// CABEÇALHO SQL CURSOS
// =========================================================

function iniciarSqlCursos() {

    const cabecalho = `-- =========================================================
-- SIA - Cursos de graduação
-- Fonte: Censo da Educação Superior ${ANO_CENSO} - Inep
--
-- Inclui:
-- Bacharelado
-- Licenciatura
-- Tecnológico
-- =========================================================

BEGIN;

`;


    fs.writeFileSync(
        SAIDA_CURSOS,
        cabecalho,
        "utf8"
    );
}


// =========================================================
// ESCREVER BLOCO DE CURSOS
// =========================================================

function escreverBlocoCursos(
    cursos
) {

    if (
        cursos.length === 0
    ) {
        return;
    }


    const valores =
        cursos.map(
            curso => `(
    ${sqlTexto(curso.codigo)},
    ${sqlTexto(curso.codigoIes)},
    ${sqlTexto(curso.nome)},
    ${sqlTexto(curso.grau)},
    'Graduação',
    ${sqlTexto(curso.modalidade)},
    ${sqlNumero(curso.cargaHoraria)},
    ${sqlTexto(curso.situacao)},
    ${ANO_CENSO}
)`
        )
        .join(",\n");


    const sql = `
INSERT INTO curso
(
    codigo_inep,
    universidade_id,
    nome,
    grau_academico,
    nivel_academico,
    modalidade,
    carga_horaria,
    situacao_inep,
    ano_censo,
    origem_dados
)

SELECT

    dados.codigo_inep,
    ies.id,
    dados.nome,
    dados.grau_academico,
    dados.nivel_academico,
    dados.modalidade,
    dados.carga_horaria,
    dados.situacao_inep,
    dados.ano_censo,
    'INEP'

FROM
(
    VALUES

${valores}

)
AS dados
(
    codigo_inep,
    codigo_ies,
    nome,
    grau_academico,
    nivel_academico,
    modalidade,
    carga_horaria,
    situacao_inep,
    ano_censo
)

JOIN universidade ies
    ON ies.codigo =
        dados.codigo_ies

ON CONFLICT (codigo_inep)

DO UPDATE SET

    universidade_id =
        EXCLUDED.universidade_id,

    nome =
        EXCLUDED.nome,

    grau_academico =
        EXCLUDED.grau_academico,

    nivel_academico =
        EXCLUDED.nivel_academico,

    modalidade =
        EXCLUDED.modalidade,

    carga_horaria =
        EXCLUDED.carga_horaria,

    situacao_inep =
        EXCLUDED.situacao_inep,

    ano_censo =
        EXCLUDED.ano_censo,

    origem_dados =
        'INEP';

`;


    fs.appendFileSync(
        SAIDA_CURSOS,
        sql,
        "utf8"
    );
}


// =========================================================
// FINALIZAR SQL CURSOS
// =========================================================

function finalizarSqlCursos() {

    const final = `
COMMIT;


-- =========================================================
-- CONFERÊNCIA
-- =========================================================

SELECT
    COUNT(*) AS total_cursos
FROM curso
WHERE origem_dados = 'INEP';


SELECT
    grau_academico,
    COUNT(*) AS quantidade
FROM curso
WHERE origem_dados = 'INEP'
GROUP BY grau_academico
ORDER BY quantidade DESC;


SELECT
    modalidade,
    COUNT(*) AS quantidade
FROM curso
WHERE origem_dados = 'INEP'
GROUP BY modalidade
ORDER BY modalidade;


-- =========================================================
-- CURSOS DO IFAL
-- =========================================================

SELECT
    ies.nome AS instituicao,
    ies.sigla,
    c.codigo_inep,
    c.nome AS curso,
    c.grau_academico,
    c.modalidade,
    c.carga_horaria

FROM curso c

JOIN universidade ies
    ON ies.id =
        c.universidade_id

WHERE
    UPPER(
        COALESCE(
            ies.sigla,
            ''
        )
    ) = 'IFAL'

ORDER BY
    c.nome,
    c.modalidade;
`;


    fs.appendFileSync(
        SAIDA_CURSOS,
        final,
        "utf8"
    );
}


// =========================================================
// PROCESSAR CURSOS EM STREAM
// =========================================================

async function processarCursos() {

    console.log(
        "Lendo cursos em modo econômico de memória..."
    );


    const encoding =
        detectarEncoding(
            ARQUIVO_CURSOS
        );


    const input =
        fs.createReadStream(
            ARQUIVO_CURSOS,
            {
                encoding
            }
        );


    const rl =
        readline.createInterface({
            input,
            crlfDelay: Infinity
        });


    let primeiraLinha =
        true;


    let colCurso;
    let colIes;
    let colNome;
    let colNivel;
    let colGrau;
    let colModalidade;
    let colCarga;
    let colSituacao;


    let bloco = [];

    const TAMANHO_BLOCO =
        500;


    const codigosProcessados =
        new Set();


    let total =
        0;

    let naoGraduacao =
        0;

    let grauDesconhecido =
        0;

    let modalidadeDesconhecida =
        0;


    iniciarSqlCursos();


    for await (
        const linhaTexto
        of rl
    ) {

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
        // CABEÇALHO
        // =================================================

        if (primeiraLinha) {

            primeiraLinha =
                false;


            const indice =
                criarIndice(
                    linha
                );


            colCurso =
                encontrarColuna(
                    indice,
                    ["CO_CURSO"]
                );


            colIes =
                encontrarColuna(
                    indice,
                    ["CO_IES"]
                );


            colNome =
                encontrarColuna(
                    indice,
                    ["NO_CURSO"]
                );


            colNivel =
                encontrarColuna(
                    indice,
                    [
                        "TP_NIVEL_ACADEMICO"
                    ]
                );


            colGrau =
                encontrarColuna(
                    indice,
                    [
                        "TP_GRAU_ACADEMICO"
                    ]
                );


            colModalidade =
                encontrarColuna(
                    indice,
                    [
                        "TP_MODALIDADE_ENSINO"
                    ]
                );


            colCarga =
                encontrarColuna(
                    indice,
                    [
                        "QT_CARGA_HORARIA",
                        "QT_CARGA_HORARIA_TOTAL",
                        "NU_CARGA_HORARIA"
                    ],
                    false
                );


            colSituacao =
                encontrarColuna(
                    indice,
                    [
                        "TP_SITUACAO",
                        "TP_SITUACAO_CURSO",
                        "DS_SITUACAO_CURSO"
                    ],
                    false
                );


            console.log(
                "Cabeçalho de cursos identificado."
            );


            continue;
        }


        const codigoNivel =
            obter(
                linha,
                colNivel
            );


        // Somente graduação
        if (
            codigoNivel !== "1"
        ) {

            naoGraduacao++;

            continue;
        }


        const codigoGrau =
            obter(
                linha,
                colGrau
            );


        const grau =
            GRAUS[
                codigoGrau
            ];


        if (!grau) {

            grauDesconhecido++;

            continue;
        }


        const codigoModalidade =
            obter(
                linha,
                colModalidade
            );


        const modalidade =
            MODALIDADES[
                codigoModalidade
            ];


        if (!modalidade) {

            modalidadeDesconhecida++;

            continue;
        }


        const codigo =
            obter(
                linha,
                colCurso
            );


        const codigoIes =
            obter(
                linha,
                colIes
            );


        const nome =
            obter(
                linha,
                colNome
            );


        if (
            !codigo ||
            !codigoIes ||
            !nome
        ) {

            continue;
        }


        if (
            codigosProcessados.has(
                codigo
            )
        ) {

            continue;
        }


        codigosProcessados.add(
            codigo
        );


        bloco.push({

            codigo,

            codigoIes,

            nome,

            grau,

            modalidade,

            cargaHoraria:
                obter(
                    linha,
                    colCarga
                ),

            situacao:
                obter(
                    linha,
                    colSituacao
                )
        });


        total++;


        if (
            bloco.length >=
            TAMANHO_BLOCO
        ) {

            escreverBlocoCursos(
                bloco
            );


            bloco = [];


            if (
                total % 5000 === 0
            ) {

                console.log(
                    `${total} cursos processados...`
                );
            }
        }
    }


    // Último bloco
    escreverBlocoCursos(
        bloco
    );


    finalizarSqlCursos();


    return {

        total,

        naoGraduacao,

        grauDesconhecido,

        modalidadeDesconhecida
    };
}


// =========================================================
// PRINCIPAL
// =========================================================

async function executar() {

    try {

        console.log(
            "=============================================="
        );

        console.log(
            "SIA - Base oficial do Inep"
        );

        console.log(
            "=============================================="
        );


        validarArquivos();


        fs.mkdirSync(
            PASTA_SQL,
            {
                recursive: true
            }
        );


        // =================================================
        // IES
        // =================================================

        const instituicoes =
            await processarIes();


        gerarSqlIes(
            instituicoes
        );


        console.log(
            `IES encontradas: ${instituicoes.length}`
        );


        // =================================================
        // CURSOS
        // =================================================

        const resultadoCursos =
            await processarCursos();


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
            `\nIES: ${instituicoes.length}`
        );


        console.log(
            `Cursos de graduação: ${resultadoCursos.total}`
        );


        console.log(
            `Registros não pertencentes à graduação ignorados: ${resultadoCursos.naoGraduacao}`
        );


        console.log(
            `Graus acadêmicos desconhecidos ignorados: ${resultadoCursos.grauDesconhecido}`
        );


        console.log(
            `Modalidades desconhecidas ignoradas: ${resultadoCursos.modalidadeDesconhecida}`
        );


        console.log(
            "\nArquivos gerados:"
        );


        console.log(
            SAIDA_IES
        );


        console.log(
            SAIDA_CURSOS
        );


        console.log(
            "\nNÃO execute os SQLs ainda."
        );


    } catch (erro) {

        console.error(
            "\nERRO:"
        );


        console.error(
            erro.message
        );


        process.exit(1);
    }
}


executar();