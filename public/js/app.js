const artigosHome = [
    {
        id: "artigo-igc-cpc-enade",
        categoria: "Indicadores oficiais",
        titulo: "O que significam IGC, CPC, IDD e Enade?",
        resumo:
            "Entenda os principais indicadores de qualidade do ensino superior e como eles ajudam a avaliar instituições e cursos.",
        subtitulo:
            "Guia rápido para interpretar os indicadores públicos disponibilizados pelo Inep.",
        conteudo: `
            <p><strong>IGC</strong> é o Índice Geral de Cursos da instituição. Ele resume a qualidade da IES com base em indicadores de graduação e pós-graduação.</p>
            <p><strong>CPC</strong> é o Conceito Preliminar de Curso. Ele ajuda a medir a qualidade de um curso específico.</p>
            <p><strong>IDD</strong> mede o valor agregado pelo curso ao desenvolvimento dos estudantes.</p>
            <p><strong>Enade</strong> é o Exame Nacional de Desempenho dos Estudantes, utilizado na avaliação dos cursos.</p>
            <p>No SIA, esses indicadores ajudam o usuário a comparar instituições e cursos com base em informações públicas e oficiais.</p>
        `
    },
    {
        id: "artigo-trajetoria",
        categoria: "Trajetória acadêmica",
        titulo: "Como interpretar permanência, conclusão e desistência?",
        resumo:
            "Veja como ler os indicadores de trajetória acadêmica e o que eles revelam sobre a evolução dos estudantes.",
        subtitulo:
            "Essas métricas mostram o comportamento de uma coorte de alunos ao longo do tempo.",
        conteudo: `
            <p><strong>Taxa de permanência</strong> representa o percentual de alunos que continuam vinculados ao curso em determinado ano de acompanhamento.</p>
            <p><strong>Taxa de conclusão acumulada</strong> mostra quantos estudantes já concluíram o curso até aquele momento.</p>
            <p><strong>Taxa de desistência acumulada</strong> indica a parcela de estudantes que abandonou o curso ao longo do acompanhamento.</p>
            <p>Esses dados são úteis para compreender retenção, evasão e sucesso acadêmico nas instituições.</p>
            <p>No contexto do SIA, eles ajudam a identificar padrões de desempenho institucional e dos cursos.</p>
        `
    },
    {
        id: "artigo-tipos-ies",
        categoria: "Instituições",
        titulo: "Diferença entre universidade, faculdade, centro universitário e instituto federal",
        resumo:
            "Nem toda instituição de ensino superior funciona da mesma forma. Conheça as principais diferenças.",
        subtitulo:
            "A organização acadêmica informa o tipo de estrutura institucional da IES.",
        conteudo: `
            <p><strong>Universidade</strong> possui atuação mais ampla, com ensino, pesquisa e extensão de forma estruturada.</p>
            <p><strong>Centro universitário</strong> tem autonomia acadêmica, mas normalmente com escopo mais concentrado do que uma universidade.</p>
            <p><strong>Faculdade</strong> costuma ter estrutura menor e foco em áreas ou cursos específicos.</p>
            <p><strong>Instituto federal</strong> integra a rede federal e oferece formação técnica e superior, muitas vezes com forte presença regional.</p>
            <p>No SIA, esse tipo de informação aparece como “organização acadêmica”.</p>
        `
    },
    {
        id: "artigo-comparacao",
        categoria: "Análise",
        titulo: "Como comparar cursos e instituições de forma mais inteligente",
        resumo:
            "Uma comparação mais útil vai além do nome da instituição: observe modalidade, indicadores e trajetória.",
        subtitulo:
            "Boas comparações ajudam na tomada de decisão acadêmica e institucional.",
        conteudo: `
            <p>Ao comparar instituições e cursos, é importante observar:</p>
            <ul>
                <li>tipo de instituição;</li>
                <li>categoria administrativa;</li>
                <li>modalidade do curso (presencial ou EAD);</li>
                <li>indicadores de qualidade;</li>
                <li>trajetória acadêmica dos estudantes.</li>
            </ul>
            <p>O SIA foi pensado justamente para organizar essas informações em uma visualização mais clara, prática e comparável.</p>
        `
    }
];

function getUsuarioLogado() {
    try {
        const usuario = localStorage.getItem("sia_usuario");
        return usuario ? JSON.parse(usuario) : null;
    } catch (error) {
        return null;
    }
}

function preencherTopbar() {
    const userName = document.getElementById("topbarUserName");
    const userRole = document.getElementById("topbarUserRole");
    const logoutButton = document.getElementById("logoutButton");

    if (!userName || !userRole || !logoutButton) return;

    const usuario = getUsuarioLogado();

    if (usuario) {
        userName.textContent = usuario.nome || "Usuário";
        userRole.textContent =
            usuario.perfil === "instituicao"
                ? "Usuário institucional"
                : usuario.perfil === "admin"
                ? "Administrador"
                : "Usuário SIA";
    } else {
        userName.textContent = "Visitante";
        userRole.textContent = "Acesso público";
    }

    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("sia_usuario");
        localStorage.removeItem("sia_token");
        window.location.href = "/login.html";
    });
}

async function carregarResumoBase() {
    const resumoElement = document.getElementById("resumoBaseInep");
    if (!resumoElement) return;

    try {
        const response = await fetch("/api/indicadores-inep/resumo");

        if (!response.ok) {
            throw new Error("Falha ao carregar resumo");
        }

        const dados = await response.json();

        const texto = `
            <strong>Base oficial do Inep</strong>
            ${Number(dados?.instituicoes?.registros || 0).toLocaleString("pt-BR")} instituições com IGC,
            ${Number(dados?.cursos?.registros || 0).toLocaleString("pt-BR")} cursos com indicadores de qualidade e
            22.864 cursos com indicadores de trajetória.
            Trajetória acompanhada até 2024.
        `;

        resumoElement.innerHTML = texto.replace(/\s+/g, " ").trim();
    } catch (error) {
        resumoElement.innerHTML =
            "<strong>Base oficial do Inep</strong> Dados públicos disponíveis para consulta no SIA.";
    }
}

function renderizarArtigos() {
    const grid = document.getElementById("articlesGrid");
    if (!grid) return;

    grid.innerHTML = artigosHome
        .map(
            (artigo) => `
                <article class="article-card">
                    <span class="article-card__tag">${artigo.categoria}</span>
                    <h3>${artigo.titulo}</h3>
                    <p>${artigo.resumo}</p>

                    <button
                        type="button"
                        class="button button--secondary article-card__button"
                        data-article-id="${artigo.id}"
                    >
                        Ler conteúdo
                    </button>
                </article>
            `
        )
        .join("");

    grid.querySelectorAll("[data-article-id]").forEach((button) => {
        button.addEventListener("click", () => {
            const articleId = button.getAttribute("data-article-id");
            abrirArtigo(articleId);
        });
    });
}

function abrirArtigo(articleId) {
    const artigo = artigosHome.find((item) => item.id === articleId);
    if (!artigo) return;

    const modal = document.getElementById("articleModal");
    const category = document.getElementById("articleModalCategory");
    const title = document.getElementById("articleModalTitle");
    const subtitle = document.getElementById("articleModalSubtitle");
    const body = document.getElementById("articleModalBody");

    if (!modal || !category || !title || !subtitle || !body) return;

    category.textContent = artigo.categoria;
    title.textContent = artigo.titulo;
    subtitle.textContent = artigo.subtitulo;
    body.innerHTML = artigo.conteudo;

    modal.hidden = false;
    document.body.classList.add("modal-open");
}

function fecharArtigo() {
    const modal = document.getElementById("articleModal");
    if (!modal) return;

    modal.hidden = true;
    document.body.classList.remove("modal-open");
}

function configurarModalArtigo() {
    const closeButton = document.getElementById("articleModalClose");
    const overlay = document.getElementById("articleModalOverlay");

    if (closeButton) {
        closeButton.addEventListener("click", fecharArtigo);
    }

    if (overlay) {
        overlay.addEventListener("click", fecharArtigo);
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            fecharArtigo();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    preencherTopbar();
    carregarResumoBase();
    renderizarArtigos();
    configurarModalArtigo();
});