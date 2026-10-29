// =========================================================
// SIA - ADMINISTRAÇÃO DA INSTITUIÇÃO
// Disponível para admin_universidade
// =========================================================


let usuarioAdminInstituicao =
    null;

let usuariosAdminInstituicao =
    [];


// =========================================================
// UTILITÁRIOS
// =========================================================

function escaparHtmlAdmin(
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


function formatarDataAdmin(
    valor
) {

    if (!valor) {

        return "-";
    }


    const data =
        new Date(
            valor
        );


    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return "-";
    }


    return data
        .toLocaleDateString(
            "pt-BR",
            {
                day:
                    "2-digit",

                month:
                    "2-digit",

                year:
                    "numeric"
            }
        );
}


function nomePerfilAdmin(
    perfil
) {

    const nomes = {

        aluno:
            "Aluno",

        consulta_institucional:
            "Consulta institucional",

        gestor:
            "Gestor",

        admin_universidade:
            "Administrador da instituição"
    };


    return (
        nomes[perfil] ||
        perfil ||
        "-"
    );
}


function nomeStatusAdmin(
    status
) {

    const nomes = {

        pendente:
            "Pendente",

        aprovado:
            "Aprovado",

        rejeitado:
            "Rejeitado",

        cancelado:
            "Cancelado",

        revogado:
            "Revogado"
    };


    return (
        nomes[status] ||
        status ||
        "-"
    );
}


// =========================================================
// ÍCONE DE CONFIGURAÇÕES DO PRÓPRIO ADMIN
//
// Aproveita o modal de perfil já existente no dashboard.
// Apenas troca o ícone do botão para engrenagem.
// =========================================================

function configurarBotaoConfiguracoesAdmin() {

    const botao =
        document.getElementById(
            "btn-dashboard-perfil"
        );


    if (!botao) {

        return;
    }


    botao.title =
        "Configurações da conta";


    botao.setAttribute(
        "aria-label",
        "Abrir configurações da conta"
    );


    botao.classList.add(
        "admin-settings-button"
    );


    botao.innerHTML = `

        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >

            <circle
                cx="12"
                cy="12"
                r="3"
            ></circle>

            <path
                d="
                    M19.4 15
                    a1.7 1.7 0 0 0 .34 1.88
                    l.06.06
                    a2 2 0 1 1-2.83 2.83
                    l-.06-.06
                    A1.7 1.7 0 0 0 15 19.4
                    a1.7 1.7 0 0 0-1 .6
                    a1.7 1.7 0 0 0-.5 1.2
                    V21
                    a2 2 0 1 1-4 0
                    v-.09
                    A1.7 1.7 0 0 0 8.4 19.4
                    a1.7 1.7 0 0 0-1.88.34
                    l-.06.06
                    a2 2 0 1 1-2.83-2.83
                    l.06-.06
                    A1.7 1.7 0 0 0 4.6 15
                    a1.7 1.7 0 0 0-.6-1
                    a1.7 1.7 0 0 0-1.2-.5
                    H3
                    a2 2 0 1 1 0-4
                    h.09
                    A1.7 1.7 0 0 0 4.6 8.4
                    a1.7 1.7 0 0 0-.34-1.88
                    l-.06-.06
                    a2 2 0 1 1 2.83-2.83
                    l.06.06
                    A1.7 1.7 0 0 0 9 4.6
                    a1.7 1.7 0 0 0 1-.6
                    a1.7 1.7 0 0 0 .5-1.2
                    V3
                    a2 2 0 1 1 4 0
                    v.09
                    A1.7 1.7 0 0 0 15.6 4.6
                    a1.7 1.7 0 0 0 1.88-.34
                    l.06-.06
                    a2 2 0 1 1 2.83 2.83
                    l-.06.06
                    A1.7 1.7 0 0 0 19.4 9
                    a1.7 1.7 0 0 0 .6 1
                    a1.7 1.7 0 0 0 1.2.5
                    H21
                    a2 2 0 1 1 0 4
                    h-.09
                    A1.7 1.7 0 0 0 19.4 15
                "
            ></path>

        </svg>
    `;
}


// =========================================================
// MENSAGEM GLOBAL
// =========================================================

function mostrarMensagemAdmin(
    texto,
    tipo = "success"
) {

    const elemento =
        document.getElementById(
            "admin-ies-mensagem"
        );


    if (!elemento) {

        return;
    }


    elemento.textContent =
        texto;


    elemento.className =
        `admin-ies-message visible ${tipo}`;


    window.clearTimeout(
        elemento._timer
    );


    elemento._timer =
        window.setTimeout(
            () => {

                elemento.className =
                    "admin-ies-message";


                elemento.textContent =
                    "";

            },
            5000
        );
}


// =========================================================
// CRIAR MODAL DE EDIÇÃO DE CONTA
//
// IMPORTANTE:
// fica diretamente no BODY.
// Isso impede o modal de ficar escondido dentro
// de uma dashboard-section.
// =========================================================

function criarModalContaAdmin() {

    if (
        document.getElementById(
            "admin-modal-conta"
        )
    ) {

        return;
    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "admin-modal-conta";


    modal.className =
        "admin-account-modal hidden";


    modal.innerHTML = `

        <div
            class="admin-account-backdrop"
            data-fechar-conta
        ></div>


        <div
            class="admin-account-card"
            role="dialog"
            aria-modal="true"
            aria-label="Editar conta"
        >

            <div class="admin-account-header">

                <div>

                    <span class="section-eyebrow">
                        Configurações da conta
                    </span>

                    <h2>
                        Editar usuário
                    </h2>

                    <p id="admin-conta-subtitulo">
                        Atualize os dados da conta.
                    </p>

                </div>


                <button
                    type="button"
                    class="admin-account-close"
                    data-fechar-conta
                    aria-label="Fechar"
                >
                    ×
                </button>

            </div>


            <form id="admin-form-conta">

                <input
                    type="hidden"
                    id="admin-conta-id"
                >


                <!-- =====================================
                     DADOS DA CONTA
                     ===================================== -->

                <section class="admin-account-section">

                    <div class="admin-account-section-title">

                        <h3>
                            Dados da conta
                        </h3>

                        <p>
                            Nome, e-mail e nível de acesso.
                        </p>

                    </div>


                    <div class="admin-account-grid">

                        <div class="admin-account-field">

                            <label for="admin-conta-nome">
                                Nome
                            </label>

                            <input
                                type="text"
                                id="admin-conta-nome"
                                maxlength="150"
                                autocomplete="name"
                                required
                            >

                        </div>


                        <div class="admin-account-field">

                            <label for="admin-conta-email">
                                E-mail
                            </label>

                            <input
                                type="email"
                                id="admin-conta-email"
                                maxlength="150"
                                autocomplete="email"
                                required
                            >

                        </div>


                        <div class="admin-account-field full">

                            <label for="admin-conta-perfil">
                                Perfil
                            </label>

                            <select
                                id="admin-conta-perfil"
                                required
                            ></select>

                            <small
                                id="admin-conta-perfil-aviso"
                                class="admin-account-help"
                            ></small>

                        </div>

                    </div>

                </section>


                <!-- =====================================
                     SEGURANÇA
                     ===================================== -->

                <section class="admin-account-section">

                    <div class="admin-account-section-title">

                        <h3>
                            Segurança
                        </h3>

                        <p>
                            Altere ou redefina a senha da conta.
                        </p>

                    </div>


                    <div class="admin-account-grid">


                        <div
                            id="admin-grupo-senha-atual"
                            class="admin-account-field full hidden"
                        >

                            <label for="admin-conta-senha-atual">
                                Senha atual
                            </label>

                            <input
                                type="password"
                                id="admin-conta-senha-atual"
                                maxlength="72"
                                autocomplete="current-password"
                            >

                            <small class="admin-account-help">
                                Para alterar sua própria senha,
                                confirme primeiro a senha atual.
                            </small>

                        </div>


                        <div class="admin-account-field">

                            <label for="admin-conta-nova-senha">
                                Nova senha
                            </label>

                            <input
                                type="password"
                                id="admin-conta-nova-senha"
                                minlength="6"
                                maxlength="72"
                                autocomplete="new-password"
                            >

                            <small
                                id="admin-conta-senha-ajuda"
                                class="admin-account-help"
                            >
                                Deixe em branco para manter
                                a senha atual.
                            </small>

                        </div>


                        <div class="admin-account-field">

                            <label for="admin-conta-confirmar-senha">
                                Confirmar nova senha
                            </label>

                            <input
                                type="password"
                                id="admin-conta-confirmar-senha"
                                minlength="6"
                                maxlength="72"
                                autocomplete="new-password"
                            >

                        </div>

                    </div>

                </section>


                <div
                    id="admin-conta-mensagem"
                    class="admin-account-message"
                ></div>


                <div class="admin-account-actions">

                    <button
                        type="button"
                        class="admin-account-cancel"
                        data-fechar-conta
                    >
                        Cancelar
                    </button>


                    <button
                        type="submit"
                        id="admin-conta-salvar"
                        class="admin-account-save"
                    >
                        Salvar alterações
                    </button>

                </div>

            </form>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    document
        .getElementById(
            "admin-form-conta"
        )
        .addEventListener(
            "submit",
            salvarContaAdmin
        );


    modal
        .querySelectorAll(
            "[data-fechar-conta]"
        )
        .forEach(
            elemento => {

                elemento.addEventListener(
                    "click",
                    fecharModalContaAdmin
                );
            }
        );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                fecharModalContaAdmin();
            }
        }
    );
}


// =========================================================
// CRIAR ABA DE ADMINISTRAÇÃO
// =========================================================

function criarAbaAdministracao() {

    if (
        document.getElementById(
            "nav-administracao"
        )
    ) {

        return;
    }


    const nav =
        document.querySelector(
            ".dashboard-nav"
        );


    const main =
        document.querySelector(
            ".institutional-main"
        );


    if (
        !nav ||
        !main
    ) {

        return;
    }


    // =====================================================
    // ITEM DO MENU
    // =====================================================

    const botao =
        document.createElement(
            "button"
        );


    botao.type =
        "button";


    botao.id =
        "nav-administracao";


    botao.className =
        "nav-item admin-nav-item";


    botao.dataset.section =
        "administracao";


    botao.innerHTML = `

        Administração

        <span
            id="admin-ies-badge-pendentes"
            class="admin-nav-badge hidden"
        >
            0
        </span>
    `;


    nav.appendChild(
        botao
    );


    // =====================================================
    // CONTEÚDO
    // =====================================================

    const secao =
        document.createElement(
            "section"
        );


    secao.id =
        "administracao";


    secao.className =
        "dashboard-section";


    secao.innerHTML = `

        <div class="section-header admin-ies-page-header">

            <div>

                <span class="section-eyebrow">
                    Gestão institucional
                </span>

                <h2>
                    Administração
                </h2>

                <p>
                    Gerencie solicitações de vínculo,
                    usuários, contas e permissões
                    da sua instituição.
                </p>

            </div>


            <button
                type="button"
                id="btn-admin-ies-atualizar"
                class="btn-secondary-dashboard"
            >
                Atualizar
            </button>

        </div>


        <div
            id="admin-ies-mensagem"
            class="admin-ies-message"
        ></div>


        <!-- =============================================
             RESUMO
             ============================================= -->

        <div class="admin-ies-summary-grid">

            <article>

                <span>
                    Solicitações pendentes
                </span>

                <strong id="admin-resumo-pendentes">
                    -
                </strong>

            </article>


            <article>

                <span>
                    Usuários vinculados
                </span>

                <strong id="admin-resumo-usuarios">
                    -
                </strong>

            </article>


            <article>

                <span>
                    Alunos vinculados
                </span>

                <strong id="admin-resumo-alunos">
                    -
                </strong>

            </article>


            <article>

                <span>
                    Funcionários
                </span>

                <strong id="admin-resumo-funcionarios">
                    -
                </strong>

            </article>

        </div>


        <!-- =============================================
             SOLICITAÇÕES
             ============================================= -->

        <div class="dashboard-panel admin-ies-panel">

            <div class="admin-ies-panel-header">

                <div>

                    <span class="section-eyebrow">
                        Vínculos
                    </span>

                    <h3>
                        Solicitações de vínculo
                    </h3>

                    <p>
                        Analise solicitações feitas
                        por alunos e funcionários.
                    </p>

                </div>


                <label class="admin-ies-filter">

                    Status

                    <select id="admin-filtro-status">

                        <option value="pendente">
                            Pendentes
                        </option>

                        <option value="aprovado">
                            Aprovadas
                        </option>

                        <option value="rejeitado">
                            Rejeitadas
                        </option>

                        <option value="cancelado">
                            Canceladas
                        </option>

                        <option value="revogado">
                            Revogadas
                        </option>

                    </select>

                </label>

            </div>


            <div
                id="admin-ies-solicitacoes"
                class="admin-ies-request-list"
            >

                <div class="empty-state">

                    <h3>
                        Carregando...
                    </h3>

                </div>

            </div>

        </div>


        <!-- =============================================
             USUÁRIOS
             ============================================= -->

        <div class="dashboard-panel admin-ies-panel">

            <div class="admin-ies-panel-header">

                <div>

                    <span class="section-eyebrow">
                        Contas
                    </span>

                    <h3>
                        Usuários vinculados
                    </h3>

                    <p>
                        Clique em
                        <strong>Editar conta</strong>
                        para alterar nome, e-mail,
                        perfil ou senha.
                    </p>

                </div>


                <div class="admin-ies-user-search">

                    <input
                        type="search"
                        id="admin-busca-usuarios"
                        placeholder="Pesquisar nome ou e-mail..."
                        autocomplete="off"
                    >

                </div>

            </div>


            <div class="dashboard-table-wrapper">

                <table class="dashboard-table admin-users-table">

                    <thead>

                        <tr>

                            <th>
                                Usuário
                            </th>

                            <th>
                                Perfil
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Ação
                            </th>

                        </tr>

                    </thead>


                    <tbody id="admin-ies-usuarios">

                        <tr>

                            <td colspan="4">
                                Carregando...
                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>
    `;


    main.appendChild(
        secao
    );


    configurarEventosAdminInstituicao();
}


// =========================================================
// ABRIR ADMINISTRAÇÃO
// =========================================================

function abrirAdministracaoInstituicao() {

    if (
        typeof abrirSecao ===
        "function"
    ) {

        abrirSecao(
            "administracao"
        );

    } else {

        document
            .querySelectorAll(
                ".dashboard-nav .nav-item"
            )
            .forEach(
                item => {

                    item.classList.toggle(
                        "active",
                        item.dataset.section ===
                            "administracao"
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
                            "administracao"
                    );
                }
            );
    }


    carregarAdministracaoInstituicao();
}


// =========================================================
// EVENTOS DA ABA
// =========================================================

function configurarEventosAdminInstituicao() {

    document
        .getElementById(
            "nav-administracao"
        )
        .addEventListener(
            "click",
            abrirAdministracaoInstituicao
        );


    document
        .getElementById(
            "btn-admin-ies-atualizar"
        )
        .addEventListener(
            "click",
            carregarAdministracaoInstituicao
        );


    document
        .getElementById(
            "admin-filtro-status"
        )
        .addEventListener(
            "change",
            carregarSolicitacoesAdmin
        );


    document
        .getElementById(
            "admin-busca-usuarios"
        )
        .addEventListener(
            "input",
            renderizarUsuariosAdmin
        );


    document
        .getElementById(
            "admin-ies-solicitacoes"
        )
        .addEventListener(
            "click",
            tratarCliqueSolicitacao
        );


    document
        .getElementById(
            "admin-ies-usuarios"
        )
        .addEventListener(
            "click",
            tratarCliqueUsuario
        );
}


// =========================================================
// CARREGAR ADMINISTRAÇÃO
// =========================================================

async function carregarAdministracaoInstituicao() {

    await Promise.all([

        carregarResumoAdmin(),

        carregarSolicitacoesAdmin(),

        carregarUsuariosAdmin()
    ]);
}


// =========================================================
// RESUMO
// =========================================================

async function carregarResumoAdmin() {

    try {

        const resposta =
            await fetch(
                "/api/admin-instituicao/resumo"
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao carregar resumo"
            );
        }


        document
            .getElementById(
                "admin-resumo-pendentes"
            )
            .textContent =
            dados.solicitacoes_pendentes ??
            0;


        document
            .getElementById(
                "admin-resumo-usuarios"
            )
            .textContent =
            dados.usuarios_vinculados ??
            0;


        document
            .getElementById(
                "admin-resumo-alunos"
            )
            .textContent =
            dados.alunos_vinculados ??
            0;


        document
            .getElementById(
                "admin-resumo-funcionarios"
            )
            .textContent =
            dados.funcionarios_vinculados ??
            0;


        atualizarBadgeAdmin(
            Number(
                dados.solicitacoes_pendentes ||
                0
            )
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar resumo:",
            erro
        );
    }
}


// =========================================================
// BADGE
// =========================================================

function atualizarBadgeAdmin(
    quantidade
) {

    const badge =
        document.getElementById(
            "admin-ies-badge-pendentes"
        );


    if (!badge) {

        return;
    }


    badge.textContent =
        quantidade;


    badge.classList.toggle(
        "hidden",
        quantidade <= 0
    );
}


// =========================================================
// SOLICITAÇÕES
// =========================================================

async function carregarSolicitacoesAdmin() {

    const container =
        document.getElementById(
            "admin-ies-solicitacoes"
        );


    if (!container) {

        return;
    }


    const status =
        document
            .getElementById(
                "admin-filtro-status"
            )
            ?.value ||
        "pendente";


    container.innerHTML = `

        <div class="empty-state">

            <h3>
                Carregando solicitações...
            </h3>

        </div>
    `;


    try {

        const resposta =
            await fetch(
                `/api/admin-instituicao/solicitacoes?status=${encodeURIComponent(
                    status
                )}`
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao consultar solicitações"
            );
        }


        renderizarSolicitacoesAdmin(
            dados
        );


    } catch (erro) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Não foi possível carregar
                </h3>

                <p>
                    ${escaparHtmlAdmin(
                        erro.message
                    )}
                </p>

            </div>
        `;
    }
}


// =========================================================
// RENDERIZAR SOLICITAÇÕES
// =========================================================

function renderizarSolicitacoesAdmin(
    solicitacoes
) {

    const container =
        document.getElementById(
            "admin-ies-solicitacoes"
        );


    if (
        !Array.isArray(
            solicitacoes
        ) ||
        solicitacoes.length ===
            0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Nenhuma solicitação
                </h3>

                <p>
                    Não existem solicitações
                    com o status selecionado.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        solicitacoes
            .map(
                solicitacao => {

                    const funcionario =
                        solicitacao.tipo_vinculo ===
                        "funcionario";


                    const pendente =
                        solicitacao.status ===
                        "pendente";


                    return `

                        <article class="admin-request-card">

                            <div class="admin-request-header">

                                <div>

                                    <div class="admin-request-badges">

                                        <span
                                            class="
                                                admin-status-badge
                                                status-${escaparHtmlAdmin(
                                                    solicitacao.status
                                                )}
                                            "
                                        >

                                            ${escaparHtmlAdmin(
                                                nomeStatusAdmin(
                                                    solicitacao.status
                                                )
                                            )}

                                        </span>


                                        <span class="admin-request-type">

                                            ${
                                                funcionario
                                                    ? "Funcionário"
                                                    : "Aluno"
                                            }

                                        </span>

                                    </div>


                                    <h4>

                                        ${escaparHtmlAdmin(
                                            solicitacao.usuario_nome
                                        )}

                                    </h4>


                                    <p>

                                        ${escaparHtmlAdmin(
                                            solicitacao.usuario_email
                                        )}

                                    </p>

                                </div>


                                <small>

                                    ${formatarDataAdmin(
                                        solicitacao.criado_em
                                    )}

                                </small>

                            </div>


                            <div class="admin-request-details">

                                <div>

                                    <span>
                                        E-mail institucional
                                    </span>

                                    <strong>

                                        ${escaparHtmlAdmin(
                                            solicitacao.email_institucional
                                        )}

                                    </strong>

                                </div>


                                ${
                                    solicitacao.matricula
                                        ? `

                                            <div>

                                                <span>
                                                    Matrícula
                                                </span>

                                                <strong>
                                                    ${escaparHtmlAdmin(
                                                        solicitacao.matricula
                                                    )}
                                                </strong>

                                            </div>
                                        `
                                        : ""
                                }


                                ${
                                    solicitacao.curso
                                        ? `

                                            <div>

                                                <span>
                                                    Curso
                                                </span>

                                                <strong>
                                                    ${escaparHtmlAdmin(
                                                        solicitacao.curso
                                                    )}
                                                </strong>

                                            </div>
                                        `
                                        : ""
                                }


                                ${
                                    solicitacao
                                        .identificacao_institucional
                                        ? `

                                            <div>

                                                <span>
                                                    Identificação
                                                </span>

                                                <strong>
                                                    ${escaparHtmlAdmin(
                                                        solicitacao
                                                            .identificacao_institucional
                                                    )}
                                                </strong>

                                            </div>
                                        `
                                        : ""
                                }


                                ${
                                    solicitacao.cargo
                                        ? `

                                            <div>

                                                <span>
                                                    Cargo
                                                </span>

                                                <strong>
                                                    ${escaparHtmlAdmin(
                                                        solicitacao.cargo
                                                    )}
                                                </strong>

                                            </div>
                                        `
                                        : ""
                                }


                                ${
                                    solicitacao.setor
                                        ? `

                                            <div>

                                                <span>
                                                    Setor
                                                </span>

                                                <strong>
                                                    ${escaparHtmlAdmin(
                                                        solicitacao.setor
                                                    )}
                                                </strong>

                                            </div>
                                        `
                                        : ""
                                }

                            </div>


                            ${
                                pendente
                                    ? `

                                        <div class="admin-request-actions">

                                            ${
                                                funcionario
                                                    ? `

                                                        <label>

                                                            Permissão

                                                            <select
                                                                data-perfil-solicitacao="${solicitacao.id}"
                                                            >

                                                                <option value="consulta_institucional">
                                                                    Consulta institucional
                                                                </option>

                                                                <option value="gestor">
                                                                    Gestor
                                                                </option>

                                                                <option value="admin_universidade">
                                                                    Administrador
                                                                </option>

                                                            </select>

                                                        </label>
                                                    `
                                                    : `

                                                        <span>
                                                            Será aprovado
                                                            como Aluno.
                                                        </span>
                                                    `
                                            }


                                            <div class="admin-request-buttons">

                                                <button
                                                    type="button"
                                                    class="admin-reject-button"
                                                    data-rejeitar-solicitacao="${solicitacao.id}"
                                                >
                                                    Rejeitar
                                                </button>


                                                <button
                                                    type="button"
                                                    class="admin-approve-button"
                                                    data-aprovar-solicitacao="${solicitacao.id}"
                                                    data-tipo-vinculo="${escaparHtmlAdmin(
                                                        solicitacao.tipo_vinculo
                                                    )}"
                                                >
                                                    Aprovar
                                                </button>

                                            </div>

                                        </div>
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
// EVENTOS DAS SOLICITAÇÕES
// =========================================================

async function tratarCliqueSolicitacao(
    event
) {

    const aprovar =
        event.target.closest(
            "[data-aprovar-solicitacao]"
        );


    if (aprovar) {

        await aprovarSolicitacaoAdmin(
            aprovar
        );

        return;
    }


    const rejeitar =
        event.target.closest(
            "[data-rejeitar-solicitacao]"
        );


    if (rejeitar) {

        await rejeitarSolicitacaoAdmin(
            rejeitar
        );
    }
}


// =========================================================
// APROVAR
// =========================================================

async function aprovarSolicitacaoAdmin(
    botao
) {

    const id =
        botao.dataset
            .aprovarSolicitacao;


    const tipo =
        botao.dataset
            .tipoVinculo;


    const payload =
        {};


    if (
        tipo ===
        "funcionario"
    ) {

        const campo =
            document.querySelector(
                `[data-perfil-solicitacao="${id}"]`
            );


        payload.perfil_funcionario =
            campo.value;
    }


    const confirmar =
        window.confirm(
            tipo ===
                "aluno"
                ? "Aprovar este vínculo como aluno?"
                : "Aprovar este funcionário?"
        );


    if (!confirmar) {

        return;
    }


    botao.disabled =
        true;


    try {

        const resposta =
            await fetch(
                `/api/admin-instituicao/solicitacoes/${id}/aprovar`,
                {
                    method:
                        "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao aprovar solicitação"
            );
        }


        mostrarMensagemAdmin(
            "Solicitação aprovada com sucesso."
        );


        await carregarAdministracaoInstituicao();


    } catch (erro) {

        mostrarMensagemAdmin(
            erro.message,
            "error"
        );


    } finally {

        botao.disabled =
            false;
    }
}


// =========================================================
// REJEITAR
// =========================================================

async function rejeitarSolicitacaoAdmin(
    botao
) {

    const id =
        botao.dataset
            .rejeitarSolicitacao;


    const observacao =
        window.prompt(
            "Informe o motivo da rejeição, se desejar:"
        );


    if (
        observacao ===
        null
    ) {

        return;
    }


    botao.disabled =
        true;


    try {

        const resposta =
            await fetch(
                `/api/admin-instituicao/solicitacoes/${id}/rejeitar`,
                {
                    method:
                        "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            observacao:
                                observacao.trim()
                        })
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao rejeitar solicitação"
            );
        }


        mostrarMensagemAdmin(
            "Solicitação rejeitada."
        );


        await carregarAdministracaoInstituicao();


    } catch (erro) {

        mostrarMensagemAdmin(
            erro.message,
            "error"
        );


    } finally {

        botao.disabled =
            false;
    }
}


// =========================================================
// USUÁRIOS
// =========================================================

async function carregarUsuariosAdmin() {

    try {

        const resposta =
            await fetch(
                "/api/admin-instituicao/usuarios"
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao consultar usuários"
            );
        }


        usuariosAdminInstituicao =
            dados;


        renderizarUsuariosAdmin();


    } catch (erro) {

        console.error(
            "Erro ao carregar usuários:",
            erro
        );


        const tbody =
            document.getElementById(
                "admin-ies-usuarios"
            );


        if (tbody) {

            tbody.innerHTML = `

                <tr>

                    <td colspan="4">
                        Não foi possível carregar
                        os usuários.
                    </td>

                </tr>
            `;
        }
    }
}


// =========================================================
// RENDERIZAR USUÁRIOS
// =========================================================

function renderizarUsuariosAdmin() {

    const tbody =
        document.getElementById(
            "admin-ies-usuarios"
        );


    if (!tbody) {

        return;
    }


    const termo =
        String(
            document
                .getElementById(
                    "admin-busca-usuarios"
                )
                ?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const usuarios =
        usuariosAdminInstituicao
            .filter(
                usuario => {

                    if (!termo) {

                        return true;
                    }


                    const texto =
                        `
                            ${usuario.nome || ""}
                            ${usuario.email || ""}
                            ${usuario.perfil || ""}
                        `
                            .toLowerCase();


                    return texto.includes(
                        termo
                    );
                }
            );


    if (
        usuarios.length ===
        0
    ) {

        tbody.innerHTML = `

            <tr>

                <td colspan="4">
                    Nenhum usuário encontrado.
                </td>

            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        usuarios
            .map(
                usuario => {

                    const ehProprio =
                        Number(
                            usuario.id
                        ) ===
                        Number(
                            usuarioAdminInstituicao
                                ?.id
                        );


                    return `

                        <tr>

                            <td>

                                <div class="admin-user-name">

                                    <strong>

                                        ${escaparHtmlAdmin(
                                            usuario.nome
                                        )}

                                    </strong>


                                    <span>

                                        ${escaparHtmlAdmin(
                                            usuario.email
                                        )}

                                    </span>


                                    ${
                                        ehProprio
                                            ? `

                                                <small>
                                                    Você
                                                </small>
                                            `
                                            : ""
                                    }

                                </div>

                            </td>


                            <td>

                                <span class="admin-user-role-readonly">

                                    ${escaparHtmlAdmin(
                                        nomePerfilAdmin(
                                            usuario.perfil
                                        )
                                    )}

                                </span>

                            </td>


                            <td>

                                <span
                                    class="
                                        admin-user-status
                                        ${
                                            usuario.ativo
                                                ? "active"
                                                : "inactive"
                                        }
                                    "
                                >

                                    ${
                                        usuario.ativo
                                            ? "Ativo"
                                            : "Inativo"
                                    }

                                </span>

                            </td>


                            <td>

                                <button
                                    type="button"
                                    class="admin-user-edit"
                                    data-editar-conta="${usuario.id}"
                                >

                                    Editar conta

                                </button>

                            </td>

                        </tr>
                    `;
                }
            )
            .join("");
}


// =========================================================
// CLIQUE EM USUÁRIO
// =========================================================

function tratarCliqueUsuario(
    event
) {

    const botao =
        event.target.closest(
            "[data-editar-conta]"
        );


    if (!botao) {

        return;
    }


    abrirModalContaAdmin(
        Number(
            botao.dataset
                .editarConta
        )
    );
}


// =========================================================
// ABRIR MODAL DE CONTA
// =========================================================

function abrirModalContaAdmin(
    usuarioId
) {

    const usuario =
        usuariosAdminInstituicao
            .find(
                item =>
                    Number(
                        item.id
                    ) ===
                    Number(
                        usuarioId
                    )
            );


    if (!usuario) {

        mostrarMensagemAdmin(
            "Usuário não encontrado.",
            "error"
        );

        return;
    }


    const ehProprio =
        Number(
            usuario.id
        ) ===
        Number(
            usuarioAdminInstituicao
                .id
        );


    const ehAluno =
        usuario.perfil ===
        "aluno";


    document
        .getElementById(
            "admin-conta-id"
        )
        .value =
        usuario.id;


    document
        .getElementById(
            "admin-conta-nome"
        )
        .value =
        usuario.nome ||
        "";


    document
        .getElementById(
            "admin-conta-email"
        )
        .value =
        usuario.email ||
        "";


    // =====================================================
    // PERFIL
    // =====================================================

    const selectPerfil =
        document.getElementById(
            "admin-conta-perfil"
        );


    const avisoPerfil =
        document.getElementById(
            "admin-conta-perfil-aviso"
        );


    if (
        ehAluno
    ) {

        selectPerfil.innerHTML = `

            <option value="aluno">
                Aluno
            </option>
        `;


        selectPerfil.disabled =
            true;


        avisoPerfil.textContent =
            "O vínculo de aluno não pode ser convertido nesta tela.";


    } else if (
        ehProprio
    ) {

        selectPerfil.innerHTML = `

            <option value="admin_universidade">
                Administrador da instituição
            </option>
        `;


        selectPerfil.disabled =
            true;


        avisoPerfil.textContent =
            "Seu próprio nível administrativo só pode ser alterado pelo Super Administrador.";


    } else {

        selectPerfil.innerHTML = `

            <option value="consulta_institucional">
                Consulta institucional
            </option>

            <option value="gestor">
                Gestor
            </option>

            <option value="admin_universidade">
                Administrador da instituição
            </option>
        `;


        selectPerfil.disabled =
            false;


        selectPerfil.value =
            usuario.perfil;


        avisoPerfil.textContent =
            "";
    }


    // =====================================================
    // SENHA
    // =====================================================

    document
        .getElementById(
            "admin-grupo-senha-atual"
        )
        .classList
        .toggle(
            "hidden",
            !ehProprio
        );


    document
        .getElementById(
            "admin-conta-senha-atual"
        )
        .value =
        "";


    document
        .getElementById(
            "admin-conta-nova-senha"
        )
        .value =
        "";


    document
        .getElementById(
            "admin-conta-confirmar-senha"
        )
        .value =
        "";


    document
        .getElementById(
            "admin-conta-senha-ajuda"
        )
        .textContent =
        ehProprio
            ? "Para alterar sua senha, informe também sua senha atual."
            : "Preencha apenas se quiser redefinir a senha deste usuário.";


    document
        .getElementById(
            "admin-conta-subtitulo"
        )
        .textContent =
        ehProprio
            ? "Você está editando sua própria conta administrativa."
            : `Editando a conta de ${usuario.nome}.`;


    const mensagem =
        document.getElementById(
            "admin-conta-mensagem"
        );


    mensagem.textContent =
        "";


    mensagem.className =
        "admin-account-message";


    // =====================================================
    // EXIBIR
    // =====================================================

    const modal =
        document.getElementById(
            "admin-modal-conta"
        );


    modal.classList.remove(
        "hidden"
    );


    // redundância proposital para evitar conflito
    // com estilos antigos do dashboard

    modal.style.display =
        "flex";


    document.body.style.overflow =
        "hidden";


    document
        .getElementById(
            "admin-conta-nome"
        )
        .focus();
}


// =========================================================
// FECHAR MODAL
// =========================================================

function fecharModalContaAdmin() {

    const modal =
        document.getElementById(
            "admin-modal-conta"
        );


    if (!modal) {

        return;
    }


    modal.classList.add(
        "hidden"
    );


    modal.style.display =
        "none";


    document.body.style.overflow =
        "";
}


// =========================================================
// SALVAR CONTA
// =========================================================

async function salvarContaAdmin(
    event
) {

    event.preventDefault();


    const usuarioId =
        Number(
            document
                .getElementById(
                    "admin-conta-id"
                )
                .value
        );


    const usuario =
        usuariosAdminInstituicao
            .find(
                item =>
                    Number(
                        item.id
                    ) ===
                    usuarioId
            );


    if (!usuario) {

        return;
    }


    const ehProprio =
        Number(
            usuario.id
        ) ===
        Number(
            usuarioAdminInstituicao.id
        );


    const campoPerfil =
        document.getElementById(
            "admin-conta-perfil"
        );


    const novaSenha =
        document
            .getElementById(
                "admin-conta-nova-senha"
            )
            .value;


    const confirmarSenha =
        document
            .getElementById(
                "admin-conta-confirmar-senha"
            )
            .value;


    if (
        novaSenha !==
        confirmarSenha
    ) {

        exibirMensagemConta(
            "A confirmação da nova senha não confere.",
            "error"
        );

        return;
    }


    const payload = {

        nome:
            document
                .getElementById(
                    "admin-conta-nome"
                )
                .value
                .trim(),

        email:
            document
                .getElementById(
                    "admin-conta-email"
                )
                .value
                .trim(),

        perfil:
            campoPerfil.value,

        senha_atual:
            ehProprio
                ? document
                    .getElementById(
                        "admin-conta-senha-atual"
                    )
                    .value
                : "",

        nova_senha:
            novaSenha,

        confirmar_nova_senha:
            confirmarSenha
    };


    const botao =
        document.getElementById(
            "admin-conta-salvar"
        );


    botao.disabled =
        true;


    botao.textContent =
        "Salvando...";


    try {

        const resposta =
            await fetch(
                `/api/admin-instituicao/usuarios/${usuarioId}/conta`,
                {
                    method:
                        "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao atualizar a conta"
            );
        }


        exibirMensagemConta(
            dados.mensagem ||
            "Conta atualizada com sucesso.",
            "success"
        );


        // =================================================
        // PRÓPRIA CONTA
        // =================================================

        if (
            ehProprio
        ) {

            usuarioAdminInstituicao.nome =
                dados.usuario.nome;


            usuarioAdminInstituicao.email =
                dados.usuario.email;


            const nomeTopo =
                document.getElementById(
                    "dashboard-usuario-nome"
                );


            if (
                nomeTopo
            ) {

                nomeTopo.textContent =
                    dados.usuario.nome;
            }


            if (
                typeof usuarioAtual !==
                    "undefined" &&
                usuarioAtual
            ) {

                usuarioAtual.nome =
                    dados.usuario.nome;


                usuarioAtual.email =
                    dados.usuario.email;
            }
        }


        await carregarUsuariosAdmin();


        window.setTimeout(
            () => {

                fecharModalContaAdmin();


                mostrarMensagemAdmin(
                    "Conta atualizada com sucesso."
                );

            },
            700
        );


    } catch (erro) {

        exibirMensagemConta(
            erro.message,
            "error"
        );


    } finally {

        botao.disabled =
            false;


        botao.textContent =
            "Salvar alterações";
    }
}


// =========================================================
// MENSAGEM DO MODAL
// =========================================================

function exibirMensagemConta(
    texto,
    tipo
) {

    const mensagem =
        document.getElementById(
            "admin-conta-mensagem"
        );


    mensagem.textContent =
        texto;


    mensagem.className =
        `admin-account-message ${tipo}`;
}


// =========================================================
// ESTILOS
// =========================================================

function adicionarEstilosAdminInstituicao() {

    if (
        document.getElementById(
            "admin-instituicao-estilos"
        )
    ) {

        return;
    }


    const estilo =
        document.createElement(
            "style"
        );


    estilo.id =
        "admin-instituicao-estilos";


    estilo.textContent = `

        /* =================================================
           CONFIGURAÇÕES DO TOPO
           ================================================= */

        .admin-settings-button {

            border-color:
                rgba(
                    255,
                    255,
                    255,
                    .35
                ) !important;

            background:
                rgba(
                    255,
                    255,
                    255,
                    .10
                ) !important;
        }


        .admin-settings-button:hover {

            background:
                rgba(
                    255,
                    255,
                    255,
                    .18
                ) !important;
        }


        .admin-settings-button svg {

            width:
                20px;

            height:
                20px;
        }


        /* =================================================
           MENU
           ================================================= */

        .admin-nav-item {

            display:
                inline-flex;

            align-items:
                center;

            gap:
                7px;
        }


        .admin-nav-badge {

            min-width:
                19px;

            height:
                19px;

            display:
                inline-flex;

            align-items:
                center;

            justify-content:
                center;

            padding:
                0 5px;

            border-radius:
                999px;

            color:
                #ffffff;

            background:
                #dc2626;

            font-size:
                9px;

            font-weight:
                800;
        }


        .admin-nav-badge.hidden {

            display:
                none;
        }


        /* =================================================
           RESUMO
           ================================================= */

        .admin-ies-summary-grid {

            display:
                grid;

            grid-template-columns:
                repeat(
                    4,
                    minmax(
                        0,
                        1fr
                    )
                );

            gap:
                15px;

            margin-bottom:
                24px;
        }


        .admin-ies-summary-grid article {

            padding:
                19px;

            border:
                1px solid
                #e6ddec;

            border-radius:
                14px;

            background:
                #ffffff;

            box-shadow:
                0 7px 22px
                rgba(
                    76,
                    29,
                    149,
                    .045
                );
        }


        .admin-ies-summary-grid span {

            display:
                block;

            margin-bottom:
                8px;

            color:
                #82768a;

            font-size:
                11px;
        }


        .admin-ies-summary-grid strong {

            color:
                #31203d;

            font-size:
                25px;
        }


        /* =================================================
           PAINEL
           ================================================= */

        .admin-ies-panel {

            margin-bottom:
                22px;
        }


        .admin-ies-panel-header {

            display:
                flex;

            align-items:
                flex-end;

            justify-content:
                space-between;

            gap:
                20px;

            margin-bottom:
                20px;
        }


        .admin-ies-panel-header h3 {

            margin:
                4px 0 5px;

            font-size:
                20px;
        }


        .admin-ies-panel-header p {

            color:
                #746a7d;

            font-size:
                12px;
        }


        .admin-ies-user-search input {

            min-width:
                260px;

            min-height:
                40px;

            padding:
                8px 10px;

            border:
                1px solid
                #ded5e5;

            border-radius:
                8px;

            background:
                #ffffff;
        }


        .admin-ies-filter {

            display:
                flex;

            flex-direction:
                column;

            gap:
                5px;

            color:
                #746a7d;

            font-size:
                10px;

            font-weight:
                700;
        }


        .admin-ies-filter select {

            min-height:
                39px;

            padding:
                7px 9px;

            border:
                1px solid
                #ded5e5;

            border-radius:
                8px;

            background:
                #ffffff;
        }


        /* =================================================
           MENSAGEM
           ================================================= */

        .admin-ies-message {

            display:
                none;

            margin-bottom:
                18px;

            padding:
                12px 15px;

            border-radius:
                10px;

            font-size:
                12px;
        }


        .admin-ies-message.visible {

            display:
                block;
        }


        .admin-ies-message.success {

            border:
                1px solid
                #bbf7d0;

            color:
                #166534;

            background:
                #f0fdf4;
        }


        .admin-ies-message.error {

            border:
                1px solid
                #fecaca;

            color:
                #991b1b;

            background:
                #fef2f2;
        }


        /* =================================================
           USUÁRIOS
           ================================================= */

        .admin-user-name strong {

            display:
                block;

            font-size:
                11px;
        }


        .admin-user-name span {

            display:
                block;

            margin-top:
                3px;

            color:
                #81768a;

            font-size:
                9px;
        }


        .admin-user-name small {

            display:
                inline-block;

            margin-top:
                5px;

            padding:
                3px 6px;

            border-radius:
                999px;

            color:
                #5b21b6;

            background:
                #ede9fe;

            font-size:
                8px;

            font-weight:
                750;
        }


        .admin-user-role-readonly {

            color:
                #5b21b6;

            font-size:
                10px;

            font-weight:
                700;
        }


        .admin-user-status {

            display:
                inline-flex;

            padding:
                5px 8px;

            border-radius:
                999px;

            font-size:
                9px;

            font-weight:
                750;
        }


        .admin-user-status.active {

            color:
                #166534;

            background:
                #dcfce7;
        }


        .admin-user-status.inactive {

            color:
                #991b1b;

            background:
                #fee2e2;
        }


        .admin-user-edit {

            min-height:
                35px;

            padding:
                7px 12px;

            border:
                1px solid
                #ddd6fe;

            border-radius:
                8px;

            color:
                #5b21b6;

            background:
                #f5f3ff;

            font-size:
                10px;

            font-weight:
                750;

            cursor:
                pointer;
        }


        .admin-user-edit:hover {

            background:
                #ede9fe;
        }


        /* =================================================
           SOLICITAÇÕES
           ================================================= */

        .admin-ies-request-list {

            display:
                grid;

            gap:
                14px;
        }


        .admin-request-card {

            padding:
                17px;

            border:
                1px solid
                #e8e1ed;

            border-radius:
                12px;

            background:
                #ffffff;
        }


        .admin-request-header {

            display:
                flex;

            justify-content:
                space-between;

            gap:
                20px;

            margin-bottom:
                15px;
        }


        .admin-request-header h4 {

            margin:
                7px 0 3px;

            font-size:
                15px;
        }


        .admin-request-header p,
        .admin-request-header small {

            color:
                #7c7284;

            font-size:
                10px;
        }


        .admin-request-badges {

            display:
                flex;

            gap:
                6px;

            flex-wrap:
                wrap;
        }


        .admin-status-badge,
        .admin-request-type {

            display:
                inline-flex;

            padding:
                5px 8px;

            border-radius:
                999px;

            font-size:
                9px;

            font-weight:
                750;
        }


        .admin-request-type {

            color:
                #5b21b6;

            background:
                #ede9fe;
        }


        .status-pendente {

            color:
                #92400e;

            background:
                #fef3c7;
        }


        .status-aprovado {

            color:
                #166534;

            background:
                #dcfce7;
        }


        .status-rejeitado,
        .status-revogado {

            color:
                #991b1b;

            background:
                #fee2e2;
        }


        .status-cancelado {

            color:
                #475569;

            background:
                #e2e8f0;
        }


        .admin-request-details {

            display:
                grid;

            grid-template-columns:
                repeat(
                    3,
                    minmax(
                        0,
                        1fr
                    )
                );

            gap:
                10px;
        }


        .admin-request-details > div {

            padding:
                10px;

            border-radius:
                8px;

            background:
                #faf8fc;
        }


        .admin-request-details span {

            display:
                block;

            margin-bottom:
                3px;

            color:
                #8b8192;

            font-size:
                9px;
        }


        .admin-request-details strong {

            font-size:
                10px;

            overflow-wrap:
                anywhere;
        }


        .admin-request-actions {

            display:
                flex;

            align-items:
                flex-end;

            justify-content:
                space-between;

            gap:
                15px;

            margin-top:
                15px;

            padding-top:
                15px;

            border-top:
                1px solid
                #eee8f1;
        }


        .admin-request-buttons {

            display:
                flex;

            gap:
                8px;
        }


        .admin-reject-button,
        .admin-approve-button {

            min-height:
                35px;

            padding:
                7px 11px;

            border-radius:
                8px;

            font-size:
                10px;

            font-weight:
                750;
        }


        .admin-reject-button {

            border:
                1px solid
                #fecaca;

            color:
                #b91c1c;

            background:
                #fff7f7;
        }


        .admin-approve-button {

            border:
                1px solid
                #ddd6fe;

            color:
                #5b21b6;

            background:
                #f5f3ff;
        }


        /* =================================================
           MODAL DA CONTA
           ================================================= */

        .admin-account-modal {

            position:
                fixed !important;

            inset:
                0 !important;

            z-index:
                99999 !important;

            display:
                flex;

            align-items:
                center;

            justify-content:
                center;

            padding:
                20px;
        }


        .admin-account-modal.hidden {

            display:
                none !important;
        }


        .admin-account-backdrop {

            position:
                absolute;

            inset:
                0;

            background:
                rgba(
                    24,
                    7,
                    36,
                    .63
                );

            backdrop-filter:
                blur(3px);
        }


        .admin-account-card {

            position:
                relative;

            z-index:
                2;

            width:
                min(
                    720px,
                    100%
                );

            max-height:
                calc(
                    100vh - 40px
                );

            overflow-y:
                auto;

            padding:
                26px;

            border:
                1px solid
                #e5dce9;

            border-radius:
                18px;

            background:
                #ffffff;

            box-shadow:
                0 30px 90px
                rgba(
                    36,
                    0,
                    70,
                    .32
                );
        }


        .admin-account-header {

            display:
                flex;

            align-items:
                flex-start;

            justify-content:
                space-between;

            gap:
                20px;

            margin-bottom:
                24px;
        }


        .admin-account-header h2 {

            margin:
                5px 0;

            color:
                #31203d;

            font-size:
                23px;
        }


        .admin-account-header p {

            color:
                #7c7284;

            font-size:
                11px;
        }


        .admin-account-close {

            width:
                36px;

            height:
                36px;

            flex:
                0 0 36px;

            border:
                1px solid
                #e5dee9;

            border-radius:
                9px;

            color:
                #756a7c;

            background:
                #ffffff;

            font-size:
                20px;

            cursor:
                pointer;
        }


        .admin-account-section {

            margin-top:
                20px;

            padding:
                18px;

            border:
                1px solid
                #ece5f0;

            border-radius:
                13px;

            background:
                #fcfbfd;
        }


        .admin-account-section-title {

            margin-bottom:
                16px;
        }


        .admin-account-section-title h3 {

            margin-bottom:
                3px;

            color:
                #31203d;

            font-size:
                15px;
        }


        .admin-account-section-title p {

            color:
                #82768a;

            font-size:
                10px;
        }


        .admin-account-grid {

            display:
                grid;

            grid-template-columns:
                repeat(
                    2,
                    minmax(
                        0,
                        1fr
                    )
                );

            gap:
                15px;
        }


        .admin-account-field {

            display:
                flex;

            flex-direction:
                column;

            gap:
                7px;
        }


        .admin-account-field.full {

            grid-column:
                1 / -1;
        }


        .admin-account-field label {

            color:
                #675d70;

            font-size:
                10px;

            font-weight:
                750;
        }


        .admin-account-field input,
        .admin-account-field select {

            width:
                100%;

            min-height:
                43px;

            padding:
                9px 11px;

            border:
                1px solid
                #ded5e5;

            border-radius:
                9px;

            color:
                #31203d;

            background:
                #ffffff;

            font:
                inherit;
        }


        .admin-account-field input:focus,
        .admin-account-field select:focus {

            border-color:
                #7c3aed;

            outline:
                none;

            box-shadow:
                0 0 0 3px
                rgba(
                    124,
                    58,
                    237,
                    .10
                );
        }


        .admin-account-field select:disabled {

            cursor:
                not-allowed;

            background:
                #f1eef3;
        }


        .admin-account-help {

            color:
                #918698;

            font-size:
                9px;

            line-height:
                1.45;
        }


        .admin-account-message {

            display:
                none;

            margin-top:
                17px;

            padding:
                11px 13px;

            border-radius:
                9px;

            font-size:
                11px;
        }


        .admin-account-message:not(:empty) {

            display:
                block;
        }


        .admin-account-message.success {

            border:
                1px solid
                #bbf7d0;

            color:
                #166534;

            background:
                #f0fdf4;
        }


        .admin-account-message.error {

            border:
                1px solid
                #fecaca;

            color:
                #991b1b;

            background:
                #fef2f2;
        }


        .admin-account-actions {

            display:
                flex;

            justify-content:
                flex-end;

            gap:
                9px;

            margin-top:
                20px;

            padding-top:
                18px;

            border-top:
                1px solid
                #ece6ef;
        }


        .admin-account-cancel,
        .admin-account-save {

            min-height:
                40px;

            padding:
                8px 15px;

            border-radius:
                8px;

            font-size:
                10px;

            font-weight:
                750;

            cursor:
                pointer;
        }


        .admin-account-cancel {

            border:
                1px solid
                #ded5e5;

            color:
                #5e5367;

            background:
                #ffffff;
        }


        .admin-account-save {

            border:
                none;

            color:
                #ffffff;

            background:
                #6d28d9;
        }


        .admin-account-save:hover {

            background:
                #5b21b6;
        }


        .admin-account-save:disabled {

            cursor:
                not-allowed;

            opacity:
                .65;
        }


        @media (
            max-width: 850px
        ) {

            .admin-ies-summary-grid {

                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );
            }


            .admin-ies-panel-header {

                align-items:
                    stretch;

                flex-direction:
                    column;
            }


            .admin-ies-user-search input {

                width:
                    100%;

                min-width:
                    0;
            }


            .admin-request-details {

                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );
            }

        }


        @media (
            max-width: 620px
        ) {

            .admin-ies-summary-grid,
            .admin-request-details,
            .admin-account-grid {

                grid-template-columns:
                    1fr;
            }


            .admin-account-field.full {

                grid-column:
                    auto;
            }


            .admin-request-header,
            .admin-request-actions {

                flex-direction:
                    column;
            }


            .admin-account-actions {

                display:
                    grid;

                grid-template-columns:
                    1fr 1fr;
            }

        }
    `;


    document.head.appendChild(
        estilo
    );
}


// =========================================================
// INICIALIZAÇÃO
// =========================================================

async function iniciarAdminInstituicao() {

    try {

        const resposta =
            await fetch(
                "/api/auth/me"
            );


        if (!resposta.ok) {

            return;
        }


        const usuario =
            await resposta.json();


        if (
            usuario.perfil !==
            "admin_universidade"
        ) {

            return;
        }


        usuarioAdminInstituicao =
            usuario;


        adicionarEstilosAdminInstituicao();


        configurarBotaoConfiguracoesAdmin();


        criarModalContaAdmin();


        criarAbaAdministracao();


        await carregarResumoAdmin();


    } catch (erro) {

        console.error(
            "Erro ao iniciar administração da instituição:",
            erro
        );
    }
}


iniciarAdminInstituicao();