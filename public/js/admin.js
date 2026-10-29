let adminAtual = null;

let universidadesAdmin = [];

let usuariosAdmin = [];


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


function nomePerfil(perfil) {

    const nomes = {

        publico:
            "Público",

        aluno:
            "Aluno",

        consulta_institucional:
            "Consulta institucional",

        gestor:
            "Gestor",

        admin_universidade:
            "Administrador da instituição",

        super_admin:
            "Super administrador"
    };


    return (
        nomes[perfil] ||
        perfil ||
        "-"
    );
}


function perfilComInstituicao(perfil) {

    return [
        "aluno",
        "consulta_institucional",
        "gestor",
        "admin_universidade"
    ].includes(perfil);
}


function formatarData(valor) {

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


    return data
        .toLocaleDateString(
            "pt-BR"
        );
}


// =========================================================
// SESSÃO
// =========================================================

async function carregarAdmin() {

    const resposta =
        await fetch(
            "/api/auth/me"
        );


    if (!resposta.ok) {

        window.location.href =
            "/login.html";

        return false;
    }


    adminAtual =
        await resposta.json();


    if (
        adminAtual.perfil !==
        "super_admin"
    ) {

        if (
            [
                "publico",
                "aluno"
            ].includes(
                adminAtual.perfil
            )
        ) {

            window.location.href =
                "/explorar.html";

        } else {

            window.location.href =
                "/dashboard.html";
        }


        return false;
    }


    atualizarNomeAdmin();


    return true;
}


function atualizarNomeAdmin() {

    const nome =
        document.getElementById(
            "admin-nome"
        );


    if (
        nome &&
        adminAtual
    ) {

        nome.textContent =
            adminAtual.nome;
    }
}


// =========================================================
// LOGOUT
// =========================================================

async function logoutAdmin() {

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
// RESUMO
// =========================================================

async function carregarResumo() {

    const resposta =
        await fetch(
            "/api/admin/resumo"
        );


    if (!resposta.ok) {

        throw new Error(
            "Erro ao carregar resumo administrativo"
        );
    }


    const dados =
        await resposta.json();


    const resumo =
        dados.resumo;


    document
        .getElementById(
            "stat-universidades"
        )
        .textContent =
        resumo.total_universidades;


    document
        .getElementById(
            "stat-universidades-ativas"
        )
        .textContent =
        `${resumo.universidades_ativas} ativas`;


    document
        .getElementById(
            "stat-usuarios"
        )
        .textContent =
        resumo.total_usuarios;


    document
        .getElementById(
            "stat-institucionais"
        )
        .textContent =
        resumo.usuarios_institucionais;


    document
        .getElementById(
            "stat-cursos"
        )
        .textContent =
        resumo.total_cursos;


    document
        .getElementById(
            "stat-alunos"
        )
        .textContent =
        resumo.total_alunos;


    renderizarUniversidadesRecentes(
        dados.universidades_recentes ||
        []
    );


    renderizarUsuariosRecentes(
        dados.usuarios_recentes ||
        []
    );
}


// =========================================================
// RECENTES
// =========================================================

function renderizarUniversidadesRecentes(
    universidades
) {

    const container =
        document.getElementById(
            "universidades-recentes"
        );


    if (!universidades.length) {

        container.innerHTML = `

            <div class="admin-empty">
                Nenhuma instituição cadastrada.
            </div>
        `;

        return;
    }


    container.innerHTML =
        universidades
            .map(
                universidade => `

                    <div class="admin-simple-item">

                        <div class="admin-simple-avatar">

                            ${escaparHtml(
                                universidade.sigla ||
                                "IES"
                            )}

                        </div>


                        <div class="admin-simple-info">

                            <strong>

                                ${escaparHtml(
                                    universidade.nome
                                )}

                            </strong>

                            <span>

                                ${escaparHtml(
                                    universidade.organizacao_academica ||
                                    "Instituição"
                                )}

                                •

                                ${escaparHtml(
                                    universidade.estado
                                )}

                            </span>

                        </div>


                        <span
                            class="
                                admin-status-badge
                                ${
                                    universidade.ativo
                                        ? "active"
                                        : "inactive"
                                }
                            "
                        >

                            ${
                                universidade.ativo
                                    ? "Ativa"
                                    : "Inativa"
                            }

                        </span>

                    </div>
                `
            )
            .join("");
}


function renderizarUsuariosRecentes(
    usuarios
) {

    const container =
        document.getElementById(
            "usuarios-recentes"
        );


    if (!usuarios.length) {

        container.innerHTML = `

            <div class="admin-empty">
                Nenhum usuário cadastrado.
            </div>
        `;

        return;
    }


    container.innerHTML =
        usuarios
            .map(
                usuario => `

                    <div class="admin-simple-item">

                        <div class="admin-simple-avatar user">

                            ${escaparHtml(
                                String(
                                    usuario.nome ||
                                    "U"
                                )
                                    .charAt(0)
                                    .toUpperCase()
                            )}

                        </div>


                        <div class="admin-simple-info">

                            <strong>

                                ${escaparHtml(
                                    usuario.nome
                                )}

                            </strong>

                            <span>

                                ${escaparHtml(
                                    nomePerfil(
                                        usuario.perfil
                                    )
                                )}

                            </span>

                        </div>


                        <small>

                            ${formatarData(
                                usuario.criado_em
                            )}

                        </small>

                    </div>
                `
            )
            .join("");
}


// =========================================================
// INSTITUIÇÕES
// =========================================================

async function carregarUniversidades() {

    const resposta =
        await fetch(
            "/api/admin/universidades"
        );


    if (!resposta.ok) {

        throw new Error(
            "Erro ao carregar instituições"
        );
    }


    universidadesAdmin =
        await resposta.json();


    renderizarUniversidades(
        universidadesAdmin
    );


    preencherSelectUniversidades();
}


function renderizarUniversidades(
    universidades
) {

    const tbody =
        document.getElementById(
            "tabela-universidades"
        );


    if (!universidades.length) {

        tbody.innerHTML = `

            <tr>

                <td colspan="8">
                    Nenhuma instituição encontrada.
                </td>

            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        universidades
            .map(
                universidade => `

                    <tr>

                        <td>

                            <div class="admin-table-main">

                                <strong>

                                    ${escaparHtml(
                                        universidade.nome
                                    )}

                                </strong>

                                <span>

                                    ${escaparHtml(
                                        universidade.sigla ||
                                        "Sem sigla"
                                    )}

                                    • Código

                                    ${escaparHtml(
                                        universidade.codigo
                                    )}

                                </span>

                            </div>

                        </td>


                        <td>

                            ${escaparHtml(
                                universidade.organizacao_academica ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${escaparHtml(
                                universidade.categoria_administrativa ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${escaparHtml(
                                universidade.cidade
                            )}

                            /

                            ${escaparHtml(
                                universidade.estado
                            )}

                        </td>


                        <td>

                            ${escaparHtml(
                                universidade.total_cursos
                            )}

                        </td>


                        <td>

                            ${escaparHtml(
                                universidade.total_usuarios
                            )}

                        </td>


                        <td>

                            <span
                                class="
                                    admin-status-badge
                                    ${
                                        universidade.ativo
                                            ? "active"
                                            : "inactive"
                                    }
                                "
                            >

                                ${
                                    universidade.ativo
                                        ? "Ativa"
                                        : "Inativa"
                                }

                            </span>

                        </td>


                        <td>

                            <button
                                type="button"
                                class="
                                    admin-table-button
                                    ${
                                        universidade.ativo
                                            ? "danger"
                                            : "success"
                                    }
                                "
                                data-universidade-status="${universidade.id}"
                                data-ativo="${universidade.ativo}"
                            >

                                ${
                                    universidade.ativo
                                        ? "Desativar"
                                        : "Ativar"
                                }

                            </button>

                        </td>

                    </tr>
                `
            )
            .join("");


    document
        .querySelectorAll(
            "[data-universidade-status]"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        alterarStatusUniversidade(
                            Number(
                                botao.dataset
                                    .universidadeStatus
                            ),
                            botao.dataset
                                .ativo ===
                            "true"
                        );
                    }
                );
            }
        );
}


async function alterarStatusUniversidade(
    id,
    ativoAtual
) {

    const novoStatus =
        !ativoAtual;


    const confirmar =
        window.confirm(
            novoStatus
                ? "Deseja ativar esta instituição?"
                : "Deseja desativar esta instituição?"
        );


    if (!confirmar) {

        return;
    }


    const resposta =
        await fetch(
            `/api/admin/universidades/${id}/status`,
            {
                method:
                    "PATCH",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        ativo:
                            novoStatus
                    })
            }
        );


    const dados =
        await resposta
            .json()
            .catch(
                () => ({})
            );


    if (!resposta.ok) {

        window.alert(
            dados.erro ||
            "Erro ao atualizar instituição"
        );

        return;
    }


    await Promise.all([
        carregarUniversidades(),
        carregarResumo()
    ]);
}


// =========================================================
// CADASTRAR INSTITUIÇÃO
// =========================================================

async function cadastrarUniversidade(
    evento
) {

    evento.preventDefault();


    const mensagem =
        document.getElementById(
            "mensagem-universidade"
        );


    mensagem.textContent =
        "";

    mensagem.className =
        "admin-message";


    const payload = {

        codigo:
            document
                .getElementById(
                    "universidade-codigo"
                )
                .value
                .trim(),

        nome:
            document
                .getElementById(
                    "universidade-nome"
                )
                .value
                .trim(),

        sigla:
            document
                .getElementById(
                    "universidade-sigla"
                )
                .value
                .trim(),

        organizacao_academica:
            document
                .getElementById(
                    "universidade-organizacao"
                )
                .value,

        categoria_administrativa:
            document
                .getElementById(
                    "universidade-categoria"
                )
                .value,

        cidade:
            document
                .getElementById(
                    "universidade-cidade"
                )
                .value
                .trim(),

        estado:
            document
                .getElementById(
                    "universidade-estado"
                )
                .value
                .trim()
                .toUpperCase()
    };


    const resposta =
        await fetch(
            "/api/universidades",
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
        await resposta
            .json()
            .catch(
                () => ({})
            );


    if (!resposta.ok) {

        mensagem.textContent =
            dados.erro ||
            "Erro ao cadastrar instituição";


        mensagem.classList.add(
            "error"
        );


        return;
    }


    mensagem.textContent =
        "Instituição cadastrada com sucesso.";


    mensagem.classList.add(
        "success"
    );


    document
        .getElementById(
            "form-universidade"
        )
        .reset();


    await Promise.all([
        carregarUniversidades(),
        carregarResumo()
    ]);


    window.setTimeout(
        fecharFormularioUniversidade,
        700
    );
}


function abrirFormularioUniversidade() {

    document
        .getElementById(
            "form-universidade-container"
        )
        .classList
        .remove(
            "hidden"
        );
}


function fecharFormularioUniversidade() {

    document
        .getElementById(
            "form-universidade-container"
        )
        .classList
        .add(
            "hidden"
        );


    document
        .getElementById(
            "mensagem-universidade"
        )
        .textContent =
        "";
}


function filtrarUniversidades() {

    const busca =
        document
            .getElementById(
                "busca-universidades"
            )
            .value
            .trim()
            .toLowerCase();


    const resultado =
        universidadesAdmin
            .filter(
                universidade => {

                    const texto = `
                        ${universidade.nome || ""}
                        ${universidade.sigla || ""}
                        ${universidade.codigo || ""}
                        ${universidade.cidade || ""}
                        ${universidade.estado || ""}
                        ${universidade.organizacao_academica || ""}
                        ${universidade.categoria_administrativa || ""}
                    `
                        .toLowerCase();


                    return texto.includes(
                        busca
                    );
                }
            );


    renderizarUniversidades(
        resultado
    );
}


// =========================================================
// USUÁRIOS
// =========================================================

async function carregarUsuarios() {

    const resposta =
        await fetch(
            "/api/admin/usuarios"
        );


    if (!resposta.ok) {

        throw new Error(
            "Erro ao carregar usuários"
        );
    }


    usuariosAdmin =
        await resposta.json();


    filtrarUsuarios();
}


function filtrarUsuarios() {

    const busca =
        document
            .getElementById(
                "busca-usuarios"
            )
            .value
            .trim()
            .toLowerCase();


    const perfil =
        document
            .getElementById(
                "filtro-perfil"
            )
            .value;


    const usuarios =
        usuariosAdmin
            .filter(
                usuario => {

                    const texto = `
                        ${usuario.nome || ""}
                        ${usuario.email || ""}
                        ${usuario.universidade || ""}
                    `
                        .toLowerCase();


                    return (
                        texto.includes(busca) &&
                        (
                            !perfil ||
                            usuario.perfil ===
                                perfil
                        )
                    );
                }
            );


    renderizarUsuarios(
        usuarios
    );
}


function renderizarUsuarios(
    usuarios
) {

    const tbody =
        document.getElementById(
            "tabela-usuarios"
        );


    if (!usuarios.length) {

        tbody.innerHTML = `

            <tr>

                <td colspan="6">
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

                    const proprio =
                        adminAtual &&
                        Number(
                            adminAtual.id
                        ) ===
                        Number(
                            usuario.id
                        );


                    return `

                        <tr>

                            <td>

                                <div class="admin-table-main">

                                    <strong>

                                        ${escaparHtml(
                                            usuario.nome
                                        )}

                                    </strong>

                                    <span>

                                        ${escaparHtml(
                                            usuario.email
                                        )}

                                        ${
                                            proprio
                                                ? " • Você"
                                                : ""
                                        }

                                    </span>

                                </div>

                            </td>


                            <td>

                                <span class="admin-profile-badge">

                                    ${escaparHtml(
                                        nomePerfil(
                                            usuario.perfil
                                        )
                                    )}

                                </span>

                            </td>


                            <td>

                                ${escaparHtml(
                                    usuario.universidade ||
                                    "-"
                                )}

                            </td>


                            <td>

                                <span
                                    class="
                                        admin-status-badge
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
                                            : "Desativado"
                                    }

                                </span>

                            </td>


                            <td>

                                ${formatarData(
                                    usuario.criado_em
                                )}

                            </td>


                            <td>

                                <button
                                    type="button"
                                    class="admin-table-button"
                                    data-editar-usuario="${usuario.id}"
                                >
                                    Editar
                                </button>

                            </td>

                        </tr>
                    `;
                }
            )
            .join("");


    document
        .querySelectorAll(
            "[data-editar-usuario]"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        abrirModalUsuario(
                            Number(
                                botao.dataset
                                    .editarUsuario
                            )
                        );
                    }
                );
            }
        );
}


// =========================================================
// SELECT DE INSTITUIÇÕES
// =========================================================

function preencherSelectUniversidades() {

    const select =
        document.getElementById(
            "modal-universidade"
        );


    select.innerHTML = `

        <option value="">
            Selecione
        </option>
    `;


    universidadesAdmin
        .filter(
            universidade =>
                universidade.ativo
        )
        .sort(
            (a, b) =>
                String(a.nome)
                    .localeCompare(
                        String(b.nome),
                        "pt-BR"
                    )
        )
        .forEach(
            universidade => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    universidade.id;


                option.textContent =
                    universidade.sigla
                        ? `${universidade.sigla} — ${universidade.nome}`
                        : universidade.nome;


                select.appendChild(
                    option
                );
            }
        );
}


// =========================================================
// MODAL DE USUÁRIO
// =========================================================

function abrirModalUsuario(id) {

    const usuario =
        usuariosAdmin
            .find(
                item =>
                    Number(item.id) ===
                    Number(id)
            );


    if (!usuario) {

        return;
    }


    const proprio =
        Number(
            usuario.id
        ) ===
        Number(
            adminAtual.id
        );


    document
        .getElementById(
            "modal-usuario-id"
        )
        .value =
        usuario.id;


    document
        .getElementById(
            "modal-nome"
        )
        .value =
        usuario.nome ||
        "";


    document
        .getElementById(
            "modal-email"
        )
        .value =
        usuario.email ||
        "";


    const campoPerfil =
        document.getElementById(
            "modal-perfil"
        );


    campoPerfil.value =
        usuario.perfil;


    campoPerfil.disabled =
        proprio;


    document
        .getElementById(
            "modal-perfil-aviso"
        )
        .textContent =
        proprio
            ? "Você não pode remover o próprio acesso de Super Administrador."
            : "";


    document
        .getElementById(
            "modal-ativo"
        )
        .value =
        String(
            usuario.ativo
        );


    document
        .getElementById(
            "modal-ativo"
        )
        .disabled =
        proprio;


    document
        .getElementById(
            "modal-universidade"
        )
        .value =
        usuario.universidade_id ||
        "";


    document
        .getElementById(
            "grupo-modal-senha-atual"
        )
        .classList
        .toggle(
            "hidden",
            !proprio
        );


    document
        .getElementById(
            "modal-senha-atual"
        )
        .value =
        "";


    document
        .getElementById(
            "modal-nova-senha"
        )
        .value =
        "";


    document
        .getElementById(
            "modal-confirmar-senha"
        )
        .value =
        "";


    atualizarCampoUniversidade();


    const mensagem =
        document.getElementById(
            "mensagem-editar-usuario"
        );


    mensagem.textContent =
        "";

    mensagem.className =
        "admin-message";


    document
        .getElementById(
            "modal-usuario"
        )
        .classList
        .remove(
            "hidden"
        );
}


function fecharModalUsuario() {

    document
        .getElementById(
            "modal-usuario"
        )
        .classList
        .add(
            "hidden"
        );
}


// =========================================================
// PERFIL / INSTITUIÇÃO
// =========================================================

function atualizarCampoUniversidade() {

    const perfil =
        document
            .getElementById(
                "modal-perfil"
            )
            .value;


    const grupo =
        document.getElementById(
            "grupo-modal-universidade"
        );


    const select =
        document.getElementById(
            "modal-universidade"
        );


    if (
        perfilComInstituicao(
            perfil
        )
    ) {

        grupo.classList.remove(
            "hidden"
        );


        select.required =
            true;

    } else {

        grupo.classList.add(
            "hidden"
        );


        select.required =
            false;


        select.value =
            "";
    }
}


// =========================================================
// SALVAR USUÁRIO
// =========================================================

async function salvarUsuario(
    evento
) {

    evento.preventDefault();


    const id =
        Number(
            document
                .getElementById(
                    "modal-usuario-id"
                )
                .value
        );


    const usuario =
        usuariosAdmin
            .find(
                item =>
                    Number(item.id) ===
                    id
            );


    if (!usuario) {

        return;
    }


    const proprio =
        Number(
            adminAtual.id
        ) ===
        id;


    const perfil =
        document
            .getElementById(
                "modal-perfil"
            )
            .value;


    const universidadeId =
        document
            .getElementById(
                "modal-universidade"
            )
            .value;


    const ativo =
        document
            .getElementById(
                "modal-ativo"
            )
            .value ===
        "true";


    const novaSenha =
        document
            .getElementById(
                "modal-nova-senha"
            )
            .value;


    const confirmarNovaSenha =
        document
            .getElementById(
                "modal-confirmar-senha"
            )
            .value;


    const mensagem =
        document.getElementById(
            "mensagem-editar-usuario"
        );


    mensagem.textContent =
        "";

    mensagem.className =
        "admin-message";


    if (
        novaSenha !==
        confirmarNovaSenha
    ) {

        mensagem.textContent =
            "A confirmação da nova senha não confere.";


        mensagem.classList.add(
            "error"
        );


        return;
    }


    if (
        perfilComInstituicao(
            perfil
        ) &&
        !universidadeId
    ) {

        mensagem.textContent =
            "Selecione uma instituição para este perfil.";


        mensagem.classList.add(
            "error"
        );


        return;
    }


    const payload = {

        nome:
            document
                .getElementById(
                    "modal-nome"
                )
                .value
                .trim(),

        email:
            document
                .getElementById(
                    "modal-email"
                )
                .value
                .trim(),

        perfil,

        universidade_id:
            universidadeId
                ? Number(
                    universidadeId
                )
                : null,

        ativo,

        senha_atual:
            proprio
                ? document
                    .getElementById(
                        "modal-senha-atual"
                    )
                    .value
                : "",

        nova_senha:
            novaSenha,

        confirmar_nova_senha:
            confirmarNovaSenha
    };


    const botao =
        document.getElementById(
            "btn-salvar-usuario"
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
                `/api/admin/usuarios/${id}`,
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


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao alterar usuário."
            );
        }


        mensagem.textContent =
            dados.mensagem ||
            "Usuário atualizado com sucesso.";


        mensagem.classList.add(
            "success"
        );


        if (
            proprio
        ) {

            adminAtual.nome =
                dados.usuario.nome;


            adminAtual.email =
                dados.usuario.email;


            atualizarNomeAdmin();
        }


        await Promise.all([
            carregarUsuarios(),
            carregarResumo()
        ]);


        window.setTimeout(
            fecharModalUsuario,
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
// MENU
// =========================================================

function abrirSecao(nome) {

    document
        .querySelectorAll(
            ".admin-menu-item"
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
            ".admin-section"
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


function configurarMenu() {

    document
        .querySelectorAll(
            ".admin-menu-item"
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
        .querySelectorAll(
            "[data-go-section]"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        abrirSecao(
                            botao.dataset
                                .goSection
                        );
                    }
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
            "btn-admin-logout"
        )
        .addEventListener(
            "click",
            logoutAdmin
        );


    document
        .getElementById(
            "btn-admin-configuracoes"
        )
        .addEventListener(
            "click",
            () => {

                abrirModalUsuario(
                    adminAtual.id
                );
            }
        );


    document
        .getElementById(
            "btn-nova-universidade"
        )
        .addEventListener(
            "click",
            abrirFormularioUniversidade
        );


    document
        .getElementById(
            "btn-fechar-universidade"
        )
        .addEventListener(
            "click",
            fecharFormularioUniversidade
        );


    document
        .getElementById(
            "btn-cancelar-universidade"
        )
        .addEventListener(
            "click",
            fecharFormularioUniversidade
        );


    document
        .getElementById(
            "form-universidade"
        )
        .addEventListener(
            "submit",
            cadastrarUniversidade
        );


    document
        .getElementById(
            "busca-universidades"
        )
        .addEventListener(
            "input",
            filtrarUniversidades
        );


    document
        .getElementById(
            "busca-usuarios"
        )
        .addEventListener(
            "input",
            filtrarUsuarios
        );


    document
        .getElementById(
            "filtro-perfil"
        )
        .addEventListener(
            "change",
            filtrarUsuarios
        );


    document
        .getElementById(
            "modal-perfil"
        )
        .addEventListener(
            "change",
            atualizarCampoUniversidade
        );


    document
        .getElementById(
            "form-editar-usuario"
        )
        .addEventListener(
            "submit",
            salvarUsuario
        );


    document
        .getElementById(
            "btn-fechar-modal"
        )
        .addEventListener(
            "click",
            fecharModalUsuario
        );


    document
        .getElementById(
            "btn-cancelar-modal"
        )
        .addEventListener(
            "click",
            fecharModalUsuario
        );


    document
        .querySelector(
            "#modal-usuario .admin-modal-backdrop"
        )
        .addEventListener(
            "click",
            fecharModalUsuario
        );


    document.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key ===
                "Escape"
            ) {

                fecharModalUsuario();
            }
        }
    );
}


// =========================================================
// INICIALIZAÇÃO
// =========================================================

async function iniciarAdmin() {

    try {

        const autorizado =
            await carregarAdmin();


        if (!autorizado) {

            return;
        }


        configurarMenu();

        configurarEventos();


        await Promise.all([
            carregarResumo(),
            carregarUniversidades(),
            carregarUsuarios()
        ]);


    } catch (erro) {

        console.error(
            "Erro ao iniciar administração:",
            erro
        );


        const main =
            document.querySelector(
                ".admin-main"
            );


        if (main) {

            main.innerHTML = `

                <div class="admin-error">

                    <h2>
                        Não foi possível carregar a administração
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
}


iniciarAdmin();