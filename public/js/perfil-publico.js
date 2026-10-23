// =========================================================
// SIA - PERFIL DO USUÁRIO PÚBLICO
// =========================================================


let usuarioPerfilAtual =
    null;


// =========================================================
// CRIAR ÍCONE NO TOPO
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
        "Abrir configurações do perfil"
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
// CRIAR MODAL
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

                    </div>


                    <div>

                        <h2>
                            Meu perfil
                        </h2>

                        <p>
                            Gerencie seus dados e segurança da conta.
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
                     DADOS DA CONTA
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
                                    value="Usuário público"
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
                     SEGURANÇA
                     ========================================= -->

                <section class="profile-section">

                    <div class="profile-section-header">

                        <h3>
                            Segurança
                        </h3>

                        <p>
                            Para trocar a senha, confirme primeiro
                            sua senha atual.
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
}


// =========================================================
// MENSAGEM
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
// CARREGAR DADOS
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


    const usuario =
        await resposta.json();


    usuarioPerfilAtual =
        usuario;


    document
        .getElementById(
            "perfil-nome"
        )
        .value =
        usuario.nome || "";


    document
        .getElementById(
            "perfil-email"
        )
        .value =
        usuario.email || "";


    document
        .getElementById(
            "perfil-tipo"
        )
        .value =
        usuario.perfil ===
            "publico"

            ? "Usuário público"

            : usuario.perfil || "-";
}


// =========================================================
// ABRIR
// =========================================================

async function abrirPerfilPublico() {

    criarModalPerfilPublico();


    const backdrop =
        document.getElementById(
            "perfil-publico-backdrop"
        );


    backdrop.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";


    limparMensagemPerfil(
        "perfil-dados-mensagem"
    );


    limparMensagemPerfil(
        "perfil-senha-mensagem"
    );


    document
        .getElementById(
            "form-perfil-senha"
        )
        .reset();


    try {

        await carregarDadosPerfil();

    } catch (erro) {

        console.error(
            "Erro ao carregar perfil:",
            erro
        );


        mostrarMensagemPerfil(
            "perfil-dados-mensagem",
            "Não foi possível carregar os dados do perfil.",
            "error"
        );
    }
}


// =========================================================
// FECHAR
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
// SALVAR DADOS
// =========================================================

async function salvarDadosPerfil(
    event
) {

    event.preventDefault();


    limparMensagemPerfil(
        "perfil-dados-mensagem"
    );


    const nome =
        document
            .getElementById(
                "perfil-nome"
            )
            .value
            .trim();


    const email =
        document
            .getElementById(
                "perfil-email"
            )
            .value
            .trim();


    const botao =
        document.getElementById(
            "btn-salvar-perfil"
        );


    botao.disabled =
        true;


    const textoOriginal =
        botao.textContent;


    botao.textContent =
        "Salvando...";


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
                            nome,
                            email
                        })
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Não foi possível atualizar o perfil"
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


        document
            .getElementById(
                "perfil-nome"
            )
            .value =
            dados.usuario.nome;


        document
            .getElementById(
                "perfil-email"
            )
            .value =
            dados.usuario.email;


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


        botao.textContent =
            textoOriginal;
    }
}


// =========================================================
// ALTERAR SENHA
// =========================================================

async function alterarSenhaPerfil(
    event
) {

    event.preventDefault();


    limparMensagemPerfil(
        "perfil-senha-mensagem"
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


    const confirmarSenha =
        document
            .getElementById(
                "perfil-confirmar-senha"
            )
            .value;


    if (
        novaSenha !==
        confirmarSenha
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


    const textoOriginal =
        botao.textContent;


    botao.textContent =
        "Alterando...";


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
                                confirmarSenha
                        })
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Não foi possível alterar a senha"
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


        botao.textContent =
            textoOriginal;
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