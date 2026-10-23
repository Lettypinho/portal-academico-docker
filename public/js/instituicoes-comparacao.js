// =========================================================
// SIA - COMPARAÇÃO DE INSTITUIÇÕES
// =========================================================


const instituicoesSelecionadasComparacao =
    new Map();


const LIMITE_INSTITUICOES_COMPARACAO =
    4;


// =========================================================
// SEGURANÇA
// =========================================================

function escaparComparacaoIes(valor) {

    return String(
        valor ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// =========================================================
// FORMATAÇÃO
// =========================================================

function formatarNumeroComparacaoIes(
    valor,
    casas = 1
) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return "-";
    }


    const numero =
        Number(valor);


    if (!Number.isFinite(numero)) {

        return "-";
    }


    return numero.toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits:
                casas,

            maximumFractionDigits:
                casas
        }
    );
}


function formatarInteiroComparacaoIes(
    valor
) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return "-";
    }


    const numero =
        Number(valor);


    if (!Number.isFinite(numero)) {

        return "-";
    }


    return numero.toLocaleString(
        "pt-BR"
    );
}


function formatarPercentualComparacaoIes(
    valor
) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return "-";
    }


    return (
        formatarNumeroComparacaoIes(
            valor,
            1
        ) +
        "%"
    );
}


// =========================================================
// DADOS DO CARD
// =========================================================

function extrairCodigoComparacaoIes(
    card
) {

    if (
        typeof obterCodigoIesDoCard ===
        "function"
    ) {

        return obterCodigoIesDoCard(
            card
        );
    }


    const texto =
        card.textContent ||
        "";


    const resultado =
        texto.match(
            /Código IES:\s*([^\s]+)/i
        );


    return resultado
        ? resultado[1].trim()
        : null;
}


function extrairInstituicaoDoCard(
    card
) {

    const codigo =
        extrairCodigoComparacaoIes(
            card
        );


    const nome =
        card
            .querySelector("h3")
            ?.textContent
            ?.trim() ||
        "Instituição";


    const sigla =
        card
            .querySelector(
                ".institution-icon"
            )
            ?.textContent
            ?.trim() ||
        "IES";


    return {
        codigo,
        nome,
        sigla
    };
}


// =========================================================
// CRIAR BARRA DE COMPARAÇÃO
// =========================================================

function criarBarraComparacaoIes() {

    if (
        document.getElementById(
            "ies-compare-bar"
        )
    ) {

        return;
    }


    const barra =
        document.createElement(
            "div"
        );


    barra.id =
        "ies-compare-bar";


    barra.className =
        "ies-compare-bar hidden";


    barra.innerHTML = `

        <div class="ies-compare-bar-inner">

            <div class="ies-compare-selection">

                <div>

                    <strong id="ies-compare-count">
                        0 instituições selecionadas
                    </strong>

                    <span id="ies-compare-hint">
                        Selecione de 2 a 4 instituições.
                    </span>

                </div>


                <div
                    id="ies-compare-chips"
                    class="ies-compare-chips"
                ></div>

            </div>


            <div class="ies-compare-actions">

                <button
                    type="button"
                    id="btn-limpar-comparacao-ies"
                    class="ies-compare-clear"
                >
                    Limpar
                </button>


                <button
                    type="button"
                    id="btn-comparar-ies"
                    class="ies-compare-now"
                    disabled
                >
                    Comparar agora
                    <span>→</span>
                </button>

            </div>

        </div>
    `;


    document.body.appendChild(
        barra
    );


    document
        .getElementById(
            "btn-limpar-comparacao-ies"
        )
        .addEventListener(
            "click",
            limparComparacaoIes
        );


    document
        .getElementById(
            "btn-comparar-ies"
        )
        .addEventListener(
            "click",
            compararInstituicoesSelecionadas
        );
}


// =========================================================
// CRIAR MODAL
// =========================================================

function criarModalComparacaoIes() {

    if (
        document.getElementById(
            "ies-comparison-modal"
        )
    ) {

        return;
    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "ies-comparison-modal";


    modal.className =
        "ies-comparison-modal hidden";


    modal.innerHTML = `

        <div
            class="ies-comparison-backdrop"
        ></div>


        <div
            class="ies-comparison-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Comparação de instituições"
        >

            <div
                id="ies-comparison-content"
            ></div>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    modal
        .querySelector(
            ".ies-comparison-backdrop"
        )
        .addEventListener(
            "click",
            fecharComparacaoIes
        );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                fecharComparacaoIes();
            }
        }
    );
}


// =========================================================
// ADICIONAR BOTÕES NOS CARDS
// =========================================================

function prepararCardComparacaoIes(
    card
) {

    if (
        card.dataset
            .comparacaoIesPreparada ===
        "true"
    ) {

        return;
    }


    const instituicao =
        extrairInstituicaoDoCard(
            card
        );


    if (!instituicao.codigo) {

        return;
    }


    card.dataset
        .comparacaoIesPreparada =
        "true";


    card.dataset
        .codigoIes =
        instituicao.codigo;


    const botao =
        document.createElement(
            "button"
        );


    botao.type =
        "button";


    botao.className =
        "ies-compare-toggle";


    botao.innerHTML = `

        <span class="ies-compare-toggle-icon">
            +
        </span>

        <span class="ies-compare-toggle-text">
            Comparar
        </span>
    `;


    botao.setAttribute(
        "aria-label",
        `Adicionar ${instituicao.nome} à comparação`
    );


    botao.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            alternarInstituicaoComparacao(
                instituicao
            );
        }
    );


    card.appendChild(
        botao
    );


    atualizarEstadoCardComparacao(
        card
    );
}


function prepararCardsComparacaoIes() {

    document
        .querySelectorAll(
            "#lista-universidades .institution-card"
        )
        .forEach(
            prepararCardComparacaoIes
        );
}


// =========================================================
// SELEÇÃO
// =========================================================

function alternarInstituicaoComparacao(
    instituicao
) {

    if (
        instituicoesSelecionadasComparacao
            .has(
                instituicao.codigo
            )
    ) {

        instituicoesSelecionadasComparacao
            .delete(
                instituicao.codigo
            );

    } else {

        if (
            instituicoesSelecionadasComparacao
                .size >=
            LIMITE_INSTITUICOES_COMPARACAO
        ) {

            mostrarAvisoComparacaoIes(
                "Você pode comparar no máximo 4 instituições."
            );

            return;
        }


        instituicoesSelecionadasComparacao
            .set(
                instituicao.codigo,
                instituicao
            );
    }


    atualizarInterfaceComparacaoIes();
}


function limparComparacaoIes() {

    instituicoesSelecionadasComparacao
        .clear();


    atualizarInterfaceComparacaoIes();
}


// =========================================================
// ESTADO VISUAL DO CARD
// =========================================================

function atualizarEstadoCardComparacao(
    card
) {

    const codigo =
        card.dataset
            .codigoIes;


    const selecionado =
        instituicoesSelecionadasComparacao
            .has(
                codigo
            );


    card.classList.toggle(
        "ies-compare-selected",
        selecionado
    );


    const botao =
        card.querySelector(
            ".ies-compare-toggle"
        );


    if (!botao) {

        return;
    }


    botao.classList.toggle(
        "selected",
        selecionado
    );


    botao.innerHTML =
        selecionado

            ? `

                <span class="ies-compare-toggle-icon">
                    ✓
                </span>

                <span class="ies-compare-toggle-text">
                    Selecionada
                </span>
            `

            : `

                <span class="ies-compare-toggle-icon">
                    +
                </span>

                <span class="ies-compare-toggle-text">
                    Comparar
                </span>
            `;
}


// =========================================================
// BARRA DE COMPARAÇÃO
// =========================================================

function atualizarInterfaceComparacaoIes() {

    criarBarraComparacaoIes();


    document
        .querySelectorAll(
            "#lista-universidades .institution-card"
        )
        .forEach(
            atualizarEstadoCardComparacao
        );


    const barra =
        document.getElementById(
            "ies-compare-bar"
        );


    const quantidade =
        instituicoesSelecionadasComparacao
            .size;


    barra.classList.toggle(
        "hidden",
        quantidade === 0
    );


    const contador =
        document.getElementById(
            "ies-compare-count"
        );


    contador.textContent =
        quantidade === 1

            ? "1 instituição selecionada"

            : `${quantidade} instituições selecionadas`;


    const dica =
        document.getElementById(
            "ies-compare-hint"
        );


    dica.textContent =
        quantidade < 2

            ? "Selecione pelo menos mais uma instituição."

            : quantidade < 4

                ? "Você pode selecionar até 4 instituições."

                : "Limite de 4 instituições atingido.";


    const chips =
        document.getElementById(
            "ies-compare-chips"
        );


    chips.innerHTML =
        Array
            .from(
                instituicoesSelecionadasComparacao
                    .values()
            )
            .map(
                instituicao => `

                    <span class="ies-compare-chip">

                        ${escaparComparacaoIes(
                            instituicao.sigla ||
                            instituicao.nome
                        )}

                    </span>
                `
            )
            .join("");


    const botaoComparar =
        document.getElementById(
            "btn-comparar-ies"
        );


    botaoComparar.disabled =
        quantidade <
        2;
}


// =========================================================
// AVISO
// =========================================================

function mostrarAvisoComparacaoIes(
    mensagem
) {

    criarBarraComparacaoIes();


    const dica =
        document.getElementById(
            "ies-compare-hint"
        );


    dica.textContent =
        mensagem;


    dica.classList.add(
        "warning"
    );


    setTimeout(
        () => {

            dica.classList.remove(
                "warning"
            );


            atualizarInterfaceComparacaoIes();

        },
        2200
    );
}


// =========================================================
// CARREGAR DETALHES
// =========================================================

async function carregarInstituicaoComparacao(
    codigo
) {

    const resposta =
        await fetch(

            "/api/universidades/codigo/" +

            encodeURIComponent(
                codigo
            )
        );


    const dados =
        await resposta.json();


    if (!resposta.ok) {

        throw new Error(
            dados.erro ||
            "Erro ao carregar instituição"
        );
    }


    return dados;
}


// =========================================================
// COMPARAR
// =========================================================

async function compararInstituicoesSelecionadas() {

    if (
        instituicoesSelecionadasComparacao
            .size <
        2
    ) {

        return;
    }


    criarModalComparacaoIes();


    const modal =
        document.getElementById(
            "ies-comparison-modal"
        );


    const conteudo =
        document.getElementById(
            "ies-comparison-content"
        );


    modal.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";


    conteudo.innerHTML = `

        <div class="ies-comparison-loading">

            <div class="ies-comparison-spinner"></div>

            <strong>
                Preparando comparação...
            </strong>

            <span>
                Carregando os indicadores oficiais das instituições.
            </span>

        </div>
    `;


    try {

        const codigos =
            Array.from(
                instituicoesSelecionadasComparacao
                    .keys()
            );


        const dados =
            await Promise.all(
                codigos.map(
                    carregarInstituicaoComparacao
                )
            );


        renderizarComparacaoInstituicoes(
            dados
        );


    } catch (erro) {

        console.error(
            "Erro ao comparar instituições:",
            erro
        );


        conteudo.innerHTML = `

            <div class="ies-comparison-error">

                <h3>
                    Não foi possível carregar a comparação
                </h3>

                <p>
                    Tente novamente.
                </p>

                <button
                    type="button"
                    class="ies-comparison-close-error"
                    id="btn-fechar-comparacao-erro"
                >
                    Fechar
                </button>

            </div>
        `;


        document
            .getElementById(
                "btn-fechar-comparacao-erro"
            )
            .addEventListener(
                "click",
                fecharComparacaoIes
            );
    }
}


// =========================================================
// LINHA DA TABELA
// =========================================================

function linhaComparacaoIes(
    titulo,
    dados,
    obterValor,
    classe = ""
) {

    return `

        <tr class="${classe}">

            <th>
                ${escaparComparacaoIes(
                    titulo
                )}
            </th>

            ${dados
                .map(
                    item => `

                        <td>

                            ${obterValor(
                                item
                            )}

                        </td>
                    `
                )
                .join("")}

        </tr>
    `;
}


// =========================================================
// RENDERIZAR
// =========================================================

function renderizarComparacaoInstituicoes(
    dados
) {

    const conteudo =
        document.getElementById(
            "ies-comparison-content"
        );


    const cabecalhos =
        dados
            .map(
                item => {

                    const ies =
                        item.instituicao;


                    return `

                        <th class="ies-comparison-institution">

                            <div class="ies-comparison-logo">

                                ${escaparComparacaoIes(
                                    ies.sigla ||
                                    "IES"
                                )}

                            </div>

                            <strong>

                                ${escaparComparacaoIes(
                                    ies.nome
                                )}

                            </strong>

                            <span>

                                ${escaparComparacaoIes(
                                    ies.cidade
                                )}

                                /

                                ${escaparComparacaoIes(
                                    ies.estado
                                )}

                            </span>

                        </th>
                    `;
                }
            )
            .join("");


    const linhas = [

        linhaComparacaoIes(
            "Organização acadêmica",
            dados,
            item =>
                escaparComparacaoIes(
                    item.instituicao
                        .organizacao_academica ||
                    "-"
                )
        ),


        linhaComparacaoIes(
            "Categoria administrativa",
            dados,
            item =>
                escaparComparacaoIes(
                    item.instituicao
                        .categoria_administrativa ||
                    "-"
                )
        ),


        linhaComparacaoIes(
            "IGC",
            dados,
            item => {

                if (
                    !item.igc ||
                    item.igc.igc_faixa ===
                        null
                ) {

                    return "-";
                }


                return `

                    <strong class="ies-comparison-value">

                        ${escaparComparacaoIes(
                            item.igc.igc_faixa
                        )}

                    </strong>

                    <small>
                        Ano
                        ${escaparComparacaoIes(
                            item.igc.ano
                        )}
                    </small>
                `;
            },
            "ies-comparison-highlight-row"
        ),


        linhaComparacaoIes(
            "Cursos ativos",
            dados,
            item =>
                `<strong>${formatarInteiroComparacaoIes(
                    item.resumo_cursos
                        ?.total_cursos
                )}</strong>`
        ),


        linhaComparacaoIes(
            "Cursos presenciais",
            dados,
            item =>
                formatarInteiroComparacaoIes(
                    item.resumo_cursos
                        ?.cursos_presenciais
                )
        ),


        linhaComparacaoIes(
            "Cursos EAD",
            dados,
            item =>
                formatarInteiroComparacaoIes(
                    item.resumo_cursos
                        ?.cursos_ead
                )
        ),


        linhaComparacaoIes(
            "Ingressantes da coorte",
            dados,
            item =>
                formatarInteiroComparacaoIes(
                    item.trajetoria
                        ?.ingressantes
                )
        ),


        linhaComparacaoIes(
            "Conclusão acumulada",
            dados,
            item =>
                `<strong class="ies-comparison-percentage good">${formatarPercentualComparacaoIes(
                    item.trajetoria
                        ?.taxa_conclusao_acumulada
                )}</strong>`,
            "ies-comparison-highlight-row"
        ),


        linhaComparacaoIes(
            "Desistência acumulada",
            dados,
            item =>
                `<strong class="ies-comparison-percentage attention">${formatarPercentualComparacaoIes(
                    item.trajetoria
                        ?.taxa_desistencia_acumulada
                )}</strong>`,
            "ies-comparison-highlight-row"
        ),


        linhaComparacaoIes(
            "Ainda vinculados",
            dados,
            item =>
                `<strong class="ies-comparison-percentage">${formatarPercentualComparacaoIes(
                    item.trajetoria
                        ?.taxa_permanencia
                )}</strong>`,
            "ies-comparison-highlight-row"
        )

    ].join("");


    const anosTrajetoria =
        dados
            .map(
                item =>
                    item.trajetoria
                        ?.ano_referencia
            )
            .filter(Boolean);


    const anoFinal =
        anosTrajetoria.length

            ? Math.max(
                ...anosTrajetoria
            )

            : "-";


    conteudo.innerHTML = `

        <div class="ies-comparison-header">

            <div>

                <span>
                    Comparação de instituições
                </span>

                <h2>
                    Compare as IES selecionadas
                </h2>

                <p>
                    Indicadores públicos e dados oficiais
                    utilizados pelo SIA.
                </p>

            </div>


            <button
                type="button"
                id="btn-fechar-comparacao-ies"
                class="ies-comparison-close"
                aria-label="Fechar comparação"
            >
                ×
            </button>

        </div>


        <div class="ies-comparison-notice">

            <strong>
                Fonte: Inep
            </strong>

            <span>
                Os indicadores de trajetória representam
                a coorte de ingresso de 2015 acompanhada
                até ${escaparComparacaoIes(
                    anoFinal
                )}.
                As taxas institucionais são consolidadas
                pelo SIA a partir dos indicadores oficiais
                dos cursos, ponderados pelo número de
                ingressantes.
            </span>

        </div>


        <div class="ies-comparison-table-wrapper">

            <table class="ies-comparison-table">

                <thead>

                    <tr>

                        <th class="ies-comparison-label">
                            Indicador
                        </th>

                        ${cabecalhos}

                    </tr>

                </thead>

                <tbody>

                    ${linhas}

                </tbody>

            </table>

        </div>


        <div class="ies-comparison-footer">

            <span>
                IGC, conclusão, desistência e permanência
                medem aspectos diferentes da educação superior.
                O SIA não classifica uma instituição como
                “melhor” apenas com base em um único indicador.
            </span>

        </div>
    `;


    document
        .getElementById(
            "btn-fechar-comparacao-ies"
        )
        .addEventListener(
            "click",
            fecharComparacaoIes
        );
}


// =========================================================
// FECHAR MODAL
// =========================================================

function fecharComparacaoIes() {

    const modal =
        document.getElementById(
            "ies-comparison-modal"
        );


    if (!modal) {

        return;
    }


    modal.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";
}


// =========================================================
// OBSERVAR CARDS DINÂMICOS
// =========================================================

const observadorComparacaoIes =
    new MutationObserver(
        prepararCardsComparacaoIes
    );


observadorComparacaoIes.observe(
    document.body,
    {
        childList:
            true,

        subtree:
            true
    }
);


// =========================================================
// INICIALIZAÇÃO
// =========================================================

criarBarraComparacaoIes();

prepararCardsComparacaoIes();