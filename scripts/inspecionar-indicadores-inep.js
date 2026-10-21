const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");


// =========================================================
// CONFIGURAÇÃO
// =========================================================

const PASTA_RAW =
    path.join(
        __dirname,
        "..",
        "dados",
        "raw"
    );


const ARQUIVOS = [

    "conceito_enade_2023.xlsx",

    "CPC_2023.xlsx",

    "IDD_2023.xlsx",

    "IGC_2023.xlsx"
];


// =========================================================
// FORMATAR VALOR
// =========================================================

function texto(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }


    return String(valor).trim();
}


// =========================================================
// INSPECIONAR PLANILHA
// =========================================================

function inspecionarArquivo(
    nomeArquivo
) {

    const caminho =
        path.join(
            PASTA_RAW,
            nomeArquivo
        );


    console.log();
    console.log(
        "=".repeat(90)
    );

    console.log(
        nomeArquivo
    );

    console.log(
        "=".repeat(90)
    );


    if (
        !fs.existsSync(caminho)
    ) {

        console.log(
            "ARQUIVO NÃO ENCONTRADO"
        );

        return;
    }


    const workbook =
        XLSX.readFile(
            caminho,
            {
                cellDates: false,
                cellText: true
            }
        );


    console.log(
        "\nAbas:"
    );


    console.log(
        workbook.SheetNames
    );


    for (
        const nomeAba
        of workbook.SheetNames
    ) {

        console.log();
        console.log(
            `--- ABA: ${nomeAba} ---`
        );


        const worksheet =
            workbook.Sheets[
                nomeAba
            ];


        if (
            !worksheet["!ref"]
        ) {

            console.log(
                "Aba vazia."
            );

            continue;
        }


        const linhas =
            XLSX.utils.sheet_to_json(
                worksheet,
                {
                    header: 1,
                    raw: false,
                    defval: ""
                }
            );


        console.log(
            `Linhas aproximadas: ${linhas.length}`
        );


        const totalColunas =
            linhas.reduce(
                (
                    maior,
                    linha
                ) =>
                    Math.max(
                        maior,
                        linha.length
                    ),
                0
            );


        console.log(
            `Colunas aproximadas: ${totalColunas}`
        );


        console.log(
            "\nPrimeiras linhas preenchidas:"
        );


        let exibidas = 0;


        for (
            let i = 0;
            i < linhas.length;
            i++
        ) {

            const linha =
                linhas[i]
                    .map(texto);


            const possuiConteudo =
                linha.some(
                    valor =>
                        valor !== ""
                );


            if (
                !possuiConteudo
            ) {
                continue;
            }


            console.log();
            console.log(
                `LINHA ${i + 1}`
            );


            linha.forEach(
                (
                    valor,
                    indice
                ) => {

                    if (
                        valor !== ""
                    ) {

                        console.log(
                            `  [${indice + 1}] ${valor}`
                        );
                    }
                }
            );


            exibidas++;


            if (
                exibidas >= 8
            ) {
                break;
            }
        }
    }
}


// =========================================================
// EXECUÇÃO
// =========================================================

console.log(
    "=============================================="
);

console.log(
    "SIA - Inspeção dos indicadores do Inep"
);

console.log(
    "=============================================="
);


for (
    const arquivo
    of ARQUIVOS
) {

    inspecionarArquivo(
        arquivo
    );
}


console.log();
console.log(
    "=============================================="
);

console.log(
    "INSPEÇÃO CONCLUÍDA"
);

console.log(
    "=============================================="
);