// =========================================================
// SIA - VÍNCULO CURSO <-> CAMPI
//
// Permite que um curso seja ofertado em vários campi
// da mesma instituição.
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


    function obterCampusIdsCurso(
        curso
    ) {

        if (
            Array.isArray(
                curso.campus_ids
            )
        ) {

            return curso.campus_ids
                .map(
                    valor =>
                        Number(
                            valor
                        )
                )
                .filter(
                    valor =>
                        Number.isInteger(
                            valor
                        ) &&
                        valor > 0
                );
        }


        if (
            curso.campus_id
        ) {

            const id =
                Number(
                    curso.campus_id
                );


            if (
                Number.isInteger(
                    id
                ) &&
                id > 0
            ) {

                return [
                    id
                ];
            }
        }


        return [];
    }


    function obterCampiAtivos() {

        return campi
            .filter(
                campus =>
                    campus.ativo
            )
            .sort(
                (
                    a,
                    b
                ) => {

                    if (
                        a.principal &&
                        !b.principal
                    ) {

                        return -1;
                    }


                    if (
                        !a.principal &&
                        b.principal
                    ) {

                        return 1;
                    }


                    return String(
                        a.nome ||
                        ""
                    )
                        .localeCompare(
                            String(
                                b.nome ||
                                ""
                            ),
                            "pt-BR"
                        );
                }
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

                max-width:
                    720px;

                color:
                    #64748b;

                font-size:
                    13px;
            }


            .curso-campus-filtro {

                width:
                    min(340px, 100%);

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


            .curso-campus-status {

                min-height:
                    20px;

                margin-bottom:
                    12px;

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


            .curso-campus-lista {

                display:
                    grid;

                gap:
                    14px;
            }


            .curso-campus-item {

                padding:
                    16px;

                border:
                    1px solid #e2e8f0;

                border-radius:
                    14px;

                background:
                    #f8fafc;
            }


            .curso-campus-item-header {

                display:
                    flex;

                justify-content:
                    space-between;

                align-items:
                    flex-start;

                gap:
                    14px;

                flex-wrap:
                    wrap;
            }


            .curso-campus-info {

                min-width:
                    0;

                flex:
                    1 1 300px;
            }


            .curso-campus-info strong {

                display:
                    block;

                color:
                    #0f172a;

                font-size:
                    15px;
            }


            .curso-campus-info span {

                display:
                    block;

                margin-top:
                    4px;

                color:
                    #64748b;

                font-size:
                    12px;
            }


            .curso-campus-contador {

                display:
                    inline-flex;

                align-items:
                    center;

                padding:
                    5px 9px;

                border:
                    1px solid #ddd6fe;

                border-radius:
                    999px;

                color:
                    #6d28d9;

                background:
                    #f5f3ff;

                font-size:
                    11px;

                font-weight:
                    800;
            }


            .curso-campus-opcoes {

                display:
                    grid;

                grid-template-columns:
                    repeat(
                        auto-fit,
                        minmax(
                            220px,
                            1fr
                        )
                    );

                gap:
                    9px;

                margin-top:
                    14px;
            }


            .curso-campus-opcao {

                display:
                    flex;

                align-items:
                    flex-start;

                gap:
                    9px;

                min-width:
                    0;

                padding:
                    11px;

                border:
                    1px solid #e2e8f0;

                border-radius:
                    10px;

                background:
                    #ffffff;

                cursor:
                    pointer;
            }


            .curso-campus-opcao:hover {

                border-color:
                    #c4b5fd;

                background:
                    #faf8ff;
            }


            .curso-campus-opcao input {

                width:
                    17px;

                height:
                    17px;

                flex:
                    0 0 auto;

                margin-top:
                    1px;

                accent-color:
                    #6d28d9;
            }


            .curso-campus-opcao-conteudo {

                min-width:
                    0;
            }


            .curso-campus-opcao-nome {

                display:
                    block;

                color:
                    #0f172a;

                font-size:
                    13px;

                font-weight:
                    750;
            }


            .curso-campus-opcao-local {

                display:
                    block;

                margin-top:
                    3px;

                color:
                    #64748b;

                font-size:
                    11px;
            }


            .curso-campus-principal {

                display:
                    inline-flex;

                margin-left:
                    5px;

                padding:
                    2px 6px;

                border-radius:
                    999px;

                color:
                    #5b21b6;

                background:
                    #ede9fe;

                font-size:
                    9px;

                font-weight:
                    800;
            }


            .curso-campus-acoes {

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    flex-end;

                gap:
                    8px;

                flex-wrap:
                    wrap;

                margin-top:
                    14px;

                padding-top:
                    13px;

                border-top:
                    1px solid #e2e8f0;
            }


            .curso-campus-button {

                min-height:
                    38px;

                padding:
                    8px 14px;

                border:
                    0;

                border-radius:
                    8px;

                color:
                    #ffffff;

                background:
                    #6d28d9;

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


            .curso-campus-button-secundario {

                min-height:
                    38px;

                padding:
                    8px 12px;

                border:
                    1px solid #d8c6ed;

                border-radius:
                    8px;

                color:
                    #6d28d9;

                background:
                    #ffffff;

                font-weight:
                    700;

                cursor:
                    pointer;
            }


            .curso-campus-button-secundario:hover {

                background:
                    #f8f4ff;
            }


            .curso-campus-vazio {

                padding:
                    28px;

                border:
                    1px dashed #cbd5e1;

                border-radius:
                    12px;

                color:
                    #64748b;

                text-align:
                    center;
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

                color:
                    #6d28d9;

                background:
                    #ffffff;

                font-weight:
                    700;

                cursor:
                    pointer;
            }


            @media (
                max-width: 700px
            ) {

                .curso-campus-acoes {

                    align-items:
                        stretch;

                    flex-direction:
                        column;
                }


                .curso-campus-acoes button {

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
                        Um curso pode ser ofertado em um ou vários
                        campi da instituição.
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
    // PERMISSÕES
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
    // CARREGAR CURSOS E CAMPI
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
    // CAMPUS CHECKBOX
    // =====================================================

    function renderizarCampusOpcao(
        campus,
        curso
    ) {

        const selecionados =
            obterCampusIdsCurso(
                curso
            );


        const marcado =
            selecionados.includes(
                Number(
                    campus.id
                )
            );


        const local =
            [
                campus.cidade,
                campus.estado
            ]
                .filter(
                    Boolean
                )
                .join(
                    " - "
                );


        return `

            <label class="curso-campus-opcao">

                <input
                    type="checkbox"
                    value="${campus.id}"
                    data-curso-campus="${curso.id}"
                    ${
                        marcado
                            ? "checked"
                            : ""
                    }
                >


                <span class="curso-campus-opcao-conteudo">

                    <span class="curso-campus-opcao-nome">

                        ${escaparHtml(
                            campus.nome
                        )}

                        ${
                            campus.principal

                                ? `
                                    <span class="curso-campus-principal">
                                        Principal
                                    </span>
                                `

                                : ""
                        }

                    </span>


                    ${
                        local

                            ? `
                                <span class="curso-campus-opcao-local">
                                    ${escaparHtml(
                                        local
                                    )}
                                </span>
                            `

                            : ""
                    }

                </span>

            </label>
        `;
    }


    // =====================================================
    // RENDERIZAR CURSOS
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


                    const texto =
                        [
                            curso.nome,
                            curso.modalidade,
                            curso.grau_academico
                        ]
                            .filter(
                                Boolean
                            )
                            .join(
                                " "
                            )
                            .toLowerCase();


                    return texto.includes(
                        filtro
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
            obterCampiAtivos();


        if (
            campiAtivos.length ===
            0
        ) {

            container.innerHTML = `

                <div class="curso-campus-vazio">

                    <strong>
                        Nenhum campus ativo cadastrado
                    </strong>

                    Cadastre pelo menos um campus antes
                    de vincular os cursos.

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
                    curso => {

                        const quantidade =
                            obterCampusIdsCurso(
                                curso
                            ).length;


                        return `

                            <article
                                class="curso-campus-item"
                                data-curso-id="${curso.id}"
                            >

                                <div class="curso-campus-item-header">

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


                                    <span
                                        class="curso-campus-contador"
                                        data-contador-curso="${curso.id}"
                                    >
                                        ${
                                            quantidade === 0
                                                ? "Nenhum campus"
                                                : quantidade === 1
                                                    ? "1 campus"
                                                    : `${quantidade} campi`
                                        }
                                    </span>

                                </div>


                                <div class="curso-campus-opcoes">

                                    ${
                                        campiAtivos
                                            .map(
                                                campus =>
                                                    renderizarCampusOpcao(
                                                        campus,
                                                        curso
                                                    )
                                            )
                                            .join("")
                                    }

                                </div>


                                <div class="curso-campus-acoes">

                                    <button
                                        type="button"
                                        class="curso-campus-button-secundario"
                                        data-marcar-todos="${curso.id}"
                                    >
                                        Selecionar todos
                                    </button>


                                    <button
                                        type="button"
                                        class="curso-campus-button-secundario"
                                        data-limpar-campi="${curso.id}"
                                    >
                                        Limpar
                                    </button>


                                    <button
                                        type="button"
                                        class="curso-campus-button"
                                        data-salvar-curso="${curso.id}"
                                    >
                                        Salvar campi
                                    </button>

                                </div>

                            </article>
                        `;
                    }
                )
                .join("");


        registrarEventos();
    }


    // =====================================================
    // EVENTOS DOS CURSOS
    // =====================================================

    function registrarEventos() {

        document
            .querySelectorAll(
                "[data-salvar-curso]"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        () => {

                            salvarVinculos(
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


        document
            .querySelectorAll(
                "[data-marcar-todos]"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        () => {

                            const cursoId =
                                Number(
                                    botao.dataset
                                        .marcarTodos
                                );


                            document
                                .querySelectorAll(
                                    `[data-curso-campus="${cursoId}"]`
                                )
                                .forEach(
                                    checkbox => {

                                        checkbox.checked =
                                            true;
                                    }
                                );


                            atualizarContador(
                                cursoId
                            );
                        }
                    );
                }
            );


        document
            .querySelectorAll(
                "[data-limpar-campi]"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        () => {

                            const cursoId =
                                Number(
                                    botao.dataset
                                        .limparCampi
                                );


                            document
                                .querySelectorAll(
                                    `[data-curso-campus="${cursoId}"]`
                                )
                                .forEach(
                                    checkbox => {

                                        checkbox.checked =
                                            false;
                                    }
                                );


                            atualizarContador(
                                cursoId
                            );
                        }
                    );
                }
            );


        document
            .querySelectorAll(
                "[data-curso-campus]"
            )
            .forEach(
                checkbox => {

                    checkbox.addEventListener(
                        "change",
                        () => {

                            atualizarContador(
                                Number(
                                    checkbox.dataset
                                        .cursoCampus
                                )
                            );
                        }
                    );
                }
            );
    }


    // =====================================================
    // CONTADOR VISUAL
    // =====================================================

    function atualizarContador(
        cursoId
    ) {

        const quantidade =
            document
                .querySelectorAll(
                    `[data-curso-campus="${cursoId}"]:checked`
                )
                .length;


        const contador =
            document.querySelector(
                `[data-contador-curso="${cursoId}"]`
            );


        if (
            !contador
        ) {

            return;
        }


        contador.textContent =
            quantidade === 0
                ? "Nenhum campus"
                : quantidade === 1
                    ? "1 campus"
                    : `${quantidade} campi`;
    }


    // =====================================================
    // OBTER SELEÇÃO DA TELA
    // =====================================================

    function obterCampiSelecionados(
        cursoId
    ) {

        return [
            ...document.querySelectorAll(
                `[data-curso-campus="${cursoId}"]:checked`
            )
        ]
            .map(
                checkbox =>
                    Number(
                        checkbox.value
                    )
            )
            .filter(
                valor =>
                    Number.isInteger(
                        valor
                    ) &&
                    valor > 0
            );
    }


    // =====================================================
    // SALVAR VÍNCULOS
    // =====================================================

    async function salvarVinculos(
        cursoId,
        botao
    ) {

        const campusIds =
            obterCampiSelecionados(
                cursoId
            );


        const textoOriginal =
            botao.textContent;


        botao.disabled =
            true;


        botao.textContent =
            "Salvando...";


        mostrarStatus(
            ""
        );


        try {

            const resposta =
                await fetch(
                    `/api/cursos/${cursoId}/campi`,
                    {
                        method:
                            "PATCH",

                        headers: {

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                campus_ids:
                                    campusIds
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
                    "Erro ao vincular os campi"
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

                curso.campus_ids =
                    [
                        ...campusIds
                    ];


                curso.campus_id =
                    campusIds[0] ||
                    null;


                curso.campi =
                    campi
                        .filter(
                            campus =>
                                campusIds.includes(
                                    Number(
                                        campus.id
                                    )
                                )
                        )
                        .map(
                            campus => ({
                                id:
                                    campus.id,

                                nome:
                                    campus.nome,

                                cidade:
                                    campus.cidade,

                                estado:
                                    campus.estado,

                                principal:
                                    campus.principal
                            })
                        );
            }


            mostrarStatus(
                campusIds.length === 0
                    ? "Todos os vínculos de campus foram removidos."
                    : "Campi do curso atualizados com sucesso.",
                "sucesso"
            );


            renderizarCursos();


        } catch (erro) {

            console.error(
                "Erro ao alterar campi do curso:",
                erro
            );


            mostrarStatus(
                erro.message ||
                "Não foi possível salvar os vínculos.",
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
    // ATUALIZAR AO ABRIR ABA CURSOS
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