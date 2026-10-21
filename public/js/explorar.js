let usuarioAtual = null;

let universidades = [];

let timeoutBuscaCurso = null;


// =========================================================
// SEGURANÇA
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
// FORMATAÇÃO
// =========================================================

function formatarNumero(
    valor,
    casas = 2
) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "-";
    }


    const numero =
        Number(valor);


    if (
        !Number.isFinite(
            numero
        )
    ) {
        return "-";
    }


    return numero
        .toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits:
                    casas,

                maximumFractionDigits:
                    casas
            }
        );
}


function formatarInteiro(
    valor
) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "-";
    }


    const numero =
        Number(valor);


    if (
        !Number.isFinite(
            numero
        )
    ) {
        return "-";
    }


    return numero
        .toLocaleString(
            "pt-BR"
        );
}


// =========================================================
// USUÁRIO
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


        const nome =
            document.getElementById(
                "nome-usuario"
            );


        if (nome) {

            nome.textContent =
                usuario.nome;
        }


        return true;


    } catch (erro) {

        console.error(
            "Erro ao carregar usuário:",
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

function abrirSecao(
    id
) {

    document
        .querySelectorAll(
            ".page-section"
        )
        .forEach(
            secao => {

                secao.classList
                    .remove(
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

                botao.classList
                    .remove(
                        "active"
                    );
            }
        );


    const secao =
        document.getElementById(
            id
        );


    if (secao) {

        secao.classList.add(
            "active"
        );
    }


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
// RESUMO OFICIAL DO INEP
// =========================================================

async function carregarResumoInep() {

    const container =
        document.getElementById(
            "resumo-inep"
        );


    try {

        const resposta =
            await fetch(
                "/api/indicadores-inep/resumo"
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao carregar resumo"
            );
        }


        const dados =
            await resposta.json();


        const totalIes =
            dados.instituicoes
                ?.instituicoes ??
            0;


        const totalCursos =
            dados.cursos
                ?.cursos ??
            0;


        const ano =
            dados.instituicoes
                ?.ano_final ??
            dados.cursos
                ?.ano_final ??
            "-";


        container.innerHTML = `

            <strong>
                Base oficial do Inep
            </strong>

            <span>

                ${formatarInteiro(
                    totalIes
                )}
                instituições com IGC e

                ${formatarInteiro(
                    totalCursos
                )}
                cursos com indicadores de qualidade.

                Ano de referência mais recente:
                ${escaparHtml(ano)}.

            </span>
        `;


    } catch (erro) {

        console.error(
            erro
        );


        container.innerHTML = `

            <strong>
                Base oficial do Inep
            </strong>

            <span>
                Os indicadores oficiais serão apresentados
                após a importação da base do Inep.
            </span>
        `;
    }
}


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
// CARD DA INSTITUIÇÃO
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
        "Instituição de Educação Superior";


    const categoria =
        universidade
            .categoria_administrativa ||
        "";


    return `

        <article class="institution-card">

            <div class="institution-icon">

                ${escaparHtml(
                    sigla
                )}

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
        universidades.length ===
        0
    ) {

        container.innerHTML = `

            <div class="empty-state">
                Nenhuma instituição disponível.
            </div>
        `;

        return;
    }


    const selecionadas = [];


    const ifal =
        universidades.find(
            universidade =>
                universidade.sigla ===
                "IFAL"
        );


    if (ifal) {

        selecionadas.push(
            ifal
        );
    }


    const universidade =
        universidades.find(
            item =>

                item
                    .organizacao_academica ===
                    "Universidade" &&

                !selecionadas.includes(
                    item
                )
        );


    if (universidade) {

        selecionadas.push(
            universidade
        );
    }


    const centro =
        universidades.find(
            item =>

                item
                    .organizacao_academica ===
                    "Centro Universitário" &&

                !selecionadas.includes(
                    item
                )
        );


    if (centro) {

        selecionadas.push(
            centro
        );
    }


    universidades.forEach(
        item => {

            if (
                selecionadas.length >= 3
            ) {
                return;
            }


            if (
                !selecionadas.includes(
                    item
                )
            ) {

                selecionadas.push(
                    item
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

async function buscarCursos(
    termo
) {

    const container =
        document.getElementById(
            "lista-cursos"
        );


    const busca =
        String(
            termo ||
            ""
        )
            .trim();


    if (
        busca.length < 2
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Pesquise um curso
                </h3>

                <p>
                    Digite ao menos 2 caracteres.
                </p>

            </div>
        `;


        return;
    }


    container.innerHTML = `

        <div class="empty-state">
            Pesquisando cursos...
        </div>
    `;


    try {

        const parametros =
            new URLSearchParams();


        parametros.set(
            "nome",
            busca
        );


        const resposta =
            await fetch(
                "/api/cursos?" +
                parametros.toString()
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao pesquisar cursos"
            );
        }


        const lista =
            Array.isArray(
                dados
            )

                ? dados

                : (
                    Array.isArray(
                        dados.dados
                    )

                        ? dados.dados

                        : []
                );


        renderizarCursos(
            lista
        );


    } catch (erro) {

        console.error(
            "Erro ao pesquisar cursos:",
            erro
        );


        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Não foi possível pesquisar
                </h3>

                <p>
                    Tente novamente.
                </p>

            </div>
        `;
    }
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
                    Tente pesquisar outro curso.
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
                        curso.duracao_semestres

                            ? `${curso.duracao_semestres} semestres`

                            : (
                                curso.carga_horaria

                                    ? `${formatarInteiro(
                                        curso.carga_horaria
                                    )} h`

                                    : ""
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

                                    ${escaparHtml(
                                        curso.universidade_sigla ||
                                        ""
                                    )}

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
                                    curso.codigo_inep

                                        ? `

                                            <span>

                                                Código Inep:
                                                ${escaparHtml(
                                                    curso.codigo_inep
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
// PESQUISA DE CURSOS COM DEBOUNCE
// =========================================================

document
    .getElementById(
        "busca-curso"
    )
    .addEventListener(
        "input",
        event => {

            clearTimeout(
                timeoutBuscaCurso
            );


            const termo =
                event.target.value;


            timeoutBuscaCurso =
                setTimeout(
                    () => {

                        buscarCursos(
                            termo
                        );

                    },
                    350
                );
        }
    );


// =========================================================
// CURSOS DISPONÍVEIS PARA COMPARAÇÃO
// =========================================================

async function preencherCursosComparacao() {

    const select =
        document.getElementById(
            "curso-comparacao"
        );


    try {

        const resposta =
            await fetch(
                "/api/indicadores-inep/cursos/opcoes"
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao carregar cursos"
            );
        }


        select.innerHTML = `

            <option value="">
                Selecione um curso
            </option>
        `;


        dados.forEach(
            item => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    item.curso;


                option.textContent =
                    item.grau_academico

                        ? `${item.curso} — ${item.grau_academico}`

                        : item.curso;


                select.appendChild(
                    option
                );
            }
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar cursos avaliados:",
            erro
        );


        select.innerHTML = `

            <option value="">
                Não foi possível carregar os cursos
            </option>
        `;
    }
}


// =========================================================
// COMPARAÇÃO OFICIAL
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


    const grau =
        document
            .getElementById(
                "grau-comparacao"
            )
            .value;


    const ano =
        document
            .getElementById(
                "ano-comparacao"
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
            Carregando indicadores oficiais...
        </div>
    `;


    try {

        const parametros =
            new URLSearchParams({
                curso,
                ano
            });


        if (modalidade) {

            parametros.set(
                "modalidade",
                modalidade
            );
        }


        if (grau) {

            parametros.set(
                "grau",
                grau
            );
        }


        const resposta =
            await fetch(

                "/api/indicadores-inep/comparacao?" +

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

                <p>
                    Verifique se os indicadores oficiais do
                    Inep foram importados para o banco.
                </p>

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
// INDICADOR
// =========================================================

function renderizarIndicador(
    faixa,
    continuo
) {

    if (
        faixa === null ||
        faixa === undefined ||
        faixa === ""
    ) {

        return "-";
    }


    const valorContinuo =
        (
            continuo !== null &&
            continuo !== undefined &&
            continuo !== ""
        )

            ? ` (${formatarNumero(
                continuo,
                3
            )})`

            : "";


    return `

        <strong>
            ${escaparHtml(
                faixa
            )}
        </strong>

        <small>
            ${valorContinuo}
        </small>
    `;
}


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
                    O curso pode não ter sido avaliado
                    nesse ano ou não possuir conceito calculado.
                </p>

            </div>
        `;


        return;
    }


    container.innerHTML = `

        <div class="public-data-notice">

            <strong>
                Fonte: Inep
            </strong>

            <span>

                Indicadores oficiais de qualidade da
                educação superior.

                Ano:
                ${escaparHtml(
                    dados[0].ano
                )}.

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
                            CPC
                        </th>

                        <th>
                            Enade
                        </th>

                        <th>
                            IDD
                        </th>

                        <th>
                            IGC
                        </th>

                        <th>
                            Participantes
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
                                                    item.instituicao
                                                )}

                                            </strong>

                                            <small>

                                                ${escaparHtml(
                                                    item.instituicao
                                                )}

                                                ${
                                                    item.estado

                                                        ? ` • ${escaparHtml(
                                                            item.estado
                                                        )}`

                                                        : ""
                                                }

                                            </small>

                                        </td>


                                        <td>

                                            ${renderizarIndicador(
                                                item.cpc_faixa,
                                                item.cpc_continuo
                                            )}

                                        </td>


                                        <td>

                                            ${renderizarIndicador(
                                                item.conceito_enade_faixa,
                                                item.conceito_enade_continuo
                                            )}

                                        </td>


                                        <td>

                                            ${renderizarIndicador(
                                                item.idd_faixa,
                                                item.idd_continuo
                                            )}

                                        </td>


                                        <td>

                                            ${renderizarIndicador(
                                                item.igc_faixa,
                                                item.igc_continuo
                                            )}

                                        </td>


                                        <td>

                                            ${formatarInteiro(
                                                item.concluintes_participantes
                                            )}

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

        carregarResumoInep(),

        preencherCursosComparacao()

    ]);
}


iniciar();