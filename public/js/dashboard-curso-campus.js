// =========================================================
// SIA - VÍNCULO CURSO -> CAMPUS
// =========================================================

(function iniciarModuloCursoCampus() {

    let cursos =
        [];

    let campi =
        [];

    let permissoes =
        [];


    // =====================================================
    // UTILITÁRIOS
    // =====================================================

    function escaparHtml(
        valor
    ) {

        return String(
            valor ??
            ""
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


    function possuiPermissao(
        codigo
    ) {

        return permissoes.includes(
            codigo
        );
    }


    // =====================================================
    // ESTILOS
    // =====================================================

    function adicionarEstilos() {

        if (
            document.getElementById(
                "curso-campus-estilos"
            )
        ) {

            return;
        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "curso-campus-estilos";


        style.textContent = `

            .curso-campus-panel {

                margin-top:
                    24px;

                padding:
                    22px;

                border:
                    1px solid #e2e8f0;

                border-radius:
                    16px;

                background:
                    #ffffff;
            }


            .curso-campus-header {

                display:
                    flex;

                align-items:
                    flex-start;

                justify-content:
                    space-between;

                gap:
                    16px;

                flex-wrap:
                    wrap;

                margin-bottom:
                    18px;
            }


            .curso-campus-header h3 {

                margin:
                    4px 0 5px;

                color:
                    #0f172a;
            }


            .curso-campus-header p {

                margin:
                    0;

                color:
                    #64748b;

                font-size:
                    13px;
            }


            .curso-campus-filtro {

                width:
                    min(320px, 100%);

                min-height:
                    40px;

                padding:
                    9px 11px;

                border:
                    1px solid #cbd5e1;

                border-radius:
                    9px;

                font:
                    inherit;

                outline:
                    none;
            }


            .curso-campus-filtro:focus {

                border-color:
                    #7c3aed;
            }


            .curso-campus-lista {

                display:
                    grid;

                gap:
                    10px;
            }


            .curso-campus-item {

                display:
                    grid;

                grid-template-columns:
                    minmax(220px, 1fr)
                    minmax(220px, 320px)
                    auto;

                align-items:
                    center;

                gap:
                    12px;

                padding:
                    14px;

                border:
                    1px solid #e2e8f0;

                border-radius:
                    12px;

                background:
                    #f8fafc;
            }


            .curso-campus-info {

                min-width:
                    0;
            }


            .curso-campus-info strong {

                display:
                    block;

                color:
                    #0f172a;

                overflow:
                    hidden;

                text-overflow:
                    ellipsis;

                white-space:
                    nowrap;
            }


            .curso-campus-info span {

                display:
                    block;

                margin-top:
                    3px;

                color:
                    #64748b;

                font-size:
                    12px;
            }


            .curso-campus-select {

                width:
                    100%;

                min-height:
                    40px;

                padding:
                    8px 10px;

                border:
                    1px solid #cbd5e1;

                border-radius:
                    8px;

                background:
                    #ffffff;

                color:
                    #0f172a;

                font:
                    inherit;
            }


            .curso-campus-button {

                min-height:
                    40px;

                padding:
                    8px 14px;

                border:
                    0;

                border-radius:
                    8px;

                background:
                    #6d28d9;

                color:
                    #ffffff;

                font-weight:
                    700;

                cursor:
                    pointer;
            }


            .curso-campus-button:hover {

                background:
                    #5b21b6;
            }


            .curso-campus-button:disabled {

                opacity:
                    .55;

                cursor:
                    not-allowed;
            }


            .curso-campus-status {

                margin:
                    0 0 14px;

                min-height:
                    20px;

                font-size:
                    13px;
            }


            .curso-campus-status.erro {

                color:
                    #b91c1c;
            }


            .curso-campus-status.sucesso {

                color:
                    #15803d;
            }


            .curso-campus-vazio {

                padding:
                    28px;

                border:
                    1px dashed #cbd5e1;

                border-radius:
                    12px;

                text-align:
                    center;

                color:
                    #64748b;
            }


            .curso-campus-vazio strong {

                display:
                    block;

                margin-bottom:
                    5px;

                color:
                    #0f172a;
            }


            .curso-campus-ir-campi {

                margin-top:
                    12px;

                min-height:
                    38px;

                padding:
                    8px 13px;

                border:
                    1px solid #6d28d9;

                border-radius:
                    8px;

                background:
                    #ffffff;

                color:
                    #6d28d9;

                font-weight:
                    700;

                cursor:
                    pointer;
            }


            @media (
                max-width: 850px
            ) {

                .curso-campus-item {

                    grid-template-columns:
                        1fr;
                }


                .curso-campus-button {

                    width:
                        100%;
                }
            }
        `;


        document.head.appendChild(
            style
        );
    }


    // =====================================================
    // CRIAR PAINEL
    // =====================================================

    function criarPainel() {

        if (
            document.getElementById(
                "curso-campus-panel"
            )
        ) {

            return;
        }


        const secaoCursos =
            document.getElementById(
                "cursos"
            );


        if (
            !secaoCursos
        ) {

            return;
        }


        const painel =
            document.createElement(
                "div"
            );


        painel.id =
            "curso-campus-panel";


        painel.className =
            "curso-campus-panel";


        painel.innerHTML = `

            <div class="curso-campus-header">

                <div>

                    <span class="section-eyebrow">
                        Gestão institucional
                    </span>


                    <h3>
                        Vincular cursos aos campi
                    </h3>


                    <p>
                        Defina em qual campus cada curso da instituição
                        é ofertado.
                    </p>

                </div>


                <input
                    type="text"
                    id="curso-campus-filtro"
                    class="curso-campus-filtro"
                    placeholder="Pesquisar curso..."
                    autocomplete="off"
                >

            </div>


            <div
                id="curso-campus-status"
                class="curso-campus-status"
            ></div>


            <div
                id="curso-campus-lista"
                class="curso-campus-lista"
            >

                <div class="curso-campus-vazio">
                    Carregando...
                </div>

            </div>
        `;


        const painelCursos =
            secaoCursos.querySelector(
                ".linked-courses-panel"
            );


        if (
            painelCursos
        ) {

            painelCursos.insertAdjacentElement(
                "afterend",
                painel
            );

        } else {

            secaoCursos.prepend(
                painel
            );
        }


        document
            .getElementById(
                "curso-campus-filtro"
            )
            .addEventListener(
                "input",
                renderizarCursos
            );
    }


    // =====================================================
    // STATUS
    // =====================================================

    function mostrarStatus(
        mensagem,
        tipo = ""
    ) {

        const elemento =
            document.getElementById(
                "curso-campus-status"
            );


        if (
            !elemento
        ) {

            return;
        }


        elemento.className =
            "curso-campus-status";


        if (
            tipo
        ) {

            elemento.classList.add(
                tipo
            );
        }


        elemento.textContent =
            mensagem ||
            "";
    }


    // =====================================================
    // CARREGAR PERMISSÕES
    // =====================================================

    async function carregarPermissoes() {

        const resposta =
            await fetch(
                "/api/perfil/permissoes"
            );


        if (
            !resposta.ok
        ) {

            return false;
        }


        const dados =
            await resposta.json();


        permissoes =
            Array.isArray(
                dados.permissoes
            )
                ? dados.permissoes
                : [];


        return possuiPermissao(
            "GERENCIAR_CURSOS"
        );
    }


    // =====================================================
    // CARREGAR DADOS
    // =====================================================

    async function carregarDados() {

        mostrarStatus(
            "Carregando cursos e campi..."
        );


        try {

            const [
                respostaCursos,
                respostaCampi
            ] =
                await Promise.all([

                    fetch(
                        "/api/cursos/minha-universidade"
                    ),

                    fetch(
                        "/api/campi/minha-instituicao"
                    )
                ]);


            const dadosCursos =
                await respostaCursos.json();


            const dadosCampi =
                await respostaCampi.json();


            if (
                !respostaCursos.ok
            ) {

                throw new Error(
                    dadosCursos.erro ||
                    "Erro ao carregar cursos"
                );
            }


            if (
                !respostaCampi.ok
            ) {

                throw new Error(
                    dadosCampi.erro ||
                    "Erro ao carregar campi"
                );
            }


            cursos =
                Array.isArray(
                    dadosCursos
                )
                    ? dadosCursos
                    : [];


            campi =
                Array.isArray(
                    dadosCampi
                )
                    ? dadosCampi
                    : [];


            mostrarStatus(
                ""
            );


            renderizarCursos();


        } catch (erro) {

            console.error(
                "Erro no vínculo curso-campus:",
                erro
            );


            mostrarStatus(
                erro.message ||
                "Não foi possível carregar os dados.",
                "erro"
            );
        }
    }


    // =====================================================
    // OPÇÕES DE CAMPI
    // =====================================================

    function montarOpcoesCampi(
        curso
    ) {

        const ativos =
            campi.filter(
                campus =>
                    campus.ativo
            );


        let html = `

            <option value="">
                Sem campus definido
            </option>
        `;


        ativos
            .forEach(
                campus => {

                    const selecionado =
                        Number(
                            curso.campus_id
                        ) ===
                        Number(
                            campus.id
                        );


                    html += `

                        <option
                            value="${campus.id}"
                            ${
                                selecionado
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${escaparHtml(
                                campus.nome
                            )}
                            ${
                                campus.principal
                                    ? " — Principal"
                                    : ""
                            }
                        </option>
                    `;
                }
            );


        const campusAtualAtivo =
            ativos.some(
                campus =>
                    Number(
                        campus.id
                    ) ===
                    Number(
                        curso.campus_id
                    )
            );


        if (
            curso.campus_id &&
            !campusAtualAtivo
        ) {

            html += `

                <option
                    value="${escaparHtml(
                        curso.campus_id
                    )}"
                    selected
                    disabled
                >
                    ${
                        escaparHtml(
                            curso.campus_nome ||
                            "Campus atual"
                        )
                    } — Inativo
                </option>
            `;
        }


        return html;
    }


    // =====================================================
    // RENDERIZAR
    // =====================================================

    function renderizarCursos() {

        const container =
            document.getElementById(
                "curso-campus-lista"
            );


        if (
            !container
        ) {

            return;
        }


        const filtro =
            (
                document
                    .getElementById(
                        "curso-campus-filtro"
                    )
                    ?.value ||
                ""
            )
                .trim()
                .toLowerCase();


        const lista =
            cursos.filter(
                curso => {

                    if (
                        !filtro
                    ) {

                        return true;
                    }


                    return (
                        String(
                            curso.nome ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                filtro
                            )
                    );
                }
            );


        if (
            cursos.length ===
            0
        ) {

            container.innerHTML = `

                <div class="curso-campus-vazio">

                    <strong>
                        Nenhum curso cadastrado
                    </strong>

                    A instituição ainda não possui cursos
                    disponíveis para vinculação.

                </div>
            `;


            return;
        }


        const campiAtivos =
            campi.filter(
                campus =>
                    campus.ativo
            );


        if (
            campiAtivos.length ===
            0
        ) {

            container.innerHTML = `

                <div class="curso-campus-vazio">

                    <strong>
                        Nenhum campus ativo cadastrado
                    </strong>

                    Cadastre pelo menos um campus antes de
                    vincular os cursos.

                    ${
                        possuiPermissao(
                            "GERENCIAR_CAMPI"
                        )

                            ? `
                                <br>

                                <button
                                    type="button"
                                    id="btn-curso-campus-ir-campi"
                                    class="curso-campus-ir-campi"
                                >
                                    Ir para Campi
                                </button>
                            `

                            : ""
                    }

                </div>
            `;


            const botaoCampi =
                document.getElementById(
                    "btn-curso-campus-ir-campi"
                );


            if (
                botaoCampi
            ) {

                botaoCampi.addEventListener(
                    "click",
                    () => {

                        if (
                            typeof abrirSecao ===
                            "function"
                        ) {

                            abrirSecao(
                                "campi"
                            );
                        }
                    }
                );
            }


            return;
        }


        if (
            lista.length ===
            0
        ) {

            container.innerHTML = `

                <div class="curso-campus-vazio">

                    <strong>
                        Nenhum curso encontrado
                    </strong>

                    Tente outro termo de pesquisa.

                </div>
            `;


            return;
        }


        container.innerHTML =
            lista
                .map(
                    curso => `

                        <div
                            class="curso-campus-item"
                            data-curso-id="${curso.id}"
                        >

                            <div class="curso-campus-info">

                                <strong>
                                    ${escaparHtml(
                                        curso.nome
                                    )}
                                </strong>


                                <span>

                                    ${escaparHtml(
                                        curso.modalidade ||
                                        "-"
                                    )}

                                    ·

                                    ${escaparHtml(
                                        curso.grau_academico ||
                                        "-"
                                    )}

                                </span>

                            </div>


                            <select
                                class="curso-campus-select"
                                data-campus-select="${curso.id}"
                            >

                                ${montarOpcoesCampi(
                                    curso
                                )}

                            </select>


                            <button
                                type="button"
                                class="curso-campus-button"
                                data-salvar-curso="${curso.id}"
                            >
                                Salvar
                            </button>

                        </div>
                    `
                )
                .join("");


        container
            .querySelectorAll(
                "[data-salvar-curso]"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        () => {

                            salvarVinculo(
                                Number(
                                    botao.dataset
                                        .salvarCurso
                                ),
                                botao
                            );
                        }
                    );
                }
            );
    }


    // =====================================================
    // SALVAR VÍNCULO
    // =====================================================

    async function salvarVinculo(
        cursoId,
        botao
    ) {

        const select =
            document.querySelector(
                `[data-campus-select="${cursoId}"]`
            );


        if (
            !select
        ) {

            return;
        }


        const campusId =
            select.value
                ? Number(
                    select.value
                )
                : null;


        botao.disabled =
            true;


        const textoOriginal =
            botao.textContent;


        botao.textContent =
            "Salvando...";


        mostrarStatus(
            ""
        );


        try {

            const resposta =
                await fetch(
                    `/api/cursos/${cursoId}/campus`,
                    {
                        method:
                            "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                campus_id:
                                    campusId
                            })
                    }
                );


            const dados =
                await resposta.json();


            if (
                !resposta.ok
            ) {

                throw new Error(
                    dados.erro ||
                    "Erro ao vincular campus"
                );
            }


            const curso =
                cursos.find(
                    item =>
                        Number(
                            item.id
                        ) ===
                        Number(
                            cursoId
                        )
                );


            if (
                curso
            ) {

                curso.campus_id =
                    campusId;


                const campus =
                    campi.find(
                        item =>
                            Number(
                                item.id
                            ) ===
                            Number(
                                campusId
                            )
                    );


                curso.campus_nome =
                    campus
                        ? campus.nome
                        : null;


                curso.campus_cidade =
                    campus
                        ? campus.cidade
                        : null;


                curso.campus_estado =
                    campus
                        ? campus.estado
                        : null;
            }


            mostrarStatus(
                campusId
                    ? "Campus vinculado ao curso com sucesso."
                    : "Vínculo de campus removido com sucesso.",
                "sucesso"
            );


            renderizarCursos();


        } catch (erro) {

            console.error(
                "Erro ao alterar campus do curso:",
                erro
            );


            mostrarStatus(
                erro.message ||
                "Não foi possível salvar o vínculo.",
                "erro"
            );


        } finally {

            botao.disabled =
                false;


            botao.textContent =
                textoOriginal;
        }
    }


    // =====================================================
    // ATUALIZAR AO ABRIR A ABA
    // =====================================================

    function observarAberturaDaAba() {

        const botaoCursos =
            document.querySelector(
                '.dashboard-nav [data-section="cursos"]'
            );


        if (
            !botaoCursos
        ) {

            return;
        }


        botaoCursos.addEventListener(
            "click",
            () => {

                carregarDados();
            }
        );
    }


    // =====================================================
    // INICIALIZAÇÃO
    // =====================================================

    async function inicializar() {

        try {

            const autorizado =
                await carregarPermissoes();


            if (
                !autorizado
            ) {

                return;
            }


            adicionarEstilos();

            criarPainel();

            observarAberturaDaAba();

            await carregarDados();


        } catch (erro) {

            console.error(
                "Erro ao iniciar gestão curso-campus:",
                erro
            );
        }
    }


    inicializar();

})();