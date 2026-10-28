// =========================================================
// SIA - ADMINISTRAÇÃO DA INSTITUIÇÃO
// Disponível apenas para admin_universidade
// =========================================================


let usuarioAdminInstituicao =
    null;

let usuariosAdminInstituicao =
    [];


// =========================================================
// UTILITÁRIOS
// =========================================================

function escaparHtmlAdmin(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatarDataAdmin(valor) {

    if (!valor) {

        return "-";
    }


    const data =
        new Date(valor);


    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return "-";
    }


    return data.toLocaleDateString(
        "pt-BR",
        {
            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );
}


function nomePerfilAdmin(perfil) {

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


function nomeStatusAdmin(status) {

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
        status
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
// CRIAR ABA
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
    // BOTÃO DO MENU
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
                    Gerencie solicitações de vínculo e permissões
                    dos usuários da sua instituição.
                </p>

            </div>


            <button
                type="button"
                id="btn-admin-ies-atualizar"
                class="btn-secondary"
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
                        Analise solicitações feitas por alunos
                        e funcionários.
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
                        Acessos
                    </span>

                    <h3>
                        Usuários vinculados
                    </h3>

                    <p>
                        Consulte os usuários da instituição
                        e gerencie as permissões dos funcionários.
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
// ABRIR SEÇÃO
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
        document.getElementById(
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
                    Não existem solicitações com
                    o status selecionado.
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
                        solicitacao
                            .tipo_vinculo ===
                        "funcionario";


                    const pendente =
                        solicitacao.status ===
                        "pendente";


                    return `

                        <article
                            class="admin-request-card"
                            data-solicitacao-id="${solicitacao.id}"
                        >

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
                                            solicitacao
                                                .usuario_nome
                                        )}
                                    </h4>


                                    <p>
                                        ${escaparHtmlAdmin(
                                            solicitacao
                                                .usuario_email
                                        )}
                                    </p>

                                </div>


                                <small>

                                    ${formatarDataAdmin(
                                        solicitacao
                                            .criado_em
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
                                            solicitacao
                                                .email_institucional
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
                                solicitacao
                                    .observacao_analise
                                    ? `

                                        <div class="admin-request-observation">

                                            <strong>
                                                Observação
                                            </strong>

                                            <p>
                                                ${escaparHtmlAdmin(
                                                    solicitacao
                                                        .observacao_analise
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
                                                                class="admin-request-profile"
                                                                data-perfil-solicitacao="${solicitacao.id}"
                                                            >

                                                                <option value="consulta_institucional">
                                                                    Consulta institucional
                                                                </option>

                                                                <option value="gestor">
                                                                    Gestor
                                                                </option>

                                                                <option value="admin_universidade">
                                                                    Administrador da instituição
                                                                </option>

                                                            </select>

                                                        </label>
                                                    `
                                                    : `

                                                        <div class="admin-student-approval-info">

                                                            Ao aprovar, o usuário
                                                            receberá o perfil
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
                                                        solicitacao
                                                            .tipo_vinculo
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
// CLIQUE EM SOLICITAÇÃO
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
                : "Aprovar este funcionário com a permissão selecionada?"
        );


    if (!confirmar) {

        return;
    }


    botao.disabled =
        true;


    const textoOriginal =
        botao.textContent;


    botao.textContent =
        "Aprovando...";


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
            "Solicitação aprovada com sucesso.",
            "success"
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


        botao.textContent =
            textoOriginal;
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


    const textoOriginal =
        botao.textContent;


    botao.textContent =
        "Rejeitando...";


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
            "Solicitação rejeitada.",
            "success"
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


        botao.textContent =
            textoOriginal;
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
            erro
        );


        const tbody =
            document.getElementById(
                "admin-ies-usuarios"
            );


        tbody.innerHTML = `

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

                    const ehAluno =
                        usuario.perfil ===
                        "aluno";


                    const ehProprioUsuario =
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
                                        ehProprioUsuario
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

                                ${
                                    ehAluno
                                        ? `

                                            <span class="admin-user-role-readonly">
                                                Aluno
                                            </span>
                                        `
                                        : `

                                            <select
                                                class="admin-user-profile-select"
                                                data-perfil-usuario="${usuario.id}"
                                                ${
                                                    ehProprioUsuario
                                                        ? "disabled"
                                                        : ""
                                                }
                                            >

                                                <option
                                                    value="consulta_institucional"
                                                    ${
                                                        usuario.perfil ===
                                                        "consulta_institucional"
                                                            ? "selected"
                                                            : ""
                                                    }
                                                >
                                                    Consulta institucional
                                                </option>


                                                <option
                                                    value="gestor"
                                                    ${
                                                        usuario.perfil ===
                                                        "gestor"
                                                            ? "selected"
                                                            : ""
                                                    }
                                                >
                                                    Gestor
                                                </option>


                                                <option
                                                    value="admin_universidade"
                                                    ${
                                                        usuario.perfil ===
                                                        "admin_universidade"
                                                            ? "selected"
                                                            : ""
                                                    }
                                                >
                                                    Administrador
                                                </option>

                                            </select>
                                        `
                                }

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

                                ${
                                    !ehAluno &&
                                    !ehProprioUsuario
                                        ? `

                                            <button
                                                type="button"
                                                class="admin-user-save"
                                                data-salvar-perfil="${usuario.id}"
                                            >
                                                Salvar
                                            </button>
                                        `
                                        : `
                                            <span class="admin-no-action">
                                                —
                                            </span>
                                        `
                                }

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

async function tratarCliqueUsuario(
    event
) {

    const botao =
        event.target.closest(
            "[data-salvar-perfil]"
        );


    if (!botao) {

        return;
    }


    const usuarioId =
        botao.dataset
            .salvarPerfil;


    const select =
        document.querySelector(
            `[data-perfil-usuario="${usuarioId}"]`
        );


    if (!select) {

        return;
    }


    const confirmar =
        window.confirm(
            "Deseja alterar a permissão deste funcionário?"
        );


    if (!confirmar) {

        return;
    }


    botao.disabled =
        true;


    try {

        const resposta =
            await fetch(
                `/api/admin-instituicao/usuarios/${usuarioId}/perfil`,
                {
                    method:
                        "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            perfil:
                                select.value
                        })
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao alterar permissão"
            );
        }


        mostrarMensagemAdmin(
            "Permissão atualizada com sucesso.",
            "success"
        );


        await carregarUsuariosAdmin();


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


        .admin-ies-page-header {

            align-items:
                center;

            justify-content:
                space-between;
        }


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
                1px solid #bbf7d0;

            color:
                #166534;

            background:
                #f0fdf4;
        }


        .admin-ies-message.error {

            border:
                1px solid #fecaca;

            color:
                #991b1b;

            background:
                #fef2f2;
        }


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
                1px solid #e6ddec;

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

            margin:
                0;

            color:
                #7d7186;

            font-size:
                12px;
        }


        .admin-ies-filter {

            display:
                flex;

            flex-direction:
                column;

            gap:
                6px;

            color:
                #675c6e;

            font-size:
                11px;

            font-weight:
                700;
        }


        .admin-ies-filter select,
        .admin-user-profile-select,
        .admin-request-profile,
        .admin-ies-user-search input {

            min-height:
                40px;

            padding:
                8px 11px;

            border:
                1px solid #ded5e6;

            border-radius:
                9px;

            outline:
                none;

            color:
                #31243a;

            background:
                #ffffff;
        }


        .admin-ies-user-search input {

            width:
                260px;
        }


        .admin-ies-request-list {

            display:
                grid;

            gap:
                14px;
        }


        .admin-request-card {

            padding:
                19px;

            border:
                1px solid #e6deeb;

            border-radius:
                14px;

            background:
                #fcfbfd;
        }


        .admin-request-header {

            display:
                flex;

            align-items:
                flex-start;

            justify-content:
                space-between;

            gap:
                20px;

            margin-bottom:
                17px;
        }


        .admin-request-header h4 {

            margin:
                9px 0 3px;

            color:
                #2c2034;

            font-size:
                16px;
        }


        .admin-request-header p {

            margin:
                0;

            color:
                #82758a;

            font-size:
                11px;
        }


        .admin-request-header small {

            color:
                #918597;

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
                800;
        }


        .admin-request-type {

            color:
                #5b21b6;

            background:
                #ede9fe;
        }


        .admin-status-badge.status-pendente {

            color:
                #92400e;

            background:
                #fef3c7;
        }


        .admin-status-badge.status-aprovado {

            color:
                #166534;

            background:
                #dcfce7;
        }


        .admin-status-badge.status-rejeitado,
        .admin-status-badge.status-revogado {

            color:
                #991b1b;

            background:
                #fee2e2;
        }


        .admin-status-badge.status-cancelado {

            color:
                #57515b;

            background:
                #eeeeef;
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
                11px;

            border:
                1px solid #ece6ef;

            border-radius:
                9px;

            background:
                #ffffff;
        }


        .admin-request-details span {

            display:
                block;

            margin-bottom:
                4px;

            color:
                #94889a;

            font-size:
                9px;

            text-transform:
                uppercase;
        }


        .admin-request-details strong {

            font-size:
                11px;

            overflow-wrap:
                anywhere;
        }


        .admin-request-observation {

            margin-top:
                13px;

            padding:
                11px 13px;

            border-left:
                4px solid #7c3aed;

            background:
                #faf5ff;
        }


        .admin-request-observation p {

            margin:
                5px 0 0;

            color:
                #66556f;

            font-size:
                11px;
        }


        .admin-request-actions {

            display:
                flex;

            align-items:
                flex-end;

            justify-content:
                space-between;

            gap:
                18px;

            margin-top:
                17px;

            padding-top:
                15px;

            border-top:
                1px solid #ece5f0;
        }


        .admin-request-actions label {

            display:
                flex;

            flex-direction:
                column;

            gap:
                6px;

            color:
                #665a6e;

            font-size:
                10px;

            font-weight:
                700;
        }


        .admin-request-profile {

            min-width:
                220px;
        }


        .admin-student-approval-info {

            color:
                #776b7e;

            font-size:
                11px;
        }


        .admin-request-buttons {

            display:
                flex;

            gap:
                8px;
        }


        .admin-approve-button,
        .admin-reject-button,
        .admin-user-save {

            min-height:
                38px;

            padding:
                8px 14px;

            border-radius:
                9px;

            font-size:
                11px;

            font-weight:
                750;
        }


        .admin-approve-button,
        .admin-user-save {

            border:
                none;

            color:
                #ffffff;

            background:
                #6d28d9;
        }


        .admin-reject-button {

            border:
                1px solid #fecaca;

            color:
                #b91c1c;

            background:
                #fff7f7;
        }


        .admin-user-name strong,
        .admin-user-name span,
        .admin-user-name small {

            display:
                block;
        }


        .admin-user-name span {

            margin-top:
                3px;

            color:
                #82778a;

            font-size:
                10px;
        }


        .admin-user-name small {

            margin-top:
                4px;

            color:
                #6d28d9;

            font-size:
                9px;

            font-weight:
                800;
        }


        .admin-user-status,
        .admin-user-role-readonly {

            display:
                inline-flex;

            padding:
                5px 8px;

            border-radius:
                999px;

            font-size:
                9px;

            font-weight:
                800;
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


        .admin-user-role-readonly {

            color:
                #5b21b6;

            background:
                #ede9fe;
        }


        .admin-no-action {

            color:
                #aaa0af;
        }


        @media (
            max-width: 900px
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
            max-width: 650px
        ) {

            .admin-ies-page-header,
            .admin-ies-panel-header,
            .admin-request-actions {

                align-items:
                    stretch;

                flex-direction:
                    column;
            }


            .admin-ies-summary-grid,
            .admin-request-details {

                grid-template-columns:
                    1fr;
            }


            .admin-ies-user-search input {

                width:
                    100%;
            }


            .admin-request-profile {

                width:
                    100%;

                min-width:
                    0;
            }


            .admin-request-buttons {

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

        criarAbaAdministracao();

        await carregarResumoAdmin();


    } catch (erro) {

        console.error(
            "Erro ao iniciar administração institucional:",
            erro
        );
    }
}


iniciarAdminInstituicao();