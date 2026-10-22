let usuarioAtual = null;

let universidades = [];

let timeoutBuscaCurso = null;
let timeoutBuscaCursoComparacao = null;
let timeoutBuscaInstituicao = null;

let mapaInstituicoesComparacao =
    new Map();


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


function formatarPercentual(
    valor,
    casas = 1
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


    return (
        numero.toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits:
                    casas,

                maximumFractionDigits:
                    casas
            }
        ) +
        "%"
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
// RESUMO INEP
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


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao carregar resumo"
            );
        }


        const totalIes =
            dados.instituicoes
                ?.instituicoes ??
            0;


        const totalQualidade =
            dados.cursos
                ?.cursos ??
            0;


        const totalTrajetoria =
            dados.trajetoria
                ?.cursos ??
            0;


        const anoTrajetoria =
            dados.trajetoria
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
                instituições com IGC,

                ${formatarInteiro(
                    totalQualidade
                )}
                cursos com indicadores de qualidade e

                ${formatarInteiro(
                    totalTrajetoria
                )}
                cursos com indicadores de trajetória.

                Trajetória acompanhada até
                ${escaparHtml(
                    anoTrajetoria
                )}.

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
                Não foi possível carregar o resumo
                dos indicadores oficiais.
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


    if (!universidades.length) {

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
            item =>
                item.sigla ===
                "IFAL"
        );


    if (ifal) {

        selecionadas.push(
            ifal
        );
    }


    for (
        const tipo
        of [
            "Universidade",
            "Centro Universitário"
        ]
    ) {

        const item =
            universidades.find(
                universidade =>

                    universidade
                        .organizacao_academica ===
                        tipo &&

                    !selecionadas.includes(
                        universidade
                    )
            );


        if (item) {

            selecionadas.push(
                item
            );
        }
    }


    universidades.forEach(
        item => {

            if (
                selecionadas.length <
                    3 &&
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
// PESQUISA DE CURSOS
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
            termo || ""
        )
            .trim();


    if (
        busca.length <
        2
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
            erro
        );


        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Não foi possível pesquisar
                </h3>

            </div>
        `;
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

                            </div>

                        </article>
                    `;
                }
            )
            .join("");
}


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


            timeoutBuscaCurso =
                setTimeout(
                    () => {

                        buscarCursos(
                            event.target.value
                        );

                    },
                    350
                );
        }
    );


// =========================================================
// ESTADOS DA COMPARAÇÃO
// =========================================================

async function carregarEstadosComparacao() {

    const select =
        document.getElementById(
            "estado-comparacao"
        );


    try {

        const resposta =
            await fetch(
                "/api/indicadores-inep/filtros/estados"
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro
            );
        }


        select.innerHTML = `

            <option value="">
                Todos
            </option>
        `;


        dados.forEach(
            item => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    item.estado;


                option.textContent =
                    item.estado;


                select.appendChild(
                    option
                );
            }
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar estados:",
            erro
        );
    }
}


// =========================================================
// CIDADES DA COMPARAÇÃO
// =========================================================

async function carregarCidadesComparacao() {

    const estado =
        document
            .getElementById(
                "estado-comparacao"
            )
            .value;


    const lista =
        document.getElementById(
            "opcoes-cidades-comparacao"
        );


    lista.innerHTML =
        "";


    if (!estado) {

        return;
    }


    try {

        const parametros =
            new URLSearchParams({
                estado
            });


        const resposta =
            await fetch(

                "/api/indicadores-inep/filtros/cidades?" +

                parametros.toString()
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro
            );
        }


        dados.forEach(
            item => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    item.cidade;


                lista.appendChild(
                    option
                );
            }
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar cidades:",
            erro
        );
    }
}


// =========================================================
// INSTITUIÇÕES DA COMPARAÇÃO
// =========================================================

function limparInstituicaoSelecionada() {

    mapaInstituicoesComparacao =
        new Map();
}


async function buscarInstituicoesComparacao(
    busca
) {

    const termo =
        String(
            busca || ""
        )
            .trim();


    const lista =
        document.getElementById(
            "opcoes-instituicoes-comparacao"
        );


    lista.innerHTML =
        "";


    limparInstituicaoSelecionada();


    if (
        termo.length <
        2
    ) {

        return;
    }


    const estado =
        document
            .getElementById(
                "estado-comparacao"
            )
            .value;


    const cidade =
        document
            .getElementById(
                "cidade-comparacao"
            )
            .value
            .trim();


    try {

        const parametros =
            new URLSearchParams({
                busca:
                    termo
            });


        if (estado) {

            parametros.set(
                "estado",
                estado
            );
        }


        if (cidade) {

            parametros.set(
                "cidade",
                cidade
            );
        }


        const resposta =
            await fetch(

                "/api/indicadores-inep/filtros/instituicoes?" +

                parametros.toString()
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro
            );
        }


        dados.forEach(
            item => {

                const rotulo =
                    item.sigla

                        ? `${item.nome} (${item.sigla})`

                        : item.nome;


                mapaInstituicoesComparacao
                    .set(
                        rotulo,
                        item.id
                    );


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    rotulo;


                lista.appendChild(
                    option
                );
            }
        );


    } catch (erro) {

        console.error(
            "Erro ao pesquisar instituições:",
            erro
        );
    }
}


// =========================================================
// CURSOS DA COMPARAÇÃO
// =========================================================

async function buscarCursosComparacao(
    busca
) {

    const termo =
        String(
            busca || ""
        )
            .trim();


    const lista =
        document.getElementById(
            "opcoes-cursos-comparacao"
        );


    lista.innerHTML =
        "";


    if (
        termo.length <
        2
    ) {

        return;
    }


    const estado =
        document
            .getElementById(
                "estado-comparacao"
            )
            .value;


    const cidade =
        document
            .getElementById(
                "cidade-comparacao"
            )
            .value
            .trim();


    const instituicaoTexto =
        document
            .getElementById(
                "instituicao-comparacao"
            )
            .value
            .trim();


    const universidadeId =
        mapaInstituicoesComparacao
            .get(
                instituicaoTexto
            );


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


    const parametros =
        new URLSearchParams({
            busca:
                termo
        });


    if (estado) {

        parametros.set(
            "estado",
            estado
        );
    }


    if (cidade) {

        parametros.set(
            "cidade",
            cidade
        );
    }


    if (universidadeId) {

        parametros.set(
            "universidade_id",
            universidadeId
        );
    }


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


    try {

        const resposta =
            await fetch(

                "/api/indicadores-inep/cursos/opcoes?" +

                parametros.toString()
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro
            );
        }


        dados.forEach(
            item => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    item.curso;


                option.label =
                    item.grau_academico ||
                    "";


                lista.appendChild(
                    option
                );
            }
        );


    } catch (erro) {

        console.error(
            "Erro ao pesquisar cursos para comparação:",
            erro
        );
    }
}


// =========================================================
// EVENTOS DOS FILTROS
// =========================================================

document
    .getElementById(
        "estado-comparacao"
    )
    .addEventListener(
        "change",
        async () => {

            document
                .getElementById(
                    "cidade-comparacao"
                )
                .value =
                "";


            document
                .getElementById(
                    "instituicao-comparacao"
                )
                .value =
                "";


            limparInstituicaoSelecionada();


            await carregarCidadesComparacao();


            const curso =
                document
                    .getElementById(
                        "curso-comparacao"
                    )
                    .value;


            if (
                curso.trim().length >=
                2
            ) {

                buscarCursosComparacao(
                    curso
                );
            }
        }
    );


document
    .getElementById(
        "cidade-comparacao"
    )
    .addEventListener(
        "input",
        () => {

            document
                .getElementById(
                    "instituicao-comparacao"
                )
                .value =
                "";


            limparInstituicaoSelecionada();
        }
    );


document
    .getElementById(
        "instituicao-comparacao"
    )
    .addEventListener(
        "input",
        event => {

            clearTimeout(
                timeoutBuscaInstituicao
            );


            timeoutBuscaInstituicao =
                setTimeout(
                    () => {

                        buscarInstituicoesComparacao(
                            event.target.value
                        );

                    },
                    300
                );
        }
    );


document
    .getElementById(
        "curso-comparacao"
    )
    .addEventListener(
        "input",
        event => {

            clearTimeout(
                timeoutBuscaCursoComparacao
            );


            timeoutBuscaCursoComparacao =
                setTimeout(
                    () => {

                        buscarCursosComparacao(
                            event.target.value
                        );

                    },
                    300
                );
        }
    );


[
    "modalidade-comparacao",
    "grau-comparacao"
]
    .forEach(
        id => {

            document
                .getElementById(
                    id
                )
                .addEventListener(
                    "change",
                    () => {

                        const curso =
                            document
                                .getElementById(
                                    "curso-comparacao"
                                )
                                .value;


                        if (
                            curso.trim().length >=
                            2
                        ) {

                            buscarCursosComparacao(
                                curso
                            );
                        }
                    }
                );
        }
    );


// =========================================================
// COMPARAÇÃO
// =========================================================

async function compararCursos() {

    const curso =
        document
            .getElementById(
                "curso-comparacao"
            )
            .value
            .trim();


    const estado =
        document
            .getElementById(
                "estado-comparacao"
            )
            .value;


    const cidade =
        document
            .getElementById(
                "cidade-comparacao"
            )
            .value
            .trim();


    const instituicaoTexto =
        document
            .getElementById(
                "instituicao-comparacao"
            )
            .value
            .trim();


    const universidadeId =
        mapaInstituicoesComparacao
            .get(
                instituicaoTexto
            );


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


    const container =
        document.getElementById(
            "resultado-comparacao"
        );


    if (!curso) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Informe um curso
                </h3>

            </div>
        `;

        return;
    }


    container.innerHTML = `

        <div class="empty-state">
            Comparando indicadores oficiais...
        </div>
    `;


    const parametros =
        new URLSearchParams({
            curso
        });


    if (estado) {

        parametros.set(
            "estado",
            estado
        );
    }


    if (cidade) {

        parametros.set(
            "cidade",
            cidade
        );
    }


    if (universidadeId) {

        parametros.set(
            "universidade_id",
            universidadeId
        );
    }


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


    try {

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
                    Verifique os filtros e tente novamente.
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
// INDICADORES DE QUALIDADE
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


    const detalhe =
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
            ${escaparHtml(
                detalhe
            )}
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
                    Nenhum resultado encontrado
                </h3>

                <p>
                    Tente remover algum filtro
                    ou pesquisar outro curso.
                </p>

            </div>
        `;

        return;
    }


    const referencia =
        dados[0];


    container.innerHTML = `

        <div class="public-data-notice">

            <strong>
                Fonte: Inep
            </strong>

            <span>

                Trajetória da coorte de

                ${escaparHtml(
                    referencia.ano_ingresso
                )}

                acompanhada até

                ${escaparHtml(
                    referencia.ano_trajetoria
                )}.

                Os indicadores de qualidade utilizam
                o último ano disponível para cada curso.

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
                            Conclusão
                        </th>

                        <th>
                            Desistência
                        </th>

                        <th>
                            Permanência
                        </th>

                        <th>
                            Participação Enade
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

                    </tr>

                </thead>

                <tbody>

                    ${dados
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
                                                item.cidade

                                                    ? ` • ${escaparHtml(
                                                        item.cidade
                                                    )}`

                                                    : ""
                                            }

                                            ${
                                                item.estado

                                                    ? `/${escaparHtml(
                                                        item.estado
                                                    )}`

                                                    : ""
                                            }

                                            ${
                                                item.codigo_inep

                                                    ? ` • Curso Inep ${escaparHtml(
                                                        item.codigo_inep
                                                    )}`

                                                    : ""
                                            }

                                        </small>

                                    </td>


                                    <td>

                                        <strong>

                                            ${formatarPercentual(
                                                item.taxa_conclusao_acumulada
                                            )}

                                        </strong>

                                        <small>
                                            acumulada
                                        </small>

                                    </td>


                                    <td>

                                        <strong>

                                            ${formatarPercentual(
                                                item.taxa_desistencia_acumulada
                                            )}

                                        </strong>

                                        <small>
                                            acumulada
                                        </small>

                                    </td>


                                    <td>

                                        <strong>

                                            ${formatarPercentual(
                                                item.taxa_permanencia
                                            )}

                                        </strong>

                                        <small>
                                            ainda vinculados
                                        </small>

                                    </td>


                                    <td>

                                        <strong>

                                            ${formatarPercentual(
                                                item.taxa_participacao_enade
                                            )}

                                        </strong>

                                        <small>

                                            ${formatarInteiro(
                                                item.concluintes_participantes
                                            )}

                                            /

                                            ${formatarInteiro(
                                                item.concluintes_inscritos
                                            )}

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

                                </tr>
                            `
                        )
                        .join("")}

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

        carregarEstadosComparacao()

    ]);
}


iniciar();