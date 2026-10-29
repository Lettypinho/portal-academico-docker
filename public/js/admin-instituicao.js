// =========================================================
// SIA - ADMINISTRAÇÃO DA INSTITUIÇÃO
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
            "Administrador"
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
// MENSAGEM
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
    // MENU
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
    // SEÇÃO
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
                    Gerencie vínculos, contas e permissões
                    dos usuários da sua instituição.
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
                        Analise solicitações feitas por
                        alunos e funcionários.
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
             CONTAS
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
                        Edite nome, e-mail, senha
                        e permissões dos usuários.
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


        <!-- =============================================
             MODAL EDITAR CONTA
             ============================================= -->

        <div
            id="admin-modal-conta"
            class="admin-account-modal hidden"
        >

            <div
                class="admin-account-backdrop"
                data-fechar-conta
            ></div>


            <div class="admin-account-card">

                <div class="admin-account-header">

                    <div>

                        <span class="section-eyebrow">
                            Conta institucional
                        </span>

                        <h3>
                            Editar usuário
                        </h3>

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


                    <div class="admin-account-grid">

                        <label>

                            Nome

                            <input
                                type="text"
                                id="admin-conta-nome"
                                maxlength="150"
                                required
                            >

                        </label>


                        <label>

                            E-mail

                            <input
                                type="email"
                                id="admin-conta-email"
                                maxlength="150"
                                required
                            >

                        </label>


                        <label>

                            Perfil

                            <select
                                id="admin-conta-perfil"
                                required
                            ></select>

                            <small id="admin-conta-perfil-aviso"></small>

                        </label>


                        <div></div>


                        <label
                            id="admin-grupo-senha-atual"
                            class="hidden"
                        >

                            Senha atual

                            <input
                                type="password"
                                id="admin-conta-senha-atual"
                                maxlength="72"
                                autocomplete="current-password"
                            >

                            <small>
                                Obrigatória somente ao alterar sua própria senha.
                            </small>

                        </label>


                        <label>

                            Nova senha

                            <input
                                type="password"
                                id="admin-conta-nova-senha"
                                minlength="6"
                                maxlength="72"
                                autocomplete="new-password"
                            >

                            <small id="admin-conta-senha-ajuda">
                                Deixe em branco para manter a senha atual.
                            </small>

                        </label>


                        <label>

                            Confirmar nova senha

                            <input
                                type="password"
                                id="admin-conta-confirmar-senha"
                                minlength="6"
                                maxlength="72"
                                autocomplete="new-password"
                            >

                        </label>

                    </div>


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

        </div>
    `;


    main.appendChild(
        secao
    );


    configurarEventosAdminInstituicao();
}


// =========================================================
// EVENTOS
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


    document
        .getElementById(
            "admin-form-conta"
        )
        .addEventListener(
            "submit",
            salvarContaAdmin
        );


    document
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
// CARREGAR TUDO
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
                                            class="admin-status-badge status-${escaparHtmlAdmin(
                                                solicitacao.status
                                            )}"
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
                                    solicitacao.cargo
                                        ? `

                                            <div>

                                                <span>
                                                    Cargo / função
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
                                solicitacao.observacao_analise
                                    ? `

                                        <div class="admin-request-observation">

                                            <strong>
                                                Observação
                                            </strong>

                                            <p>
                                                ${escaparHtmlAdmin(
                                                    solicitacao.observacao_analise
                                                )}
                                            </p>

                                        </div>
                                    `
                                    : ""
                            }


                            ${
                                pendente
                                    ? `

                                        <div class="admin-request-actions">

                                            ${
                                                funcionario
                                                    ? `

                                                        <label>

                                                            Permissão após aprovação

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

                                                        <div>
                                                            Ao aprovar,
                                                            o usuário receberá
                                                            o perfil
                                                            <strong>Aluno</strong>.
                                                        </div>
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
// CLIQUES EM SOLICITAÇÕES
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
// APROVAR SOLICITAÇÃO
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
                : "Aprovar este funcionário com a permissão selecionada?"
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
// REJEITAR SOLICITAÇÃO
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
        observacao === null
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


        document
            .getElementById(
                "admin-ies-usuarios"
            )
            .innerHTML = `

                <tr>

                    <td colspan="4">
                        Não foi possível carregar os usuários.
                    </td>

                </tr>
            `;
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
                        `${usuario.nome} ${usuario.email} ${usuario.perfil}`
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
                                    class="admin-user-status ${
                                        usuario.ativo
                                            ? "active"
                                            : "inactive"
                                    }"
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
                                    Editar
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

    const editar =
        event.target.closest(
            "[data-editar-conta]"
        );


    if (!editar) {

        return;
    }


    abrirModalContaAdmin(
        Number(
            editar.dataset
                .editarConta
        )
    );
}


// =========================================================
// ABRIR MODAL DA CONTA
// =========================================================

function abrirModalContaAdmin(
    usuarioId
) {

    const usuario =
        usuariosAdminInstituicao
            .find(
                item =>
                    Number(item.id) ===
                    Number(usuarioId)
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
        usuario.nome || "";


    document
        .getElementById(
            "admin-conta-email"
        )
        .value =
        usuario.email || "";


    const perfil =
        document.getElementById(
            "admin-conta-perfil"
        );


    const aviso =
        document.getElementById(
            "admin-conta-perfil-aviso"
        );


    if (
        ehAluno
    ) {

        perfil.innerHTML = `

            <option value="aluno">
                Aluno
            </option>
        `;


        perfil.disabled =
            true;


        aviso.textContent =
            "O vínculo de aluno não é convertido por esta operação.";


    } else if (
        ehProprio
    ) {

        perfil.innerHTML = `

            <option value="admin_universidade">
                Administrador
            </option>
        `;


        perfil.disabled =
            true;


        aviso.textContent =
            "Seu próprio nível de administrador só pode ser alterado pelo super administrador.";


    } else {

        perfil.innerHTML = `

            <option value="consulta_institucional">
                Consulta institucional
            </option>

            <option value="gestor">
                Gestor
            </option>

            <option value="admin_universidade">
                Administrador
            </option>
        `;


        perfil.disabled =
            false;


        perfil.value =
            usuario.perfil;


        aviso.textContent =
            "";
    }


    const grupoSenhaAtual =
        document.getElementById(
            "admin-grupo-senha-atual"
        );


    grupoSenhaAtual.classList.toggle(
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
            ? "Para trocar sua senha, informe também sua senha atual."
            : "Informe uma senha somente se quiser redefinir o acesso deste usuário.";


    document
        .getElementById(
            "admin-conta-subtitulo"
        )
        .textContent =
        ehProprio
            ? "Você está editando a sua própria conta administrativa."
            : `Editando ${usuario.nome}.`;


    const mensagem =
        document.getElementById(
            "admin-conta-mensagem"
        );


    mensagem.textContent =
        "";


    mensagem.className =
        "admin-account-message";


    document
        .getElementById(
            "admin-modal-conta"
        )
        .classList
        .remove(
            "hidden"
        );


    document.body.style.overflow =
        "hidden";
}


// =========================================================
// FECHAR MODAL
// =========================================================

function fecharModalContaAdmin() {

    document
        .getElementById(
            "admin-modal-conta"
        )
        ?.classList
        .add(
            "hidden"
        );


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
                    Number(item.id) ===
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


    const perfil =
        document.getElementById(
            "admin-conta-perfil"
        );


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
            perfil.value,

        senha_atual:
            ehProprio
                ? document
                    .getElementById(
                        "admin-conta-senha-atual"
                    )
                    .value
                : "",

        nova_senha:
            document
                .getElementById(
                    "admin-conta-nova-senha"
                )
                .value,

        confirmar_nova_senha:
            document
                .getElementById(
                    "admin-conta-confirmar-senha"
                )
                .value
    };


    const mensagem =
        document.getElementById(
            "admin-conta-mensagem"
        );


    const botao =
        document.getElementById(
            "admin-conta-salvar"
        );


    mensagem.textContent =
        "";


    mensagem.className =
        "admin-account-message";


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


        mensagem.textContent =
            dados.mensagem ||
            "Conta atualizada com sucesso.";


        mensagem.classList.add(
            "success"
        );


        // =================================================
        // SE EDITOU A PRÓPRIA CONTA
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
            650
        );


    } catch (erro) {

        mensagem.textContent =
            erro.message;


        mensagem.classList.add(
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

        .admin-nav-item {
            display: inline-flex;
            align-items: center;
            gap: 7px;
        }


        .admin-nav-badge {
            min-width: 19px;
            height: 19px;

            display: inline-flex;
            align-items: center;
            justify-content: center;

            padding: 0 5px;

            border-radius: 999px;

            color: #ffffff;
            background: #dc2626;

            font-size: 9px;
            font-weight: 800;
        }


        .admin-nav-badge.hidden {
            display: none;
        }


        .admin-ies-page-header {
            align-items: center;
            justify-content: space-between;
        }


        .admin-ies-message {
            display: none;

            margin-bottom: 18px;
            padding: 12px 15px;

            border-radius: 10px;

            font-size: 12px;
        }


        .admin-ies-message.visible {
            display: block;
        }


        .admin-ies-message.success {
            border: 1px solid #bbf7d0;
            color: #166534;
            background: #f0fdf4;
        }


        .admin-ies-message.error {
            border: 1px solid #fecaca;
            color: #991b1b;
            background: #fef2f2;
        }


        .admin-ies-summary-grid {
            display: grid;

            grid-template-columns:
                repeat(
                    4,
                    minmax(0, 1fr)
                );

            gap: 15px;

            margin-bottom: 24px;
        }


        .admin-ies-summary-grid article {
            padding: 19px;

            border: 1px solid #e6ddec;
            border-radius: 14px;

            background: #ffffff;

            box-shadow:
                0 7px 22px
                rgba(
                    76,
                    29,
                    149,
                    0.045
                );
        }


        .admin-ies-summary-grid span {
            display: block;

            margin-bottom: 8px;

            color: #82768a;

            font-size: 11px;
        }


        .admin-ies-summary-grid strong {
            color: #31203d;

            font-size: 25px;
        }


        .admin-ies-panel {
            margin-bottom: 22px;
        }


        .admin-ies-panel-header {
            display: flex;

            align-items: flex-end;
            justify-content: space-between;

            gap: 20px;

            margin-bottom: 20px;
        }


        .admin-ies-panel-header h3 {
            margin: 4px 0 5px;

            font-size: 20px;
        }


        .admin-ies-panel-header p {
            color: #746a7d;

            font-size: 12px;
        }


        .admin-ies-filter {
            display: flex;
            flex-direction: column;

            gap: 6px;

            color: #746a7d;

            font-size: 10px;
            font-weight: 700;
        }


        .admin-ies-filter select,
        .admin-ies-user-search input {
            min-height: 39px;

            padding: 8px 10px;

            border: 1px solid #ded5e5;
            border-radius: 8px;

            color: #31203d;
            background: #ffffff;
        }


        .admin-ies-user-search input {
            min-width: 260px;
        }


        .admin-ies-request-list {
            display: grid;

            gap: 14px;
        }


        .admin-request-card {
            padding: 17px;

            border: 1px solid #e8e1ed;
            border-radius: 12px;

            background: #ffffff;
        }


        .admin-request-header {
            display: flex;

            align-items: flex-start;
            justify-content: space-between;

            gap: 20px;

            margin-bottom: 15px;
        }


        .admin-request-header h4 {
            margin: 8px 0 3px;

            font-size: 15px;
        }


        .admin-request-header p,
        .admin-request-header small {
            color: #7c7284;

            font-size: 10px;
        }


        .admin-request-badges {
            display: flex;

            flex-wrap: wrap;

            gap: 6px;
        }


        .admin-status-badge,
        .admin-request-type {
            display: inline-flex;

            padding: 5px 8px;

            border-radius: 999px;

            font-size: 9px;
            font-weight: 750;
        }


        .admin-request-type {
            color: #5b21b6;
            background: #ede9fe;
        }


        .status-pendente {
            color: #92400e;
            background: #fef3c7;
        }


        .status-aprovado {
            color: #166534;
            background: #dcfce7;
        }


        .status-rejeitado,
        .status-revogado {
            color: #991b1b;
            background: #fee2e2;
        }


        .status-cancelado {
            color: #475569;
            background: #e2e8f0;
        }


        .admin-request-details {
            display: grid;

            grid-template-columns:
                repeat(
                    3,
                    minmax(0, 1fr)
                );

            gap: 10px;
        }


        .admin-request-details > div {
            padding: 10px;

            border-radius: 8px;

            background: #faf8fc;
        }


        .admin-request-details span {
            display: block;

            margin-bottom: 3px;

            color: #8b8192;

            font-size: 9px;
        }


        .admin-request-details strong {
            font-size: 10px;

            overflow-wrap: anywhere;
        }


        .admin-request-observation {
            margin-top: 12px;

            padding: 11px;

            border-radius: 8px;

            background: #fff7ed;
        }


        .admin-request-observation strong {
            font-size: 10px;
        }


        .admin-request-observation p {
            margin-top: 4px;

            color: #7c2d12;

            font-size: 10px;
        }


        .admin-request-actions {
            display: flex;

            align-items: flex-end;
            justify-content: space-between;

            gap: 15px;

            margin-top: 15px;
            padding-top: 15px;

            border-top: 1px solid #eee8f1;
        }


        .admin-request-actions label {
            display: flex;
            flex-direction: column;

            gap: 6px;

            color: #746a7d;

            font-size: 10px;
            font-weight: 700;
        }


        .admin-request-actions select {
            min-height: 38px;

            padding: 7px 9px;

            border: 1px solid #ded5e5;
            border-radius: 8px;

            background: #ffffff;
        }


        .admin-request-buttons {
            display: flex;

            gap: 8px;
        }


        .admin-reject-button,
        .admin-approve-button,
        .admin-user-edit {
            min-height: 35px;

            padding: 7px 11px;

            border-radius: 8px;

            font-size: 10px;
            font-weight: 750;
        }


        .admin-reject-button {
            border: 1px solid #fecaca;

            color: #b91c1c;
            background: #fff7f7;
        }


        .admin-approve-button,
        .admin-user-edit {
            border: 1px solid #ddd6fe;

            color: #5b21b6;
            background: #f5f3ff;
        }


        .admin-user-name strong {
            display: block;

            font-size: 11px;
        }


        .admin-user-name span {
            display: block;

            margin-top: 3px;

            color: #81768a;

            font-size: 9px;
        }


        .admin-user-name small {
            display: inline-block;

            margin-top: 5px;
            padding: 3px 6px;

            border-radius: 999px;

            color: #5b21b6;
            background: #ede9fe;

            font-size: 8px;
            font-weight: 750;
        }


        .admin-user-role-readonly {
            color: #5b21b6;

            font-size: 10px;
            font-weight: 700;
        }


        .admin-user-status {
            display: inline-flex;

            padding: 5px 8px;

            border-radius: 999px;

            font-size: 9px;
            font-weight: 750;
        }


        .admin-user-status.active {
            color: #166534;
            background: #dcfce7;
        }


        .admin-user-status.inactive {
            color: #991b1b;
            background: #fee2e2;
        }


        /* =============================================
           MODAL CONTA
           ============================================= */

        .admin-account-modal {
            position: fixed;

            inset: 0;

            z-index: 2000;

            display: flex;

            align-items: center;
            justify-content: center;

            padding: 20px;
        }


        .admin-account-modal.hidden {
            display: none;
        }


        .admin-account-backdrop {
            position: absolute;

            inset: 0;

            background:
                rgba(
                    25,
                    8,
                    37,
                    0.58
                );

            backdrop-filter: blur(2px);
        }


        .admin-account-card {
            position: relative;

            z-index: 2;

            width: min(680px, 100%);

            max-height:
                calc(
                    100vh - 40px
                );

            overflow-y: auto;

            padding: 24px;

            border: 1px solid #e4dce9;
            border-radius: 18px;

            background: #ffffff;

            box-shadow:
                0 28px 75px
                rgba(
                    36,
                    0,
                    70,
                    0.30
                );
        }


        .admin-account-header {
            display: flex;

            align-items: flex-start;
            justify-content: space-between;

            gap: 20px;

            margin-bottom: 22px;
        }


        .admin-account-header h3 {
            margin: 5px 0;

            font-size: 21px;
        }


        .admin-account-header p {
            color: #7c7284;

            font-size: 11px;
        }


        .admin-account-close {
            width: 36px;
            height: 36px;

            border: 1px solid #e5dee9;
            border-radius: 9px;

            color: #756a7c;
            background: #ffffff;

            font-size: 20px;
        }


        .admin-account-grid {
            display: grid;

            grid-template-columns:
                repeat(
                    2,
                    minmax(0, 1fr)
                );

            gap: 15px;
        }


        .admin-account-grid label {
            display: flex;
            flex-direction: column;

            gap: 7px;

            color: #675d70;

            font-size: 10px;
            font-weight: 750;
        }


        .admin-account-grid input,
        .admin-account-grid select {
            min-height: 42px;

            width: 100%;

            padding: 9px 11px;

            border: 1px solid #ded5e5;
            border-radius: 9px;

            color: #31203d;
            background: #ffffff;

            font: inherit;
        }


        .admin-account-grid input:focus,
        .admin-account-grid select:focus {
            border-color: #7c3aed;

            outline: none;

            box-shadow:
                0 0 0 3px
                rgba(
                    124,
                    58,
                    237,
                    0.10
                );
        }


        .admin-account-grid select:disabled {
            cursor: not-allowed;

            background: #f4f2f6;
        }


        .admin-account-grid small {
            color: #918698;

            font-size: 8px;
            line-height: 1.45;
        }


        .admin-account-message {
            display: none;

            margin-top: 17px;
            padding: 11px 13px;

            border-radius: 9px;

            font-size: 11px;
        }


        .admin-account-message:not(:empty) {
            display: block;
        }


        .admin-account-message.success {
            border: 1px solid #bbf7d0;

            color: #166534;
            background: #f0fdf4;
        }


        .admin-account-message.error {
            border: 1px solid #fecaca;

            color: #991b1b;
            background: #fef2f2;
        }


        .admin-account-actions {
            display: flex;

            justify-content: flex-end;

            gap: 9px;

            margin-top: 20px;
            padding-top: 18px;

            border-top: 1px solid #ece6ef;
        }


        .admin-account-cancel,
        .admin-account-save {
            min-height: 39px;

            padding: 8px 14px;

            border-radius: 8px;

            font-size: 10px;
            font-weight: 750;
        }


        .admin-account-cancel {
            border: 1px solid #ded5e5;

            color: #5e5367;
            background: #ffffff;
        }


        .admin-account-save {
            border: none;

            color: #ffffff;
            background: #6d28d9;
        }


        .admin-account-save:hover {
            background: #5b21b6;
        }


        .admin-account-save:disabled {
            cursor: not-allowed;

            opacity: 0.65;
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
                align-items: stretch;
                flex-direction: column;
            }


            .admin-ies-user-search input {
                width: 100%;
                min-width: 0;
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


            .admin-request-actions {
                align-items: stretch;
                flex-direction: column;
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


            .admin-request-header {
                flex-direction: column;
            }


            .admin-account-actions {
                display: grid;

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