let usuarioAtual = null;

let universidades = [];

let cursos = [];


// =========================================================
// SEGURANÇA DE TEXTO
// =========================================================

function escaparHtml(valor) {

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
                method:
                    "POST"
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
            secao => {

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
            botao => {

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
        botao => {

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
// INSTITUIÇÕES
// =========================================================

async function carregarUniversidades() {

    try {

        const resposta =
            await fetch(
                "/api/universidades"
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao carregar instituições"
            );
        }


        universidades =
            await resposta.json();


        renderizarUniversidades(
            universidades
        );


        renderizarResumoUniversidades();


    } catch (erro) {

        console.error(
            "Erro ao carregar instituições:",
            erro
        );
    }
}


// =========================================================
// CARD DE INSTITUIÇÃO
// =========================================================

function criarCardUniversidade(
    universidade
) {

    const sigla =
        universidade.sigla ||
        "IES";


    const organizacao =
        universidade
            .organizacao_academica ||
        "Instituição de Ensino Superior";


    const categoria =
        universidade
            .categoria_administrativa ||
        "";


    return `
        <article class="institution-card">

            <div class="institution-icon">
                ${escaparHtml(sigla)}
            </div>

            <div>

                <h3>
                    ${escaparHtml(
                        universidade.nome
                    )}
                </h3>

                <p>
                    ${escaparHtml(
                        universidade.cidade
                    )}
                    -
                    ${escaparHtml(
                        universidade.estado
                    )}
                </p>

                <div class="course-meta">

                    <span>
                        ${escaparHtml(
                            organizacao
                        )}
                    </span>

                    ${
                        categoria
                            ? `
                                <span>
                                    ${escaparHtml(
                                        categoria
                                    )}
                                </span>
                            `
                            : ""
                    }

                </div>

                <span>
                    Código IES:
                    ${escaparHtml(
                        universidade.codigo
                    )}
                </span>

            </div>

        </article>
    `;
}


// =========================================================
// RENDERIZAR INSTITUIÇÕES
// =========================================================

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
                    Nenhuma instituição encontrada
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


// =========================================================
// RESUMO DA PÁGINA INICIAL
// =========================================================

function renderizarResumoUniversidades() {

    const container =
        document.getElementById(
            "universidades-resumo"
        );


    if (
        universidades.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                Nenhuma instituição disponível.
            </div>
        `;

        return;
    }


    // Prioriza exemplos variados de IES para mostrar
    // que o SIA não contém apenas universidades.

    const selecionadas = [];


    const tiposDesejados = [
        "Instituto Federal",
        "Universidade",
        "Centro Universitário"
    ];


    tiposDesejados.forEach(
        tipo => {

            const encontrada =
                universidades.find(
                    universidade =>
                        universidade
                            .organizacao_academica ===
                        tipo &&
                        !selecionadas.includes(
                            universidade
                        )
                );


            if (encontrada) {

                selecionadas.push(
                    encontrada
                );
            }
        }
    );


    universidades.forEach(
        universidade => {

            if (
                selecionadas.length >= 3
            ) {
                return;
            }


            if (
                !selecionadas.includes(
                    universidade
                )
            ) {

                selecionadas.push(
                    universidade
                );
            }
        }
    );


    container.innerHTML =
        selecionadas
            .slice(
                0,
                3
            )
            .map(
                criarCardUniversidade
            )
            .join("");
}


// =========================================================
// PESQUISA DE INSTITUIÇÕES
// =========================================================

document
    .getElementById(
        "busca-universidade"
    )
    .addEventListener(
        "input",
        event => {

            const termo =
                event.target.value
                    .toLowerCase()
                    .trim();


            const resultado =
                universidades.filter(
                    universidade => {

                        const texto = `
                            ${universidade.nome}
                            ${universidade.sigla || ""}
                            ${universidade.codigo || ""}
                            ${universidade.cidade}
                            ${universidade.estado}
                            ${universidade.organizacao_academica || ""}
                            ${universidade.categoria_administrativa || ""}
                        `
                            .toLowerCase();


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


        if (!resposta.ok) {

            throw new Error(
                "Erro ao carregar cursos"
            );
        }


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


// =========================================================
// TEXTO DE DURAÇÃO
// =========================================================

function obterDuracaoCurso(
    curso
) {

    if (
        curso.duracao_semestres
    ) {

        return (
            `${curso.duracao_semestres} semestres`
        );
    }


    if (
        curso.carga_horaria
    ) {

        return (
            `${curso.carga_horaria} h`
        );
    }


    return "";
}


// =========================================================
// RENDERIZAR CURSOS
// =========================================================

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

                <p>
                    Tente pesquisar outro curso ou instituição.
                </p>

            </div>
        `;


        return;
    }


    container.innerHTML =
        dados
            .map(
                curso => {

                    const duracao =
                        obterDuracaoCurso(
                            curso
                        );


                    return `
                        <article class="course-card">

                            <div>

                                <h3>
                                    ${escaparHtml(
                                        curso.nome
                                    )}
                                </h3>

                                <p>
                                    ${escaparHtml(
                                        curso.universidade
                                    )}
                                </p>

                                <small>
                                    ${
                                        escaparHtml(
                                            curso.universidade_sigla ||
                                            ""
                                        )
                                    }
                                    ${
                                        curso.estado
                                            ? ` • ${escaparHtml(
                                                curso.estado
                                            )}`
                                            : ""
                                    }
                                </small>

                            </div>


                            <div class="course-meta">

                                ${
                                    curso.grau_academico
                                        ? `
                                            <span>
                                                ${escaparHtml(
                                                    curso.grau_academico
                                                )}
                                            </span>
                                        `
                                        : ""
                                }


                                <span>
                                    ${escaparHtml(
                                        curso.modalidade
                                    )}
                                </span>


                                ${
                                    duracao
                                        ? `
                                            <span>
                                                ${escaparHtml(
                                                    duracao
                                                )}
                                            </span>
                                        `
                                        : ""
                                }


                                ${
                                    curso.organizacao_academica
                                        ? `
                                            <span>
                                                ${escaparHtml(
                                                    curso.organizacao_academica
                                                )}
                                            </span>
                                        `
                                        : ""
                                }

                            </div>

                        </article>
                    `;
                }
            )
            .join("");
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
        event => {

            const termo =
                event.target.value
                    .toLowerCase()
                    .trim();


            const resultado =
                cursos.filter(
                    curso => {

                        const texto = `
                            ${curso.nome}
                            ${curso.universidade}
                            ${curso.universidade_sigla || ""}
                            ${curso.grau_academico || ""}
                            ${curso.nivel_academico || ""}
                            ${curso.modalidade || ""}
                            ${curso.organizacao_academica || ""}
                            ${curso.categoria_administrativa || ""}
                            ${curso.estado || ""}
                        `
                            .toLowerCase();


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
// CURSOS PARA COMPARAÇÃO
// =========================================================

function preencherCursosComparacao() {

    const select =
        document.getElementById(
            "curso-comparacao"
        );


    const nomes =
        [
            ...new Set(
                cursos
                    .map(
                        curso =>
                            curso.nome
                    )
                    .filter(Boolean)
            )
        ]
            .sort(
                (
                    a,
                    b
                ) =>
                    a.localeCompare(
                        b,
                        "pt-BR"
                    )
            );


    select.innerHTML = `
        <option value="">
            Selecione um curso
        </option>
    `;


    nomes.forEach(
        nome => {

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


    const modalidade =
        document
            .getElementById(
                "modalidade-comparacao"
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


        if (modalidade) {

            parametros.set(
                "modalidade",
                modalidade
            );
        }


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
                    Não existem dados acadêmicos
                    disponíveis para este curso no
                    período selecionado.
                </p>

            </div>
        `;


        return;
    }


    container.innerHTML = `

        <div class="demo-data-warning">

            <strong>
                Dados demonstrativos
            </strong>

            <span>
                Os indicadores exibidos nesta demonstração
                não representam resultados oficiais das
                instituições.
            </span>

        </div>


        <div class="table-container">

            <table class="comparison-table">

                <thead>

                    <tr>

                        <th>
                            Instituição
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

                    ${
                        dados
                            .map(
                                item => `

                                    <tr>

                                        <td>

                                            <strong>
                                                ${escaparHtml(
                                                    item.sigla ||
                                                    item.universidade
                                                )}
                                            </strong>

                                            <small>
                                                ${escaparHtml(
                                                    item.universidade
                                                )}
                                            </small>

                                        </td>


                                        <td>
                                            ${
                                                item.media_geral ??
                                                "-"
                                            }
                                        </td>


                                        <td>
                                            ${
                                                item.taxa_aprovacao ??
                                                "-"
                                            }%
                                        </td>


                                        <td>
                                            ${
                                                item.taxa_reprovacao ??
                                                "-"
                                            }%
                                        </td>


                                        <td>
                                            ${
                                                item.frequencia_media ??
                                                "-"
                                            }%
                                        </td>

                                    </tr>
                                `
                            )
                            .join("")
                    }

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