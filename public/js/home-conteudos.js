// =========================================================
// SIA - CONTEÚDOS OFICIAIS DA HOME
// Pesquisa + preview interativo
// Fontes: Inep / Governo Federal
// =========================================================


// =========================================================
// PUBLICAÇÕES OFICIAIS
// =========================================================

const conteudosOficiaisSia = [

    {
        id:
            "censo-superior-2024",

        categoria:
            "Censo da Educação Superior",

        fonte:
            "INEP • GOV.BR",

        titulo:
            "Resumo Técnico do Censo da Educação Superior 2024",

        descricao:
            "Conheça os principais resultados do Censo da Educação Superior 2024.",

        resumo:
            "O Resumo Técnico apresenta uma visão consolidada da educação superior brasileira a partir dos dados coletados pelo Inep. O documento permite compreender o cenário das instituições, dos cursos, das matrículas, dos ingressantes, dos concluintes e de outros aspectos da educação superior.",

        topicos: [
            "Instituições e cursos de educação superior",
            "Matrículas, ingressantes e concluintes",
            "Oferta da graduação brasileira",
            "Principais resultados do Censo 2024"
        ],

        palavrasChave: [
            "censo",
            "2024",
            "matriculas",
            "instituicoes",
            "cursos",
            "concluintes",
            "inep"
        ],

        destaque:
            "CENSO",

        tipo:
            "Publicação oficial",

        url:
            "https://download.inep.gov.br/publicacoes/institucionais/avaliacoes_e_exames_da_educacao_superior/resumo_tecnico_do_censo_da_educacao_superior_2024.pdf"
    },


    {
        id:
            "trajetoria-superior",

        categoria:
            "Trajetória acadêmica",

        fonte:
            "INEP • GOV.BR",

        titulo:
            "Indicadores de Trajetória da Educação Superior",

        descricao:
            "Acompanhe permanência, conclusão e desistência dos estudantes ao longo dos anos.",

        resumo:
            "Os Indicadores de Trajetória permitem acompanhar o percurso acadêmico das diferentes coortes de estudantes da educação superior. No SIA, esses dados são utilizados principalmente para analisar conclusão acumulada, desistência acumulada e permanência.",

        topicos: [
            "Taxa de conclusão acumulada",
            "Taxa de desistência acumulada",
            "Permanência dos estudantes",
            "Acompanhamento das coortes ao longo dos anos"
        ],

        palavrasChave: [
            "trajetoria",
            "tca",
            "tda",
            "tap",
            "permanencia",
            "conclusao",
            "desistencia",
            "coorte"
        ],

        destaque:
            "TCA",

        tipo:
            "Dados e indicadores oficiais",

        url:
            "https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/indicadores-educacionais/indicadores-de-trajetoria-da-educacao-superior"
    },


    {
        id:
            "qualidade-superior",

        categoria:
            "Qualidade da Educação Superior",

        fonte:
            "INEP • GOV.BR",

        titulo:
            "Indicadores de Qualidade da Educação Superior",

        descricao:
            "Entenda os principais indicadores usados para avaliar cursos e instituições.",

        resumo:
            "A página reúne os indicadores de qualidade produzidos pelo Inep para a educação superior. Esses indicadores complementam as informações cadastrais e de trajetória utilizadas pelo SIA nas consultas e comparações.",

        topicos: [
            "Conceito Enade",
            "Indicador de Diferença entre os Desempenhos Observado e Esperado — IDD",
            "Conceito Preliminar de Curso — CPC",
            "Índice Geral de Cursos — IGC"
        ],

        palavrasChave: [
            "qualidade",
            "enade",
            "idd",
            "cpc",
            "igc",
            "avaliacao",
            "indicadores"
        ],

        destaque:
            "IGC",

        tipo:
            "Indicadores oficiais",

        url:
            "https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/indicadores-de-qualidade-da-educacao-superior"
    },


    {
        id:
            "censo-superior",

        categoria:
            "Educação Superior",

        fonte:
            "INEP • GOV.BR",

        titulo:
            "Censo da Educação Superior",

        descricao:
            "Conheça a pesquisa oficial que reúne informações sobre a educação superior brasileira.",

        resumo:
            "O Censo da Educação Superior é realizado anualmente pelo Inep e reúne informações sobre instituições, cursos, estudantes, vagas, concluintes e outros elementos da educação superior. É uma das principais fontes utilizadas pelo SIA.",

        topicos: [
            "Instituições de educação superior",
            "Cursos de graduação",
            "Estudantes e matrículas",
            "Dados e resultados do Censo"
        ],

        palavrasChave: [
            "censo",
            "educacao superior",
            "ies",
            "graduacao",
            "estudantes",
            "inep"
        ],

        destaque:
            "IES",

        tipo:
            "Página institucional",

        url:
            "https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-da-educacao-superior/"
    },


    {
        id:
            "sinopse-superior",

        categoria:
            "Estatísticas oficiais",

        fonte:
            "INEP • GOV.BR",

        titulo:
            "Sinopse Estatística da Educação Superior",

        descricao:
            "Consulte tabelas e estatísticas oficiais sobre a educação superior brasileira.",

        resumo:
            "A Sinopse Estatística organiza os resultados da educação superior em tabelas que facilitam consultas e análises. Os dados podem ser utilizados para observar instituições, cursos e diferentes recortes territoriais.",

        topicos: [
            "Tabelas estatísticas oficiais",
            "Dados de instituições e cursos",
            "Informações por unidade da Federação",
            "Panorama da educação superior"
        ],

        palavrasChave: [
            "sinopse",
            "estatistica",
            "dados",
            "tabelas",
            "brasil",
            "estado",
            "municipio"
        ],

        destaque:
            "BR",

        tipo:
            "Dados estatísticos",

        url:
            "https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/sinopses-estatisticas/educacao-superior"
    },


    {
        id:
            "metodologia-censo",

        categoria:
            "Metodologia",

        fonte:
            "INEP",

        titulo:
            "Metodologia de coleta do Censo da Educação Superior 2024",

        descricao:
            "Entenda como os dados do Censo Superior são coletados e tratados pelo Inep.",

        resumo:
            "O documento apresenta aspectos técnicos relacionados à produção dos dados do Censo da Educação Superior 2024. É uma referência importante para compreender a origem, o tratamento e a organização das informações utilizadas nas análises.",

        topicos: [
            "Coleta das informações",
            "Tratamento dos dados",
            "Verificação das informações",
            "Produção e disseminação dos resultados"
        ],

        palavrasChave: [
            "metodologia",
            "coleta",
            "censo",
            "dados",
            "tratamento",
            "verificacao"
        ],

        destaque:
            "DOC",

        tipo:
            "Documento técnico",

        url:
            "https://riep.inep.gov.br/items/55b18fd1-5853-4ec7-8b75-ec5a0f900e2c"
    }

];


// =========================================================
// ESTADO
// =========================================================

let ultimoElementoArtigoFocado =
    null;


// =========================================================
// SEGURANÇA HTML
// =========================================================

function escaparHtmlConteudo(
    valor
) {

    return String(
        valor ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


// =========================================================
// NORMALIZAR PESQUISA
// =========================================================

function normalizarPesquisa(
    valor
) {

    return String(
        valor ?? ""
    )
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();
}


// =========================================================
// CRIAR BARRA DE PESQUISA
// =========================================================

function criarPesquisaConteudos() {

    const secao =
        document.querySelector(
            ".home-articles"
        );


    const grade =
        document.querySelector(
            ".home-articles-grid"
        );


    if (
        !secao ||
        !grade ||
        document.getElementById(
            "home-articles-search"
        )
    ) {

        return;
    }


    const pesquisa =
        document.createElement(
            "div"
        );


    pesquisa.className =
        "home-articles-search";


    pesquisa.id =
        "home-articles-search";


    pesquisa.innerHTML = `

        <div class="home-articles-search-box">

            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >

                <circle
                    cx="11"
                    cy="11"
                    r="7"
                ></circle>

                <path
                    d="m20 20-3.5-3.5"
                ></path>

            </svg>


            <input
                type="search"
                id="pesquisa-conteudos-oficiais"
                placeholder="Pesquisar por Censo, Enade, IGC, trajetória, estatísticas..."
                autocomplete="off"
                aria-label="Pesquisar publicações oficiais"
            >


            <button
                type="button"
                id="limpar-pesquisa-conteudos"
                class="home-articles-search-clear hidden"
                aria-label="Limpar pesquisa"
                title="Limpar pesquisa"
            >
                ×
            </button>

        </div>


        <div class="home-articles-search-meta">

            <span id="home-articles-result-count">
                ${conteudosOficiaisSia.length} conteúdos disponíveis
            </span>

            <span>
                Fontes oficiais • Inep / Governo Federal
            </span>

        </div>
    `;


    grade.parentNode.insertBefore(
        pesquisa,
        grade
    );


    const input =
        document.getElementById(
            "pesquisa-conteudos-oficiais"
        );


    const limpar =
        document.getElementById(
            "limpar-pesquisa-conteudos"
        );


    input.addEventListener(
        "input",
        filtrarConteudosOficiais
    );


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                input.value =
                    "";

                filtrarConteudosOficiais();

                input.blur();
            }
        }
    );


    limpar.addEventListener(
        "click",
        () => {

            input.value =
                "";

            filtrarConteudosOficiais();

            input.focus();
        }
    );
}


// =========================================================
// FILTRAR
// =========================================================

function filtrarConteudosOficiais() {

    const input =
        document.getElementById(
            "pesquisa-conteudos-oficiais"
        );


    const botaoLimpar =
        document.getElementById(
            "limpar-pesquisa-conteudos"
        );


    if (!input) {

        return;
    }


    const termo =
        normalizarPesquisa(
            input.value
        );


    const palavrasPesquisa =
        termo
            .split(/\s+/)
            .filter(Boolean);


    const resultado =
        conteudosOficiaisSia
            .filter(
                conteudo => {

                    if (
                        palavrasPesquisa.length ===
                        0
                    ) {

                        return true;
                    }


                    const texto =

                        normalizarPesquisa(`

                            ${conteudo.titulo}

                            ${conteudo.categoria}

                            ${conteudo.fonte}

                            ${conteudo.tipo}

                            ${conteudo.descricao}

                            ${conteudo.resumo}

                            ${conteudo.topicos.join(
                                " "
                            )}

                            ${conteudo.palavrasChave.join(
                                " "
                            )}
                        `);


                    return palavrasPesquisa
                        .every(
                            palavra =>
                                texto.includes(
                                    palavra
                                )
                        );
                }
            );


    if (botaoLimpar) {

        botaoLimpar.classList.toggle(
            "hidden",
            !termo
        );
    }


    atualizarContagemConteudos(
        resultado.length,
        termo
    );


    renderizarConteudosOficiais(
        resultado
    );
}


// =========================================================
// CONTAGEM
// =========================================================

function atualizarContagemConteudos(
    quantidade,
    termo = ""
) {

    const contador =
        document.getElementById(
            "home-articles-result-count"
        );


    if (!contador) {

        return;
    }


    if (!termo) {

        contador.textContent =
            `${quantidade} conteúdos disponíveis`;

        return;
    }


    contador.textContent =
        quantidade === 1
            ? "1 conteúdo encontrado"
            : `${quantidade} conteúdos encontrados`;
}


// =========================================================
// RENDERIZAR CONTEÚDOS
// =========================================================

function renderizarConteudosOficiais(
    lista = conteudosOficiaisSia
) {

    const container =
        document.querySelector(
            ".home-articles-grid"
        );


    if (!container) {

        return;
    }


    if (
        lista.length ===
        0
    ) {

        container.innerHTML = `

            <div class="home-articles-empty">

                <div class="home-articles-empty-icon">

                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >

                        <circle
                            cx="11"
                            cy="11"
                            r="7"
                        ></circle>

                        <path
                            d="m20 20-3.5-3.5"
                        ></path>

                    </svg>

                </div>


                <h3>
                    Nenhum conteúdo encontrado
                </h3>


                <p>
                    Tente pesquisar por outro termo,
                    como Censo, Enade, IGC, trajetória
                    ou estatísticas.
                </p>


                <button
                    type="button"
                    id="btn-limpar-busca-vazia"
                >
                    Limpar pesquisa
                </button>

            </div>
        `;


        const botao =
            document.getElementById(
                "btn-limpar-busca-vazia"
            );


        if (botao) {

            botao.addEventListener(
                "click",
                () => {

                    const input =
                        document.getElementById(
                            "pesquisa-conteudos-oficiais"
                        );


                    if (input) {

                        input.value =
                            "";

                        filtrarConteudosOficiais();

                        input.focus();
                    }
                }
            );
        }


        return;
    }


    container.innerHTML =
        lista
            .map(
                conteudo => `

                    <article
                        class="home-article-card"
                        data-conteudo-id="${escaparHtmlConteudo(
                            conteudo.id
                        )}"
                        tabindex="0"
                        role="button"
                        aria-label="Ver resumo de ${escaparHtmlConteudo(
                            conteudo.titulo
                        )}"
                    >

                        <div class="home-article-card-top">

                            <div class="home-article-icon">

                                ${escaparHtmlConteudo(
                                    conteudo.destaque
                                )}

                            </div>


                            <span class="home-article-type">

                                ${escaparHtmlConteudo(
                                    conteudo.tipo
                                )}

                            </span>

                        </div>


                        <div class="home-article-category">

                            ${escaparHtmlConteudo(
                                conteudo.fonte
                            )}

                        </div>


                        <h3>

                            ${escaparHtmlConteudo(
                                conteudo.titulo
                            )}

                        </h3>


                        <p>

                            ${escaparHtmlConteudo(
                                conteudo.descricao
                            )}

                        </p>


                        <div class="home-article-card-footer">

                            <span class="home-article-preview-button">

                                Ver resumo

                                <span>
                                    →
                                </span>

                            </span>

                        </div>

                    </article>
                `
            )
            .join("");
}


// =========================================================
// CRIAR MODAL
// =========================================================

function criarModalConteudoOficial() {

    if (
        document.getElementById(
            "home-article-modal"
        )
    ) {

        return;
    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "home-article-modal";


    modal.className =
        "home-article-modal hidden";


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    modal.innerHTML = `

        <div
            class="home-article-modal-backdrop"
            data-fechar-artigo
        ></div>


        <div
            class="home-article-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-article-modal-title"
        >

            <button
                type="button"
                id="home-article-modal-close"
                class="home-article-modal-close"
                aria-label="Fechar"
                title="Fechar"
            >
                ×
            </button>


            <div class="home-article-modal-heading">

                <div
                    id="home-article-modal-icon"
                    class="home-article-modal-icon"
                ></div>


                <div>

                    <div
                        id="home-article-modal-source"
                        class="home-article-modal-category"
                    ></div>


                    <h2
                        id="home-article-modal-title"
                    ></h2>

                </div>

            </div>


            <div class="home-article-modal-metadata">

                <span
                    id="home-article-modal-category"
                ></span>

                <span
                    id="home-article-modal-type"
                ></span>

            </div>


            <div class="home-article-modal-body">

                <p
                    id="home-article-modal-summary"
                    class="home-article-modal-summary"
                ></p>


                <div class="home-article-modal-topics">

                    <h3>
                        O que você encontra neste conteúdo
                    </h3>


                    <ul
                        id="home-article-modal-topics-list"
                    ></ul>

                </div>


                <div class="home-article-highlight">

                    Este conteúdo é disponibilizado
                    por uma fonte oficial externa ao SIA.

                </div>

            </div>


            <div class="home-article-modal-actions">

                <button
                    type="button"
                    id="home-article-modal-cancel"
                    class="home-article-modal-secondary"
                >
                    Fechar
                </button>


                <a
                    id="home-article-modal-link"
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="home-article-modal-primary"
                >

                    Acessar conteúdo oficial

                    <span>
                        ↗
                    </span>

                </a>

            </div>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    document
        .getElementById(
            "home-article-modal-close"
        )
        .addEventListener(
            "click",
            fecharConteudoOficial
        );


    document
        .getElementById(
            "home-article-modal-cancel"
        )
        .addEventListener(
            "click",
            fecharConteudoOficial
        );


    modal
        .querySelector(
            "[data-fechar-artigo]"
        )
        .addEventListener(
            "click",
            fecharConteudoOficial
        );
}


// =========================================================
// ABRIR MODAL
// =========================================================

function abrirConteudoOficial(
    conteudoId,
    elementoFoco = null
) {

    const conteudo =
        conteudosOficiaisSia
            .find(
                item =>
                    item.id ===
                    conteudoId
            );


    if (!conteudo) {

        return;
    }


    criarModalConteudoOficial();


    ultimoElementoArtigoFocado =
        elementoFoco;


    document
        .getElementById(
            "home-article-modal-icon"
        )
        .textContent =
        conteudo.destaque;


    document
        .getElementById(
            "home-article-modal-source"
        )
        .textContent =
        conteudo.fonte;


    document
        .getElementById(
            "home-article-modal-title"
        )
        .textContent =
        conteudo.titulo;


    document
        .getElementById(
            "home-article-modal-category"
        )
        .textContent =
        conteudo.categoria;


    document
        .getElementById(
            "home-article-modal-type"
        )
        .textContent =
        conteudo.tipo;


    document
        .getElementById(
            "home-article-modal-summary"
        )
        .textContent =
        conteudo.resumo;


    document
        .getElementById(
            "home-article-modal-topics-list"
        )
        .innerHTML =
        conteudo.topicos
            .map(
                topico => `

                    <li>

                        ${escaparHtmlConteudo(
                            topico
                        )}

                    </li>
                `
            )
            .join("");


    document
        .getElementById(
            "home-article-modal-link"
        )
        .href =
        conteudo.url;


    const modal =
        document.getElementById(
            "home-article-modal"
        );


    modal.classList.remove(
        "hidden"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "home-modal-open"
    );


    setTimeout(
        () => {

            document
                .getElementById(
                    "home-article-modal-close"
                )
                .focus();
        },
        0
    );
}


// =========================================================
// FECHAR MODAL
// =========================================================

function fecharConteudoOficial() {

    const modal =
        document.getElementById(
            "home-article-modal"
        );


    if (!modal) {

        return;
    }


    modal.classList.add(
        "hidden"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "home-modal-open"
    );


    if (
        ultimoElementoArtigoFocado &&
        document.body.contains(
            ultimoElementoArtigoFocado
        )
    ) {

        ultimoElementoArtigoFocado
            .focus();
    }


    ultimoElementoArtigoFocado =
        null;
}


// =========================================================
// INTERAÇÃO COM CARDS
// =========================================================

function configurarInteracaoConteudos() {

    const container =
        document.querySelector(
            ".home-articles-grid"
        );


    if (!container) {

        return;
    }


    container.addEventListener(
        "click",
        event => {

            const card =
                event.target.closest(
                    ".home-article-card"
                );


            if (!card) {

                return;
            }


            abrirConteudoOficial(
                card.dataset.conteudoId,
                card
            );
        }
    );


    container.addEventListener(
        "keydown",
        event => {

            const card =
                event.target.closest(
                    ".home-article-card"
                );


            if (
                !card ||
                event.target !==
                    card
            ) {

                return;
            }


            if (
                event.key ===
                    "Enter" ||
                event.key ===
                    " "
            ) {

                event.preventDefault();


                abrirConteudoOficial(
                    card.dataset
                        .conteudoId,
                    card
                );
            }
        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                const modal =
                    document.getElementById(
                        "home-article-modal"
                    );


                if (
                    modal &&
                    !modal.classList
                        .contains(
                            "hidden"
                        )
                ) {

                    fecharConteudoOficial();
                }
            }
        }
    );
}


// =========================================================
// ALTERAR TÍTULO
// =========================================================

function atualizarTituloConteudos() {

    const secao =
        document.querySelector(
            ".home-articles"
        );


    if (!secao) {

        return;
    }


    const eyebrow =
        secao.querySelector(
            ".section-eyebrow"
        );


    const titulo =
        secao.querySelector(
            ".home-articles-header h2"
        );


    const descricao =
        secao.querySelector(
            ".home-articles-header p"
        );


    if (eyebrow) {

        eyebrow.textContent =
            "Conteúdos oficiais";
    }


    if (titulo) {

        titulo.textContent =
            "Explore publicações e dados sobre a educação superior";
    }


    if (descricao) {

        descricao.textContent =
            "Pesquise conteúdos oficiais, veja um resumo dentro do SIA e acesse a publicação completa diretamente na fonte.";
    }
}


// =========================================================
// IR PARA INSTITUIÇÕES
// =========================================================

function irParaInstituicoes() {

    if (
        typeof abrirSecao ===
        "function"
    ) {

        abrirSecao(
            "universidades"
        );


        window.scrollTo({
            top:
                0,

            behavior:
                "smooth"
        });


        return;
    }


    const botaoMenu =
        document.querySelector(
            '[data-section="universidades"]'
        );


    if (botaoMenu) {

        botaoMenu.click();
    }
}


// =========================================================
// CONFIGURAR CTA
// =========================================================

function configurarAcessoInstituicoes() {

    const botao =
        document.getElementById(
            "btn-ir-instituicoes"
        );


    if (!botao) {

        return;
    }


    botao.addEventListener(
        "click",
        irParaInstituicoes
    );
}


// =========================================================
// CARREGAR MÓDULO DE PERFIL
// =========================================================

function carregarModuloPerfilPublico() {

    const cssExistente =
        document.querySelector(
            'link[data-modulo="perfil-publico"]'
        );


    if (!cssExistente) {

        const link =
            document.createElement(
                "link"
            );


        link.rel =
            "stylesheet";


        link.href =
            "/css/perfil-publico.css?v=1";


        link.dataset.modulo =
            "perfil-publico";


        document.head.appendChild(
            link
        );
    }


    const scriptExistente =
        document.querySelector(
            'script[data-modulo="perfil-publico"]'
        );


    if (!scriptExistente) {

        const script =
            document.createElement(
                "script"
            );


        script.src =
            "/js/perfil-publico.js?v=1";


        script.dataset.modulo =
            "perfil-publico";


        document.body.appendChild(
            script
        );
    }
}


// =========================================================
// INICIALIZAÇÃO
// =========================================================

function iniciarConteudosOficiais() {

    atualizarTituloConteudos();

    criarPesquisaConteudos();

    renderizarConteudosOficiais();

    criarModalConteudoOficial();

    configurarInteracaoConteudos();

    configurarAcessoInstituicoes();

    carregarModuloPerfilPublico();
}


iniciarConteudosOficiais();