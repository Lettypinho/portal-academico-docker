let usuarioAtual = null;

let universidades = [];

let cursos = [];


// =========================================================
// USUÁRIO LOGADO
// =========================================================

async function carregarUsuario() {

    try {

        const resposta =
            await fetch(
                "/api/auth/me"
            );


        if (!resposta.ok) {

            window.location.href =
                "/login.html";

            return false;
        }


        const usuario =
            await resposta.json();


        usuarioAtual =
            usuario;


        // ---------------------------------------------
        // REDIRECIONAMENTO POR PERFIL
        // ---------------------------------------------

        if (
            usuario.perfil ===
            "super_admin"
        ) {

            window.location.href =
                "/admin.html";

            return false;
        }


        if (
            usuario.perfil ===
                "admin_universidade" ||

            usuario.perfil ===
                "gestor" ||

            usuario.perfil ===
                "consulta_institucional"
        ) {

            window.location.href =
                "/dashboard.html";

            return false;
        }


        document
            .getElementById(
                "nome-usuario"
            )
            .textContent =
                usuario.nome;


        return true;

    } catch (erro) {

        console.error(
            erro
        );

        window.location.href =
            "/login.html";

        return false;
    }
}


// =========================================================
// LOGOUT
// =========================================================

async function logout() {

    try {

        await fetch(
            "/api/auth/logout",
            {
                method: "POST"
            }
        );

    } finally {

        window.location.href =
            "/login.html";
    }
}


document
    .getElementById(
        "btn-logout"
    )
    .addEventListener(
        "click",
        logout
    );


// =========================================================
// NAVEGAÇÃO
// =========================================================

function abrirSecao(id) {

    document
        .querySelectorAll(
            ".page-section"
        )
        .forEach(
            (secao) => {

                secao.classList.remove(
                    "active"
                );

            }
        );


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            (botao) => {

                botao.classList.remove(
                    "active"
                );

            }
        );


    document
        .getElementById(id)
        .classList.add(
            "active"
        );


    const botao =
        document.querySelector(
            `[data-section="${id}"]`
        );


    if (botao) {

        botao.classList.add(
            "active"
        );
    }
}


document
    .querySelectorAll(
        ".nav-item"
    )
    .forEach(
        (botao) => {

            botao.addEventListener(
                "click",
                () => {

                    abrirSecao(
                        botao.dataset.section
                    );

                }
            );

        }
    );


document
    .getElementById(
        "btn-ir-comparar"
    )
    .addEventListener(
        "click",
        () => {

            abrirSecao(
                "comparar"
            );

        }
    );


// =========================================================
// UNIVERSIDADES
// =========================================================

async function carregarUniversidades() {

    try {

        const resposta =
            await fetch(
                "/api/universidades"
            );


        universidades =
            await resposta.json();


        renderizarUniversidades(
            universidades
        );


        renderizarResumoUniversidades();

    } catch (erro) {

        console.error(
            "Erro ao carregar universidades:",
            erro
        );
    }
}


function criarCardUniversidade(
    universidade
) {

    return `
        <article class="institution-card">

            <div class="institution-icon">
                ${universidade.sigla || "UNI"}
            </div>

            <div>

                <h3>
                    ${universidade.nome}
                </h3>

                <p>
                    ${universidade.cidade}
                    -
                    ${universidade.estado}
                </p>

                <span>
                    ${universidade.codigo}
                </span>

            </div>

        </article>
    `;
}


function renderizarUniversidades(
    dados
) {

    const container =
        document.getElementById(
            "lista-universidades"
        );


    if (!dados.length) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>
                    Nenhuma universidade encontrada
                </h3>

                <p>
                    Tente utilizar outro termo de pesquisa.
                </p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        dados
            .map(
                criarCardUniversidade
            )
            .join("");
}


function renderizarResumoUniversidades() {

    const container =
        document.getElementById(
            "universidades-resumo"
        );


    container.innerHTML =
        universidades
            .slice(0, 3)
            .map(
                criarCardUniversidade
            )
            .join("");
}


// =========================================================
// PESQUISA DE UNIVERSIDADES
// =========================================================

document
    .getElementById(
        "busca-universidade"
    )
    .addEventListener(
        "input",
        (event) => {

            const termo =
                event.target.value
                    .toLowerCase()
                    .trim();


            const resultado =
                universidades.filter(
                    (universidade) => {

                        const texto = `
                            ${universidade.nome}
                            ${universidade.sigla || ""}
                            ${universidade.cidade}
                            ${universidade.estado}
                        `.toLowerCase();


                        return texto.includes(
                            termo
                        );
                    }
                );


            renderizarUniversidades(
                resultado
            );
        }
    );


// =========================================================
// CURSOS
// =========================================================

async function carregarCursos() {

    try {

        const resposta =
            await fetch(
                "/api/cursos"
            );


        cursos =
            await resposta.json();


        renderizarCursos(
            cursos
        );


        preencherCursosComparacao();

    } catch (erro) {

        console.error(
            "Erro ao carregar cursos:",
            erro
        );
    }
}


function renderizarCursos(
    dados
) {

    const container =
        document.getElementById(
            "lista-cursos"
        );


    if (!dados.length) {

        container.innerHTML = `
            <div class="empty-state">

                <h3>
                    Nenhum curso encontrado
                </h3>

            </div>
        `;

        return;
    }


    container.innerHTML =
        dados.map(
            (curso) => `
                <article class="course-card">

                    <div>

                        <h3>
                            ${curso.nome}
                        </h3>

                        <p>
                            ${curso.universidade}
                        </p>

                    </div>

                    <div class="course-meta">

                        <span>
                            ${curso.modalidade}
                        </span>

                        <span>
                            ${curso.duracao_semestres}
                            semestres
                        </span>

                        <span>
                            ${curso.estado}
                        </span>

                    </div>

                </article>
            `
        ).join("");
}


// =========================================================
// PESQUISA DE CURSOS
// =========================================================

document
    .getElementById(
        "busca-curso"
    )
    .addEventListener(
        "input",
        (event) => {

            const termo =
                event.target.value
                    .toLowerCase()
                    .trim();


            const resultado =
                cursos.filter(
                    (curso) => {

                        const texto = `
                            ${curso.nome}
                            ${curso.universidade}
                            ${curso.modalidade}
                            ${curso.estado}
                        `.toLowerCase();


                        return texto.includes(
                            termo
                        );
                    }
                );


            renderizarCursos(
                resultado
            );
        }
    );


// =========================================================
// CURSOS DISPONÍVEIS PARA COMPARAÇÃO
// =========================================================

function preencherCursosComparacao() {

    const select =
        document.getElementById(
            "curso-comparacao"
        );


    const nomes =
        [
            ...new Set(
                cursos.map(
                    (curso) =>
                        curso.nome
                )
            )
        ]
        .sort();


    select.innerHTML = `
        <option value="">
            Selecione um curso
        </option>
    `;


    nomes.forEach(
        (nome) => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                nome;

            option.textContent =
                nome;

            select.appendChild(
                option
            );
        }
    );
}


// =========================================================
// COMPARAÇÃO
// =========================================================

async function compararCursos() {

    const curso =
        document
            .getElementById(
                "curso-comparacao"
            )
            .value;


    const ano =
        document
            .getElementById(
                "ano-comparacao"
            )
            .value;


    const semestre =
        document
            .getElementById(
                "semestre-comparacao"
            )
            .value;


    const container =
        document.getElementById(
            "resultado-comparacao"
        );


    if (!curso) {

        container.innerHTML = `
            <div class="empty-state">

                <h3>
                    Selecione um curso
                </h3>

            </div>
        `;

        return;
    }


    container.innerHTML = `
        <div class="empty-state">
            Carregando comparação...
        </div>
    `;


    try {

        const parametros =
            new URLSearchParams({
                curso,
                ano,
                semestre
            });


        const resposta =
            await fetch(
                "/api/indicadores/comparacao/cursos?" +
                parametros.toString()
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao comparar cursos"
            );
        }


        renderizarComparacao(
            dados
        );

    } catch (erro) {

        console.error(
            erro
        );


        container.innerHTML = `
            <div class="empty-state">

                <h3>
                    Não foi possível carregar a comparação
                </h3>

            </div>
        `;
    }
}


document
    .getElementById(
        "btn-comparar"
    )
    .addEventListener(
        "click",
        compararCursos
    );


// =========================================================
// RENDERIZAR COMPARAÇÃO
// =========================================================

function renderizarComparacao(
    dados
) {

    const container =
        document.getElementById(
            "resultado-comparacao"
        );


    if (!dados.length) {

        container.innerHTML = `
            <div class="empty-state">

                <h3>
                    Nenhum indicador encontrado
                </h3>

                <p>
                    Não existem dados para este curso
                    no período selecionado.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML = `

        <div class="table-container">

            <table class="comparison-table">

                <thead>

                    <tr>

                        <th>
                            Universidade
                        </th>

                        <th>
                            Média
                        </th>

                        <th>
                            Aprovação
                        </th>

                        <th>
                            Reprovação
                        </th>

                        <th>
                            Frequência
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${dados.map(
                        (item) => `

                            <tr>

                                <td>

                                    <strong>
                                        ${item.sigla || item.universidade}
                                    </strong>

                                    <small>
                                        ${item.universidade}
                                    </small>

                                </td>

                                <td>
                                    ${item.media_geral ?? "-"}
                                </td>

                                <td>
                                    ${item.taxa_aprovacao ?? "-"}%
                                </td>

                                <td>
                                    ${item.taxa_reprovacao ?? "-"}%
                                </td>

                                <td>
                                    ${item.frequencia_media ?? "-"}%
                                </td>

                            </tr>

                        `
                    ).join("")}

                </tbody>

            </table>

        </div>
    `;
}


// =========================================================
// INICIALIZAÇÃO
// =========================================================

async function iniciar() {

    const autenticado =
        await carregarUsuario();


    if (!autenticado) {
        return;
    }


    await Promise.all([
        carregarUniversidades(),
        carregarCursos()
    ]);
}


iniciar();