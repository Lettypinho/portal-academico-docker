// =========================================================
// SIA - CRIAÇÃO DE ACESSOS PELO SUPER ADMIN
// =========================================================


let universidadesNovoAcesso =
    [];


// =========================================================
// INICIALIZAÇÃO
// =========================================================

async function iniciarNovoAcessoAdmin() {

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
            "super_admin"
        ) {

            return;
        }


        criarBotaoNovoAcesso();

        criarModalNovoAcesso();


    } catch (erro) {

        console.error(
            "Erro ao iniciar criação de acessos:",
            erro
        );
    }
}


// =========================================================
// BOTÃO
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


    if (!cabecalho) {

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
// MODAL
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


        <div class="admin-modal-card">

            <div class="admin-panel-header">

                <div>

                    <span class="admin-panel-label">
                        Controle de acesso
                    </span>

                    <h2>
                        Novo acesso
                    </h2>

                    <p>
                        Crie uma conta e defina diretamente
                        seu nível de acesso.
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
                                Usuário público
                            </option>

                            <option value="aluno">
                                Aluno
                            </option>

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
            atualizarInstituicaoNovoAcesso
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

    const modal =
        document.getElementById(
            "modal-novo-acesso"
        );


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


    atualizarInstituicaoNovoAcesso();


    if (
        universidadesNovoAcesso.length ===
        0
    ) {

        await carregarInstituicoesNovoAcesso();
    }


    modal.classList.remove(
        "hidden"
    );
}


// =========================================================
// FECHAR
// =========================================================

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
// CARREGAR IES
// =========================================================

async function carregarInstituicoesNovoAcesso() {

    const resposta =
        await fetch(
            "/api/admin/universidades"
        );


    if (!resposta.ok) {

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


// =========================================================
// MOSTRAR IES QUANDO NECESSÁRIO
// =========================================================

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


    if (
        !grupo ||
        !campo
    ) {

        return;
    }


    const exigeInstituicao = [

        "aluno",

        "consulta_institucional",

        "gestor",

        "admin_universidade"

    ].includes(
        perfil
    );


    grupo.classList.toggle(
        "hidden",
        !exigeInstituicao
    );


    campo.required =
        exigeInstituicao;


    if (!exigeInstituicao) {

        campo.value =
            "";
    }
}


// =========================================================
// SALVAR
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


    const perfil =
        document
            .getElementById(
                "novo-acesso-perfil"
            )
            .value;


    const universidade =
        document
            .getElementById(
                "novo-acesso-universidade"
            )
            .value;


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

        perfil,

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


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Não foi possível criar o acesso"
            );
        }


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


iniciarNovoAcessoAdmin();