// =========================================================
// SIA - ADMINISTRAÇÃO INSTITUCIONAL
// =========================================================

let usuarioAdminInstituicao =
    null;

let usuariosAdminInstituicao =
    [];

let podeGerenciarUsuarios =
    false;

let podeGerenciarVinculos =
    false;


// =========================================================
// UTILITÁRIOS
// =========================================================

function escaparHtmlAdmin(
    valor
) {

    return String(
        valor ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function nomePerfilAdmin(
    perfil
) {

    const nomes = {

        publico:
            "Público",

        aluno:
            "Aluno",

        institucional:
            "Institucional",

        consulta_institucional:
            "Institucional",

        gestor:
            "Institucional",

        admin_universidade:
            "Institucional",

        super_admin:
            "Super administrador"
    };


    return (
        nomes[perfil] ||
        perfil ||
        "-"
    );
}


function formatarDataAdmin(
    valor
) {

    if (
        !valor
    ) {

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
            "pt-BR"
        );
}


// =========================================================
// CONFIGURAÇÃO DO BOTÃO DE PERFIL
// =========================================================

function configurarBotaoConfiguracoesAdmin() {

    const botao =
        document.getElementById(
            "btn-dashboard-perfil"
        );


    if (
        !botao
    ) {

        return;
    }


    botao.title =
        "Configurações da conta";


    botao.setAttribute(
        "aria-label",
        "Configurações da conta"
    );


    botao.innerHTML = `

        <svg
            viewBox="0 0 24 24"
            width="19"
            height="19"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
        >

            <circle
                cx="12"
                cy="12"
                r="3"
            ></circle>

            <path
                d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.5 1.2V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.4 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.2-.5H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.4a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6a1.7 1.7 0 0 0 .5-1.2V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.6 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 .6 1a1.7 1.7 0 0 0 1.2.5H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15z"
            ></path>

        </svg>
    `;
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


    const botao =
        document.createElement(
            "button"
        );


    botao.type =
        "button";


    botao.id =
        "nav-administracao";


    botao.className =
        "nav-item";


    botao.dataset.section =
        "administracao";


    botao.innerHTML = `

        Administração

        <span
            id="admin-ies-badge-pendentes"
            class="admin-ies-badge hidden"
        >
            0
        </span>
    `;


    botao.addEventListener(
        "click",
        () => {

            if (
                typeof abrirSecao ===
                "function"
            ) {

                abrirSecao(
                    "administracao"
                );
            }
        }
    );


    nav.appendChild(
        botao
    );


    const secao =
        document.createElement(
            "section"
        );


    secao.id =
        "administracao";


    secao.className =
        "dashboard-section";


    secao.innerHTML = `

        <div class="section-header">

            <div>

                <span class="section-eyebrow">
                    Gestão institucional
                </span>

                <h2>
                    Administração
                </h2>

                <p>
                    Recursos disponíveis conforme
                    suas permissões institucionais.
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
            id="admin-ies-resumo"
            class="admin-ies-summary"
        ></div>


        <div
            id="admin-ies-solicitacoes"
            class="admin-ies-panel"
        >

            <div class="admin-ies-panel-header">

                <div>

                    <span class="section-eyebrow">
                        Vínculos
                    </span>

                    <h3>
                        Solicitações pendentes
                    </h3>

                </div>

            </div>


            <div id="admin-ies-solicitacoes-lista">
                Carregando...
            </div>

        </div>


        <div
            id="admin-ies-usuarios"
            class="admin-ies-panel"
        >

            <div class="admin-ies-panel-header">

                <div>

                    <span class="section-eyebrow">
                        Contas
                    </span>

                    <h3>
                        Usuários vinculados
                    </h3>

                </div>

            </div>


            <div
                id="admin-ies-usuarios-lista"
                class="admin-ies-table-wrap"
            >
                Carregando...
            </div>

        </div>


        <div
            id="admin-ies-mensagem"
            class="admin-ies-message"
        ></div>
    `;


    main.appendChild(
        secao
    );


    document
        .getElementById(
            "btn-admin-ies-atualizar"
        )
        .addEventListener(
            "click",
            atualizarAdministracaoInstituicao
        );
}


// =========================================================
// RESUMO
// =========================================================

function renderizarResumoAdmin(
    resumo
) {

    const container =
        document.getElementById(
            "admin-ies-resumo"
        );


    if (
        !container
    ) {

        return;
    }


    container.innerHTML = `

        <article>
            <span>Solicitações pendentes</span>
            <strong>
                ${escaparHtmlAdmin(
                    resumo.solicitacoes_pendentes
                )}
            </strong>
        </article>

        <article>
            <span>Usuários</span>
            <strong>
                ${escaparHtmlAdmin(
                    resumo.usuarios_vinculados
                )}
            </strong>
        </article>

        <article>
            <span>Alunos</span>
            <strong>
                ${escaparHtmlAdmin(
                    resumo.alunos_vinculados
                )}
            </strong>
        </article>

        <article>
            <span>Institucionais</span>
            <strong>
                ${escaparHtmlAdmin(
                    resumo.funcionarios_vinculados
                )}
            </strong>
        </article>
    `;


    const badge =
        document.getElementById(
            "admin-ies-badge-pendentes"
        );


    const quantidade =
        Number(
            resumo
                .solicitacoes_pendentes ||
            0
        );


    if (
        badge
    ) {

        badge.textContent =
            quantidade;


        badge.classList.toggle(
            "hidden",
            quantidade === 0
        );
    }
}


// =========================================================
// SOLICITAÇÕES
// =========================================================

async function carregarSolicitacoesAdmin() {

    const container =
        document.getElementById(
            "admin-ies-solicitacoes-lista"
        );


    if (
        !container
    ) {

        return;
    }


    const resposta =
        await fetch(
            "/api/admin-instituicao/solicitacoes?status=pendente"
        );


    if (
        resposta.status ===
        403
    ) {

        podeGerenciarVinculos =
            false;


        document
            .getElementById(
                "admin-ies-solicitacoes"
            )
            ?.classList
            .add(
                "hidden"
            );


        return;
    }


    if (
        !resposta.ok
    ) {

        container.textContent =
            "Não foi possível carregar as solicitações.";

        return;
    }


    podeGerenciarVinculos =
        true;


    const solicitacoes =
        await resposta.json();


    if (
        solicitacoes.length ===
        0
    ) {

        container.innerHTML = `

            <div class="admin-ies-empty">
                Nenhuma solicitação pendente.
            </div>
        `;

        return;
    }


    container.innerHTML =
        solicitacoes
            .map(
                solicitacao => `

                    <div class="admin-ies-request">

                        <div>

                            <strong>
                                ${escaparHtmlAdmin(
                                    solicitacao.usuario_nome
                                )}
                            </strong>

                            <span>
                                ${escaparHtmlAdmin(
                                    solicitacao.usuario_email
                                )}
                            </span>

                            <small>
                                ${
                                    solicitacao.tipo_vinculo ===
                                    "aluno"
                                        ? "Aluno"
                                        : "Funcionário institucional"
                                }
                            </small>

                        </div>


                        <div class="admin-ies-request-actions">

                            <button
                                type="button"
                                data-aprovar-vinculo="${solicitacao.id}"
                            >
                                Aprovar
                            </button>

                            <button
                                type="button"
                                class="danger"
                                data-rejeitar-vinculo="${solicitacao.id}"
                            >
                                Rejeitar
                            </button>

                        </div>

                    </div>
                `
            )
            .join("");


    container
        .querySelectorAll(
            "[data-aprovar-vinculo]"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () =>
                        aprovarVinculoAdmin(
                            botao.dataset
                                .aprovarVinculo
                        )
                );
            }
        );


    container
        .querySelectorAll(
            "[data-rejeitar-vinculo]"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () =>
                        rejeitarVinculoAdmin(
                            botao.dataset
                                .rejeitarVinculo
                        )
                );
            }
        );
}


async function aprovarVinculoAdmin(
    id
) {

    if (
        !window.confirm(
            "Deseja aprovar este vínculo?"
        )
    ) {

        return;
    }


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
                    JSON.stringify({})
            }
        );


    const dados =
        await resposta
            .json()
            .catch(
                () => ({})
            );


    if (
        !resposta.ok
    ) {

        window.alert(
            dados.erro ||
            "Erro ao aprovar vínculo"
        );

        return;
    }


    await atualizarAdministracaoInstituicao();
}


async function rejeitarVinculoAdmin(
    id
) {

    const observacao =
        window.prompt(
            "Motivo da rejeição (opcional):",
            ""
        );


    if (
        observacao ===
        null
    ) {

        return;
    }


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
                        observacao
                    })
            }
        );


    const dados =
        await resposta
            .json()
            .catch(
                () => ({})
            );


    if (
        !resposta.ok
    ) {

        window.alert(
            dados.erro ||
            "Erro ao rejeitar vínculo"
        );

        return;
    }


    await atualizarAdministracaoInstituicao();
}


// =========================================================
// USUÁRIOS
// =========================================================

async function carregarUsuariosAdminInstituicao() {

    const container =
        document.getElementById(
            "admin-ies-usuarios-lista"
        );


    if (
        !container
    ) {

        return;
    }


    const resposta =
        await fetch(
            "/api/admin-instituicao/usuarios"
        );


    if (
        resposta.status ===
        403
    ) {

        podeGerenciarUsuarios =
            false;


        document
            .getElementById(
                "admin-ies-usuarios"
            )
            ?.classList
            .add(
                "hidden"
            );


        return;
    }


    if (
        !resposta.ok
    ) {

        container.textContent =
            "Não foi possível carregar os usuários.";

        return;
    }


    podeGerenciarUsuarios =
        true;


    usuariosAdminInstituicao =
        await resposta.json();


    if (
        usuariosAdminInstituicao
            .length ===
        0
    ) {

        container.innerHTML = `

            <div class="admin-ies-empty">
                Nenhum usuário vinculado.
            </div>
        `;

        return;
    }


    container.innerHTML = `

        <table class="admin-ies-table">

            <thead>

                <tr>
                    <th>Usuário</th>
                    <th>Perfil</th>
                    <th>Status</th>
                    <th>Ação</th>
                </tr>

            </thead>

            <tbody>

                ${usuariosAdminInstituicao
                    .map(
                        usuario => `

                            <tr>

                                <td>

                                    <strong>
                                        ${escaparHtmlAdmin(
                                            usuario.nome
                                        )}
                                    </strong>

                                    <small>
                                        ${escaparHtmlAdmin(
                                            usuario.email
                                        )}
                                    </small>

                                </td>

                                <td>
                                    ${escaparHtmlAdmin(
                                        nomePerfilAdmin(
                                            usuario.perfil
                                        )
                                    )}
                                </td>

                                <td>
                                    ${
                                        usuario.ativo
                                            ? "Ativo"
                                            : "Desativado"
                                    }
                                </td>

                                <td>

                                    <button
                                        type="button"
                                        data-editar-conta="${usuario.id}"
                                    >
                                        Editar conta
                                    </button>

                                </td>

                            </tr>
                        `
                    )
                    .join("")}

            </tbody>

        </table>
    `;


    container
        .querySelectorAll(
            "[data-editar-conta]"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () =>
                        abrirModalContaAdmin(
                            Number(
                                botao.dataset
                                    .editarConta
                            )
                        )
                );
            }
        );
}


// =========================================================
// MODAL DE CONTA
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


        <div class="admin-account-card">

            <div class="admin-account-header">

                <div>

                    <span class="section-eyebrow">
                        Conta institucional
                    </span>

                    <h2>
                        Editar usuário
                    </h2>

                </div>


                <button
                    type="button"
                    data-fechar-conta
                >
                    ×
                </button>

            </div>


            <form id="admin-form-conta">

                <input
                    type="hidden"
                    id="admin-conta-id"
                >


                <label>
                    Nome

                    <input
                        type="text"
                        id="admin-conta-nome"
                        required
                    >
                </label>


                <label>
                    E-mail

                    <input
                        type="email"
                        id="admin-conta-email"
                        required
                    >
                </label>


                <label>
                    Perfil

                    <input
                        type="text"
                        id="admin-conta-perfil"
                        disabled
                    >
                </label>


                <div
                    id="admin-grupo-senha-atual"
                    class="hidden"
                >

                    <label>
                        Senha atual

                        <input
                            type="password"
                            id="admin-conta-senha-atual"
                        >
                    </label>

                </div>


                <label>
                    Nova senha

                    <input
                        type="password"
                        id="admin-conta-nova-senha"
                        minlength="6"
                    >
                </label>


                <label>
                    Confirmar nova senha

                    <input
                        type="password"
                        id="admin-conta-confirmar-senha"
                        minlength="6"
                    >
                </label>


                <div
                    id="admin-conta-mensagem"
                    class="admin-account-message"
                ></div>


                <div class="admin-account-actions">

                    <button
                        type="button"
                        data-fechar-conta
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
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


    modal
        .querySelectorAll(
            "[data-fechar-conta]"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    fecharModalContaAdmin
                );
            }
        );


    document
        .getElementById(
            "admin-form-conta"
        )
        .addEventListener(
            "submit",
            salvarContaAdmin
        );
}


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


    if (
        !usuario
    ) {

        return;
    }


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


    document
        .getElementById(
            "admin-conta-perfil"
        )
        .value =
        nomePerfilAdmin(
            usuario.perfil
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


    const ehProprio =
        Number(
            usuarioAdminInstituicao.id
        ) ===
        Number(
            usuario.id
        );


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
            "admin-modal-conta"
        )
        .classList
        .remove(
            "hidden"
        );
}


function fecharModalContaAdmin() {

    document
        .getElementById(
            "admin-modal-conta"
        )
        ?.classList
        .add(
            "hidden"
        );
}


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


    const ehProprio =
        Number(
            usuarioAdminInstituicao.id
        ) ===
        usuarioId;


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


    if (
        payload.nova_senha !==
        payload.confirmar_nova_senha
    ) {

        mensagem.textContent =
            "A confirmação da senha não confere.";

        return;
    }


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
        await resposta
            .json()
            .catch(
                () => ({})
            );


    if (
        !resposta.ok
    ) {

        mensagem.textContent =
            dados.erro ||
            "Erro ao atualizar a conta.";

        return;
    }


    mensagem.textContent =
        "Conta atualizada com sucesso.";


    await carregarUsuariosAdminInstituicao();


    setTimeout(
        fecharModalContaAdmin,
        600
    );
}


// =========================================================
// ATUALIZAR
// =========================================================

async function atualizarAdministracaoInstituicao() {

    const respostaResumo =
        await fetch(
            "/api/admin-instituicao/resumo"
        );


    if (
        respostaResumo.ok
    ) {

        const resumo =
            await respostaResumo.json();


        renderizarResumoAdmin(
            resumo
        );
    }


    await Promise.all([
        carregarSolicitacoesAdmin(),
        carregarUsuariosAdminInstituicao()
    ]);
}


// =========================================================
// ESTILOS
// =========================================================

function criarEstilosAdminInstituicao() {

    if (
        document.getElementById(
            "admin-ies-style"
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "admin-ies-style";


    style.textContent = `

        .admin-ies-badge {
            margin-left: 5px;
            padding: 2px 6px;
            border-radius: 999px;
            background: #6d28d9;
            color: white;
            font-size: 9px;
        }

        .admin-ies-summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 20px;
        }

        .admin-ies-summary article,
        .admin-ies-panel {
            padding: 16px;
            border: 1px solid #e7dfea;
            border-radius: 12px;
            background: white;
        }

        .admin-ies-summary article {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .admin-ies-summary strong {
            font-size: 22px;
        }

        .admin-ies-panel {
            margin-bottom: 18px;
        }

        .admin-ies-panel-header {
            margin-bottom: 14px;
        }

        .admin-ies-request {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid #eee8f1;
        }

        .admin-ies-request > div:first-child {
            display: flex;
            flex-direction: column;
            gap: 3px;
        }

        .admin-ies-request-actions {
            display: flex;
            gap: 6px;
        }

        .admin-ies-request-actions button,
        .admin-ies-table button {
            padding: 7px 10px;
            border: 1px solid #ddd6fe;
            border-radius: 7px;
            background: white;
            color: #5b21b6;
            cursor: pointer;
        }

        .admin-ies-request-actions .danger {
            color: #b91c1c;
        }

        .admin-ies-table {
            width: 100%;
            border-collapse: collapse;
        }

        .admin-ies-table th,
        .admin-ies-table td {
            padding: 10px;
            border-bottom: 1px solid #eee8f1;
            text-align: left;
        }

        .admin-ies-table td:first-child {
            display: flex;
            flex-direction: column;
            gap: 3px;
        }

        .admin-ies-table small {
            color: #7c7284;
        }

        .admin-account-modal {
            position: fixed;
            inset: 0;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .admin-account-modal.hidden {
            display: none;
        }

        .admin-account-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(32, 18, 39, 0.55);
        }

        .admin-account-card {
            position: relative;
            width: min(620px, calc(100vw - 30px));
            max-height: calc(100vh - 30px);
            overflow-y: auto;
            padding: 22px;
            border-radius: 16px;
            background: white;
        }

        .admin-account-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 18px;
        }

        #admin-form-conta {
            display: grid;
            gap: 13px;
        }

        #admin-form-conta label {
            display: grid;
            gap: 6px;
        }

        #admin-form-conta input {
            min-height: 42px;
            padding: 9px 11px;
            border: 1px solid #ddd5e2;
            border-radius: 8px;
        }

        .admin-account-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 10px;
        }

        .admin-account-actions button {
            padding: 10px 14px;
            border-radius: 8px;
            border: 1px solid #ddd6fe;
            cursor: pointer;
        }

        @media (max-width: 800px) {

            .admin-ies-summary {
                grid-template-columns:
                    repeat(2, 1fr);
            }

        }

        @media (max-width: 520px) {

            .admin-ies-summary {
                grid-template-columns:
                    1fr;
            }

            .admin-ies-request {
                flex-direction: column;
            }

        }
    `;


    document.head.appendChild(
        style
    );
}


// =========================================================
// INICIAR
// =========================================================

async function iniciarAdminInstituicao() {

    try {

        const resposta =
            await fetch(
                "/api/auth/me"
            );


        if (
            !resposta.ok
        ) {

            return;
        }


        const usuario =
            await resposta.json();


        if (
            ![
                "institucional",

                // Compatibilidade com sessões antigas.
                "consulta_institucional",
                "gestor",
                "admin_universidade"
            ].includes(
                usuario.perfil
            )
        ) {

            return;
        }


        usuarioAdminInstituicao =
            usuario;


        const perfilTopo =
            document.getElementById(
                "dashboard-usuario-perfil"
            );


        if (
            perfilTopo
        ) {

            perfilTopo.textContent =
                "Institucional";
        }


        configurarBotaoConfiguracoesAdmin();

        criarModalContaAdmin();

        criarEstilosAdminInstituicao();


        // =================================================
        // DESCOBRIR SE O USUÁRIO POSSUI ALGUMA PERMISSÃO
        // ADMINISTRATIVA.
        // =================================================

        const resumoResposta =
            await fetch(
                "/api/admin-instituicao/resumo"
            );


        if (
            resumoResposta.status ===
            403
        ) {

            return;
        }


        if (
            !resumoResposta.ok
        ) {

            return;
        }


        criarAbaAdministracao();


        const resumo =
            await resumoResposta.json();


        renderizarResumoAdmin(
            resumo
        );


        await Promise.all([
            carregarSolicitacoesAdmin(),
            carregarUsuariosAdminInstituicao()
        ]);


    } catch (erro) {

        console.error(
            "Erro ao iniciar administração institucional:",
            erro
        );
    }
}


iniciarAdminInstituicao();