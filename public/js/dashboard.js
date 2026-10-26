// =========================================================
// SIA - DASHBOARD INSTITUCIONAL
// Loader + controles da comparação de instituições
// =========================================================

(function carregarDashboardInstitucional() {

    const scriptCore =
        document.createElement(
            "script"
        );


    scriptCore.src =
        "/js/dashboard-core.js?v=4";


    scriptCore.onload =
        iniciarControlesComparacaoIES;


    scriptCore.onerror =
        () => {

            console.error(
                "Não foi possível carregar o dashboard institucional."
            );
        };


    document.body.appendChild(
        scriptCore
    );

})();


// =========================================================
// CONTROLES DA COMPARAÇÃO DE IES
// =========================================================

function iniciarControlesComparacaoIES() {

    const barra =
        document.getElementById(
            "barra-comparacao-ies"
        );


    const contador =
        document.getElementById(
            "comparacao-ies-selecionadas"
        );


    const botaoComparar =
        document.getElementById(
            "btn-executar-comparacao-ies"
        );


    if (
        !barra ||
        !contador ||
        !botaoComparar
    ) {

        return;
    }


    adicionarEstilosComparacaoIES();


    // =====================================================
    // BLOCO PRINCIPAL
    // =====================================================

    const blocoInformacoes =
        contador.parentElement;


    blocoInformacoes.classList.add(
        "comparison-bar-main"
    );


    const titulo =
        blocoInformacoes.querySelector(
            "strong"
        );


    const cabecalho =
        document.createElement(
            "div"
        );


    cabecalho.className =
        "comparison-bar-heading";


    if (titulo) {

        cabecalho.appendChild(
            titulo
        );
    }


    cabecalho.appendChild(
        contador
    );


    blocoInformacoes.prepend(
        cabecalho
    );


    // =====================================================
    // LISTA DAS INSTITUIÇÕES SELECIONADAS
    // =====================================================

    const chips =
        document.createElement(
            "div"
        );


    chips.id =
        "comparacao-ies-chips";


    chips.className =
        "comparison-selection-chips";


    chips.setAttribute(
        "aria-label",
        "Instituições selecionadas para comparação"
    );


    blocoInformacoes.appendChild(
        chips
    );


    // =====================================================
    // ÁREA DOS BOTÕES
    // =====================================================

    const acoes =
        document.createElement(
            "div"
        );


    acoes.className =
        "comparison-bar-actions";


    const botaoLimpar =
        document.createElement(
            "button"
        );


    botaoLimpar.type =
        "button";


    botaoLimpar.id =
        "btn-limpar-comparacao-ies";


    botaoLimpar.className =
        "comparison-clear-button";


    botaoLimpar.textContent =
        "Limpar seleção";


    acoes.appendChild(
        botaoLimpar
    );


    // Preserva o botão Comparar já existente
    acoes.appendChild(
        botaoComparar
    );


    barra.appendChild(
        acoes
    );


    // =====================================================
    // LIMPAR TODAS
    // =====================================================

    botaoLimpar.addEventListener(
        "click",
        limparSelecaoComparacaoIES
    );


    // =====================================================
    // DESMARCAR UMA INSTITUIÇÃO PELO X
    // =====================================================

    chips.addEventListener(
        "click",
        event => {

            const botao =
                event.target.closest(
                    "[data-remover-ies]"
                );


            if (!botao) {

                return;
            }


            const codigo =
                botao.dataset
                    .removerIes;


            alternarComparacaoInstituicao(
                codigo
            );
        }
    );


    // =====================================================
    // ESTENDER ATUALIZAÇÃO DA BARRA EXISTENTE
    // =====================================================

    const atualizarBarraOriginal =
        atualizarBarraComparacao;


    atualizarBarraComparacao =
        function atualizarBarraComparacaoComSelecao() {

            atualizarBarraOriginal();

            renderizarSelecaoComparacaoIES();
        };


    renderizarSelecaoComparacaoIES();
}


// =========================================================
// MOSTRAR INSTITUIÇÕES SELECIONADAS
// =========================================================

function renderizarSelecaoComparacaoIES() {

    const container =
        document.getElementById(
            "comparacao-ies-chips"
        );


    const botaoLimpar =
        document.getElementById(
            "btn-limpar-comparacao-ies"
        );


    if (
        !container ||
        !botaoLimpar
    ) {

        return;
    }


    const selecionadas =
        [
            ...instituicoesComparacao
                .entries()
        ];


    botaoLimpar.disabled =
        selecionadas.length ===
        0;


    if (
        selecionadas.length ===
        0
    ) {

        container.innerHTML =
            "";

        return;
    }


    container.innerHTML =
        selecionadas
            .map(
                ([
                    codigo,
                    instituicao
                ]) => {

                    const nomeCurto =
                        instituicao.sigla ||
                        instituicao.nome ||
                        `IES ${codigo}`;


                    const nomeCompleto =
                        instituicao.nome ||
                        nomeCurto;


                    return `

                        <span
                            class="comparison-selection-chip"
                            title="${escaparHtml(
                                nomeCompleto
                            )}"
                        >

                            <span
                                class="comparison-selection-chip-label"
                            >
                                ${escaparHtml(
                                    nomeCurto
                                )}
                            </span>


                            <button
                                type="button"
                                class="comparison-selection-remove"
                                data-remover-ies="${escaparHtml(
                                    codigo
                                )}"
                                aria-label="Desmarcar ${escaparHtml(
                                    nomeCompleto
                                )}"
                                title="Desmarcar instituição"
                            >
                                ×
                            </button>

                        </span>
                    `;
                }
            )
            .join("");
}


// =========================================================
// LIMPAR TODAS AS INSTITUIÇÕES
// =========================================================

function limparSelecaoComparacaoIES() {

    if (
        instituicoesComparacao
            .size ===
        0
    ) {

        return;
    }


    instituicoesComparacao
        .clear();


    atualizarBarraComparacao();


    renderizarInstituicoes();
}


// =========================================================
// ESTILOS DA NOVA BARRA
// =========================================================

function adicionarEstilosComparacaoIES() {

    if (
        document.getElementById(
            "dashboard-comparacao-ies-estilos"
        )
    ) {

        return;
    }


    const estilo =
        document.createElement(
            "style"
        );


    estilo.id =
        "dashboard-comparacao-ies-estilos";


    estilo.textContent = `

        .comparison-bar {

            align-items:
                center;

            gap:
                18px;
        }


        .comparison-bar-main {

            flex:
                1 1 auto;

            min-width:
                0;
        }


        .comparison-bar-heading {

            display:
                flex;

            align-items:
                baseline;

            gap:
                10px;

            flex-wrap:
                wrap;
        }


        .comparison-selection-chips {

            display:
                flex;

            flex-wrap:
                wrap;

            gap:
                7px;

            margin-top:
                9px;
        }


        .comparison-selection-chip {

            max-width:
                230px;

            display:
                inline-flex;

            align-items:
                center;

            gap:
                5px;

            padding:
                4px 5px 4px 10px;

            border:
                1px solid #dfd2f4;

            border-radius:
                999px;

            color:
                #5b21b6;

            background:
                #f8f4ff;

            font-size:
                11px;

            font-weight:
                750;
        }


        .comparison-selection-chip-label {

            min-width:
                0;

            overflow:
                hidden;

            text-overflow:
                ellipsis;

            white-space:
                nowrap;
        }


        .comparison-bar
        .comparison-selection-remove {

            width:
                23px;

            height:
                23px;

            min-width:
                23px;

            display:
                inline-flex;

            align-items:
                center;

            justify-content:
                center;

            padding:
                0;

            border:
                0;

            border-radius:
                50%;

            color:
                #6d28d9;

            background:
                transparent;

            box-shadow:
                none;

            cursor:
                pointer;

            font-size:
                17px;

            font-weight:
                500;

            line-height:
                1;
        }


        .comparison-bar
        .comparison-selection-remove:hover {

            color:
                #ffffff;

            background:
                #6d28d9;
        }


        .comparison-bar-actions {

            flex:
                0 0 auto;

            display:
                flex;

            align-items:
                center;

            gap:
                8px;
        }


        .comparison-bar
        .comparison-clear-button {

            padding:
                10px 14px;

            border:
                1px solid #d8c6ed;

            color:
                #6d28d9;

            background:
                #ffffff;

            box-shadow:
                none;
        }


        .comparison-bar
        .comparison-clear-button:hover {

            border-color:
                #b99cde;

            background:
                #f8f4ff;
        }


        .comparison-bar
        .comparison-clear-button:disabled {

            opacity:
                .45;

            cursor:
                not-allowed;
        }


        @media (
            max-width: 720px
        ) {

            .comparison-bar {

                align-items:
                    stretch;

                flex-direction:
                    column;
            }


            .comparison-bar-actions {

                width:
                    100%;
            }


            .comparison-bar-actions
            > button {

                flex:
                    1 1 0;
            }

        }
    `;


    document.head.appendChild(
        estilo
    );
}