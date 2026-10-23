// =========================================================
// SIA - CONTEÚDOS OFICIAIS DA HOME
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
            "Publicação oficial com os principais resultados da educação superior brasileira, incluindo instituições, cursos, matrículas, concluintes, trajetória acadêmica e docentes.",

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
            "Página oficial do Inep com as taxas de permanência, conclusão e desistência dos estudantes da educação superior, incluindo a coorte 2015–2024 utilizada pelo SIA.",

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
            "Página oficial que reúne informações sobre Conceito Enade, IDD, CPC e IGC, indicadores utilizados pelo SIA nas consultas e comparações.",

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
            "Conheça a pesquisa oficial realizada anualmente pelo Inep e as informações coletadas sobre instituições, cursos, estudantes, vagas, concluintes e docentes.",

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
            "Base oficial com tabelas estatísticas da educação superior brasileira, incluindo dados organizados por instituições, cursos, municípios e unidades da Federação.",

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
            "Documento técnico oficial que apresenta a metodologia utilizada pelo Inep na coleta, verificação, tratamento e disseminação dos dados do Censo Superior 2024.",

        destaque:
            "DOC",

        tipo:
            "Documento técnico",

        url:
            "https://riep.inep.gov.br/items/55b18fd1-5853-4ec7-8b75-ec5a0f900e2c"
    }

];


// =========================================================
// RENDERIZAR CONTEÚDOS OFICIAIS
// =========================================================

function renderizarConteudosOficiais() {

    const container =
        document.querySelector(
            ".home-articles-grid"
        );


    if (!container) {

        return;
    }


    container.innerHTML =
        conteudosOficiaisSia
            .map(
                conteudo => `

                    <article
                        class="home-article-card"
                    >

                        <div class="home-article-icon">

                            ${conteudo.destaque}

                        </div>


                        <div class="home-article-category">

                            ${conteudo.fonte}

                        </div>


                        <h3>

                            ${conteudo.titulo}

                        </h3>


                        <p>

                            ${conteudo.descricao}

                        </p>


                        <div
                            style="
                                margin-bottom: 16px;
                                color: #92879d;
                                font-size: 12px;
                                font-weight: 650;
                            "
                        >

                            ${conteudo.tipo}

                        </div>


                        <a
                            href="${conteudo.url}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="home-article-button"
                        >

                            Acessar fonte oficial

                            <span>
                                ↗
                            </span>

                        </a>

                    </article>
                `
            )
            .join("");
}


// =========================================================
// ALTERAR TÍTULO DA SEÇÃO
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
            "Fontes oficiais";
    }


    if (titulo) {

        titulo.textContent =
            "Publicações e dados oficiais sobre a educação superior";
    }


    if (descricao) {

        descricao.textContent =
            "Acesse diretamente conteúdos publicados pelo Inep e pelo Governo Federal utilizados como referência para os dados apresentados no SIA.";
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
// REMOVER MODAL ANTIGO
// =========================================================

function removerModalArtigosInternos() {

    const modal =
        document.getElementById(
            "home-article-modal"
        );


    if (modal) {

        modal.remove();
    }
}


// =========================================================
// INICIALIZAÇÃO
// =========================================================

function iniciarConteudosOficiais() {

    atualizarTituloConteudos();

    renderizarConteudosOficiais();

    configurarAcessoInstituicoes();

    removerModalArtigosInternos();
}


iniciarConteudosOficiais();