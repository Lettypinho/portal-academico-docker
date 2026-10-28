let usuarioAtual =
    null;

let dadosDashboard =
    null;

let cursosInstituicao =
    [];

let disciplinasInstituicao =
    [];

let instituicoesCatalogo =
    [];

let detalheInstituicaoVinculada =
    null;

const instituicoesComparacao =
    new Map();

let timerBuscaComparacaoCurso =
    null;


// =========================================================
// UTILITÁRIOS
// =========================================================

function escaparHtml(valor) {

    return String(
        valor ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function numero(valor) {

    const convertido =
        Number(valor);

    return Number.isFinite(
        convertido
    )
        ? convertido
        : 0;
}


function exibirNumero(
    valor,
    casas = 0
) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return "-";
    }


    const convertido =
        Number(valor);


    if (
        !Number.isFinite(
            convertido
        )
    ) {

        return "-";
    }


    return convertido
        .toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits:
                    casas,

                maximumFractionDigits:
                    casas
            }
        );
}


function exibirPercentual(
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
        `${exibirNumero(
            valor,
            1
        )}%`
    );
}


function nomePerfil(
    perfil
) {

    const nomes = {

        consulta_institucional:
            "Consulta institucional",

        gestor:
            "Gestor",

        admin_universidade:
            "Administrador da instituição",

        super_admin:
            "Super administrador",

        publico:
            "Usuário público"
    };


    return (
        nomes[perfil] ||
        perfil ||
        "-"
    );
}


// =========================================================
// USUÁRIO
// =========================================================

async function carregarUsuario() {

    try {

        const resposta =
            await fetch(
                "/api/auth/me"
            );


        if (!resposta.ok) {

            window.location.href =
                "/login.html";

            return false;
        }


        usuarioAtual =
            await resposta.json();


        if (
    usuarioAtual.perfil ===
        "publico" ||
    usuarioAtual.perfil ===
        "aluno"
) {

    window.location.href =
        "/explorar.html";

    return false;
}


        if (
            usuarioAtual.perfil ===
            "super_admin"
        ) {

            window.location.href =
                "/admin.html";

            return false;
        }


        if (
            !usuarioAtual
                .universidade_id
        ) {

            window.location.href =
                "/login.html";

            return false;
        }


        document
            .getElementById(
                "dashboard-usuario-nome"
            )
            .textContent =
            usuarioAtual.nome;


        document
            .getElementById(
                "dashboard-usuario-perfil"
            )
            .textContent =
            nomePerfil(
                usuarioAtual.perfil
            );


        document
            .getElementById(
                "topo-instituicao"
            )
            .textContent =
            usuarioAtual
                .universidade_sigla ||
            usuarioAtual
                .universidade ||
            "Instituição";


        return true;


    } catch (erro) {

        console.error(
            "Erro ao carregar usuário:",
            erro
        );


        window.location.href =
            "/login.html";


        return false;
    }
}


// =========================================================
// LOGOUT
// =========================================================

async function logout() {

    try {

        await fetch(
            "/api/auth/logout",
            {
                method:
                    "POST"
            }
        );

    } finally {

        window.location.href =
            "/login.html";
    }
}


// =========================================================
// NAVEGAÇÃO
// =========================================================

function abrirSecao(
    nome
) {

    document
        .querySelectorAll(
            ".dashboard-nav .nav-item"
        )
        .forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.section ===
                        nome
                );
            }
        );


    document
        .querySelectorAll(
            ".dashboard-section"
        )
        .forEach(
            secao => {

                secao.classList.toggle(
                    "active",
                    secao.id ===
                        nome
                );
            }
        );


    window.scrollTo({
        top:
            0,

        behavior:
            "smooth"
    });
}


// =========================================================
// PERÍODO
// =========================================================

function obterPeriodo() {

    return {

        ano:
            document
                .getElementById(
                    "dashboard-ano"
                )
                .value,

        semestre:
            document
                .getElementById(
                    "dashboard-semestre"
                )
                .value
    };
}


// =========================================================
// DADOS INSTITUCIONAIS
// =========================================================

async function carregarDadosInstitucionais() {

    const {
        ano,
        semestre
    } =
        obterPeriodo();


    const parametros =
        new URLSearchParams({
            ano,
            semestre
        });


    try {

        const [
            respostaDashboard,
            respostaCursos,
            respostaDisciplinas
        ] =
            await Promise.all([

                fetch(
                    "/api/indicadores/dashboard?" +
                    parametros.toString()
                ),

                fetch(
                    "/api/cursos/minha-universidade"
                ),

                fetch(
                    "/api/indicadores/disciplinas"
                )
            ]);


        if (
            !respostaDashboard.ok
        ) {

            throw new Error(
                "Erro ao carregar os indicadores institucionais"
            );
        }


        dadosDashboard =
            await respostaDashboard
                .json();


        cursosInstituicao =
            respostaCursos.ok
                ? await respostaCursos
                    .json()
                : [];


        disciplinasInstituicao =
            respostaDisciplinas.ok
                ? await respostaDisciplinas
                    .json()
                : [];


        renderizarDadosInstitucionais();

        await carregarMinhaInstituicao();


    } catch (erro) {

        console.error(
            "Erro no dashboard:",
            erro
        );
    }
}


// =========================================================
// INDICADOR DO PERÍODO
// =========================================================

function indicadorPeriodo() {

    if (
        !dadosDashboard ||
        !Array.isArray(
            dadosDashboard.indicadores
        )
    ) {

        return null;
    }


    const {
        ano,
        semestre
    } =
        obterPeriodo();


    return (
        dadosDashboard
            .indicadores
            .find(
                item =>
                    String(item.ano) ===
                        String(ano) &&

                    String(item.semestre) ===
                        String(semestre)
            ) ||
        null
    );
}


// =========================================================
// RENDERIZAR DADOS INTERNOS
// =========================================================

function renderizarDadosInstitucionais() {

    if (!dadosDashboard) {

        return;
    }


    const instituicao =
        dadosDashboard.universidade;


    const indicador =
        indicadorPeriodo();


    const nome =
        instituicao.universidade;


    const sigla =
        instituicao.sigla ||
        nome;


    document
        .getElementById(
            "dashboard-instituicao-nome"
        )
        .textContent =
        nome;


    document
        .getElementById(
            "dashboard-instituicao-detalhes"
        )
        .textContent =
        `${sigla} • Código IES ${instituicao.codigo}`;


    document
        .getElementById(
            "topo-instituicao"
        )
        .textContent =
        sigla;


    document
        .getElementById(
            "stat-total-cursos"
        )
        .textContent =
        exibirNumero(
            instituicao.total_cursos
        );


    document
        .getElementById(
            "stat-total-disciplinas"
        )
        .textContent =
        exibirNumero(
            instituicao.total_disciplinas
        );


    document
        .getElementById(
            "stat-total-alunos"
        )
        .textContent =
        exibirNumero(
            instituicao.total_alunos
        );


    document
        .getElementById(
            "stat-media-geral"
        )
        .textContent =
        indicador
            ? exibirNumero(
                indicador.media_geral,
                2
            )
            : "-";


    document
        .getElementById(
            "stat-aprovacao"
        )
        .textContent =
        indicador
            ? exibirPercentual(
                indicador
                    .taxa_aprovacao
            )
            : "-";


    document
        .getElementById(
            "stat-frequencia"
        )
        .textContent =
        indicador
            ? exibirPercentual(
                indicador
                    .frequencia_media
            )
            : "-";


    const {
        ano,
        semestre
    } =
        obterPeriodo();


    document
        .getElementById(
            "stat-periodo-media"
        )
        .textContent =
        `${semestre}º semestre de ${ano}`;


    renderizarSituacaoAlunos();

    renderizarDesempenho();

    renderizarDisciplinas();

    renderizarMeusCursos();
}


// =========================================================
// SITUAÇÃO DOS ALUNOS
// =========================================================

function renderizarSituacaoAlunos() {

    const situacao =
        dadosDashboard
            .situacao_alunos ||
        {};


    const total =
        numero(
            situacao.total_alunos
        );

    const ativos =
        numero(
            situacao.ativos
        );

    const trancados =
        numero(
            situacao.trancados
        );

    const formados =
        numero(
            situacao.formados
        );

    const evadidos =
        numero(
            situacao.evadidos
        );


    document
        .getElementById(
            "alunos-ativos"
        )
        .textContent =
        ativos;


    document
        .getElementById(
            "alunos-trancados"
        )
        .textContent =
        trancados;


    document
        .getElementById(
            "alunos-formados"
        )
        .textContent =
        formados;


    document
        .getElementById(
            "alunos-evadidos"
        )
        .textContent =
        evadidos;


    document
        .getElementById(
            "card-alunos-total"
        )
        .textContent =
        total;


    document
        .getElementById(
            "card-alunos-ativos"
        )
        .textContent =
        ativos;


    document
        .getElementById(
            "card-alunos-trancados"
        )
        .textContent =
        trancados;


    document
        .getElementById(
            "card-alunos-formados"
        )
        .textContent =
        formados;


    document
        .getElementById(
            "card-alunos-evadidos"
        )
        .textContent =
        evadidos;


    document
        .getElementById(
            "card-taxa-evasao"
        )
        .textContent =
        exibirPercentual(
            situacao
                .taxa_evasao_atual
        );
}


// =========================================================
// DESEMPENHO
// =========================================================

function renderizarDesempenho() {

    const indicador =
        indicadorPeriodo();


    const campos = {

        "indicador-alunos-avaliados":
            indicador
                ? exibirNumero(
                    indicador
                        .alunos_avaliados
                )
                : "-",

        "indicador-cursos-resultados":
            indicador
                ? exibirNumero(
                    indicador
                        .cursos_com_resultados
                )
                : "-",

        "indicador-aprovacao":
            indicador
                ? exibirPercentual(
                    indicador
                        .taxa_aprovacao
                )
                : "-",

        "indicador-reprovacao":
            indicador
                ? exibirPercentual(
                    indicador
                        .taxa_reprovacao
                )
                : "-",

        "indicador-frequencia":
            indicador
                ? exibirPercentual(
                    indicador
                        .frequencia_media
                )
                : "-"
    };


    Object.entries(
        campos
    )
        .forEach(
            ([
                id,
                valor
            ]) => {

                document
                    .getElementById(id)
                    .textContent =
                    valor;
            }
        );
}


// =========================================================
// MEUS CURSOS
// =========================================================

function renderizarMeusCursos() {

    const container =
        document.getElementById(
            "meus-cursos-resumo"
        );


    if (
        !cursosInstituicao.length
    ) {

        container.textContent =
            "Nenhum curso cadastrado.";

        return;
    }


    const limite =
        cursosInstituicao
            .slice(
                0,
                15
            );


    container.innerHTML =
        limite
            .map(
                curso => `

                    <span
                        class="my-course-chip"
                    >
                        ${escaparHtml(
                            curso.nome
                        )}

                        ·

                        ${escaparHtml(
                            curso.modalidade ||
                            "-"
                        )}
                    </span>
                `
            )
            .join("");


    if (
        cursosInstituicao.length >
        limite.length
    ) {

        container.innerHTML += `

            <span
                class="my-course-chip"
            >
                +${
                    cursosInstituicao.length -
                    limite.length
                } cursos
            </span>
        `;
    }
}


// =========================================================
// DISCIPLINAS
// =========================================================

function renderizarDisciplinas() {

    const tbody =
        document.getElementById(
            "tabela-dashboard-disciplinas"
        );


    const {
        ano,
        semestre
    } =
        obterPeriodo();


    const lista =
        disciplinasInstituicao
            .filter(
                item =>
                    String(item.ano) ===
                        String(ano) &&

                    String(item.semestre) ===
                        String(semestre)
            );


    if (!lista.length) {

        tbody.innerHTML = `

            <tr>

                <td colspan="6">

                    Não existem indicadores
                    para este período.

                </td>

            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        lista
            .map(
                item => `

                    <tr>

                        <td>
                            <strong>
                                ${escaparHtml(
                                    item.disciplina
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escaparHtml(
                                item.curso
                            )}
                        </td>

                        <td>
                            ${exibirNumero(
                                item.media,
                                2
                            )}
                        </td>

                        <td>
                            ${exibirPercentual(
                                item.taxa_aprovacao
                            )}
                        </td>

                        <td>
                            ${exibirPercentual(
                                item.taxa_reprovacao
                            )}
                        </td>

                        <td>
                            ${exibirPercentual(
                                item.frequencia_media
                            )}
                        </td>

                    </tr>
                `
            )
            .join("");
}


// =========================================================
// MINHA INSTITUIÇÃO
// =========================================================

async function carregarMinhaInstituicao() {

    if (
        !dadosDashboard ||
        !dadosDashboard.universidade
    ) {

        return;
    }


    const codigo =
        dadosDashboard
            .universidade
            .codigo;


    try {

        const resposta =
            await fetch(
                `/api/universidades/codigo/${encodeURIComponent(
                    codigo
                )}`
            );


        if (!resposta.ok) {

            throw new Error(
                "Detalhes oficiais não encontrados"
            );
        }


        detalheInstituicaoVinculada =
            await resposta.json();


        renderizarMinhaInstituicao();


    } catch (erro) {

        document
            .getElementById(
                "minha-instituicao-conteudo"
            )
            .innerHTML = `

                <div class="empty-state">

                    <h3>
                        Dados oficiais indisponíveis
                    </h3>

                    <p>
                        ${escaparHtml(
                            erro.message
                        )}
                    </p>

                </div>
            `;
    }
}


function renderizarMinhaInstituicao() {

    if (
        !detalheInstituicaoVinculada
    ) {

        return;
    }


    const {
        instituicao,
        resumo_cursos,
        igc,
        trajetoria
    } =
        detalheInstituicaoVinculada;


    const indicador =
        indicadorPeriodo();


    document
        .getElementById(
            "minha-instituicao-conteudo"
        )
        .innerHTML = `

            <article
                class="my-institution-card"
            >

                <div
                    class="my-institution-head"
                >

                    <span
                        class="section-eyebrow"
                        style="color:#dcc8ff"
                    >
                        Código IES
                        ${escaparHtml(
                            instituicao.codigo
                        )}
                    </span>


                    <h2>
                        ${escaparHtml(
                            instituicao.nome
                        )}
                    </h2>


                    <p>
                        ${escaparHtml(
                            instituicao.sigla ||
                            ""
                        )}

                        ${instituicao.cidade
                            ? " • " +
                            escaparHtml(
                                instituicao.cidade
                            )
                            : ""
                        }

                        ${instituicao.estado
                            ? " / " +
                            escaparHtml(
                                instituicao.estado
                            )
                            : ""
                        }
                    </p>

                </div>


                <div
                    class="my-institution-body"
                >

                    <span
                        class="section-eyebrow"
                    >
                        Dados oficiais
                    </span>


                    <div
                        class="institution-info-grid"
                    >

                        ${itemInstituicao(
                            "Organização",
                            instituicao
                                .organizacao_academica
                        )}

                        ${itemInstituicao(
                            "Categoria",
                            instituicao
                                .categoria_administrativa
                        )}

                        ${itemInstituicao(
                            "IGC",
                            igc
                                ? `${exibirNumero(
                                    igc.igc_continuo,
                                    3
                                )} • Faixa ${
                                    igc.igc_faixa ??
                                    "-"
                                }`
                                : "-"
                        )}

                        ${itemInstituicao(
                            "Cursos ativos",
                            resumo_cursos
                                ?.total_cursos
                        )}

                        ${itemInstituicao(
                            "Presenciais",
                            resumo_cursos
                                ?.cursos_presenciais
                        )}

                        ${itemInstituicao(
                            "EAD",
                            resumo_cursos
                                ?.cursos_ead
                        )}

                        ${itemInstituicao(
                            "Conclusão",
                            trajetoria
                                ? exibirPercentual(
                                    trajetoria
                                        .taxa_conclusao_acumulada
                                )
                                : "-"
                        )}

                        ${itemInstituicao(
                            "Desistência",
                            trajetoria
                                ? exibirPercentual(
                                    trajetoria
                                        .taxa_desistencia_acumulada
                                )
                                : "-"
                        )}

                        ${itemInstituicao(
                            "Ainda vinculados",
                            trajetoria
                                ? exibirPercentual(
                                    trajetoria
                                        .taxa_permanencia
                                )
                                : "-"
                        )}

                    </div>


                    <div
                        class="institution-private-area"
                    >

                        <h3>
                            Dados institucionais privados
                        </h3>

                        <p>
                            Indicadores agregados do período selecionado.
                            Dados pessoais de alunos não são exibidos.
                        </p>


                        <div
                            class="institution-info-grid"
                        >

                            ${itemInstituicao(
                                "Alunos",
                                dadosDashboard
                                    .universidade
                                    .total_alunos
                            )}

                            ${itemInstituicao(
                                "Disciplinas",
                                dadosDashboard
                                    .universidade
                                    .total_disciplinas
                            )}

                            ${itemInstituicao(
                                "Média",
                                indicador
                                    ? exibirNumero(
                                        indicador
                                            .media_geral,
                                        2
                                    )
                                    : "-"
                            )}

                            ${itemInstituicao(
                                "Aprovação",
                                indicador
                                    ? exibirPercentual(
                                        indicador
                                            .taxa_aprovacao
                                    )
                                    : "-"
                            )}

                            ${itemInstituicao(
                                "Frequência",
                                indicador
                                    ? exibirPercentual(
                                        indicador
                                            .frequencia_media
                                    )
                                    : "-"
                            )}

                        </div>

                    </div>

                </div>

            </article>
        `;
}


function itemInstituicao(
    titulo,
    valor
) {

    return `

        <div
            class="institution-info-item"
        >

            <span>
                ${escaparHtml(
                    titulo
                )}
            </span>

            <strong>
                ${escaparHtml(
                    valor ??
                    "-"
                )}
            </strong>

        </div>
    `;
}


// =========================================================
// CATÁLOGO DE INSTITUIÇÕES
// =========================================================

async function carregarCatalogoInstituicoes() {

    try {

        const resposta =
            await fetch(
                "/api/universidades"
            );


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar as instituições"
            );
        }


        instituicoesCatalogo =
            await resposta.json();


        preencherFiltrosGeograficos();

        renderizarInstituicoes();


    } catch (erro) {

        console.error(
            erro
        );


        document
            .getElementById(
                "lista-instituicoes"
            )
            .innerHTML = `

                <div class="empty-state">

                    <h3>
                        Não foi possível carregar as instituições
                    </h3>

                </div>
            `;
    }
}


// =========================================================
// FILTROS GEOGRÁFICOS
// =========================================================

function preencherFiltrosGeograficos() {

    const estados =
        [
            ...new Set(
                instituicoesCatalogo
                    .map(
                        item =>
                            item.estado
                    )
                    .filter(Boolean)
            )
        ]
            .sort();


    [
        "curso-estado",
        "comparacao-estado"
    ]
        .forEach(
            id => {

                const select =
                    document.getElementById(
                        id
                    );


                select.innerHTML =
                    `<option value="">Todos</option>` +
                    estados
                        .map(
                            estado => `
                                <option
                                    value="${escaparHtml(
                                        estado
                                    )}"
                                >
                                    ${escaparHtml(
                                        estado
                                    )}
                                </option>
                            `
                        )
                        .join("");
            }
        );


    atualizarFiltrosDependentes(
        "curso"
    );

    atualizarFiltrosDependentes(
        "comparacao"
    );
}


function atualizarFiltrosDependentes(
    prefixo
) {

    const estado =
        document
            .getElementById(
                `${prefixo}-estado`
            )
            .value;


    const campoCidade =
        document.getElementById(
            `${prefixo}-cidade`
        );


    const campoInstituicao =
        document.getElementById(
            `${prefixo}-instituicao`
        );


    const cidadeAtual =
        campoCidade.value;


    const instituicaoAtual =
        campoInstituicao.value;


    let lista =
        instituicoesCatalogo;


    if (estado) {

        lista =
            lista.filter(
                item =>
                    item.estado ===
                    estado
            );
    }


    const cidades =
        [
            ...new Set(
                lista
                    .map(
                        item =>
                            item.cidade
                    )
                    .filter(Boolean)
            )
        ]
            .sort(
                (
                    a,
                    b
                ) =>
                    a.localeCompare(
                        b,
                        "pt-BR"
                    )
            );


    campoCidade.innerHTML =
        `<option value="">Todas</option>` +
        cidades
            .map(
                cidade => `
                    <option
                        value="${escaparHtml(
                            cidade
                        )}"
                    >
                        ${escaparHtml(
                            cidade
                        )}
                    </option>
                `
            )
            .join("");


    if (
        cidades.includes(
            cidadeAtual
        )
    ) {

        campoCidade.value =
            cidadeAtual;
    }


    const cidade =
        campoCidade.value;


    if (cidade) {

        lista =
            lista.filter(
                item =>
                    item.cidade ===
                    cidade
            );
    }


    campoInstituicao.innerHTML =
        `<option value="">Todas</option>` +
        lista
            .sort(
                (
                    a,
                    b
                ) =>
                    a.nome.localeCompare(
                        b.nome,
                        "pt-BR"
                    )
            )
            .map(
                item => `
                    <option
                        value="${item.id}"
                    >
                        ${escaparHtml(
                            item.sigla
                                ? `${item.sigla} — ${item.nome}`
                                : item.nome
                        )}
                    </option>
                `
            )
            .join("");


    if (
        [
            ...campoInstituicao
                .options
        ]
            .some(
                opcao =>
                    opcao.value ===
                    instituicaoAtual
            )
    ) {

        campoInstituicao.value =
            instituicaoAtual;
    }
}


// =========================================================
// LISTA DE IES
// =========================================================

function renderizarInstituicoes() {

    const termo =
        document
            .getElementById(
                "busca-instituicoes"
            )
            .value
            .trim()
            .toLowerCase();


    let resultado =
        instituicoesCatalogo;


    if (termo) {

        resultado =
            resultado.filter(
                item => {

                    const texto = `
                        ${item.nome || ""}
                        ${item.sigla || ""}
                        ${item.cidade || ""}
                        ${item.estado || ""}
                        ${item.organizacao_academica || ""}
                        ${item.categoria_administrativa || ""}
                        ${item.codigo || ""}
                    `
                        .toLowerCase();


                    return texto.includes(
                        termo
                    );
                }
            );
    }


    const exibidos =
        resultado.slice(
            0,
            60
        );


    document
        .getElementById(
            "instituicoes-contagem"
        )
        .textContent =
        termo
            ? `${resultado.length} instituição(ões) encontrada(s)`
            : `${instituicoesCatalogo.length} instituições disponíveis`;


    const container =
        document.getElementById(
            "lista-instituicoes"
        );


    if (!exibidos.length) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Nenhuma instituição encontrada
                </h3>

            </div>
        `;

        return;
    }


    container.innerHTML =
        exibidos
            .map(
                item => {

                    const vinculada =
                        Number(item.id) ===
                        Number(
                            usuarioAtual
                                .universidade_id
                        );


                    const selecionada =
                        instituicoesComparacao
                            .has(
                                String(
                                    item.codigo
                                )
                            );


                    return `

                        <article
                            class="institution-card-dashboard ${
                                vinculada
                                    ? "linked"
                                    : ""
                            }"
                        >

                            <span
                                class="institution-card-code"
                            >
                                Código IES
                                ${escaparHtml(
                                    item.codigo
                                )}
                            </span>


                            <h3>
                                ${escaparHtml(
                                    item.nome
                                )}
                            </h3>


                            <p>
                                ${
                                    item.sigla
                                        ? escaparHtml(
                                            item.sigla
                                        ) + " • "
                                        : ""
                                }

                                ${escaparHtml(
                                    item.cidade ||
                                    "-"
                                )}

                                /

                                ${escaparHtml(
                                    item.estado ||
                                    "-"
                                )}
                            </p>


                            <p>
                                ${escaparHtml(
                                    item.organizacao_academica ||
                                    "-"
                                )}

                                ·

                                ${escaparHtml(
                                    item.categoria_administrativa ||
                                    "-"
                                )}
                            </p>


                            ${
                                vinculada
                                    ? `
                                        <span
                                            class="linked-badge"
                                        >
                                            Sua instituição
                                        </span>
                                    `
                                    : ""
                            }


                            <div
                                class="institution-card-actions"
                            >

                                <button
                                    type="button"
                                    data-acao="detalhes"
                                    data-codigo="${escaparHtml(
                                        item.codigo
                                    )}"
                                >
                                    Ver detalhes
                                </button>


                                <button
                                    type="button"
                                    class="${
                                        selecionada
                                            ? "active"
                                            : ""
                                    }"
                                    data-acao="comparar"
                                    data-codigo="${escaparHtml(
                                        item.codigo
                                    )}"
                                >
                                    ${
                                        selecionada
                                            ? "✓ Selecionada"
                                            : "+ Comparar"
                                    }
                                </button>

                            </div>

                        </article>
                    `;
                }
            )
            .join("");
}


// =========================================================
// DETALHES DA IES
// =========================================================

async function abrirDetalhesInstituicao(
    codigo
) {

    abrirModal(
        "modal-instituicao"
    );


    const container =
        document.getElementById(
            "modal-instituicao-conteudo"
        );


    container.innerHTML =
        "Carregando...";


    try {

        const resposta =
            await fetch(
                `/api/universidades/codigo/${encodeURIComponent(
                    codigo
                )}`
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao carregar instituição"
            );
        }


        const vinculada =
            Number(
                dados.instituicao.id
            ) ===
            Number(
                usuarioAtual
                    .universidade_id
            );


        container.innerHTML =
            renderHtmlDetalhesInstituicao(
                dados,
                vinculada
            );


    } catch (erro) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    ${escaparHtml(
                        erro.message
                    )}
                </h3>

            </div>
        `;
    }
}


function renderHtmlDetalhesInstituicao(
    dados,
    vinculada
) {

    const {
        instituicao,
        resumo_cursos,
        igc,
        trajetoria
    } =
        dados;


    return `

        <div class="modal-heading">

            <span class="section-eyebrow">
                Código IES
                ${escaparHtml(
                    instituicao.codigo
                )}
            </span>

            <h2>
                ${escaparHtml(
                    instituicao.nome
                )}
            </h2>

            <p>
                ${escaparHtml(
                    instituicao.cidade ||
                    "-"
                )}

                /

                ${escaparHtml(
                    instituicao.estado ||
                    "-"
                )}
            </p>

        </div>


        <div
            class="institution-info-grid"
        >

            ${itemInstituicao(
                "Organização",
                instituicao
                    .organizacao_academica
            )}

            ${itemInstituicao(
                "Categoria",
                instituicao
                    .categoria_administrativa
            )}

            ${itemInstituicao(
                "Cursos",
                resumo_cursos
                    ?.total_cursos
            )}

            ${itemInstituicao(
                "Presenciais",
                resumo_cursos
                    ?.cursos_presenciais
            )}

            ${itemInstituicao(
                "EAD",
                resumo_cursos
                    ?.cursos_ead
            )}

            ${itemInstituicao(
                "IGC",
                igc
                    ? `${exibirNumero(
                        igc.igc_continuo,
                        3
                    )} • Faixa ${
                        igc.igc_faixa ??
                        "-"
                    }`
                    : "-"
            )}

            ${itemInstituicao(
                "Conclusão",
                trajetoria
                    ? exibirPercentual(
                        trajetoria
                            .taxa_conclusao_acumulada
                    )
                    : "-"
            )}

            ${itemInstituicao(
                "Desistência",
                trajetoria
                    ? exibirPercentual(
                        trajetoria
                            .taxa_desistencia_acumulada
                    )
                    : "-"
            )}

            ${itemInstituicao(
                "Ainda vinculados",
                trajetoria
                    ? exibirPercentual(
                        trajetoria
                            .taxa_permanencia
                    )
                    : "-"
            )}

        </div>


        ${
            vinculada
                ? `
                    <div
                        class="institution-private-area"
                    >

                        <h3>
                            Indicadores internos
                        </h3>

                        <p>
                            Esta é sua instituição vinculada.
                            Por isso você também possui acesso
                            aos dados internos agregados.
                        </p>

                        <button
                            type="button"
                            class="btn-primary btn-auto"
                            onclick="
                                fecharModal('modal-instituicao');
                                abrirSecao('minha-instituicao');
                            "
                        >
                            Abrir visão institucional
                        </button>

                    </div>
                `
                : ""
        }
    `;
}


// =========================================================
// COMPARAÇÃO ENTRE IES
// =========================================================

function alternarComparacaoInstituicao(
    codigo
) {

    const chave =
        String(codigo);


    if (
        instituicoesComparacao
            .has(chave)
    ) {

        instituicoesComparacao
            .delete(chave);

    } else {

        if (
            instituicoesComparacao
                .size >=
            4
        ) {

            alert(
                "Selecione no máximo 4 instituições."
            );

            return;
        }


        const instituicao =
            instituicoesCatalogo
                .find(
                    item =>
                        String(
                            item.codigo
                        ) ===
                        chave
                );


        if (instituicao) {

            instituicoesComparacao
                .set(
                    chave,
                    instituicao
                );
        }
    }


    atualizarBarraComparacao();

    renderizarInstituicoes();
}


function atualizarBarraComparacao() {

    const barra =
        document.getElementById(
            "barra-comparacao-ies"
        );


    const quantidade =
        instituicoesComparacao
            .size;


    barra.classList.toggle(
        "hidden",
        quantidade === 0
    );


    document
        .getElementById(
            "comparacao-ies-selecionadas"
        )
        .textContent =
        `${quantidade} selecionada(s)`;


    document
        .getElementById(
            "btn-executar-comparacao-ies"
        )
        .disabled =
        quantidade < 2;
}


async function compararInstituicoes() {

    const codigos =
        [
            ...instituicoesComparacao
                .keys()
        ];


    if (
        codigos.length <
        2
    ) {

        return;
    }


    abrirModal(
        "modal-comparacao-ies"
    );


    const container =
        document.getElementById(
            "modal-comparacao-ies-conteudo"
        );


    container.innerHTML =
        "Carregando comparação...";


    try {

        const dados =
            await Promise.all(

                codigos.map(
                    async codigo => {

                        const resposta =
                            await fetch(
                                `/api/universidades/codigo/${encodeURIComponent(
                                    codigo
                                )}`
                            );


                        if (!resposta.ok) {

                            throw new Error(
                                "Erro ao comparar instituições"
                            );
                        }


                        return resposta.json();
                    }
                )
            );


        container.innerHTML =
            renderizarTabelaComparacaoIES(
                dados
            );


    } catch (erro) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    ${escaparHtml(
                        erro.message
                    )}
                </h3>

            </div>
        `;
    }
}


function renderizarTabelaComparacaoIES(
    lista
) {

    return `

        <div class="modal-heading">

            <span class="section-eyebrow">
                Comparação
            </span>

            <h2>
                Instituições selecionadas
            </h2>

            <p>
                Dados oficiais do Inep.
            </p>

        </div>


        <div
            class="dashboard-table-wrapper"
        >

            <table
                class="dashboard-table"
            >

                <thead>

                    <tr>
                        <th>Instituição</th>
                        <th>Local</th>
                        <th>IGC</th>
                        <th>Cursos</th>
                        <th>Conclusão</th>
                        <th>Desistência</th>
                        <th>Ainda vinculados</th>
                    </tr>

                </thead>


                <tbody>

                    ${
                        lista
                            .map(
                                dados => {

                                    const i =
                                        dados.instituicao;

                                    const vinculada =
                                        Number(
                                            i.id
                                        ) ===
                                        Number(
                                            usuarioAtual
                                                .universidade_id
                                        );


                                    return `

                                        <tr
                                            class="${
                                                vinculada
                                                    ? "linked-row"
                                                    : ""
                                            }"
                                        >

                                            <td>

                                                <strong>
                                                    ${escaparHtml(
                                                        i.sigla ||
                                                        i.nome
                                                    )}
                                                </strong>

                                                <small>
                                                    ${escaparHtml(
                                                        i.nome
                                                    )}
                                                </small>

                                            </td>

                                            <td>
                                                ${escaparHtml(
                                                    i.cidade ||
                                                    "-"
                                                )}
                                                /
                                                ${escaparHtml(
                                                    i.estado ||
                                                    "-"
                                                )}
                                            </td>

                                            <td>
                                                ${
                                                    dados.igc
                                                        ? `${exibirNumero(
                                                            dados
                                                                .igc
                                                                .igc_continuo,
                                                            3
                                                        )} • ${
                                                            dados
                                                                .igc
                                                                .igc_faixa ??
                                                            "-"
                                                        }`
                                                        : "-"
                                                }
                                            </td>

                                            <td>
                                                ${exibirNumero(
                                                    dados
                                                        .resumo_cursos
                                                        ?.total_cursos
                                                )}
                                            </td>

                                            <td>
                                                ${
                                                    dados.trajetoria
                                                        ? exibirPercentual(
                                                            dados
                                                                .trajetoria
                                                                .taxa_conclusao_acumulada
                                                        )
                                                        : "-"
                                                }
                                            </td>

                                            <td>
                                                ${
                                                    dados.trajetoria
                                                        ? exibirPercentual(
                                                            dados
                                                                .trajetoria
                                                                .taxa_desistencia_acumulada
                                                        )
                                                        : "-"
                                                }
                                            </td>

                                            <td>
                                                ${
                                                    dados.trajetoria
                                                        ? exibirPercentual(
                                                            dados
                                                                .trajetoria
                                                                .taxa_permanencia
                                                        )
                                                        : "-"
                                                }
                                            </td>

                                        </tr>
                                    `;
                                }
                            )
                            .join("")
                    }

                </tbody>

            </table>

        </div>
    `;
}


// =========================================================
// PESQUISA DE CURSOS
// =========================================================

async function pesquisarCursos() {

    const parametros =
        new URLSearchParams();


    const nome =
        document
            .getElementById(
                "curso-busca"
            )
            .value
            .trim();


    const estado =
        document
            .getElementById(
                "curso-estado"
            )
            .value;


    const cidade =
        document
            .getElementById(
                "curso-cidade"
            )
            .value;


    const universidadeId =
        document
            .getElementById(
                "curso-instituicao"
            )
            .value;


    const modalidade =
        document
            .getElementById(
                "curso-modalidade"
            )
            .value;


    const grau =
        document
            .getElementById(
                "curso-grau"
            )
            .value;


    if (nome) {

        parametros.set(
            "nome",
            nome
        );
    }


    if (estado) {

        parametros.set(
            "estado",
            estado
        );
    }


    if (cidade) {

        parametros.set(
            "cidade",
            cidade
        );
    }


    if (universidadeId) {

        parametros.set(
            "universidade_id",
            universidadeId
        );
    }


    if (modalidade) {

        parametros.set(
            "modalidade",
            modalidade
        );
    }


    if (grau) {

        parametros.set(
            "grau",
            grau
        );
    }


    parametros.set(
        "limite",
        "100"
    );


    const container =
        document.getElementById(
            "resultado-cursos"
        );


    container.innerHTML =
        `<div class="dashboard-loading">Pesquisando...</div>`;


    try {

        const resposta =
            await fetch(
                `/api/cursos?${parametros.toString()}`
            );


        const lista =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                lista.erro ||
                "Erro ao pesquisar cursos"
            );
        }


        renderizarResultadosCursos(
            lista
        );


    } catch (erro) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    ${escaparHtml(
                        erro.message
                    )}
                </h3>

            </div>
        `;
    }
}


function renderizarResultadosCursos(
    lista
) {

    const container =
        document.getElementById(
            "resultado-cursos"
        );


    if (!lista.length) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Nenhum curso encontrado
                </h3>

            </div>
        `;

        return;
    }


    container.innerHTML =
        lista
            .map(
                curso => {

                    const vinculada =
                        Number(
                            curso.universidade_id
                        ) ===
                        Number(
                            usuarioAtual
                                .universidade_id
                        );


                    return `

                        <article
                            class="course-card-dashboard ${
                                vinculada
                                    ? "linked"
                                    : ""
                            }"
                        >

                            <span
                                class="institution-card-code"
                            >
                                ${escaparHtml(
                                    curso.grau_academico ||
                                    "Graduação"
                                )}
                                ·
                                ${escaparHtml(
                                    curso.modalidade ||
                                    "-"
                                )}
                            </span>


                            <h3>
                                ${escaparHtml(
                                    curso.nome
                                )}
                            </h3>


                            <p>
                                ${escaparHtml(
                                    curso.universidade_sigla ||
                                    curso.universidade
                                )}
                            </p>


                            <p>
                                ${escaparHtml(
                                    curso.cidade ||
                                    "-"
                                )}
                                /
                                ${escaparHtml(
                                    curso.estado ||
                                    "-"
                                )}
                            </p>


                            ${
                                vinculada
                                    ? `
                                        <span
                                            class="linked-badge"
                                        >
                                            Sua instituição
                                        </span>
                                    `
                                    : ""
                            }

                        </article>
                    `;
                }
            )
            .join("");
}


// =========================================================
// COMPARAÇÃO DE CURSOS
// =========================================================

async function buscarOpcoesComparacaoCurso() {

    const busca =
        document
            .getElementById(
                "comparacao-curso"
            )
            .value
            .trim();


    if (
        busca.length <
        2
    ) {

        document
            .getElementById(
                "comparacao-cursos-opcoes"
            )
            .innerHTML =
            "";

        return;
    }


    try {

        const parametros =
            new URLSearchParams({
                busca
            });


        const resposta =
            await fetch(
                `/api/indicadores-inep/cursos/opcoes?${parametros.toString()}`
            );


        if (!resposta.ok) {

            return;
        }


        const dados =
            await resposta.json();


        document
            .getElementById(
                "comparacao-cursos-opcoes"
            )
            .innerHTML =
            dados
                .map(
                    item => `

                        <option
                            value="${escaparHtml(
                                item.curso
                            )}"
                        >
                            ${escaparHtml(
                                item.grau_academico ||
                                ""
                            )}
                        </option>
                    `
                )
                .join("");


    } catch (erro) {

        console.error(
            erro
        );
    }
}


async function compararCursos() {

    const curso =
        document
            .getElementById(
                "comparacao-curso"
            )
            .value
            .trim();


    if (!curso) {

        return;
    }


    const parametros =
        new URLSearchParams({
            curso
        });


    const campos = {

        estado:
            "comparacao-estado",

        cidade:
            "comparacao-cidade",

        universidade_id:
            "comparacao-instituicao",

        modalidade:
            "comparacao-modalidade",

        grau:
            "comparacao-grau"
    };


    Object.entries(
        campos
    )
        .forEach(
            ([
                parametro,
                id
            ]) => {

                const valor =
                    document
                        .getElementById(
                            id
                        )
                        .value;


                if (valor) {

                    parametros.set(
                        parametro,
                        valor
                    );
                }
            }
        );


    const container =
        document.getElementById(
            "resultado-comparacao-cursos"
        );


    container.innerHTML =
        `<div class="dashboard-loading">Comparando...</div>`;


    try {

        const resposta =
            await fetch(
                `/api/indicadores-inep/comparacao?${parametros.toString()}`
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao comparar cursos"
            );
        }


        renderizarComparacaoCursos(
            dados
        );


    } catch (erro) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    ${escaparHtml(
                        erro.message
                    )}
                </h3>

            </div>
        `;
    }
}


function renderizarComparacaoCursos(
    dados
) {

    const container =
        document.getElementById(
            "resultado-comparacao-cursos"
        );


    if (!dados.length) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Nenhum resultado encontrado
                </h3>

                <p>
                    Verifique o nome exato do curso
                    ou remova alguns filtros.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML = `

        <div
            class="dashboard-table-wrapper"
        >

            <table
                class="dashboard-table"
            >

                <thead>

                    <tr>
                        <th>Instituição</th>
                        <th>Modalidade</th>
                        <th>Conclusão</th>
                        <th>Desistência</th>
                        <th>Ainda vinculados</th>
                        <th>Enade participação</th>
                        <th>CPC</th>
                        <th>Enade</th>
                        <th>IDD</th>
                        <th>IGC</th>
                    </tr>

                </thead>


                <tbody>

                    ${
                        dados
                            .map(
                                item => {

                                    const vinculada =
                                        Number(
                                            item.universidade_id
                                        ) ===
                                        Number(
                                            usuarioAtual
                                                .universidade_id
                                        );


                                    return `

                                        <tr
                                            class="${
                                                vinculada
                                                    ? "linked-row"
                                                    : ""
                                            }"
                                        >

                                            <td>

                                                <strong>
                                                    ${escaparHtml(
                                                        item.sigla ||
                                                        item.instituicao
                                                    )}
                                                </strong>

                                                <small>
                                                    ${escaparHtml(
                                                        item.cidade ||
                                                        "-"
                                                    )}
                                                    /
                                                    ${escaparHtml(
                                                        item.estado ||
                                                        "-"
                                                    )}
                                                </small>

                                            </td>

                                            <td>
                                                ${escaparHtml(
                                                    item.modalidade ||
                                                    "-"
                                                )}
                                            </td>

                                            <td>
                                                ${exibirPercentual(
                                                    item.taxa_conclusao_acumulada
                                                )}
                                            </td>

                                            <td>
                                                ${exibirPercentual(
                                                    item.taxa_desistencia_acumulada
                                                )}
                                            </td>

                                            <td>
                                                ${exibirPercentual(
                                                    item.taxa_permanencia
                                                )}
                                            </td>

                                            <td>
                                                ${exibirPercentual(
                                                    item.taxa_participacao_enade
                                                )}
                                            </td>

                                            <td>
                                                ${item.cpc_faixa ?? "-"}
                                            </td>

                                            <td>
                                                ${item.conceito_enade_faixa ?? "-"}
                                            </td>

                                            <td>
                                                ${item.idd_faixa ?? "-"}
                                            </td>

                                            <td>
                                                ${item.igc_faixa ?? "-"}
                                            </td>

                                        </tr>
                                    `;
                                }
                            )
                            .join("")
                    }

                </tbody>

            </table>

        </div>
    `;
}


// =========================================================
// PERFIL
// =========================================================

async function abrirPerfil() {

    abrirModal(
        "modal-perfil"
    );


    limparMensagem(
        "perfil-mensagem"
    );

    limparMensagem(
        "senha-mensagem"
    );


    try {

        const resposta =
            await fetch(
                "/api/perfil"
            );


        const perfil =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                perfil.erro ||
                "Erro ao carregar perfil"
            );
        }


        document
            .getElementById(
                "perfil-nome"
            )
            .value =
            perfil.nome || "";


        document
            .getElementById(
                "perfil-email"
            )
            .value =
            perfil.email || "";


        document
            .getElementById(
                "perfil-tipo"
            )
            .value =
            nomePerfil(
                perfil.perfil
            );


        document
            .getElementById(
                "perfil-instituicao"
            )
            .value =
            perfil.universidade
                ? `${
                    perfil.universidade_sigla ||
                    perfil.universidade
                } — ${perfil.universidade}`
                : "-";


    } catch (erro) {

        mostrarMensagem(
            "perfil-mensagem",
            erro.message,
            "error"
        );
    }
}


async function salvarPerfil(
    event
) {

    event.preventDefault();


    limparMensagem(
        "perfil-mensagem"
    );


    try {

        const resposta =
            await fetch(
                "/api/perfil/dados",
                {
                    method:
                        "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            nome:
                                document
                                    .getElementById(
                                        "perfil-nome"
                                    )
                                    .value
                                    .trim(),

                            email:
                                document
                                    .getElementById(
                                        "perfil-email"
                                    )
                                    .value
                                    .trim()
                        })
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao atualizar perfil"
            );
        }


        usuarioAtual.nome =
            dados.usuario.nome;


        usuarioAtual.email =
            dados.usuario.email;


        document
            .getElementById(
                "dashboard-usuario-nome"
            )
            .textContent =
            dados.usuario.nome;


        mostrarMensagem(
            "perfil-mensagem",
            "Dados atualizados com sucesso.",
            "success"
        );


    } catch (erro) {

        mostrarMensagem(
            "perfil-mensagem",
            erro.message,
            "error"
        );
    }
}


async function alterarSenha(
    event
) {

    event.preventDefault();


    limparMensagem(
        "senha-mensagem"
    );


    const senhaAtual =
        document
            .getElementById(
                "perfil-senha-atual"
            )
            .value;


    const novaSenha =
        document
            .getElementById(
                "perfil-nova-senha"
            )
            .value;


    const confirmar =
        document
            .getElementById(
                "perfil-confirmar-senha"
            )
            .value;


    if (
        novaSenha !==
        confirmar
    ) {

        mostrarMensagem(
            "senha-mensagem",
            "A confirmação da nova senha não confere.",
            "error"
        );

        return;
    }


    try {

        const resposta =
            await fetch(
                "/api/perfil/senha",
                {
                    method:
                        "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            senha_atual:
                                senhaAtual,

                            nova_senha:
                                novaSenha,

                            confirmar_nova_senha:
                                confirmar
                        })
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao alterar senha"
            );
        }


        document
            .getElementById(
                "form-dashboard-senha"
            )
            .reset();


        mostrarMensagem(
            "senha-mensagem",
            "Senha alterada com sucesso.",
            "success"
        );


    } catch (erro) {

        mostrarMensagem(
            "senha-mensagem",
            erro.message,
            "error"
        );
    }
}


function mostrarMensagem(
    id,
    mensagem,
    tipo
) {

    const elemento =
        document.getElementById(
            id
        );


    elemento.textContent =
        mensagem;


    elemento.className =
        `dashboard-message visible ${tipo}`;
}


function limparMensagem(
    id
) {

    const elemento =
        document.getElementById(
            id
        );


    elemento.textContent =
        "";


    elemento.className =
        "dashboard-message";
}


// =========================================================
// MODAIS
// =========================================================

function abrirModal(
    id
) {

    document
        .getElementById(id)
        .classList
        .remove(
            "hidden"
        );


    document.body.style.overflow =
        "hidden";
}


function fecharModal(
    id
) {

    document
        .getElementById(id)
        .classList
        .add(
            "hidden"
        );


    document.body.style.overflow =
        "";
}


// =========================================================
// LIMPAR FILTROS DE CURSOS
// =========================================================

function limparFiltrosCursos() {

    document
        .getElementById(
            "curso-busca"
        )
        .value =
        "";


    document
        .getElementById(
            "curso-estado"
        )
        .value =
        "";


    atualizarFiltrosDependentes(
        "curso"
    );


    document
        .getElementById(
            "curso-modalidade"
        )
        .value =
        "";


    document
        .getElementById(
            "curso-grau"
        )
        .value =
        "";


    document
        .getElementById(
            "resultado-cursos"
        )
        .innerHTML = `

            <div class="empty-state">

                <h3>
                    Pesquise cursos
                </h3>

                <p>
                    Utilize os filtros acima.
                </p>

            </div>
        `;
}


// =========================================================
// EVENTOS
// =========================================================

function configurarEventos() {

    document
        .getElementById(
            "btn-dashboard-logout"
        )
        .addEventListener(
            "click",
            logout
        );


    document
        .getElementById(
            "btn-dashboard-perfil"
        )
        .addEventListener(
            "click",
            abrirPerfil
        );


    document
        .getElementById(
            "btn-instituicao-vinculada"
        )
        .addEventListener(
            "click",
            () => {

                abrirSecao(
                    "minha-instituicao"
                );
            }
        );


    document
        .getElementById(
            "btn-ver-minha-instituicao"
        )
        .addEventListener(
            "click",
            () => {

                abrirSecao(
                    "minha-instituicao"
                );
            }
        );


    document
        .getElementById(
            "btn-ir-comparacoes"
        )
        .addEventListener(
            "click",
            () => {

                abrirSecao(
                    "instituicoes"
                );
            }
        );


    document
        .querySelectorAll(
            ".dashboard-nav .nav-item"
        )
        .forEach(
            item => {

                item.addEventListener(
                    "click",
                    () => {

                        abrirSecao(
                            item.dataset.section
                        );
                    }
                );
            }
        );


    document
        .getElementById(
            "dashboard-ano"
        )
        .addEventListener(
            "change",
            carregarDadosInstitucionais
        );


    document
        .getElementById(
            "dashboard-semestre"
        )
        .addEventListener(
            "change",
            carregarDadosInstitucionais
        );


    document
        .getElementById(
            "busca-instituicoes"
        )
        .addEventListener(
            "input",
            renderizarInstituicoes
        );


    document
        .getElementById(
            "lista-instituicoes"
        )
        .addEventListener(
            "click",
            event => {

                const botao =
                    event.target.closest(
                        "button[data-acao]"
                    );


                if (!botao) {

                    return;
                }


                const codigo =
                    botao.dataset.codigo;


                if (
                    botao.dataset.acao ===
                    "detalhes"
                ) {

                    abrirDetalhesInstituicao(
                        codigo
                    );
                }


                if (
                    botao.dataset.acao ===
                    "comparar"
                ) {

                    alternarComparacaoInstituicao(
                        codigo
                    );
                }
            }
        );


    document
        .getElementById(
            "btn-executar-comparacao-ies"
        )
        .addEventListener(
            "click",
            compararInstituicoes
        );


    document
        .getElementById(
            "curso-estado"
        )
        .addEventListener(
            "change",
            () => {

                atualizarFiltrosDependentes(
                    "curso"
                );
            }
        );


    document
        .getElementById(
            "curso-cidade"
        )
        .addEventListener(
            "change",
            () => {

                atualizarFiltrosDependentes(
                    "curso"
                );
            }
        );


    document
        .getElementById(
            "comparacao-estado"
        )
        .addEventListener(
            "change",
            () => {

                atualizarFiltrosDependentes(
                    "comparacao"
                );
            }
        );


    document
        .getElementById(
            "comparacao-cidade"
        )
        .addEventListener(
            "change",
            () => {

                atualizarFiltrosDependentes(
                    "comparacao"
                );
            }
        );


    document
        .getElementById(
            "btn-buscar-cursos"
        )
        .addEventListener(
            "click",
            pesquisarCursos
        );


    document
        .getElementById(
            "btn-limpar-cursos"
        )
        .addEventListener(
            "click",
            limparFiltrosCursos
        );


    document
        .getElementById(
            "comparacao-curso"
        )
        .addEventListener(
            "input",
            () => {

                clearTimeout(
                    timerBuscaComparacaoCurso
                );


                timerBuscaComparacaoCurso =
                    setTimeout(
                        buscarOpcoesComparacaoCurso,
                        300
                    );
            }
        );


    document
        .getElementById(
            "btn-comparar-cursos"
        )
        .addEventListener(
            "click",
            compararCursos
        );


    document
        .getElementById(
            "form-dashboard-perfil"
        )
        .addEventListener(
            "submit",
            salvarPerfil
        );


    document
        .getElementById(
            "form-dashboard-senha"
        )
        .addEventListener(
            "submit",
            alterarSenha
        );


    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        fecharModal(
                            botao.dataset
                                .closeModal
                        );
                    }
                );
            }
        );


    document
        .querySelectorAll(
            ".dashboard-modal-backdrop"
        )
        .forEach(
            modal => {

                modal.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            modal
                        ) {

                            fecharModal(
                                modal.id
                            );
                        }
                    }
                );
            }
        );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {

                return;
            }


            document
                .querySelectorAll(
                    ".dashboard-modal-backdrop:not(.hidden)"
                )
                .forEach(
                    modal => {

                        fecharModal(
                            modal.id
                        );
                    }
                );
        }
    );
}


// =========================================================
// INICIALIZAÇÃO
// =========================================================

async function iniciarDashboard() {

    const autorizado =
        await carregarUsuario();


    if (!autorizado) {

        return;
    }


    configurarEventos();


    await Promise.all([

        carregarDadosInstitucionais(),

        carregarCatalogoInstituicoes()

    ]);
}


iniciarDashboard();