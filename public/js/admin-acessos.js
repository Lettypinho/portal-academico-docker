// =========================================================
// SIA - ACESSOS + PERMISSÕES
// =========================================================

let universidadesNovoAcesso =
    [];

let catalogoPermissoesAdmin =
    [];

let usuarioPermissoesEdicao =
    null;

let funcaoAbrirModalUsuarioOriginal =
    null;


// =========================================================
// UTILITÁRIO
// =========================================================

function escaparHtmlPermissao(
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


// =========================================================
// INICIALIZAÇÃO
// =========================================================

async function iniciarNovoAcessoAdmin() {

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
            usuario.perfil !==
            "super_admin"
        ) {

            return;
        }


        await carregarCatalogoPermissoes();


        criarEstilosPermissoes();

        criarBotaoNovoAcesso();

        criarModalNovoAcesso();

        criarSecaoPermissoesEdicao();

        integrarModalEdicaoUsuario();


    } catch (erro) {

        console.error(
            "Erro ao iniciar acessos:",
            erro
        );
    }
}


// =========================================================
// CATÁLOGO
// =========================================================

async function carregarCatalogoPermissoes() {

    const resposta =
        await fetch(
            "/api/admin-permissoes/catalogo"
        );


    const dados =
        await resposta
            .json()
            .catch(
                () => []
            );


    if (
        !resposta.ok
    ) {

        throw new Error(
            dados.erro ||
            "Não foi possível carregar as permissões"
        );
    }


    catalogoPermissoesAdmin =
        Array.isArray(
            dados
        )
            ? dados
            : [];
}


// =========================================================
// AGRUPAR
// =========================================================

function agruparPermissoes() {

    const grupos =
        new Map();


    catalogoPermissoesAdmin
        .forEach(
            permissao => {

                const categoria =
                    permissao.categoria ||
                    "Outras permissões";


                if (
                    !grupos.has(
                        categoria
                    )
                ) {

                    grupos.set(
                        categoria,
                        []
                    );
                }


                grupos
                    .get(
                        categoria
                    )
                    .push(
                        permissao
                    );
            }
        );


    return grupos;
}


// =========================================================
// RENDER
// =========================================================

function renderizarPermissoes(
    container,
    selecionadas = [],
    bloqueado = false
) {

    if (
        !container
    ) {

        return;
    }


    const selecionadasSet =
        new Set(
            selecionadas
        );


    const grupos =
        agruparPermissoes();


    container.innerHTML =
        Array
            .from(
                grupos.entries()
            )
            .map(
                ([
                    categoria,
                    permissoes
                ]) => `

                    <div class="permission-category">

                        <div class="permission-category-title">
                            ${escaparHtmlPermissao(
                                categoria
                            )}
                        </div>


                        <div class="permission-options">

                            ${permissoes
                                .map(
                                    permissao => `

                                        <label class="permission-option">

                                            <input
                                                type="checkbox"
                                                value="${escaparHtmlPermissao(
                                                    permissao.codigo
                                                )}"
                                                ${
                                                    selecionadasSet.has(
                                                        permissao.codigo
                                                    )
                                                        ? "checked"
                                                        : ""
                                                }
                                                ${
                                                    bloqueado
                                                        ? "disabled"
                                                        : ""
                                                }
                                            >


                                            <span>

                                                <strong>
                                                    ${escaparHtmlPermissao(
                                                        permissao.nome
                                                    )}
                                                </strong>

                                                <small>
                                                    ${escaparHtmlPermissao(
                                                        permissao.descricao ||
                                                        ""
                                                    )}
                                                </small>

                                            </span>

                                        </label>
                                    `
                                )
                                .join("")}

                        </div>

                    </div>
                `
            )
            .join("");
}


// =========================================================
// MARCADAS
// =========================================================

function obterPermissoesMarcadas(
    container
) {

    if (
        !container
    ) {

        return [];
    }


    return Array
        .from(
            container.querySelectorAll(
                'input[type="checkbox"]:checked'
            )
        )
        .map(
            campo =>
                campo.value
        );
}


function alterarTodasPermissoes(
    container,
    marcado
) {

    if (
        !container
    ) {

        return;
    }


    container
        .querySelectorAll(
            'input[type="checkbox"]:not(:disabled)'
        )
        .forEach(
            campo => {

                campo.checked =
                    marcado;
            }
        );
}


// =========================================================
// PADRÃO DO PERFIL
// =========================================================

function permissoesPadraoPerfil(
    perfil
) {

    if (
        perfil ===
        "institucional"
    ) {

        return [
            "VISUALIZAR_DADOS_INSTITUCIONAIS"
        ];
    }


    return [];
}


// =========================================================
// BOTÃO NOVO ACESSO
// =========================================================

function criarBotaoNovoAcesso() {

    if (
        document.getElementById(
            "btn-novo-acesso"
        )
    ) {

        return;
    }


    const cabecalho =
        document.querySelector(
            "#usuarios .admin-section-header"
        );


    if (
        !cabecalho
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
        "btn-novo-acesso";


    botao.className =
        "admin-primary-button";


    botao.textContent =
        "+ Novo acesso";


    cabecalho.appendChild(
        botao
    );


    botao.addEventListener(
        "click",
        abrirNovoAcesso
    );
}


// =========================================================
// MODAL NOVO ACESSO
// =========================================================

function criarModalNovoAcesso() {

    if (
        document.getElementById(
            "modal-novo-acesso"
        )
    ) {

        return;
    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "modal-novo-acesso";


    modal.className =
        "admin-modal hidden";


    modal.innerHTML = `

        <div
            class="admin-modal-backdrop"
            id="novo-acesso-backdrop"
        ></div>


        <div class="admin-modal-card permissions-modal-card">

            <div class="admin-panel-header">

                <div>

                    <span class="section-eyebrow">
                        Controle de acesso
                    </span>

                    <h2>
                        Novo acesso
                    </h2>

                    <p>
                        Crie uma conta e defina suas permissões.
                    </p>

                </div>


                <button
                    type="button"
                    id="btn-fechar-novo-acesso"
                    class="admin-close-button"
                >
                    ×
                </button>

            </div>


            <form id="form-novo-acesso">


                <div class="admin-form-grid">


                    <div class="admin-form-group">

                        <label for="novo-acesso-nome">
                            Nome
                        </label>

                        <input
                            type="text"
                            id="novo-acesso-nome"
                            maxlength="150"
                            required
                        >

                    </div>


                    <div class="admin-form-group">

                        <label for="novo-acesso-email">
                            E-mail
                        </label>

                        <input
                            type="email"
                            id="novo-acesso-email"
                            maxlength="150"
                            required
                        >

                    </div>


                    <div class="admin-form-group">

                        <label for="novo-acesso-senha">
                            Senha inicial
                        </label>

                        <input
                            type="password"
                            id="novo-acesso-senha"
                            minlength="6"
                            maxlength="72"
                            required
                        >

                    </div>


                    <div class="admin-form-group">

                        <label for="novo-acesso-perfil">
                            Perfil
                        </label>

                        <select
                            id="novo-acesso-perfil"
                            required
                        >

                            <option value="">
                                Selecione
                            </option>

                            <option value="publico">
                                Público
                            </option>

                            <option value="aluno">
                                Aluno
                            </option>

                            <option value="institucional">
                                Institucional
                            </option>

                        </select>

                    </div>


                    <div
                        id="grupo-novo-acesso-universidade"
                        class="admin-form-group hidden"
                    >

                        <label for="novo-acesso-universidade">
                            Instituição
                        </label>

                        <select
                            id="novo-acesso-universidade"
                        >

                            <option value="">
                                Selecione
                            </option>

                        </select>

                    </div>


                    <div class="admin-form-group">

                        <label for="novo-acesso-status">
                            Status
                        </label>

                        <select id="novo-acesso-status">

                            <option value="true">
                                Ativo
                            </option>

                            <option value="false">
                                Desativado
                            </option>

                        </select>

                    </div>

                </div>


                <section class="permission-editor">

                    <div class="permission-editor-header">

                        <div>

                            <span class="section-eyebrow">
                                Permissões
                            </span>

                            <h3>
                                Permissões individuais
                            </h3>

                            <p>
                                Defina o que esta conta poderá fazer.
                            </p>

                        </div>


                        <div class="permission-bulk-actions">

                            <button
                                type="button"
                                id="btn-marcar-todas-novo"
                            >
                                Marcar todas
                            </button>

                            <button
                                type="button"
                                id="btn-limpar-permissoes-novo"
                            >
                                Limpar
                            </button>

                        </div>

                    </div>


                    <div
                        id="permissoes-novo-acesso"
                        class="permission-list"
                    ></div>

                </section>


                <div
                    id="mensagem-novo-acesso"
                    class="admin-message"
                ></div>


                <div class="admin-form-actions">

                    <button
                        type="button"
                        id="btn-cancelar-novo-acesso"
                        class="admin-secondary-button"
                    >
                        Cancelar
                    </button>


                    <button
                        type="submit"
                        id="btn-salvar-novo-acesso"
                        class="admin-primary-button"
                    >
                        Criar acesso
                    </button>

                </div>

            </form>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    renderizarPermissoes(
        document.getElementById(
            "permissoes-novo-acesso"
        )
    );


    document
        .getElementById(
            "btn-fechar-novo-acesso"
        )
        .addEventListener(
            "click",
            fecharNovoAcesso
        );


    document
        .getElementById(
            "btn-cancelar-novo-acesso"
        )
        .addEventListener(
            "click",
            fecharNovoAcesso
        );


    document
        .getElementById(
            "novo-acesso-backdrop"
        )
        .addEventListener(
            "click",
            fecharNovoAcesso
        );


    document
        .getElementById(
            "novo-acesso-perfil"
        )
        .addEventListener(
            "change",
            () => {

                atualizarInstituicaoNovoAcesso();

                aplicarPermissoesPadraoNovoAcesso();
            }
        );


    document
        .getElementById(
            "btn-marcar-todas-novo"
        )
        .addEventListener(
            "click",
            () => {

                alterarTodasPermissoes(
                    document.getElementById(
                        "permissoes-novo-acesso"
                    ),
                    true
                );
            }
        );


    document
        .getElementById(
            "btn-limpar-permissoes-novo"
        )
        .addEventListener(
            "click",
            () => {

                alterarTodasPermissoes(
                    document.getElementById(
                        "permissoes-novo-acesso"
                    ),
                    false
                );
            }
        );


    document
        .getElementById(
            "form-novo-acesso"
        )
        .addEventListener(
            "submit",
            salvarNovoAcesso
        );
}


// =========================================================
// ABRIR
// =========================================================

async function abrirNovoAcesso() {

    document
        .getElementById(
            "form-novo-acesso"
        )
        .reset();


    document
        .getElementById(
            "mensagem-novo-acesso"
        )
        .textContent =
        "";


    if (
        universidadesNovoAcesso.length ===
        0
    ) {

        await carregarInstituicoesNovoAcesso();
    }


    atualizarInstituicaoNovoAcesso();


    renderizarPermissoes(
        document.getElementById(
            "permissoes-novo-acesso"
        )
    );


    document
        .getElementById(
            "modal-novo-acesso"
        )
        .classList
        .remove(
            "hidden"
        );
}


function fecharNovoAcesso() {

    document
        .getElementById(
            "modal-novo-acesso"
        )
        ?.classList
        .add(
            "hidden"
        );
}


// =========================================================
// IES
// =========================================================

async function carregarInstituicoesNovoAcesso() {

    const resposta =
        await fetch(
            "/api/admin/universidades"
        );


    if (
        !resposta.ok
    ) {

        throw new Error(
            "Não foi possível carregar as instituições"
        );
    }


    universidadesNovoAcesso =
        await resposta.json();


    const campo =
        document.getElementById(
            "novo-acesso-universidade"
        );


    campo.innerHTML = `

        <option value="">
            Selecione
        </option>
    `;


    universidadesNovoAcesso
        .filter(
            instituicao =>
                instituicao.ativo
        )
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
        .forEach(
            instituicao => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    instituicao.id;


                option.textContent =
                    instituicao.sigla
                        ? `${instituicao.sigla} — ${instituicao.nome}`
                        : instituicao.nome;


                campo.appendChild(
                    option
                );
            }
        );
}


function atualizarInstituicaoNovoAcesso() {

    const perfil =
        document
            .getElementById(
                "novo-acesso-perfil"
            )
            ?.value;


    const grupo =
        document.getElementById(
            "grupo-novo-acesso-universidade"
        );


    const campo =
        document.getElementById(
            "novo-acesso-universidade"
        );


    const exige =
        perfil ===
            "aluno" ||
        perfil ===
            "institucional";


    grupo.classList.toggle(
        "hidden",
        !exige
    );


    campo.required =
        exige;


    if (
        !exige
    ) {

        campo.value =
            "";
    }
}


// =========================================================
// PADRÃO
// =========================================================

function aplicarPermissoesPadraoNovoAcesso() {

    const perfil =
        document
            .getElementById(
                "novo-acesso-perfil"
            )
            .value;


    const selecionadas =
        new Set(
            permissoesPadraoPerfil(
                perfil
            )
        );


    document
        .getElementById(
            "permissoes-novo-acesso"
        )
        .querySelectorAll(
            'input[type="checkbox"]'
        )
        .forEach(
            campo => {

                campo.checked =
                    selecionadas.has(
                        campo.value
                    );
            }
        );
}


// =========================================================
// SALVAR PERMISSÕES
// =========================================================

async function salvarPermissoesUsuario(
    usuarioId,
    permissoes
) {

    const resposta =
        await fetch(
            `/api/admin-permissoes/usuarios/${usuarioId}`,
            {
                method:
                    "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        permissoes
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

        throw new Error(
            dados.erro ||
            "Não foi possível salvar as permissões"
        );
    }


    return dados;
}


// =========================================================
// CRIAR ACESSO
// =========================================================

async function salvarNovoAcesso(
    event
) {

    event.preventDefault();


    const mensagem =
        document.getElementById(
            "mensagem-novo-acesso"
        );


    mensagem.textContent =
        "";

    mensagem.className =
        "admin-message";


    const perfilInterface =
        document
            .getElementById(
                "novo-acesso-perfil"
            )
            .value;


    // Compatibilidade interna temporária.
    const perfilBackend =
        perfilInterface ===
        "institucional"
            ? "gestor"
            : perfilInterface;


    const universidade =
        document
            .getElementById(
                "novo-acesso-universidade"
            )
            .value;


    const permissoes =
        obterPermissoesMarcadas(
            document.getElementById(
                "permissoes-novo-acesso"
            )
        );


    const payload = {

        nome:
            document
                .getElementById(
                    "novo-acesso-nome"
                )
                .value
                .trim(),

        email:
            document
                .getElementById(
                    "novo-acesso-email"
                )
                .value
                .trim(),

        senha:
            document
                .getElementById(
                    "novo-acesso-senha"
                )
                .value,

        perfil:
            perfilBackend,

        universidade_id:
            universidade
                ? Number(
                    universidade
                )
                : null,

        ativo:
            document
                .getElementById(
                    "novo-acesso-status"
                )
                .value ===
            "true"
    };


    const botao =
        document.getElementById(
            "btn-salvar-novo-acesso"
        );


    botao.disabled =
        true;


    const textoOriginal =
        botao.textContent;


    botao.textContent =
        "Criando...";


    try {

        const resposta =
            await fetch(
                "/api/admin-acessos",
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


        if (
            !resposta.ok
        ) {

            throw new Error(
                dados.erro ||
                "Não foi possível criar o acesso"
            );
        }


        await salvarPermissoesUsuario(
            dados.usuario.id,
            permissoes
        );


        mensagem.textContent =
            "Acesso criado com sucesso.";


        mensagem.classList.add(
            "success"
        );


        if (
            typeof carregarUsuarios ===
            "function"
        ) {

            await carregarUsuarios();
        }


        if (
            typeof carregarResumo ===
            "function"
        ) {

            await carregarResumo();
        }


        setTimeout(
            fecharNovoAcesso,
            700
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
            textoOriginal;
    }
}


// =========================================================
// PERMISSÕES DO MODAL DE EDIÇÃO
// =========================================================

function criarSecaoPermissoesEdicao() {

    if (
        document.getElementById(
            "admin-permissoes-edicao"
        )
    ) {

        return;
    }


    const formulario =
        document.getElementById(
            "form-editar-usuario"
        );


    const mensagemConta =
        document.getElementById(
            "mensagem-editar-usuario"
        );


    if (
        !formulario ||
        !mensagemConta
    ) {

        return;
    }


    const secao =
        document.createElement(
            "section"
        );


    secao.id =
        "admin-permissoes-edicao";


    secao.className =
        "permission-editor permission-editor-edit";


    secao.innerHTML = `

        <div class="permission-editor-header">

            <div>

                <span class="section-eyebrow">
                    Permissões
                </span>

                <h3>
                    Permissões individuais
                </h3>

                <p>
                    Escolha exatamente quais recursos
                    esta conta poderá utilizar.
                </p>

            </div>


            <div
                id="acoes-permissoes-edicao"
                class="permission-bulk-actions"
            >

                <button
                    type="button"
                    id="btn-marcar-todas-edicao"
                >
                    Marcar todas
                </button>

                <button
                    type="button"
                    id="btn-limpar-permissoes-edicao"
                >
                    Limpar
                </button>

            </div>

        </div>


        <div
            id="permissoes-edicao-usuario"
            class="permission-list"
        ></div>


        <div
            id="aviso-permissoes-edicao"
            class="permission-note hidden"
        ></div>


        <div
            id="mensagem-permissoes-edicao"
            class="admin-message"
        ></div>


        <div
            id="acoes-salvar-permissoes-edicao"
            class="permission-save-area"
        >

            <button
                type="button"
                id="btn-salvar-permissoes-edicao"
                class="admin-primary-button"
            >
                Salvar permissões
            </button>

        </div>
    `;


    formulario.insertBefore(
        secao,
        mensagemConta
    );


    document
        .getElementById(
            "btn-marcar-todas-edicao"
        )
        .addEventListener(
            "click",
            () => {

                alterarTodasPermissoes(
                    document.getElementById(
                        "permissoes-edicao-usuario"
                    ),
                    true
                );
            }
        );


    document
        .getElementById(
            "btn-limpar-permissoes-edicao"
        )
        .addEventListener(
            "click",
            () => {

                alterarTodasPermissoes(
                    document.getElementById(
                        "permissoes-edicao-usuario"
                    ),
                    false
                );
            }
        );


    document
        .getElementById(
            "btn-salvar-permissoes-edicao"
        )
        .addEventListener(
            "click",
            salvarPermissoesEdicao
        );
}


// =========================================================
// INTERCEPTAR ABERTURA DO MODAL
// =========================================================

function integrarModalEdicaoUsuario() {

    if (
        typeof abrirModalUsuario !==
        "function"
    ) {

        return;
    }


    if (
        funcaoAbrirModalUsuarioOriginal
    ) {

        return;
    }


    funcaoAbrirModalUsuarioOriginal =
        abrirModalUsuario;


    abrirModalUsuario =
        function (
            usuarioId
        ) {

            funcaoAbrirModalUsuarioOriginal(
                usuarioId
            );


            carregarPermissoesEdicao(
                usuarioId
            );
        };
}


// =========================================================
// CARREGAR PERMISSÕES
// =========================================================

async function carregarPermissoesEdicao(
    usuarioId
) {

    const container =
        document.getElementById(
            "permissoes-edicao-usuario"
        );


    const mensagem =
        document.getElementById(
            "mensagem-permissoes-edicao"
        );


    const aviso =
        document.getElementById(
            "aviso-permissoes-edicao"
        );


    const acoes =
        document.getElementById(
            "acoes-permissoes-edicao"
        );


    const salvar =
        document.getElementById(
            "acoes-salvar-permissoes-edicao"
        );


    mensagem.textContent =
        "";

    mensagem.className =
        "admin-message";


    try {

        const resposta =
            await fetch(
                `/api/admin-permissoes/usuarios/${usuarioId}`
            );


        const dados =
            await resposta.json();


        if (
            !resposta.ok
        ) {

            throw new Error(
                dados.erro ||
                "Erro ao carregar permissões"
            );
        }


        usuarioPermissoesEdicao =
            dados.usuario;


        const automaticas =
            dados.permissoes_automaticas ===
            true;


        renderizarPermissoes(
            container,
            dados.permissoes ||
            [],
            automaticas
        );


        aviso.classList.remove(
            "hidden"
        );


        if (
            automaticas
        ) {

            aviso.innerHTML = `

                <strong>
                    Super Administrador
                </strong>

                <span>
                    Este perfil possui todas as permissões automaticamente.
                </span>
            `;


            acoes.classList.add(
                "hidden"
            );


            salvar.classList.add(
                "hidden"
            );


        } else {

            aviso.innerHTML = `

                <strong>
                    Permissões individuais
                </strong>

                <span>
                    O perfil identifica o usuário.
                    As permissões determinam o que ele pode fazer.
                </span>
            `;


            acoes.classList.remove(
                "hidden"
            );


            salvar.classList.remove(
                "hidden"
            );
        }


    } catch (erro) {

        mensagem.textContent =
            erro.message;


        mensagem.classList.add(
            "error"
        );
    }
}


// =========================================================
// SALVAR EDIÇÃO
// =========================================================

async function salvarPermissoesEdicao() {

    if (
        !usuarioPermissoesEdicao ||
        usuarioPermissoesEdicao
            .perfil ===
        "super_admin"
    ) {

        return;
    }


    const permissoes =
        obterPermissoesMarcadas(
            document.getElementById(
                "permissoes-edicao-usuario"
            )
        );


    const mensagem =
        document.getElementById(
            "mensagem-permissoes-edicao"
        );


    const botao =
        document.getElementById(
            "btn-salvar-permissoes-edicao"
        );


    const textoOriginal =
        botao.textContent;


    botao.disabled =
        true;


    botao.textContent =
        "Salvando...";


    try {

        await salvarPermissoesUsuario(
            usuarioPermissoesEdicao.id,
            permissoes
        );


        mensagem.textContent =
            "Permissões atualizadas com sucesso.";


        mensagem.className =
            "admin-message success";


    } catch (erro) {

        mensagem.textContent =
            erro.message;


        mensagem.className =
            "admin-message error";


    } finally {

        botao.disabled =
            false;


        botao.textContent =
            textoOriginal;
    }
}


// =========================================================
// ESTILOS
// =========================================================

function criarEstilosPermissoes() {

    if (
        document.getElementById(
            "admin-permissoes-estilos"
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "admin-permissoes-estilos";


    style.textContent = `

        .permissions-modal-card {
            width: min(880px, calc(100vw - 30px));
            max-height: calc(100vh - 30px);
            overflow-y: auto;
        }

        .permission-editor {
            margin-top: 20px;
            padding: 18px;
            border: 1px solid #e7dfea;
            border-radius: 13px;
            background: #faf8fc;
        }

        .permission-editor-edit {
            margin-bottom: 20px;
        }

        .permission-editor-header {
            display: flex;
            justify-content: space-between;
            gap: 15px;
            margin-bottom: 16px;
        }

        .permission-editor-header h3 {
            margin: 4px 0;
            font-size: 16px;
        }

        .permission-editor-header p {
            color: #7c7284;
            font-size: 10px;
        }

        .permission-bulk-actions {
            display: flex;
            gap: 7px;
        }

        .permission-bulk-actions button {
            padding: 7px 10px;
            border: 1px solid #ddd6fe;
            border-radius: 7px;
            color: #5b21b6;
            background: white;
            font-size: 9px;
            font-weight: 700;
        }

        .permission-list {
            display: grid;
            gap: 13px;
        }

        .permission-category {
            overflow: hidden;
            border: 1px solid #ece5f0;
            border-radius: 10px;
            background: white;
        }

        .permission-category-title {
            padding: 9px 11px;
            border-bottom: 1px solid #eee8f1;
            color: #5b21b6;
            background: #faf5ff;
            font-size: 10px;
            font-weight: 800;
        }

        .permission-options {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1px;
            background: #f0ebf3;
        }

        .permission-option {
            min-height: 72px;
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 12px;
            background: white;
        }

        .permission-option input {
            width: 17px;
            height: 17px;
            margin-top: 2px;
            accent-color: #6d28d9;
        }

        .permission-option strong {
            display: block;
            margin-bottom: 4px;
            font-size: 10px;
        }

        .permission-option small {
            display: block;
            color: #81768a;
            font-size: 9px;
            line-height: 1.45;
        }

        .permission-note {
            display: flex;
            flex-direction: column;
            gap: 3px;
            margin-top: 14px;
            padding: 10px 12px;
            border: 1px solid #e9d5ff;
            border-radius: 8px;
            color: #6b21a8;
            background: #faf5ff;
            font-size: 9px;
        }

        .permission-save-area {
            display: flex;
            justify-content: flex-end;
            margin-top: 14px;
        }

        @media (max-width: 700px) {

            .permission-editor-header {
                flex-direction: column;
            }

            .permission-options {
                grid-template-columns: 1fr;
            }
        }
    `;


    document.head.appendChild(
        style
    );
}


iniciarNovoAcessoAdmin();