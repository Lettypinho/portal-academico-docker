// =========================================================
// SIA - DASHBOARD INSTITUCIONAL
//
// Extensões do dashboard:
// - carregamento do core
// - período institucional global
// - comparação de instituições
// =========================================================


// =========================================================
// CARREGAR CORE
// =========================================================

(function carregarDashboardInstitucional() {

    const scriptCore =
        document.createElement(
            "script"
        );


    scriptCore.src =
        "/js/dashboard-core.js?v=5";


    scriptCore.onload =
        iniciarExtensoesDashboard;


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
// INICIAR EXTENSÕES
// =========================================================

function iniciarExtensoesDashboard() {

    iniciarPeriodoGlobalInstitucional();

    iniciarControlesComparacaoIES();
}


// =========================================================
// PERÍODO GLOBAL
// =========================================================

function iniciarPeriodoGlobalInstitucional() {

    const cardPeriodo =
        document.querySelector(
            ".dashboard-period-card"
        );


    const topbarUser =
        document.querySelector(
            ".topbar-user"
        );


    const userInfo =
        document.querySelector(
            ".topbar-user .user-info"
        );


    const campoAno =
        document.getElementById(
            "dashboard-ano"
        );


    const campoSemestre =
        document.getElementById(
            "dashboard-semestre"
        );


    if (
        !cardPeriodo ||
        !topbarUser ||
        !campoAno ||
        !campoSemestre
    ) {

        return;
    }


    // =====================================================
    // MOVER FILTRO PARA O TOPO
    // =====================================================

    cardPeriodo.classList.add(
        "dashboard-global-period"
    );


    const titulo =
        cardPeriodo.querySelector(
            ":scope > span"
        );


    if (titulo) {

        titulo.textContent =
            "Período";
    }


    const textoPrivado =
        cardPeriodo.querySelector(
            ":scope > small"
        );


    if (textoPrivado) {

        textoPrivado.textContent =
            "Dados internos";
    }


    if (userInfo) {

        topbarUser.insertBefore(
            cardPeriodo,
            userInfo
        );

    } else {

        topbarUser.prepend(
            cardPeriodo
        );
    }


    document.body.classList.add(
        "periodo-global-movido"
    );


    adicionarEstilosPeriodoGlobal();


    // =====================================================
    // INTERCEPTAR RENDERIZAÇÃO DO CORE
    // =====================================================

    if (
        typeof renderizarDadosInstitucionais ===
        "function"
    ) {

        const renderizarDadosOriginal =
            renderizarDadosInstitucionais;


        renderizarDadosInstitucionais =
            function renderizarDadosInstitucionaisComPeriodo() {

                renderizarDadosOriginal();


                sincronizarOpcoesPeriodoGlobal();


                atualizarIndicacaoPeriodoGlobal();
            };
    }


    // =====================================================
    // MINHA INSTITUIÇÃO É RENDERIZADA DEPOIS
    // =====================================================

    if (
        typeof renderizarMinhaInstituicao ===
        "function"
    ) {

        const renderizarMinhaInstituicaoOriginal =
            renderizarMinhaInstituicao;


        renderizarMinhaInstituicao =
            function renderizarMinhaInstituicaoComPeriodo() {

                renderizarMinhaInstituicaoOriginal();


                atualizarIndicacaoPeriodoGlobal();
            };
    }


    // =====================================================
    // ANO
    //
    // Usa capture para atualizar os semestres ANTES
    // do listener do dashboard-core.js.
    // =====================================================

    campoAno.addEventListener(
        "change",
        () => {

            atualizarSemestresDoPeriodoGlobal();

            atualizarIndicacaoPeriodoGlobal();
        },
        true
    );


    // =====================================================
    // SEMESTRE
    // =====================================================

    campoSemestre.addEventListener(
        "change",
        () => {

            atualizarIndicacaoPeriodoGlobal();
        },
        true
    );


    // =====================================================
    // TENTATIVA INICIAL
    //
    // Os dados podem ainda estar carregando.
    // =====================================================

    aguardarDadosParaPeriodoGlobal();
}


// =========================================================
// AGUARDAR PRIMEIRO CARREGAMENTO
// =========================================================

function aguardarDadosParaPeriodoGlobal(
    tentativas = 0
) {

    if (
        typeof dadosDashboard !==
            "undefined" &&
        dadosDashboard &&
        Array.isArray(
            dadosDashboard.cursos
        )
    ) {

        sincronizarOpcoesPeriodoGlobal();

        atualizarIndicacaoPeriodoGlobal();

        return;
    }


    if (
        tentativas >=
        40
    ) {

        return;
    }


    setTimeout(
        () => {

            aguardarDadosParaPeriodoGlobal(
                tentativas + 1
            );
        },
        100
    );
}


// =========================================================
// OBTER PERÍODOS DISPONÍVEIS
// =========================================================

function obterPeriodosDisponiveis() {

    const periodos =
        new Map();


    // =====================================================
    // INDICADORES POR CURSO
    //
    // O endpoint do dashboard já devolve todos os períodos
    // por curso, mesmo quando o indicador geral está filtrado.
    // =====================================================

    const cursos =
        (
            typeof dadosDashboard !==
                "undefined" &&
            dadosDashboard &&
            Array.isArray(
                dadosDashboard.cursos
            )
        )
            ? dadosDashboard.cursos
            : [];


    // =====================================================
    // DISCIPLINAS
    // =====================================================

    const disciplinas =
        (
            typeof disciplinasInstituicao !==
                "undefined" &&
            Array.isArray(
                disciplinasInstituicao
            )
        )
            ? disciplinasInstituicao
            : [];


    [
        ...cursos,
        ...disciplinas
    ]
        .forEach(
            item => {

                const ano =
                    Number(
                        item.ano
                    );


                const semestre =
                    Number(
                        item.semestre
                    );


                if (
                    !Number.isInteger(ano) ||
                    ![
                        1,
                        2
                    ].includes(
                        semestre
                    )
                ) {

                    return;
                }


                if (
                    !periodos.has(
                        ano
                    )
                ) {

                    periodos.set(
                        ano,
                        new Set()
                    );
                }


                periodos
                    .get(ano)
                    .add(
                        semestre
                    );
            }
        );


    return periodos;
}


// =========================================================
// SINCRONIZAR ANO E SEMESTRE
// =========================================================

let ajustandoPeriodoAutomaticamente =
    false;


function sincronizarOpcoesPeriodoGlobal() {

    if (
        ajustandoPeriodoAutomaticamente
    ) {

        return;
    }


    const campoAno =
        document.getElementById(
            "dashboard-ano"
        );


    const campoSemestre =
        document.getElementById(
            "dashboard-semestre"
        );


    if (
        !campoAno ||
        !campoSemestre
    ) {

        return;
    }


    const periodos =
        obterPeriodosDisponiveis();


    if (
        periodos.size ===
        0
    ) {

        atualizarIndicacaoPeriodoGlobal();

        return;
    }


    ajustandoPeriodoAutomaticamente =
        true;


    const anoAnterior =
        campoAno.value;


    const semestreAnterior =
        campoSemestre.value;


    // =====================================================
    // ANOS DISPONÍVEIS
    // =====================================================

    const anos =
        [
            ...periodos.keys()
        ]
            .sort(
                (
                    a,
                    b
                ) =>
                    b - a
            );


    campoAno.innerHTML =
        anos
            .map(
                ano => `

                    <option
                        value="${ano}"
                    >
                        ${ano}
                    </option>
                `
            )
            .join("");


    // =====================================================
    // MANTER ANO SE FOR VÁLIDO
    // SENÃO USAR MAIS RECENTE
    // =====================================================

    const anoSelecionado =
        anos.includes(
            Number(
                anoAnterior
            )
        )
            ? Number(
                anoAnterior
            )
            : anos[0];


    campoAno.value =
        String(
            anoSelecionado
        );


    // =====================================================
    // SEMESTRES DO ANO
    // =====================================================

    const semestres =
        [
            ...(
                periodos.get(
                    anoSelecionado
                ) ||
                []
            )
        ]
            .sort(
                (
                    a,
                    b
                ) =>
                    b - a
            );


    campoSemestre.innerHTML =
        semestres
            .map(
                semestre => `

                    <option
                        value="${semestre}"
                    >
                        ${semestre}º
                    </option>
                `
            )
            .join("");


    // =====================================================
    // MANTER SEMESTRE SE FOR VÁLIDO
    // SENÃO USAR MAIS RECENTE
    // =====================================================

    const semestreSelecionado =
        semestres.includes(
            Number(
                semestreAnterior
            )
        )
            ? Number(
                semestreAnterior
            )
            : semestres[0];


    campoSemestre.value =
        String(
            semestreSelecionado
        );


    ajustandoPeriodoAutomaticamente =
        false;


    // =====================================================
    // SE O PERÍODO ORIGINAL NÃO EXISTIA,
    // RECARREGAR AUTOMATICAMENTE COM O MAIS RECENTE
    // =====================================================

    const mudouPeriodo =
        String(
            anoAnterior
        ) !==
            String(
                anoSelecionado
            ) ||

        String(
            semestreAnterior
        ) !==
            String(
                semestreSelecionado
            );


    atualizarIndicacaoPeriodoGlobal();


    if (
        mudouPeriodo &&
        typeof carregarDadosInstitucionais ===
            "function"
    ) {

        setTimeout(
            () => {

                carregarDadosInstitucionais();
            },
            0
        );
    }
}


// =========================================================
// ATUALIZAR SEMESTRES QUANDO MUDA O ANO
// =========================================================

function atualizarSemestresDoPeriodoGlobal() {

    const campoAno =
        document.getElementById(
            "dashboard-ano"
        );


    const campoSemestre =
        document.getElementById(
            "dashboard-semestre"
        );


    if (
        !campoAno ||
        !campoSemestre
    ) {

        return;
    }


    const periodos =
        obterPeriodosDisponiveis();


    const ano =
        Number(
            campoAno.value
        );


    const semestreAnterior =
        Number(
            campoSemestre.value
        );


    const semestres =
        [
            ...(
                periodos.get(
                    ano
                ) ||
                []
            )
        ]
            .sort(
                (
                    a,
                    b
                ) =>
                    b - a
            );


    if (
        semestres.length ===
        0
    ) {

        return;
    }


    campoSemestre.innerHTML =
        semestres
            .map(
                semestre => `

                    <option
                        value="${semestre}"
                    >
                        ${semestre}º
                    </option>
                `
            )
            .join("");


    campoSemestre.value =
        String(
            semestres.includes(
                semestreAnterior
            )
                ? semestreAnterior
                : semestres[0]
        );
}


// =========================================================
// TEXTO DO PERÍODO ATUAL
// =========================================================

function descricaoPeriodoAtual() {

    const campoAno =
        document.getElementById(
            "dashboard-ano"
        );


    const campoSemestre =
        document.getElementById(
            "dashboard-semestre"
        );


    if (
        !campoAno ||
        !campoSemestre ||
        !campoAno.value ||
        !campoSemestre.value
    ) {

        return "Período não definido";
    }


    return (
        `${campoSemestre.value}º semestre de ${campoAno.value}`
    );
}


// =========================================================
// ATUALIZAR INDICAÇÕES DO PERÍODO NAS TELAS
// =========================================================

function atualizarIndicacaoPeriodoGlobal() {

    const descricao =
        descricaoPeriodoAtual();


    // =====================================================
    // TOOLTIP DO FILTRO GLOBAL
    // =====================================================

    const card =
        document.querySelector(
            ".dashboard-global-period"
        );


    if (card) {

        card.title =
            `Período institucional: ${descricao}`;
    }


    // =====================================================
    // CARD MÉDIA DA HOME
    // =====================================================

    const periodoMedia =
        document.getElementById(
            "stat-periodo-media"
        );


    if (periodoMedia) {

        periodoMedia.textContent =
            descricao;
    }


    // =====================================================
    // MINHA INSTITUIÇÃO
    // =====================================================

    const areaPrivada =
        document.querySelector(
            "#minha-instituicao-conteudo .institution-private-area"
        );


    if (areaPrivada) {

        let badge =
            areaPrivada.querySelector(
                ".institution-private-period"
            );


        if (!badge) {

            badge =
                document.createElement(
                    "div"
                );


            badge.className =
                "institution-private-period";


            const titulo =
                areaPrivada.querySelector(
                    "h3"
                );


            if (titulo) {

                titulo.insertAdjacentElement(
                    "afterend",
                    badge
                );
            }
        }


        badge.textContent =
            `Período selecionado: ${descricao}`;


        const descricaoPrivada =
            areaPrivada.querySelector(
                "p"
            );


        if (descricaoPrivada) {

            descricaoPrivada.textContent =
                `Indicadores agregados referentes ao ${descricao}. Dados pessoais de alunos não são exibidos.`;
        }
    }


    // =====================================================
    // DISCIPLINAS
    // =====================================================

    const descricaoDisciplinas =
        document.querySelector(
            "#disciplinas .section-header p"
        );


    if (descricaoDisciplinas) {

        descricaoDisciplinas.textContent =
            `Indicadores agregados do ${descricao}.`;
    }


    // =====================================================
    // INÍCIO
    // =====================================================

    const desempenhoTitulo =
        document.querySelector(
            "#inicio .dashboard-panel:nth-child(2) h2"
        );


    if (desempenhoTitulo) {

        desempenhoTitulo.textContent =
            `Resumo — ${descricao}`;
    }
}


// =========================================================
// ESTILOS DO PERÍODO GLOBAL
// =========================================================

function adicionarEstilosPeriodoGlobal() {

    if (
        document.getElementById(
            "dashboard-periodo-global-estilos"
        )
    ) {

        return;
    }


    const estilo =
        document.createElement(
            "style"
        );


    estilo.id =
        "dashboard-periodo-global-estilos";


    estilo.textContent = `

        /* =================================================
           TOPO FIXO
           ================================================= */

        .dashboard-page .topbar {

            position:
                sticky;

            top:
                0;

            z-index:
                3000;
        }


        /* =================================================
           HERO SEM O CARD DE PERÍODO
           ================================================= */

        .dashboard-page.periodo-global-movido
        .institutional-hero {

            grid-template-columns:
                minmax(0, 1fr);
        }


        /* =================================================
           PERÍODO GLOBAL
           ================================================= */

        .dashboard-global-period {

            width:
                auto;

            min-width:
                225px;

            flex:
                0 0 auto;

            padding:
                7px 10px;

            border:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    .20
                );

            border-radius:
                11px;

            color:
                #ffffff;

            background:
                rgba(
                    255,
                    255,
                    255,
                    .08
                );
        }


        .dashboard-global-period
        > span {

            display:
                block;

            margin:
                0 0 4px;

            color:
                #d9c4f4;

            font-size:
                9px;

            font-weight:
                800;

            letter-spacing:
                .07em;

            text-transform:
                uppercase;
        }


        .dashboard-global-period
        .dashboard-period {

            display:
                flex;

            align-items:
                flex-end;

            gap:
                6px;
        }


        .dashboard-global-period
        .dashboard-period label {

            min-width:
                0;

            color:
                #e8dcf6;

            font-size:
                9px;

            font-weight:
                700;
        }


        .dashboard-global-period
        .dashboard-period label:first-child {

            width:
                82px;
        }


        .dashboard-global-period
        .dashboard-period label:last-child {

            width:
                108px;
        }


        .dashboard-global-period
        .dashboard-period select {

            width:
                100%;

            min-height:
                30px;

            margin-top:
                3px;

            padding:
                4px 7px;

            border:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    .18
                );

            border-radius:
                7px;

            outline:
                none;

            color:
                #32114d;

            background:
                #ffffff;

            font-size:
                11px;

            font-weight:
                700;

            cursor:
                pointer;
        }


        .dashboard-global-period
        > small {

            display:
                none;
        }


        /* =================================================
           PERÍODO NA ÁREA PRIVADA
           ================================================= */

        .institution-private-period {

            display:
                inline-flex;

            align-items:
                center;

            margin:
                6px 0 8px;

            padding:
                5px 9px;

            border:
                1px solid
                #d8c8f1;

            border-radius:
                999px;

            color:
                #5b21b6;

            background:
                #f4effc;

            font-size:
                10px;

            font-weight:
                800;
        }


        /* =================================================
           RESPONSIVO
           ================================================= */

        @media (
            max-width: 1100px
        ) {

            .dashboard-global-period {

                min-width:
                    205px;
            }


            .dashboard-global-period
            .dashboard-period label:first-child {

                width:
                    75px;
            }


            .dashboard-global-period
            .dashboard-period label:last-child {

                width:
                    96px;
            }

        }


        @media (
            max-width: 900px
        ) {

            .dashboard-page .topbar {

                flex-wrap:
                    wrap;
            }


            .dashboard-page
            .topbar-user {

                gap:
                    8px;
            }


            .dashboard-global-period {

                order:
                    -1;
            }

        }


        @media (
            max-width: 700px
        ) {

            .dashboard-global-period {

                width:
                    100%;

                min-width:
                    0;
            }


            .dashboard-global-period
            .dashboard-period {

                display:
                    grid;

                grid-template-columns:
                    1fr 1fr;
            }


            .dashboard-global-period
            .dashboard-period label:first-child,
            .dashboard-global-period
            .dashboard-period label:last-child {

                width:
                    auto;
            }

        }
    `;


    document.head.appendChild(
        estilo
    );
}


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
    // BOTÕES
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


    acoes.appendChild(
        botaoComparar
    );


    barra.appendChild(
        acoes
    );


    // =====================================================
    // LIMPAR
    // =====================================================

    botaoLimpar.addEventListener(
        "click",
        limparSelecaoComparacaoIES
    );


    // =====================================================
    // REMOVER INDIVIDUALMENTE
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
    // ESTENDER FUNÇÃO ORIGINAL
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
// MOSTRAR IES SELECIONADAS
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
// LIMPAR TODAS AS IES
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
// ESTILOS DA COMPARAÇÃO
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