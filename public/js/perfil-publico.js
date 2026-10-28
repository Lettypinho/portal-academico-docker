// =========================================================
// SIA - PERFIL DO USUÁRIO PÚBLICO
// Perfil + Segurança + Solicitação de vínculo
// =========================================================


let usuarioPerfilAtual =
    null;

let solicitacaoVinculoAtual =
    null;

let instituicoesVinculo =
    [];

let instituicaoVinculoSelecionada =
    null;


// =========================================================
// UTILITÁRIOS
// =========================================================

function escaparHtmlPerfil(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function normalizarPerfil(valor) {

    return String(valor ?? "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase();
}


function formatarDataPerfil(valor) {

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
                "numeric"
        }
    );
}


// =========================================================
// BOTÃO DE PERFIL
// =========================================================

function criarBotaoPerfilPublico() {

    if (
        document.getElementById(
            "btn-perfil-publico"
        )
    ) {

        return;
    }


    const topbar =
        document.querySelector(
            ".topbar-user"
        );


    const botaoSair =
        document.getElementById(
            "btn-logout"
        );


    if (
        !topbar ||
        !botaoSair
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
        "btn-perfil-publico";


    botao.className =
        "btn-profile";


    botao.title =
        "Meu perfil";


    botao.setAttribute(
        "aria-label",
        "Abrir meu perfil"
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

            <path
                d="M20 21a8 8 0 0 0-16 0"
            ></path>

            <circle
                cx="12"
                cy="7"
                r="4"
            ></circle>

        </svg>
    `;


    topbar.insertBefore(
        botao,
        botaoSair
    );


    botao.addEventListener(
        "click",
        abrirPerfilPublico
    );
}


// =========================================================
// MODAL
// =========================================================

function criarModalPerfilPublico() {

    if (
        document.getElementById(
            "perfil-publico-backdrop"
        )
    ) {

        return;
    }


    const backdrop =
        document.createElement(
            "div"
        );


    backdrop.id =
        "perfil-publico-backdrop";


    backdrop.className =
        "profile-modal-backdrop hidden";


    backdrop.innerHTML = `

        <div
            class="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Meu perfil"
        >

            <div class="profile-modal-header">

                <div class="profile-modal-title">

                    <div class="profile-modal-avatar">

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >

                            <path
                                d="M20 21a8 8 0 0 0-16 0"
                            ></path>

                            <circle
                                cx="12"
                                cy="7"
                                r="4"
                            ></circle>

                        </svg>

                    </div>


                    <div>

                        <h2>
                            Meu perfil
                        </h2>

                        <p>
                            Conta, vínculo institucional e segurança.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    id="btn-fechar-perfil"
                    class="profile-modal-close"
                    aria-label="Fechar"
                >
                    ×
                </button>

            </div>


            <div class="profile-modal-body">


                <!-- =========================================
                     CONTA
                     ========================================= -->

                <section class="profile-section">

                    <div class="profile-section-header">

                        <h3>
                            Dados da conta
                        </h3>

                        <p>
                            Atualize seu nome e endereço de e-mail.
                        </p>

                    </div>


                    <div
                        id="perfil-dados-mensagem"
                        class="profile-message"
                    ></div>


                    <form id="form-perfil-dados">

                        <div class="profile-form-grid">

                            <div class="profile-form-group full">

                                <label for="perfil-nome">
                                    Nome
                                </label>

                                <input
                                    type="text"
                                    id="perfil-nome"
                                    maxlength="150"
                                    autocomplete="name"
                                    required
                                >

                            </div>


                            <div class="profile-form-group">

                                <label for="perfil-email">
                                    E-mail
                                </label>

                                <input
                                    type="email"
                                    id="perfil-email"
                                    maxlength="200"
                                    autocomplete="email"
                                    required
                                >

                            </div>


                            <div class="profile-form-group">

                                <label for="perfil-tipo">
                                    Tipo de usuário
                                </label>

                                <input
                                    type="text"
                                    id="perfil-tipo"
                                    readonly
                                >

                            </div>

                        </div>


                        <div class="profile-form-actions">

                            <button
                                type="submit"
                                id="btn-salvar-perfil"
                                class="profile-save-button"
                            >
                                Salvar alterações
                            </button>

                        </div>

                    </form>

                </section>


                <!-- =========================================
                     VÍNCULO
                     ========================================= -->

                <section class="profile-section">

                    <div class="profile-section-header">

                        <h3>
                            Vínculo institucional
                        </h3>

                        <p>
                            Solicite o reconhecimento do seu vínculo
                            como aluno ou funcionário de uma instituição.
                        </p>

                    </div>


                    <div
                        id="perfil-vinculo-mensagem"
                        class="profile-message"
                    ></div>


                    <div
                        id="perfil-vinculo-status"
                    >
                        Carregando...
                    </div>


                    <form
                        id="form-solicitacao-vinculo"
                        class="profile-link-form hidden"
                    >

                        <div class="profile-form-grid">


                            <div class="profile-form-group full">

                                <label for="vinculo-tipo">
                                    Tipo de vínculo
                                </label>

                                <select
                                    id="vinculo-tipo"
                                    required
                                >

                                    <option value="">
                                        Selecione
                                    </option>

                                    <option value="aluno">
                                        Aluno
                                    </option>

                                    <option value="funcionario">
                                        Funcionário da instituição
                                    </option>

                                </select>

                            </div>


                            <div class="profile-form-group full profile-institution-search">

                                <label for="vinculo-instituicao-busca">
                                    Instituição
                                </label>

                                <input
                                    type="search"
                                    id="vinculo-instituicao-busca"
                                    placeholder="Digite o nome ou sigla da instituição"
                                    autocomplete="off"
                                    required
                                >

                                <input
                                    type="hidden"
                                    id="vinculo-universidade-id"
                                >


                                <div
                                    id="vinculo-instituicoes-resultados"
                                    class="profile-institution-results hidden"
                                ></div>

                            </div>


                            <div class="profile-form-group full">

                                <label for="vinculo-email-institucional">
                                    E-mail institucional
                                </label>

                                <input
                                    type="email"
                                    id="vinculo-email-institucional"
                                    placeholder="nome@instituicao.br"
                                    autocomplete="email"
                                    required
                                >

                            </div>


                            <!-- ALUNO -->

                            <div
                                id="campos-vinculo-aluno"
                                class="profile-dynamic-fields hidden"
                            >

                                <div class="profile-form-group">

                                    <label for="vinculo-matricula">
                                        Matrícula
                                    </label>

                                    <input
                                        type="text"
                                        id="vinculo-matricula"
                                        maxlength="100"
                                    >

                                </div>


                                <div class="profile-form-group">

                                    <label for="vinculo-curso">
                                        Curso
                                    </label>

                                    <select id="vinculo-curso">

                                        <option value="">
                                            Selecione primeiro a instituição
                                        </option>

                                    </select>

                                </div>

                            </div>


                            <!-- FUNCIONÁRIO -->

                            <div
                                id="campos-vinculo-funcionario"
                                class="profile-dynamic-fields hidden"
                            >

                                <div class="profile-form-group">

                                    <label for="vinculo-identificacao">
                                        Matrícula funcional / identificação
                                    </label>

                                    <input
                                        type="text"
                                        id="vinculo-identificacao"
                                        maxlength="100"
                                        placeholder="Opcional"
                                    >

                                </div>


                                <div class="profile-form-group">

                                    <label for="vinculo-cargo">
                                        Cargo ou função
                                    </label>

                                    <input
                                        type="text"
                                        id="vinculo-cargo"
                                        maxlength="150"
                                    >

                                </div>


                                <div class="profile-form-group full">

                                    <label for="vinculo-setor">
                                        Setor
                                    </label>

                                    <input
                                        type="text"
                                        id="vinculo-setor"
                                        maxlength="150"
                                    >

                                </div>

                            </div>

                        </div>


                        <div class="profile-link-note">

                            <strong>
                                Importante
                            </strong>

                            <span>
                                O envio da solicitação não altera
                                automaticamente suas permissões.
                                O vínculo precisará ser analisado.
                            </span>

                        </div>


                        <div class="profile-form-actions profile-form-actions-between">

                            <button
                                type="button"
                                id="btn-cancelar-form-vinculo"
                                class="profile-secondary-button"
                            >
                                Voltar
                            </button>


                            <button
                                type="submit"
                                id="btn-enviar-vinculo"
                                class="profile-save-button"
                            >
                                Enviar solicitação
                            </button>

                        </div>

                    </form>

                </section>


                <!-- =========================================
                     SEGURANÇA
                     ========================================= -->

                <section class="profile-section">

                    <div class="profile-section-header">

                        <h3>
                            Segurança
                        </h3>

                        <p>
                            Confirme sua senha atual antes de alterá-la.
                        </p>

                    </div>


                    <div
                        id="perfil-senha-mensagem"
                        class="profile-message"
                    ></div>


                    <form id="form-perfil-senha">

                        <div class="profile-form-grid">

                            <div class="profile-form-group full">

                                <label for="perfil-senha-atual">
                                    Senha atual
                                </label>

                                <input
                                    type="password"
                                    id="perfil-senha-atual"
                                    autocomplete="current-password"
                                    required
                                >

                            </div>


                            <div class="profile-form-group">

                                <label for="perfil-nova-senha">
                                    Nova senha
                                </label>

                                <input
                                    type="password"
                                    id="perfil-nova-senha"
                                    minlength="6"
                                    maxlength="72"
                                    autocomplete="new-password"
                                    required
                                >

                            </div>


                            <div class="profile-form-group">

                                <label for="perfil-confirmar-senha">
                                    Confirmar nova senha
                                </label>

                                <input
                                    type="password"
                                    id="perfil-confirmar-senha"
                                    minlength="6"
                                    maxlength="72"
                                    autocomplete="new-password"
                                    required
                                >

                            </div>

                        </div>


                        <div class="profile-form-actions">

                            <button
                                type="submit"
                                id="btn-alterar-senha"
                                class="profile-save-button"
                            >
                                Alterar senha
                            </button>

                        </div>

                    </form>

                </section>

            </div>

        </div>
    `;


    document.body.appendChild(
        backdrop
    );


    configurarEventosPerfil();
}


// =========================================================
// EVENTOS
// =========================================================

function configurarEventosPerfil() {

    const backdrop =
        document.getElementById(
            "perfil-publico-backdrop"
        );


    backdrop.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                backdrop
            ) {

                fecharPerfilPublico();
            }
        }
    );


    document
        .getElementById(
            "btn-fechar-perfil"
        )
        .addEventListener(
            "click",
            fecharPerfilPublico
        );


    document
        .getElementById(
            "form-perfil-dados"
        )
        .addEventListener(
            "submit",
            salvarDadosPerfil
        );


    document
        .getElementById(
            "form-perfil-senha"
        )
        .addEventListener(
            "submit",
            alterarSenhaPerfil
        );


    document
        .getElementById(
            "form-solicitacao-vinculo"
        )
        .addEventListener(
            "submit",
            enviarSolicitacaoVinculo
        );


    document
        .getElementById(
            "btn-cancelar-form-vinculo"
        )
        .addEventListener(
            "click",
            fecharFormularioVinculo
        );


    document
        .getElementById(
            "vinculo-tipo"
        )
        .addEventListener(
            "change",
            atualizarCamposTipoVinculo
        );


    document
        .getElementById(
            "vinculo-instituicao-busca"
        )
        .addEventListener(
            "input",
            pesquisarInstituicoesVinculo
        );


    document
        .getElementById(
            "vinculo-instituicoes-resultados"
        )
        .addEventListener(
            "click",
            selecionarInstituicaoVinculo
        );
}


// =========================================================
// MENSAGENS
// =========================================================

function mostrarMensagemPerfil(
    elementoId,
    mensagem,
    tipo
) {

    const elemento =
        document.getElementById(
            elementoId
        );


    if (!elemento) {

        return;
    }


    elemento.textContent =
        mensagem;


    elemento.className =
        `profile-message visible ${tipo}`;
}


function limparMensagemPerfil(
    elementoId
) {

    const elemento =
        document.getElementById(
            elementoId
        );


    if (!elemento) {

        return;
    }


    elemento.textContent =
        "";


    elemento.className =
        "profile-message";
}


// =========================================================
// ABRIR PERFIL
// =========================================================

async function abrirPerfilPublico() {

    criarModalPerfilPublico();


    document
        .getElementById(
            "perfil-publico-backdrop"
        )
        .classList
        .remove(
            "hidden"
        );


    document.body.style.overflow =
        "hidden";


    limparMensagemPerfil(
        "perfil-dados-mensagem"
    );

    limparMensagemPerfil(
        "perfil-vinculo-mensagem"
    );

    limparMensagemPerfil(
        "perfil-senha-mensagem"
    );


    document
        .getElementById(
            "form-perfil-senha"
        )
        .reset();


    fecharFormularioVinculo();


    try {

        await Promise.all([
            carregarDadosPerfil(),
            carregarSolicitacaoVinculo()
        ]);


    } catch (erro) {

        console.error(
            erro
        );
    }
}


// =========================================================
// FECHAR PERFIL
// =========================================================

function fecharPerfilPublico() {

    const backdrop =
        document.getElementById(
            "perfil-publico-backdrop"
        );


    if (!backdrop) {

        return;
    }


    backdrop.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";
}


// =========================================================
// DADOS DA CONTA
// =========================================================

async function carregarDadosPerfil() {

    const resposta =
        await fetch(
            "/api/auth/me"
        );


    if (!resposta.ok) {

        throw new Error(
            "Não foi possível carregar o perfil"
        );
    }


    usuarioPerfilAtual =
        await resposta.json();


    document
        .getElementById(
            "perfil-nome"
        )
        .value =
        usuarioPerfilAtual.nome ||
        "";


    document
        .getElementById(
            "perfil-email"
        )
        .value =
        usuarioPerfilAtual.email ||
        "";


    const nomesPerfil = {

    publico:
        "Usuário público",

    aluno:
        "Aluno"
};


document
    .getElementById(
        "perfil-tipo"
    )
    .value =
    nomesPerfil[
        usuarioPerfilAtual.perfil
    ] ||
    usuarioPerfilAtual.perfil;
}


// =========================================================
// SALVAR CONTA
// =========================================================

async function salvarDadosPerfil(event) {

    event.preventDefault();


    const botao =
        document.getElementById(
            "btn-salvar-perfil"
        );


    botao.disabled =
        true;


    try {

        const resposta =
            await fetch(
                "/api/auth/perfil",
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


        usuarioPerfilAtual =
            dados.usuario;


        const nomeTopo =
            document.getElementById(
                "nome-usuario"
            );


        if (nomeTopo) {

            nomeTopo.textContent =
                dados.usuario.nome;
        }


        mostrarMensagemPerfil(
            "perfil-dados-mensagem",
            "Dados atualizados com sucesso.",
            "success"
        );


    } catch (erro) {

        mostrarMensagemPerfil(
            "perfil-dados-mensagem",
            erro.message,
            "error"
        );


    } finally {

        botao.disabled =
            false;
    }
}


// =========================================================
// SOLICITAÇÃO ATUAL
// =========================================================

async function carregarSolicitacaoVinculo() {

    const resposta =
        await fetch(
            "/api/solicitacoes-vinculo/minha"
        );


    if (!resposta.ok) {

        const dados =
            await resposta.json();


        throw new Error(
            dados.erro ||
            "Erro ao consultar vínculo"
        );
    }


    solicitacaoVinculoAtual =
        await resposta.json();


    renderizarStatusVinculo();
}


// =========================================================
// STATUS
// =========================================================

function renderizarStatusVinculo() {

    const container =
        document.getElementById(
            "perfil-vinculo-status"
        );


    if (!solicitacaoVinculoAtual) {

        container.innerHTML = `

            <div class="profile-link-empty">

                <div class="profile-link-icon">
                    +
                </div>


                <div>

                    <strong>
                        Nenhum vínculo institucional
                    </strong>

                    <p>
                        Se você é aluno ou funcionário de uma
                        instituição, solicite seu vínculo.
                    </p>

                </div>


                <button
                    type="button"
                    class="profile-save-button"
                    id="btn-solicitar-vinculo"
                >
                    Solicitar vínculo
                </button>

            </div>
        `;


        document
            .getElementById(
                "btn-solicitar-vinculo"
            )
            .addEventListener(
                "click",
                abrirFormularioVinculo
            );


        return;
    }


    const s =
        solicitacaoVinculoAtual;


    const statusLabels = {

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


    const tipo =
        s.tipo_vinculo ===
            "aluno"
            ? "Aluno"
            : "Funcionário";


    container.innerHTML = `

        <div class="profile-link-status-card">

            <div class="profile-link-status-header">

                <div>

                    <span
                        class="profile-link-status-badge status-${escaparHtmlPerfil(
                            s.status
                        )}"
                    >
                        ${escaparHtmlPerfil(
                            statusLabels[
                                s.status
                            ] ||
                            s.status
                        )}
                    </span>


                    <h4>
                        ${escaparHtmlPerfil(
                            s.universidade_sigla ||
                            s.universidade
                        )}
                    </h4>


                    <p>
                        ${escaparHtmlPerfil(
                            s.universidade
                        )}
                    </p>

                </div>


                <span class="profile-link-type">
                    ${tipo}
                </span>

            </div>


            <div class="profile-link-details">

                <div>
                    <span>
                        E-mail institucional
                    </span>

                    <strong>
                        ${escaparHtmlPerfil(
                            s.email_institucional
                        )}
                    </strong>
                </div>


                ${
                    s.matricula
                        ? `

                            <div>
                                <span>
                                    Matrícula
                                </span>

                                <strong>
                                    ${escaparHtmlPerfil(
                                        s.matricula
                                    )}
                                </strong>
                            </div>
                        `
                        : ""
                }


                ${
                    s.curso
                        ? `

                            <div>
                                <span>
                                    Curso
                                </span>

                                <strong>
                                    ${escaparHtmlPerfil(
                                        s.curso
                                    )}
                                </strong>
                            </div>
                        `
                        : ""
                }


                ${
                    s.cargo
                        ? `

                            <div>
                                <span>
                                    Cargo
                                </span>

                                <strong>
                                    ${escaparHtmlPerfil(
                                        s.cargo
                                    )}
                                </strong>
                            </div>
                        `
                        : ""
                }


                ${
                    s.setor
                        ? `

                            <div>
                                <span>
                                    Setor
                                </span>

                                <strong>
                                    ${escaparHtmlPerfil(
                                        s.setor
                                    )}
                                </strong>
                            </div>
                        `
                        : ""
                }


                <div>
                    <span>
                        Enviada em
                    </span>

                    <strong>
                        ${formatarDataPerfil(
                            s.criado_em
                        )}
                    </strong>
                </div>

            </div>


            ${
                s.observacao_analise
                    ? `

                        <div class="profile-link-analysis">

                            <strong>
                                Observação da análise
                            </strong>

                            <p>
                                ${escaparHtmlPerfil(
                                    s.observacao_analise
                                )}
                            </p>

                        </div>
                    `
                    : ""
            }


            <div class="profile-link-status-actions">

                ${
                    s.status ===
                        "pendente"
                        ? `

                            <button
                                type="button"
                                id="btn-cancelar-solicitacao"
                                class="profile-danger-button"
                            >
                                Cancelar solicitação
                            </button>
                        `
                        : ""
                }


                ${
                    [
                        "rejeitado",
                        "cancelado",
                        "revogado"
                    ].includes(
                        s.status
                    )
                        ? `

                            <button
                                type="button"
                                id="btn-nova-solicitacao"
                                class="profile-save-button"
                            >
                                Nova solicitação
                            </button>
                        `
                        : ""
                }

            </div>

        </div>
    `;


    const cancelar =
        document.getElementById(
            "btn-cancelar-solicitacao"
        );


    if (cancelar) {

        cancelar.addEventListener(
            "click",
            cancelarSolicitacaoVinculo
        );
    }


    const nova =
        document.getElementById(
            "btn-nova-solicitacao"
        );


    if (nova) {

        nova.addEventListener(
            "click",
            abrirFormularioVinculo
        );
    }
}


// =========================================================
// FORMULÁRIO
// =========================================================

async function abrirFormularioVinculo() {

    limparMensagemPerfil(
        "perfil-vinculo-mensagem"
    );


    document
        .getElementById(
            "perfil-vinculo-status"
        )
        .classList
        .add(
            "hidden"
        );


    const formulario =
        document.getElementById(
            "form-solicitacao-vinculo"
        );


    formulario.reset();


    instituicaoVinculoSelecionada =
        null;


    document
        .getElementById(
            "vinculo-universidade-id"
        )
        .value =
        "";


    atualizarCamposTipoVinculo();


    formulario.classList.remove(
        "hidden"
    );


    if (
        instituicoesVinculo.length ===
        0
    ) {

        await carregarInstituicoesVinculo();
    }
}


function fecharFormularioVinculo() {

    const formulario =
        document.getElementById(
            "form-solicitacao-vinculo"
        );


    const status =
        document.getElementById(
            "perfil-vinculo-status"
        );


    if (formulario) {

        formulario.classList.add(
            "hidden"
        );
    }


    if (status) {

        status.classList.remove(
            "hidden"
        );
    }


    const resultados =
        document.getElementById(
            "vinculo-instituicoes-resultados"
        );


    if (resultados) {

        resultados.classList.add(
            "hidden"
        );
    }
}


// =========================================================
// TIPO DE VÍNCULO
// =========================================================

function atualizarCamposTipoVinculo() {

    const tipo =
        document.getElementById(
            "vinculo-tipo"
        )
            ?.value;


    const aluno =
        document.getElementById(
            "campos-vinculo-aluno"
        );


    const funcionario =
        document.getElementById(
            "campos-vinculo-funcionario"
        );


    if (
        !aluno ||
        !funcionario
    ) {

        return;
    }


    aluno.classList.toggle(
        "hidden",
        tipo !==
            "aluno"
    );


    funcionario.classList.toggle(
        "hidden",
        tipo !==
            "funcionario"
    );


    if (
        tipo ===
            "aluno" &&
        instituicaoVinculoSelecionada
    ) {

        carregarCursosVinculo(
            instituicaoVinculoSelecionada.id
        );
    }
}


// =========================================================
// INSTITUIÇÕES
// =========================================================

async function carregarInstituicoesVinculo() {

    const resposta =
        await fetch(
            "/api/universidades"
        );


    if (!resposta.ok) {

        throw new Error(
            "Não foi possível carregar as instituições"
        );
    }


    instituicoesVinculo =
        await resposta.json();
}


function pesquisarInstituicoesVinculo(event) {

    const valor =
        event.target.value;


    instituicaoVinculoSelecionada =
        null;


    document
        .getElementById(
            "vinculo-universidade-id"
        )
        .value =
        "";


    const container =
        document.getElementById(
            "vinculo-instituicoes-resultados"
        );


    const termo =
        normalizarPerfil(
            valor
        )
            .trim();


    if (
        termo.length <
        2
    ) {

        container.classList.add(
            "hidden"
        );

        container.innerHTML =
            "";

        return;
    }


    const resultados =
        instituicoesVinculo
            .filter(
                item => {

                    const texto =
                        normalizarPerfil(`

                            ${item.nome || ""}

                            ${item.sigla || ""}

                            ${item.codigo || ""}

                            ${item.cidade || ""}

                            ${item.estado || ""}
                        `);


                    return texto.includes(
                        termo
                    );
                }
            )
            .slice(
                0,
                8
            );


    if (!resultados.length) {

        container.innerHTML = `

            <div class="profile-institution-empty">
                Nenhuma instituição encontrada.
            </div>
        `;

        container.classList.remove(
            "hidden"
        );

        return;
    }


    container.innerHTML =
        resultados
            .map(
                item => `

                    <button
                        type="button"
                        class="profile-institution-option"
                        data-universidade-id="${item.id}"
                    >

                        <strong>
                            ${escaparHtmlPerfil(
                                item.sigla ||
                                item.nome
                            )}
                        </strong>

                        <span>
                            ${escaparHtmlPerfil(
                                item.nome
                            )}
                        </span>

                        <small>
                            ${escaparHtmlPerfil(
                                item.cidade ||
                                "-"
                            )}
                            /
                            ${escaparHtmlPerfil(
                                item.estado ||
                                "-"
                            )}

                            • Código IES
                            ${escaparHtmlPerfil(
                                item.codigo
                            )}
                        </small>

                    </button>
                `
            )
            .join("");


    container.classList.remove(
        "hidden"
    );
}


async function selecionarInstituicaoVinculo(event) {

    const opcao =
        event.target.closest(
            "[data-universidade-id]"
        );


    if (!opcao) {

        return;
    }


    const id =
        Number(
            opcao.dataset
                .universidadeId
        );


    const instituicao =
        instituicoesVinculo
            .find(
                item =>
                    Number(item.id) ===
                    id
            );


    if (!instituicao) {

        return;
    }


    instituicaoVinculoSelecionada =
        instituicao;


    document
        .getElementById(
            "vinculo-universidade-id"
        )
        .value =
        instituicao.id;


    document
        .getElementById(
            "vinculo-instituicao-busca"
        )
        .value =
        instituicao.sigla
            ? `${instituicao.sigla} — ${instituicao.nome}`
            : instituicao.nome;


    document
        .getElementById(
            "vinculo-instituicoes-resultados"
        )
        .classList
        .add(
            "hidden"
        );


    if (
        document
            .getElementById(
                "vinculo-tipo"
            )
            .value ===
        "aluno"
    ) {

        await carregarCursosVinculo(
            instituicao.id
        );
    }
}


// =========================================================
// CURSOS
// =========================================================

async function carregarCursosVinculo(
    universidadeId
) {

    const campo =
        document.getElementById(
            "vinculo-curso"
        );


    campo.innerHTML = `

        <option value="">
            Carregando cursos...
        </option>
    `;


    try {

        const resposta =
            await fetch(
                `/api/cursos?universidade_id=${encodeURIComponent(
                    universidadeId
                )}&limite=500`
            );


        const cursos =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                "Erro ao carregar cursos"
            );
        }


        campo.innerHTML =
            `<option value="">Selecione</option>` +
            cursos
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
                    curso => `

                        <option value="${curso.id}">

                            ${escaparHtmlPerfil(
                                curso.nome
                            )}

                            ${
                                curso.modalidade
                                    ? ` — ${escaparHtmlPerfil(
                                        curso.modalidade
                                    )}`
                                    : ""
                            }

                        </option>
                    `
                )
                .join("");


    } catch (erro) {

        campo.innerHTML = `

            <option value="">
                Não foi possível carregar os cursos
            </option>
        `;
    }
}


// =========================================================
// ENVIAR SOLICITAÇÃO
// =========================================================

async function enviarSolicitacaoVinculo(
    event
) {

    event.preventDefault();


    limparMensagemPerfil(
        "perfil-vinculo-mensagem"
    );


    const tipo =
        document.getElementById(
            "vinculo-tipo"
        )
            .value;


    const universidadeId =
        document.getElementById(
            "vinculo-universidade-id"
        )
            .value;


    if (!universidadeId) {

        mostrarMensagemPerfil(
            "perfil-vinculo-mensagem",
            "Selecione uma instituição na lista de resultados.",
            "error"
        );

        return;
    }


    const payload = {

        universidade_id:
            universidadeId,

        tipo_vinculo:
            tipo,

        email_institucional:
            document
                .getElementById(
                    "vinculo-email-institucional"
                )
                .value
                .trim()
    };


    if (
        tipo ===
        "aluno"
    ) {

        payload.matricula =
            document
                .getElementById(
                    "vinculo-matricula"
                )
                .value
                .trim();


        payload.curso_id =
            document
                .getElementById(
                    "vinculo-curso"
                )
                .value;
    }


    if (
        tipo ===
        "funcionario"
    ) {

        payload.identificacao_institucional =
            document
                .getElementById(
                    "vinculo-identificacao"
                )
                .value
                .trim();


        payload.cargo =
            document
                .getElementById(
                    "vinculo-cargo"
                )
                .value
                .trim();


        payload.setor =
            document
                .getElementById(
                    "vinculo-setor"
                )
                .value
                .trim();
    }


    const botao =
        document.getElementById(
            "btn-enviar-vinculo"
        );


    botao.disabled =
        true;


    botao.textContent =
        "Enviando...";


    try {

        const resposta =
            await fetch(
                "/api/solicitacoes-vinculo",
                {
                    method:
                        "POST",

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
                "Erro ao enviar solicitação"
            );
        }


        mostrarMensagemPerfil(
            "perfil-vinculo-mensagem",
            "Solicitação enviada com sucesso.",
            "success"
        );


        await carregarSolicitacaoVinculo();


        fecharFormularioVinculo();


    } catch (erro) {

        mostrarMensagemPerfil(
            "perfil-vinculo-mensagem",
            erro.message,
            "error"
        );


    } finally {

        botao.disabled =
            false;


        botao.textContent =
            "Enviar solicitação";
    }
}


// =========================================================
// CANCELAR SOLICITAÇÃO
// =========================================================

async function cancelarSolicitacaoVinculo() {

    if (
        !solicitacaoVinculoAtual ||
        solicitacaoVinculoAtual.status !==
            "pendente"
    ) {

        return;
    }


    const confirmar =
        window.confirm(
            "Deseja cancelar esta solicitação de vínculo?"
        );


    if (!confirmar) {

        return;
    }


    try {

        const resposta =
            await fetch(
                `/api/solicitacoes-vinculo/${solicitacaoVinculoAtual.id}`,
                {
                    method:
                        "DELETE"
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao cancelar solicitação"
            );
        }


        mostrarMensagemPerfil(
            "perfil-vinculo-mensagem",
            "Solicitação cancelada.",
            "success"
        );


        await carregarSolicitacaoVinculo();


    } catch (erro) {

        mostrarMensagemPerfil(
            "perfil-vinculo-mensagem",
            erro.message,
            "error"
        );
    }
}


// =========================================================
// SENHA
// =========================================================

async function alterarSenhaPerfil(
    event
) {

    event.preventDefault();


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

        mostrarMensagemPerfil(
            "perfil-senha-mensagem",
            "A confirmação da nova senha não confere.",
            "error"
        );

        return;
    }


    const botao =
        document.getElementById(
            "btn-alterar-senha"
        );


    botao.disabled =
        true;


    try {

        const resposta =
            await fetch(
                "/api/auth/senha",
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
                "form-perfil-senha"
            )
            .reset();


        mostrarMensagemPerfil(
            "perfil-senha-mensagem",
            "Senha alterada com sucesso.",
            "success"
        );


    } catch (erro) {

        mostrarMensagemPerfil(
            "perfil-senha-mensagem",
            erro.message,
            "error"
        );


    } finally {

        botao.disabled =
            false;
    }
}


// =========================================================
// ESC
// =========================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            fecharPerfilPublico();
        }
    }
);


// =========================================================
// INICIALIZAÇÃO
// =========================================================

function iniciarPerfilPublico() {

    criarBotaoPerfilPublico();

    criarModalPerfilPublico();
}


iniciarPerfilPublico();