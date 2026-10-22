let universidadesFiltroCursos = [];

let timeoutFiltroNomeCurso = null;


// =========================================================
// MONTAR INTERFACE
// =========================================================

function montarFiltrosCursos() {

    const secao =
        document.getElementById(
            "cursos"
        );


    if (!secao) {
        return;
    }


    const buscaAtual =
        secao.querySelector(
            ".search-box"
        );


    if (!buscaAtual) {
        return;
    }


    buscaAtual.outerHTML = `

        <div class="course-filter-panel">

            <div class="course-filter-grid">


                <div class="form-group">

                    <label for="busca-curso">
                        Nome do curso
                    </label>

                    <input
                        type="text"
                        id="busca-curso"
                        autocomplete="off"
                        placeholder="Ex.: Sistemas de Informação"
                    >

                </div>


                <div class="form-group">

                    <label for="estado-curso">
                        Estado
                    </label>

                    <select id="estado-curso">

                        <option value="">
                            Todos os estados
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label for="cidade-curso">
                        Cidade
                    </label>

                    <select
                        id="cidade-curso"
                        disabled
                    >

                        <option value="">
                            Todas as cidades
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label for="instituicao-curso">
                        Instituição
                    </label>

                    <select
                        id="instituicao-curso"
                        disabled
                    >

                        <option value="">
                            Todas as instituições
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label for="modalidade-curso">
                        Modalidade
                    </label>

                    <select id="modalidade-curso">

                        <option value="">
                            Todas
                        </option>

                        <option value="Presencial">
                            Presencial
                        </option>

                        <option value="EAD">
                            EAD
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label for="grau-curso">
                        Grau acadêmico
                    </label>

                    <select id="grau-curso">

                        <option value="">
                            Todos
                        </option>

                        <option value="Bacharelado">
                            Bacharelado
                        </option>

                        <option value="Licenciatura">
                            Licenciatura
                        </option>

                        <option value="Tecnológico">
                            Tecnológico
                        </option>

                    </select>

                </div>

            </div>


            <div class="course-filter-actions">

                <button
                    type="button"
                    id="btn-filtrar-cursos"
                    class="btn-primary btn-auto"
                >
                    Buscar cursos
                </button>


                <button
                    type="button"
                    id="btn-limpar-filtros-cursos"
                    class="btn-filter-secondary"
                >
                    Limpar filtros
                </button>


                <span
                    id="resultado-filtros-cursos"
                    class="course-filter-result"
                >
                    Utilize os filtros para pesquisar.
                </span>

            </div>

        </div>
    `;
}


// =========================================================
// CARREGAR BASE DE INSTITUIÇÕES
// =========================================================

async function carregarBaseFiltrosCursos() {

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


        universidadesFiltroCursos =
            await resposta.json();


        preencherEstadosCursos();


    } catch (erro) {

        console.error(
            "Erro ao preparar filtros dos cursos:",
            erro
        );
    }
}


// =========================================================
// ESTADOS
// =========================================================

function preencherEstadosCursos() {

    const select =
        document.getElementById(
            "estado-curso"
        );


    if (!select) {
        return;
    }


    const estados =
        [
            ...new Set(
                universidadesFiltroCursos

                    .map(
                        item =>
                            item.estado
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
            Todos os estados
        </option>
    `;


    estados.forEach(
        estado => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                estado;


            option.textContent =
                estado;


            select.appendChild(
                option
            );
        }
    );
}


// =========================================================
// CIDADES
// =========================================================

function preencherCidadesCursos() {

    const estado =
        document
            .getElementById(
                "estado-curso"
            )
            .value;


    const cidadeSelect =
        document.getElementById(
            "cidade-curso"
        );


    const instituicaoSelect =
        document.getElementById(
            "instituicao-curso"
        );


    cidadeSelect.innerHTML = `

        <option value="">
            Todas as cidades
        </option>
    `;


    instituicaoSelect.innerHTML = `

        <option value="">
            Todas as instituições
        </option>
    `;


    if (!estado) {

        cidadeSelect.disabled =
            true;


        instituicaoSelect.disabled =
            true;


        return;
    }


    cidadeSelect.disabled =
        false;


    instituicaoSelect.disabled =
        false;


    const cidades =
        [
            ...new Set(
                universidadesFiltroCursos

                    .filter(
                        item =>
                            item.estado ===
                            estado
                    )

                    .map(
                        item =>
                            item.cidade
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


    cidades.forEach(
        cidade => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                cidade;


            option.textContent =
                cidade;


            cidadeSelect.appendChild(
                option
            );
        }
    );


    preencherInstituicoesCursos();
}


// =========================================================
// INSTITUIÇÕES
// =========================================================

function preencherInstituicoesCursos() {

    const estado =
        document
            .getElementById(
                "estado-curso"
            )
            .value;


    const cidade =
        document
            .getElementById(
                "cidade-curso"
            )
            .value;


    const select =
        document.getElementById(
            "instituicao-curso"
        );


    select.innerHTML = `

        <option value="">
            Todas as instituições
        </option>
    `;


    if (!estado) {

        select.disabled =
            true;

        return;
    }


    select.disabled =
        false;


    const instituicoes =
        universidadesFiltroCursos

            .filter(
                item => {

                    if (
                        item.estado !==
                        estado
                    ) {

                        return false;
                    }


                    if (
                        cidade &&
                        item.cidade !==
                            cidade
                    ) {

                        return false;
                    }


                    return true;
                }
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
            );


    instituicoes.forEach(
        item => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                item.id;


            option.textContent =
                item.sigla

                    ? `${item.sigla} — ${item.nome}`

                    : item.nome;


            select.appendChild(
                option
            );
        }
    );
}


// =========================================================
// PESQUISA
// =========================================================

async function pesquisarCursosComFiltros() {

    const nome =
        document
            .getElementById(
                "busca-curso"
            )
            .value
            .trim();


    const estado =
        document
            .getElementById(
                "estado-curso"
            )
            .value;


    const cidade =
        document
            .getElementById(
                "cidade-curso"
            )
            .value;


    const universidadeId =
        document
            .getElementById(
                "instituicao-curso"
            )
            .value;


    const modalidade =
        document
            .getElementById(
                "modalidade-curso"
            )
            .value;


    const grau =
        document
            .getElementById(
                "grau-curso"
            )
            .value;


    const container =
        document.getElementById(
            "lista-cursos"
        );


    const resumo =
        document.getElementById(
            "resultado-filtros-cursos"
        );


    const possuiFiltro =
        Boolean(
            estado ||
            cidade ||
            universidadeId ||
            modalidade ||
            grau
        );


    if (
        nome.length < 2 &&
        !possuiFiltro
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Pesquise um curso
                </h3>

                <p>
                    Digite pelo menos 2 caracteres
                    ou selecione algum filtro.
                </p>

            </div>
        `;


        resumo.textContent =
            "Utilize os filtros para pesquisar.";


        return;
    }


    const parametros =
        new URLSearchParams();


    if (
        nome.length >=
        2
    ) {

        parametros.set(
            "nome",
            nome
        );
    }


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


    parametros.set(
        "limite",
        "100"
    );


    container.innerHTML = `

        <div class="empty-state">
            Pesquisando cursos...
        </div>
    `;


    resumo.textContent =
        "Consultando a base nacional...";


    try {

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


        const cursos =
            Array.isArray(
                dados
            )
                ? dados
                : [];


        renderizarCursos(
            cursos
        );


        if (
            cursos.length ===
            100
        ) {

            resumo.innerHTML = `

                <strong>
                    100 resultados exibidos
                </strong>

                — refine os filtros para uma busca mais específica.
            `;

        } else {

            resumo.innerHTML = `

                <strong>
                    ${cursos.length}
                </strong>

                ${
                    cursos.length === 1
                        ? "curso encontrado"
                        : "cursos encontrados"
                }.
            `;
        }


    } catch (erro) {

        console.error(
            "Erro na pesquisa filtrada:",
            erro
        );


        resumo.textContent =
            "Não foi possível concluir a pesquisa.";


        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Erro ao pesquisar cursos
                </h3>

                <p>
                    Tente novamente.
                </p>

            </div>
        `;
    }
}


// =========================================================
// LIMPAR FILTROS
// =========================================================

function limparFiltrosCursos() {

    document
        .getElementById(
            "busca-curso"
        )
        .value =
        "";


    document
        .getElementById(
            "estado-curso"
        )
        .value =
        "";


    document
        .getElementById(
            "modalidade-curso"
        )
        .value =
        "";


    document
        .getElementById(
            "grau-curso"
        )
        .value =
        "";


    preencherCidadesCursos();


    const container =
        document.getElementById(
            "lista-cursos"
        );


    const resumo =
        document.getElementById(
            "resultado-filtros-cursos"
        );


    resumo.textContent =
        "Utilize os filtros para pesquisar.";


    container.innerHTML = `

        <div class="empty-state">

            <h3>
                Pesquise um curso
            </h3>

            <p>
                Digite pelo menos 2 caracteres
                ou selecione algum filtro.
            </p>

        </div>
    `;
}


// =========================================================
// EVENTOS
// =========================================================

function configurarEventosFiltrosCursos() {

    const nome =
        document.getElementById(
            "busca-curso"
        );


    const estado =
        document.getElementById(
            "estado-curso"
        );


    const cidade =
        document.getElementById(
            "cidade-curso"
        );


    const instituicao =
        document.getElementById(
            "instituicao-curso"
        );


    const modalidade =
        document.getElementById(
            "modalidade-curso"
        );


    const grau =
        document.getElementById(
            "grau-curso"
        );


    nome.addEventListener(
        "input",
        () => {

            clearTimeout(
                timeoutFiltroNomeCurso
            );


            timeoutFiltroNomeCurso =
                setTimeout(
                    pesquisarCursosComFiltros,
                    350
                );
        }
    );


    estado.addEventListener(
        "change",
        async () => {

            preencherCidadesCursos();

            await pesquisarCursosComFiltros();
        }
    );


    cidade.addEventListener(
        "change",
        async () => {

            preencherInstituicoesCursos();

            await pesquisarCursosComFiltros();
        }
    );


    instituicao.addEventListener(
        "change",
        pesquisarCursosComFiltros
    );


    modalidade.addEventListener(
        "change",
        pesquisarCursosComFiltros
    );


    grau.addEventListener(
        "change",
        pesquisarCursosComFiltros
    );


    document
        .getElementById(
            "btn-filtrar-cursos"
        )
        .addEventListener(
            "click",
            pesquisarCursosComFiltros
        );


    document
        .getElementById(
            "btn-limpar-filtros-cursos"
        )
        .addEventListener(
            "click",
            limparFiltrosCursos
        );
}


// =========================================================
// INICIALIZAÇÃO
// =========================================================

async function iniciarFiltrosCursos() {

    montarFiltrosCursos();

    configurarEventosFiltrosCursos();

    await carregarBaseFiltrosCursos();
}


iniciarFiltrosCursos();