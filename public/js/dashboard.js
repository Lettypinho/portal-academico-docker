let usuarioAtual = null;

let dadosDashboard = null;

let cursosInstituicao = [];

let disciplinasInstituicao = [];


// =========================================================
// SEGURANÇA
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


// =========================================================
// AUXILIARES
// =========================================================

function numero(valor) {

    const convertido =
        Number(valor);


    return Number.isFinite(convertido)
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


    return convertido.toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits:
                casas,

            maximumFractionDigits:
                casas
        }
    );
}


function exibirPercentual(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "-";
    }


    return (
        `${exibirNumero(valor, 2)}%`
    );
}


function nomePerfil(perfil) {

    const perfis = {

        consulta_institucional:
            "Consulta institucional",

        gestor:
            "Gestor",

        admin_universidade:
            "Administrador da instituição",

        super_admin:
            "Super administrador",

        publico:
            "Público"
    };


    return (
        perfis[perfil] ||
        perfil
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
            "publico"
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


        return true;


    } catch (erro) {

        console.error(
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
// CARREGAR DADOS
// =========================================================

async function carregarDados() {

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

            const erro =
                await respostaDashboard
                    .json()
                    .catch(
                        () => ({})
                    );


            throw new Error(
                erro.erro ||
                "Erro ao carregar dashboard"
            );
        }


        dadosDashboard =
            await respostaDashboard.json();


        cursosInstituicao =
            respostaCursos.ok
                ? await respostaCursos.json()
                : [];


        disciplinasInstituicao =
            respostaDisciplinas.ok
                ? await respostaDisciplinas.json()
                : [];


        renderizarDashboard();


    } catch (erro) {

        console.error(
            erro
        );


        document
            .querySelector(
                ".dashboard-main"
            )
            .innerHTML = `

                <div class="dashboard-error">

                    <h2>
                        Não foi possível carregar
                        o dashboard
                    </h2>

                    <p>
                        ${escaparHtml(
                            erro.message
                        )}
                    </p>

                </div>
            `;
    }
}


// =========================================================
// INSTITUIÇÃO
// =========================================================

function renderizarInstituicao() {

    const instituicao =
        dadosDashboard
            .universidade;


    const nome =
        instituicao
            .universidade;


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
            "sidebar-instituicao"
        )
        .textContent =
            sigla;


    document
        .getElementById(
            "sidebar-instituicao-codigo"
        )
        .textContent =
            `Código IES ${instituicao.codigo}`;
}


// =========================================================
// INDICADOR DO PERÍODO
// =========================================================

function obterIndicadorPeriodo() {

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
            )
        ||
        null
    );
}


// =========================================================
// CARDS
// =========================================================

function renderizarCards() {

    const instituicao =
        dadosDashboard
            .universidade;


    const indicador =
        obterIndicadorPeriodo();


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
                    indicador.taxa_aprovacao
                )
                : "-";


    document
        .getElementById(
            "stat-frequencia"
        )
        .textContent =
            indicador
                ? exibirPercentual(
                    indicador.frequencia_media
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
}


// =========================================================
// SITUAÇÃO DOS ALUNOS
// =========================================================

function atualizarBarra(
    id,
    quantidade,
    total
) {

    const percentual =
        total > 0
            ? Math.min(
                100,
                (
                    quantidade /
                    total
                ) * 100
            )
            : 0;


    document
        .getElementById(id)
        .style.width =
            `${percentual}%`;
}


function renderizarSituacaoAlunos() {

    const situacao =
        dadosDashboard
            .situacao_alunos
        || {};


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


    atualizarBarra(
        "barra-ativos",
        ativos,
        total
    );


    atualizarBarra(
        "barra-trancados",
        trancados,
        total
    );


    atualizarBarra(
        "barra-formados",
        formados,
        total
    );


    atualizarBarra(
        "barra-evadidos",
        evadidos,
        total
    );


    // Cards da aba Alunos

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
                situacao.taxa_evasao_atual
            );
}


// =========================================================
// DESEMPENHO
// =========================================================

function renderizarDesempenho() {

    const indicador =
        obterIndicadorPeriodo();


    document
        .getElementById(
            "indicador-alunos-avaliados"
        )
        .textContent =
            indicador
                ? exibirNumero(
                    indicador.alunos_avaliados
                )
                : "-";


    document
        .getElementById(
            "indicador-cursos-resultados"
        )
        .textContent =
            indicador
                ? exibirNumero(
                    indicador.cursos_com_resultados
                )
                : "-";


    document
        .getElementById(
            "indicador-aprovacao"
        )
        .textContent =
            indicador
                ? exibirPercentual(
                    indicador.taxa_aprovacao
                )
                : "-";


    document
        .getElementById(
            "indicador-reprovacao"
        )
        .textContent =
            indicador
                ? exibirPercentual(
                    indicador.taxa_reprovacao
                )
                : "-";


    document
        .getElementById(
            "indicador-frequencia"
        )
        .textContent =
            indicador
                ? exibirPercentual(
                    indicador.frequencia_media
                )
                : "-";
}


// =========================================================
// DESEMPENHO POR CURSO
// =========================================================

function encontrarDesempenhoCurso(
    curso
) {

    const {
        ano,
        semestre
    } =
        obterPeriodo();


    return (
        dadosDashboard
            .cursos
            .find(
                item =>
                    Number(item.curso_id) ===
                        Number(curso.id) &&
                    String(item.ano) ===
                        String(ano) &&
                    String(item.semestre) ===
                        String(semestre)
            )
        ||
        null
    );
}


// =========================================================
// CURSOS
// =========================================================

function descricaoCargaCurso(
    curso
) {

    if (
        curso.duracao_semestres
    ) {

        return (
            `${curso.duracao_semestres} semestres`
        );
    }


    if (
        curso.carga_horaria
    ) {

        return (
            `${curso.carga_horaria} h`
        );
    }


    return "-";
}


function renderizarCursos(
    lista = cursosInstituicao
) {

    const tbody =
        document.getElementById(
            "tabela-dashboard-cursos"
        );


    if (!lista.length) {

        tbody.innerHTML = `
            <tr>

                <td colspan="6">

                    <div class="dashboard-empty">

                        Nenhum curso encontrado.

                    </div>

                </td>

            </tr>
        `;


        return;
    }


    tbody.innerHTML =
        lista
            .map(
                curso => {

                    const desempenho =
                        encontrarDesempenhoCurso(
                            curso
                        );


                    return `

                        <tr>

                            <td>

                                <div class="dashboard-table-main">

                                    <strong>
                                        ${escaparHtml(
                                            curso.nome
                                        )}
                                    </strong>

                                    <span>
                                        ${
                                            curso.codigo_inep
                                                ? `Código Inep ${escaparHtml(
                                                    curso.codigo_inep
                                                )}`
                                                : "Cadastro institucional"
                                        }
                                    </span>

                                </div>

                            </td>


                            <td>
                                ${escaparHtml(
                                    curso.grau_academico ||
                                    "-"
                                )}
                            </td>


                            <td>
                                ${escaparHtml(
                                    curso.modalidade ||
                                    "-"
                                )}
                            </td>


                            <td>
                                ${escaparHtml(
                                    descricaoCargaCurso(
                                        curso
                                    )
                                )}
                            </td>


                            <td>
                                ${
                                    desempenho
                                        ? exibirNumero(
                                            desempenho.media_geral,
                                            2
                                        )
                                        : "-"
                                }
                            </td>


                            <td>
                                ${
                                    desempenho
                                        ? exibirPercentual(
                                            desempenho.taxa_aprovacao
                                        )
                                        : "-"
                                }
                            </td>

                        </tr>
                    `;
                }
            )
            .join("");
}


// =========================================================
// FILTRAR CURSOS
// =========================================================

function filtrarCursos() {

    const termo =
        document
            .getElementById(
                "busca-dashboard-cursos"
            )
            .value
            .toLowerCase()
            .trim();


    const resultado =
        cursosInstituicao.filter(
            curso => {

                const texto = `
                    ${curso.nome || ""}
                    ${curso.codigo_inep || ""}
                    ${curso.grau_academico || ""}
                    ${curso.modalidade || ""}
                `
                    .toLowerCase();


                return texto.includes(
                    termo
                );
            }
        );


    renderizarCursos(
        resultado
    );
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


    const disciplinas =
        disciplinasInstituicao.filter(
            item =>
                String(item.ano) ===
                    String(ano) &&
                String(item.semestre) ===
                    String(semestre)
        );


    if (!disciplinas.length) {

        tbody.innerHTML = `
            <tr>

                <td colspan="6">

                    <div class="dashboard-empty">

                        Não existem indicadores de
                        disciplinas para este período.

                    </div>

                </td>

            </tr>
        `;


        return;
    }


    tbody.innerHTML =
        disciplinas
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
// RENDERIZAÇÃO GERAL
// =========================================================

function renderizarDashboard() {

    renderizarInstituicao();

    renderizarCards();

    renderizarSituacaoAlunos();

    renderizarDesempenho();

    renderizarCursos();

    renderizarDisciplinas();
}


// =========================================================
// NAVEGAÇÃO
// =========================================================

function abrirSecao(
    nome
) {

    document
        .querySelectorAll(
            ".dashboard-nav-item"
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
            section => {

                section.classList.toggle(
                    "active",
                    section.id ===
                        nome
                );
            }
        );
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
        .querySelectorAll(
            ".dashboard-nav-item"
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
            carregarDados
        );


    document
        .getElementById(
            "dashboard-semestre"
        )
        .addEventListener(
            "change",
            carregarDados
        );


    document
        .getElementById(
            "busca-dashboard-cursos"
        )
        .addEventListener(
            "input",
            filtrarCursos
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


    await carregarDados();
}


iniciarDashboard();