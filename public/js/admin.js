let adminAtual = null;

let universidadesAdmin = [];

let usuariosAdmin = [];


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
// PERFIS
// =========================================================

function nomePerfil(perfil) {

    const nomes = {

        publico:
            "Público",

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
        perfil
    );
}


function perfilInstitucional(perfil) {

    return [
        "consulta_institucional",
        "gestor",
        "admin_universidade"
    ].includes(perfil);
}


// =========================================================
// DATA
// =========================================================

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


    return data.toLocaleDateString(
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
            adminAtual.perfil ===
            "publico"
        ) {

            window.location.href =
                "/explorar.html";

        } else {

            window.location.href =
                "/dashboard.html";
        }


        return false;
    }


    document
        .getElementById(
            "admin-nome"
        )
        .textContent =
            adminAtual.nome;


    return true;
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
        dados.universidades_recentes
    );


    renderizarUsuariosRecentes(
        dados.usuarios_recentes
    );
}


// =========================================================
// INSTITUIÇÕES RECENTES
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
                                    "Instituição de Ensino Superior"
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


// =========================================================
// USUÁRIOS RECENTES
// =========================================================

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
                                usuario.nome
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


// =========================================================
// TABELA INSTITUIÇÕES
// =========================================================

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
                                    ${
                                        escaparHtml(
                                            universidade.sigla ||
                                            "Sem sigla"
                                        )
                                    }
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
                            ${universidade.total_cursos}
                        </td>


                        <td>
                            ${universidade.total_usuarios}
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
                                class="
                                    admin-table-button
                                    ${
                                        universidade.ativo
                                            ? "danger"
                                            : "success"
                                    }
                                "

                                data-universidade-status="
                                    ${universidade.id}
                                "

                                data-ativo="
                                    ${universidade.ativo}
                                "
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


// =========================================================
// STATUS INSTITUIÇÃO
// =========================================================

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

        alert(
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


    mensagem.textContent = "";

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


    setTimeout(
        fecharFormularioUniversidade,
        700
    );
}


// =========================================================
// FORMULÁRIO
// =========================================================

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


// =========================================================
// PESQUISA INSTITUIÇÕES
// =========================================================

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
        universidadesAdmin.filter(
            universidade => {

                const texto = `
                    ${universidade.nome}
                    ${universidade.sigla || ""}
                    ${universidade.codigo}
                    ${universidade.cidade}
                    ${universidade.estado}
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
        usuariosAdmin.filter(
            usuario => {

                const texto = `
                    ${usuario.nome}
                    ${usuario.email}
                    ${usuario.universidade || ""}
                `
                    .toLowerCase();


                const correspondeBusca =
                    texto.includes(
                        busca
                    );


                const correspondePerfil =
                    !perfil ||
                    usuario.perfil ===
                        perfil;


                return (
                    correspondeBusca &&
                    correspondePerfil
                );
            }
        );


    renderizarUsuarios(
        usuarios
    );
}


// =========================================================
// RENDERIZAR USUÁRIOS
// =========================================================

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
                usuario => `

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
                                class="admin-table-button"

                                data-editar-usuario="
                                    ${usuario.id}
                                "
                            >
                                Editar
                            </button>

                        </td>

                    </tr>
                `
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
// SELECT DE IES
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
        .forEach(
            universidade => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    universidade.id;


                const sigla =
                    universidade.sigla
                    ||
                    universidade.nome;


                option.textContent =
                    `${sigla} - ${universidade.estado}`;


                select.appendChild(
                    option
                );
            }
        );
}


// =========================================================
// MODAL USUÁRIO
// =========================================================

function abrirModalUsuario(id) {

    const usuario =
        usuariosAdmin.find(
            item =>
                Number(item.id) ===
                id
        );


    if (!usuario) {
        return;
    }


    document
        .getElementById(
            "modal-usuario-id"
        )
        .value =
            usuario.id;


    document
        .getElementById(
            "modal-usuario-nome"
        )
        .textContent =
            usuario.nome;


    document
        .getElementById(
            "modal-usuario-email"
        )
        .textContent =
            usuario.email;


    document
        .getElementById(
            "modal-perfil"
        )
        .value =
            usuario.perfil;


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
            "modal-universidade"
        )
        .value =
            usuario.universidade_id ||
            "";


    atualizarCampoUniversidade();


    document
        .getElementById(
            "mensagem-editar-usuario"
        )
        .textContent =
            "";


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
// PERFIL / IES
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
        perfilInstitucional(
            perfil
        )
    ) {

        grupo.classList.remove(
            "hidden"
        );

    } else {

        grupo.classList.add(
            "hidden"
        );

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
        document
            .getElementById(
                "modal-usuario-id"
            )
            .value;


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


    const mensagem =
        document.getElementById(
            "mensagem-editar-usuario"
        );


    mensagem.textContent =
        "";

    mensagem.className =
        "admin-message";


    if (
        perfilInstitucional(
            perfil
        ) &&
        !universidadeId
    ) {

        mensagem.textContent =
            "Selecione uma instituição para o perfil institucional.";


        mensagem.classList.add(
            "error"
        );


        return;
    }


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
                    JSON.stringify({

                        perfil,

                        universidade_id:
                            universidadeId
                                ? Number(
                                    universidadeId
                                )
                                : null,

                        ativo
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

        mensagem.textContent =
            dados.erro ||
            "Erro ao alterar usuário.";


        mensagem.classList.add(
            "error"
        );


        return;
    }


    mensagem.textContent =
        "Usuário atualizado com sucesso.";


    mensagem.classList.add(
        "success"
    );


    await Promise.all([
        carregarUsuarios(),
        carregarResumo()
    ]);


    setTimeout(
        fecharModalUsuario,
        600
    );
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
            section => {

                section.classList.toggle(
                    "active",

                    section.id ===
                    nome
                );
            }
        );
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
                            botao.dataset.goSection
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
            ".admin-modal-backdrop"
        )
        .addEventListener(
            "click",
            fecharModalUsuario
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
            erro
        );


        document
            .querySelector(
                ".admin-main"
            )
            .innerHTML = `

                <div class="admin-error">

                    <h2>
                        Não foi possível carregar
                        a administração
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


iniciarAdmin();