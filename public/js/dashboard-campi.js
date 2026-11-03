// =========================================================
// SIA - GERENCIAMENTO DE CAMPI
// =========================================================

(function iniciarModuloCampi() {

    let campi =
        [];

    let campusEdicaoId =
        null;

    let resultadoEnderecoSelecionado =
        null;

    let resultadosPesquisa =
        [];

    let mapa =
        null;

    let marcador =
        null;

    let leafletPromise =
        null;


    const UFS = {

        "acre": "AC",
        "alagoas": "AL",
        "amapa": "AP",
        "amazonas": "AM",
        "bahia": "BA",
        "ceara": "CE",
        "distrito federal": "DF",
        "espirito santo": "ES",
        "goias": "GO",
        "maranhao": "MA",
        "mato grosso": "MT",
        "mato grosso do sul": "MS",
        "minas gerais": "MG",
        "para": "PA",
        "paraiba": "PB",
        "parana": "PR",
        "pernambuco": "PE",
        "piaui": "PI",
        "rio de janeiro": "RJ",
        "rio grande do norte": "RN",
        "rio grande do sul": "RS",
        "rondonia": "RO",
        "roraima": "RR",
        "santa catarina": "SC",
        "sao paulo": "SP",
        "sergipe": "SE",
        "tocantins": "TO"
    };


    // =====================================================
    // UTILITÁRIOS
    // =====================================================

    function escapar(
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


    function normalizarTexto(
        valor
    ) {

        return String(
            valor ??
            ""
        )
            .normalize(
                "NFD"
            )
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .trim()
            .toLowerCase();
    }


    function obterSiglaEstado(
        estado
    ) {

        const texto =
            String(
                estado ??
                ""
            )
                .trim()
                .toUpperCase();


        if (
            texto.length ===
            2
        ) {

            return texto;
        }


        return (
            UFS[
                normalizarTexto(
                    estado
                )
            ] ||
            ""
        );
    }


    function numeroValido(
        valor
    ) {

        const numero =
            Number(
                valor
            );


        return Number.isFinite(
            numero
        )
            ? numero
            : null;
    }


    function formatarEndereco(
        campus
    ) {

        const linha1 = [

            campus.endereco,

            campus.numero

        ]
            .filter(
                Boolean
            )
            .join(
                ", "
            );


        const linha2 = [

            campus.bairro,

            campus.cidade,

            campus.estado

        ]
            .filter(
                Boolean
            )
            .join(
                " - "
            );


        return [

            linha1,

            linha2,

            campus.cep
                ? `CEP ${campus.cep}`
                : null

        ]
            .filter(
                Boolean
            )
            .join(
                " • "
            );
    }


    // =====================================================
    // PERMISSÕES
    // =====================================================

    async function possuiPermissaoCampi() {

        try {

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


            return (
                Array.isArray(
                    dados.permissoes
                ) &&
                dados.permissoes.includes(
                    "GERENCIAR_CAMPI"
                )
            );


        } catch (erro) {

            console.error(
                "Erro ao consultar permissões de campi:",
                erro
            );


            return false;
        }
    }


    // =====================================================
    // ESTILOS
    // =====================================================

    function adicionarEstilos() {

        if (
            document.getElementById(
                "dashboard-campi-style"
            )
        ) {

            return;
        }


        const estilo =
            document.createElement(
                "style"
            );


        estilo.id =
            "dashboard-campi-style";


        estilo.textContent = `

            .campi-toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 16px;
                flex-wrap: wrap;
                margin-bottom: 24px;
            }

            .campi-toolbar p {
                margin: 0;
                color: #64748b;
            }

            .campi-grid {
                display: grid;
                grid-template-columns:
                    repeat(
                        auto-fill,
                        minmax(280px, 1fr)
                    );
                gap: 16px;
            }

            .campus-card {
                border:
                    1px solid #e2e8f0;
                border-radius:
                    14px;
                background:
                    #ffffff;
                padding:
                    18px;
            }

            .campus-card.inativo {
                opacity:
                    0.7;
            }

            .campus-card-header {
                display:
                    flex;
                justify-content:
                    space-between;
                gap:
                    12px;
                align-items:
                    flex-start;
                margin-bottom:
                    10px;
            }

            .campus-card h3 {
                margin:
                    0;
                font-size:
                    17px;
                color:
                    #0f172a;
            }

            .campus-badges {
                display:
                    flex;
                gap:
                    5px;
                flex-wrap:
                    wrap;
                justify-content:
                    flex-end;
            }

            .campus-badge {
                display:
                    inline-flex;
                align-items:
                    center;
                min-height:
                    24px;
                padding:
                    3px 8px;
                border-radius:
                    999px;
                background:
                    #f1f5f9;
                color:
                    #475569;
                font-size:
                    11px;
                font-weight:
                    700;
            }

            .campus-badge.principal {
                background:
                    #eff6ff;
                color:
                    #1d4ed8;
            }

            .campus-badge.ativo {
                background:
                    #f0fdf4;
                color:
                    #15803d;
            }

            .campus-badge.inativo {
                background:
                    #fef2f2;
                color:
                    #b91c1c;
            }

            .campus-endereco {
                color:
                    #475569;
                font-size:
                    13px;
                line-height:
                    1.55;
                margin:
                    10px 0 14px;
            }

            .campus-coordenadas {
                color:
                    #94a3b8;
                font-size:
                    11px;
                margin-bottom:
                    14px;
            }

            .campus-card-actions {
                display:
                    flex;
                gap:
                    8px;
                flex-wrap:
                    wrap;
            }

            .campi-button {
                min-height:
                    40px;
                padding:
                    9px 14px;
                border-radius:
                    9px;
                border:
                    1px solid #cbd5e1;
                background:
                    #ffffff;
                color:
                    #0f172a;
                font-weight:
                    700;
                cursor:
                    pointer;
            }

            .campi-button:hover {
                background:
                    #f8fafc;
            }

            .campi-button.primary {
                border-color:
                    #2563eb;
                background:
                    #2563eb;
                color:
                    #ffffff;
            }

            .campi-button.primary:hover {
                background:
                    #1d4ed8;
            }

            .campi-button.danger {
                border-color:
                    #fecaca;
                color:
                    #b91c1c;
            }

            .campi-button:disabled {
                opacity:
                    0.55;
                cursor:
                    not-allowed;
            }

            .campi-empty {
                padding:
                    32px;
                border:
                    1px dashed #cbd5e1;
                border-radius:
                    14px;
                background:
                    #f8fafc;
                text-align:
                    center;
                color:
                    #64748b;
            }

            .campi-empty strong {
                display:
                    block;
                color:
                    #0f172a;
                margin-bottom:
                    6px;
            }

            .campi-modal-backdrop {
                position:
                    fixed;
                inset:
                    0;
                z-index:
                    9999;
                display:
                    flex;
                align-items:
                    flex-start;
                justify-content:
                    center;
                padding:
                    32px 16px;
                overflow:
                    auto;
                background:
                    rgba(15, 23, 42, 0.58);
            }

            .campi-modal-backdrop.hidden {
                display:
                    none;
            }

            .campi-modal {
                width:
                    min(1040px, 100%);
                background:
                    #ffffff;
                border-radius:
                    16px;
                overflow:
                    hidden;
            }

            .campi-modal-header {
                display:
                    flex;
                align-items:
                    center;
                justify-content:
                    space-between;
                gap:
                    16px;
                padding:
                    20px 22px;
                border-bottom:
                    1px solid #e2e8f0;
            }

            .campi-modal-header h2 {
                margin:
                    0;
            }

            .campi-modal-close {
                width:
                    42px;
                height:
                    42px;
                border:
                    none;
                border-radius:
                    50%;
                background:
                    #f1f5f9;
                cursor:
                    pointer;
                font-size:
                    24px;
            }

            .campi-modal-body {
                padding:
                    22px;
            }

            .campi-search-box {
                margin-bottom:
                    20px;
                padding:
                    16px;
                border:
                    1px solid #e2e8f0;
                border-radius:
                    12px;
                background:
                    #f8fafc;
            }

            .campi-search-box label {
                display:
                    block;
                margin-bottom:
                    7px;
                font-weight:
                    700;
            }

            .campi-search-row {
                display:
                    grid;
                grid-template-columns:
                    minmax(0, 1fr)
                    auto;
                gap:
                    8px;
            }

            .campi-search-row input {
                width:
                    100%;
                box-sizing:
                    border-box;
                min-height:
                    43px;
                border:
                    1px solid #cbd5e1;
                border-radius:
                    9px;
                padding:
                    9px 11px;
                font:
                    inherit;
            }

            .campi-search-results {
                display:
                    grid;
                gap:
                    7px;
                margin-top:
                    10px;
            }

            .campi-search-result {
                width:
                    100%;
                text-align:
                    left;
                padding:
                    10px 12px;
                border:
                    1px solid #e2e8f0;
                border-radius:
                    8px;
                background:
                    #ffffff;
                cursor:
                    pointer;
                line-height:
                    1.4;
            }

            .campi-search-result:hover {
                border-color:
                    #94a3b8;
                background:
                    #f8fafc;
            }

            .campi-form-map-grid {
                display:
                    grid;
                grid-template-columns:
                    minmax(320px, 1fr)
                    minmax(340px, 1fr);
                gap:
                    20px;
                align-items:
                    start;
            }

            .campi-form-grid {
                display:
                    grid;
                grid-template-columns:
                    repeat(2, minmax(0, 1fr));
                gap:
                    14px;
            }

            .campi-field {
                min-width:
                    0;
            }

            .campi-field.wide {
                grid-column:
                    1 / -1;
            }

            .campi-field label {
                display:
                    block;
                margin-bottom:
                    6px;
                font-size:
                    13px;
                font-weight:
                    700;
                color:
                    #334155;
            }

            .campi-field input,
            .campi-field select {
                width:
                    100%;
                box-sizing:
                    border-box;
                min-height:
                    42px;
                padding:
                    9px 10px;
                border:
                    1px solid #cbd5e1;
                border-radius:
                    8px;
                font:
                    inherit;
                color:
                    #0f172a;
                background:
                    #ffffff;
            }

            .campi-field input[readonly] {
                background:
                    #f8fafc;
                color:
                    #64748b;
            }

            .campi-checks {
                display:
                    flex;
                flex-direction:
                    column;
                gap:
                    10px;
                margin-top:
                    16px;
            }

            .campi-checks label {
                display:
                    flex;
                align-items:
                    center;
                gap:
                    8px;
                cursor:
                    pointer;
            }

            .campi-checks input {
                width:
                    18px;
                height:
                    18px;
            }

            .campi-map-box {
                border:
                    1px solid #e2e8f0;
                border-radius:
                    12px;
                overflow:
                    hidden;
                background:
                    #f1f5f9;
            }

            #campi-form-map {
                width:
                    100%;
                height:
                    430px;
            }

            .campi-form-actions {
                display:
                    flex;
                justify-content:
                    flex-end;
                gap:
                    8px;
                flex-wrap:
                    wrap;
                margin-top:
                    22px;
            }

            .campi-message {
                min-height:
                    20px;
                margin:
                    8px 0 14px;
                font-size:
                    13px;
            }

            .campi-message.error {
                color:
                    #b91c1c;
            }

            .campi-message.success {
                color:
                    #15803d;
            }

            @media (
                max-width: 850px
            ) {

                .campi-form-map-grid {
                    grid-template-columns:
                        1fr;
                }

                #campi-form-map {
                    height:
                        330px;
                }
            }

            @media (
                max-width: 560px
            ) {

                .campi-form-grid {
                    grid-template-columns:
                        1fr;
                }

                .campi-field.wide {
                    grid-column:
                        auto;
                }

                .campi-search-row {
                    grid-template-columns:
                        1fr;
                }

                .campi-toolbar {
                    align-items:
                        stretch;
                }

                .campi-toolbar
                .campi-button {
                    width:
                        100%;
                }
            }
        `;


        document.head.appendChild(
            estilo
        );
    }


    // =====================================================
    // CRIAR SEÇÃO
    // =====================================================

    function criarInterface() {

        const nav =
            document.querySelector(
                ".dashboard-nav"
            );


        const main =
            document.querySelector(
                ".institutional-main"
            );


        if (
            !nav ||
            !main ||
            document.getElementById(
                "campi"
            )
        ) {

            return;
        }


        const botao =
            document.createElement(
                "button"
            );


        botao.type =
            "button";

        botao.className =
            "nav-item";

        botao.dataset.section =
            "campi";

        botao.textContent =
            "Campi";


        nav.appendChild(
            botao
        );


        const secao =
            document.createElement(
                "section"
            );


        secao.id =
            "campi";

        secao.className =
            "dashboard-section";


        secao.innerHTML = `

            <div class="section-header">

                <div>

                    <span class="section-eyebrow">
                        Localização institucional
                    </span>

                    <h2>
                        Campi
                    </h2>

                    <p>
                        Cadastre os locais de oferta da instituição
                        e suas coordenadas para uso nos mapas e rotas.
                    </p>

                </div>

            </div>


            <div class="campi-toolbar">

                <p id="campi-resumo">
                    Carregando campi...
                </p>


                <button
                    type="button"
                    id="btn-novo-campus"
                    class="
                        campi-button
                        primary
                    "
                >
                    + Novo campus
                </button>

            </div>


            <div
                id="campi-lista"
                class="campi-grid"
            >

                <div class="campi-empty">
                    Carregando...
                </div>

            </div>
        `;


        main.appendChild(
            secao
        );


        criarModal();


        botao.addEventListener(
            "click",
            () => {

                abrirSecaoCampi();

                carregarCampi();
            }
        );


        document
            .getElementById(
                "btn-novo-campus"
            )
            .addEventListener(
                "click",
                () => {

                    abrirFormularioCampus();
                }
            );
    }


    // =====================================================
    // NAVEGAÇÃO
    // =====================================================

    function abrirSecaoCampi() {

        if (
            typeof abrirSecao ===
            "function"
        ) {

            abrirSecao(
                "campi"
            );

            return;
        }


        document
            .querySelectorAll(
                ".dashboard-nav .nav-item"
            )
            .forEach(
                item => {

                    item.classList.toggle(
                        "active",
                        item.dataset.section ===
                            "campi"
                    );
                }
            );


        document
            .querySelectorAll(
                ".dashboard-section"
            )
            .forEach(
                secao => {

                    secao.classList.toggle(
                        "active",
                        secao.id ===
                            "campi"
                    );
                }
            );
    }


    // =====================================================
    // CRIAR MODAL
    // =====================================================

    function criarModal() {

        if (
            document.getElementById(
                "campi-modal"
            )
        ) {

            return;
        }


        const backdrop =
            document.createElement(
                "div"
            );


        backdrop.id =
            "campi-modal";

        backdrop.className =
            "campi-modal-backdrop hidden";


        backdrop.innerHTML = `

            <div class="campi-modal">

                <div class="campi-modal-header">

                    <div>

                        <span class="section-eyebrow">
                            Localização
                        </span>

                        <h2 id="campi-modal-titulo">
                            Novo campus
                        </h2>

                    </div>


                    <button
                        type="button"
                        id="btn-fechar-campus"
                        class="campi-modal-close"
                        aria-label="Fechar"
                    >
                        ×
                    </button>

                </div>


                <div class="campi-modal-body">

                    <div class="campi-search-box">

                        <label for="campus-pesquisa-endereco">
                            Pesquisar endereço
                        </label>


                        <div class="campi-search-row">

                            <input
                                type="text"
                                id="campus-pesquisa-endereco"
                                maxlength="200"
                                placeholder="Ex.: Universidade Federal de Alagoas, Maceió"
                            >


                            <button
                                type="button"
                                id="btn-campus-pesquisar"
                                class="campi-button"
                            >
                                Pesquisar
                            </button>

                        </div>


                        <div
                            id="campus-resultados-endereco"
                            class="campi-search-results"
                        ></div>

                    </div>


                    <div
                        id="campi-form-mensagem"
                        class="campi-message"
                    ></div>


                    <form id="form-campus">

                        <div class="campi-form-map-grid">

                            <div>

                                <div class="campi-form-grid">


                                    <div class="campi-field wide">

                                        <label for="campus-nome">
                                            Nome do campus
                                        </label>

                                        <input
                                            type="text"
                                            id="campus-nome"
                                            maxlength="200"
                                            required
                                            placeholder="Ex.: Campus A. C. Simões"
                                        >

                                    </div>


                                    <div class="campi-field wide">

                                        <label for="campus-endereco">
                                            Endereço
                                        </label>

                                        <input
                                            type="text"
                                            id="campus-endereco"
                                            maxlength="200"
                                            required
                                        >

                                    </div>


                                    <div class="campi-field">

                                        <label for="campus-numero">
                                            Número
                                        </label>

                                        <input
                                            type="text"
                                            id="campus-numero"
                                            maxlength="30"
                                        >

                                    </div>


                                    <div class="campi-field">

                                        <label for="campus-complemento">
                                            Complemento
                                        </label>

                                        <input
                                            type="text"
                                            id="campus-complemento"
                                            maxlength="100"
                                        >

                                    </div>


                                    <div class="campi-field">

                                        <label for="campus-bairro">
                                            Bairro
                                        </label>

                                        <input
                                            type="text"
                                            id="campus-bairro"
                                            maxlength="100"
                                        >

                                    </div>


                                    <div class="campi-field">

                                        <label for="campus-cep">
                                            CEP
                                        </label>

                                        <input
                                            type="text"
                                            id="campus-cep"
                                            maxlength="15"
                                        >

                                    </div>


                                    <div class="campi-field">

                                        <label for="campus-cidade">
                                            Cidade
                                        </label>

                                        <input
                                            type="text"
                                            id="campus-cidade"
                                            maxlength="100"
                                            required
                                        >

                                    </div>


                                    <div class="campi-field">

                                        <label for="campus-estado">
                                            Estado
                                        </label>

                                        <select
                                            id="campus-estado"
                                            required
                                        >
                                            <option value="">
                                                Selecione
                                            </option>
                                            <option value="AC">AC</option>
                                            <option value="AL">AL</option>
                                            <option value="AP">AP</option>
                                            <option value="AM">AM</option>
                                            <option value="BA">BA</option>
                                            <option value="CE">CE</option>
                                            <option value="DF">DF</option>
                                            <option value="ES">ES</option>
                                            <option value="GO">GO</option>
                                            <option value="MA">MA</option>
                                            <option value="MT">MT</option>
                                            <option value="MS">MS</option>
                                            <option value="MG">MG</option>
                                            <option value="PA">PA</option>
                                            <option value="PB">PB</option>
                                            <option value="PR">PR</option>
                                            <option value="PE">PE</option>
                                            <option value="PI">PI</option>
                                            <option value="RJ">RJ</option>
                                            <option value="RN">RN</option>
                                            <option value="RS">RS</option>
                                            <option value="RO">RO</option>
                                            <option value="RR">RR</option>
                                            <option value="SC">SC</option>
                                            <option value="SP">SP</option>
                                            <option value="SE">SE</option>
                                            <option value="TO">TO</option>
                                        </select>

                                    </div>


                                    <div class="campi-field">

                                        <label for="campus-latitude">
                                            Latitude
                                        </label>

                                        <input
                                            type="text"
                                            id="campus-latitude"
                                            readonly
                                            required
                                        >

                                    </div>


                                    <div class="campi-field">

                                        <label for="campus-longitude">
                                            Longitude
                                        </label>

                                        <input
                                            type="text"
                                            id="campus-longitude"
                                            readonly
                                            required
                                        >

                                    </div>

                                </div>


                                <div class="campi-checks">

                                    <label>

                                        <input
                                            type="checkbox"
                                            id="campus-principal"
                                        >

                                        Campus principal

                                    </label>


                                    <label
                                        id="campus-ativo-wrapper"
                                        class="hidden"
                                    >

                                        <input
                                            type="checkbox"
                                            id="campus-ativo"
                                            checked
                                        >

                                        Campus ativo

                                    </label>

                                </div>

                            </div>


                            <div class="campi-map-box">

                                <div id="campi-form-map"></div>

                            </div>

                        </div>


                        <div class="campi-form-actions">

                            <button
                                type="button"
                                id="btn-cancelar-campus"
                                class="campi-button"
                            >
                                Cancelar
                            </button>


                            <button
                                type="submit"
                                id="btn-salvar-campus"
                                class="
                                    campi-button
                                    primary
                                "
                            >
                                Salvar campus
                            </button>

                        </div>

                    </form>

                </div>

            </div>
        `;


        document.body.appendChild(
            backdrop
        );


        document
            .getElementById(
                "btn-fechar-campus"
            )
            .addEventListener(
                "click",
                fecharFormularioCampus
            );


        document
            .getElementById(
                "btn-cancelar-campus"
            )
            .addEventListener(
                "click",
                fecharFormularioCampus
            );


        document
            .getElementById(
                "btn-campus-pesquisar"
            )
            .addEventListener(
                "click",
                pesquisarEndereco
            );


        document
            .getElementById(
                "campus-pesquisa-endereco"
            )
            .addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        pesquisarEndereco();
                    }
                }
            );


        document
            .getElementById(
                "form-campus"
            )
            .addEventListener(
                "submit",
                salvarCampus
            );


        backdrop.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    backdrop
                ) {

                    fecharFormularioCampus();
                }
            }
        );
    }


    // =====================================================
    // LEAFLET
    // =====================================================

    function carregarLeaflet() {

        if (
            window.L
        ) {

            return Promise.resolve(
                window.L
            );
        }


        if (
            leafletPromise
        ) {

            return leafletPromise;
        }


        leafletPromise =
            new Promise(
                (
                    resolve,
                    reject
                ) => {

                    if (
                        !document.getElementById(
                            "campi-leaflet-css"
                        )
                    ) {

                        const link =
                            document.createElement(
                                "link"
                            );


                        link.id =
                            "campi-leaflet-css";

                        link.rel =
                            "stylesheet";

                        link.href =
                            "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";

                        link.integrity =
                            "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";

                        link.crossOrigin =
                            "anonymous";


                        document.head.appendChild(
                            link
                        );
                    }


                    const script =
                        document.createElement(
                            "script"
                        );


                    script.id =
                        "campi-leaflet-js";

                    script.src =
                        "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";

                    script.integrity =
                        "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";

                    script.crossOrigin =
                        "anonymous";


                    script.onload =
                        () => {

                            resolve(
                                window.L
                            );
                        };


                    script.onerror =
                        () => {

                            reject(
                                new Error(
                                    "Não foi possível carregar o mapa"
                                )
                            );
                        };


                    document.body.appendChild(
                        script
                    );
                }
            );


        return leafletPromise;
    }


    // =====================================================
    // MAPA DO FORMULÁRIO
    // =====================================================

    async function criarMapa(
        latitude = -14.235,
        longitude = -51.9253,
        zoom = 4
    ) {

        try {

            const L =
                await carregarLeaflet();


            const elemento =
                document.getElementById(
                    "campi-form-map"
                );


            if (!elemento) {

                return;
            }


            if (
                mapa
            ) {

                mapa.remove();

                mapa =
                    null;
            }


            mapa =
                L.map(
                    elemento
                )
                    .setView(
                        [
                            Number(
                                latitude
                            ),
                            Number(
                                longitude
                            )
                        ],
                        zoom
                    );


            L.tileLayer(
                "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                    maxZoom:
                        19,

                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }
            )
                .addTo(
                    mapa
                );


            if (
                zoom >
                4
            ) {

                atualizarMarcador(
                    latitude,
                    longitude
                );
            }


            window.setTimeout(
                () => {

                    if (
                        mapa
                    ) {

                        mapa.invalidateSize();
                    }
                },
                100
            );


        } catch (erro) {

            console.error(
                "Erro ao iniciar mapa de campus:",
                erro
            );


            mostrarMensagem(
                "Não foi possível carregar o mapa.",
                "error"
            );
        }
    }


    function atualizarMarcador(
        latitude,
        longitude
    ) {

        if (
            !mapa ||
            !window.L
        ) {

            return;
        }


        const lat =
            Number(
                latitude
            );

        const lon =
            Number(
                longitude
            );


        if (
            !Number.isFinite(
                lat
            ) ||
            !Number.isFinite(
                lon
            )
        ) {

            return;
        }


        if (
            marcador
        ) {

            marcador.remove();
        }


        marcador =
            window.L
                .marker(
                    [
                        lat,
                        lon
                    ]
                )
                .addTo(
                    mapa
                );


        mapa.setView(
            [
                lat,
                lon
            ],
            16
        );
    }


    // =====================================================
    // LISTAR CAMPI
    // =====================================================

    async function carregarCampi() {

        const lista =
            document.getElementById(
                "campi-lista"
            );


        const resumo =
            document.getElementById(
                "campi-resumo"
            );


        if (
            !lista ||
            !resumo
        ) {

            return;
        }


        lista.innerHTML = `

            <div class="campi-empty">
                Carregando campi...
            </div>
        `;


        try {

            const resposta =
                await fetch(
                    "/api/campi/minha-instituicao"
                );


            const dados =
                await resposta.json();


            if (
                !resposta.ok
            ) {

                throw new Error(
                    dados.erro ||
                    "Erro ao carregar campi"
                );
            }


            campi =
                Array.isArray(
                    dados
                )
                    ? dados
                    : [];


            renderizarCampi();


        } catch (erro) {

            console.error(
                "Erro ao carregar campi:",
                erro
            );


            resumo.textContent =
                "Não foi possível carregar os campi.";


            lista.innerHTML = `

                <div class="campi-empty">

                    <strong>
                        Erro ao carregar campi
                    </strong>

                    ${escapar(
                        erro.message
                    )}

                </div>
            `;
        }
    }


    function renderizarCampi() {

        const lista =
            document.getElementById(
                "campi-lista"
            );


        const resumo =
            document.getElementById(
                "campi-resumo"
            );


        if (
            !lista ||
            !resumo
        ) {

            return;
        }


        const ativos =
            campi.filter(
                campus =>
                    campus.ativo
            );


        resumo.textContent =
            `${campi.length} ${
                campi.length === 1
                    ? "campus cadastrado"
                    : "campi cadastrados"
            } • ${ativos.length} ativos`;


        if (
            campi.length ===
            0
        ) {

            lista.innerHTML = `

                <div class="campi-empty">

                    <strong>
                        Nenhum campus cadastrado
                    </strong>

                    Cadastre o primeiro campus para habilitar
                    localização, mapas e cálculo de rotas.

                </div>
            `;


            return;
        }


        lista.innerHTML =
            campi
                .map(
                    campus => `

                        <article
                            class="
                                campus-card
                                ${
                                    campus.ativo
                                        ? ""
                                        : "inativo"
                                }
                            "
                        >

                            <div class="campus-card-header">

                                <h3>
                                    ${escapar(
                                        campus.nome
                                    )}
                                </h3>


                                <div class="campus-badges">

                                    ${
                                        campus.principal

                                            ? `
                                                <span
                                                    class="
                                                        campus-badge
                                                        principal
                                                    "
                                                >
                                                    Principal
                                                </span>
                                            `

                                            : ""
                                    }


                                    <span
                                        class="
                                            campus-badge
                                            ${
                                                campus.ativo
                                                    ? "ativo"
                                                    : "inativo"
                                            }
                                        "
                                    >
                                        ${
                                            campus.ativo
                                                ? "Ativo"
                                                : "Inativo"
                                        }
                                    </span>

                                </div>

                            </div>


                            <div class="campus-endereco">

                                ${escapar(
                                    formatarEndereco(
                                        campus
                                    )
                                )}

                            </div>


                            <div class="campus-coordenadas">

                                ${escapar(
                                    campus.latitude
                                )},

                                ${escapar(
                                    campus.longitude
                                )}

                            </div>


                            <div class="campus-card-actions">

                                <button
                                    type="button"
                                    class="campi-button"
                                    data-editar-campus="${campus.id}"
                                >
                                    Editar
                                </button>

                            </div>

                        </article>
                    `
                )
                .join("");


        lista
            .querySelectorAll(
                "[data-editar-campus]"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        () => {

                            const id =
                                Number(
                                    botao.dataset
                                        .editarCampus
                                );


                            const campus =
                                campi.find(
                                    item =>
                                        Number(
                                            item.id
                                        ) ===
                                        id
                                );


                            if (
                                campus
                            ) {

                                abrirFormularioCampus(
                                    campus
                                );
                            }
                        }
                    );
                }
            );
    }


    // =====================================================
    // FORMULÁRIO
    // =====================================================

    function limparFormulario() {

        campusEdicaoId =
            null;

        resultadoEnderecoSelecionado =
            null;

        resultadosPesquisa =
            [];


        document
            .getElementById(
                "form-campus"
            )
            .reset();


        document
            .getElementById(
                "campus-latitude"
            )
            .value =
            "";


        document
            .getElementById(
                "campus-longitude"
            )
            .value =
            "";


        document
            .getElementById(
                "campus-resultados-endereco"
            )
            .innerHTML =
            "";


        document
            .getElementById(
                "campus-pesquisa-endereco"
            )
            .value =
            "";


        document
            .getElementById(
                "campus-ativo"
            )
            .checked =
            true;


        document
            .getElementById(
                "campus-ativo-wrapper"
            )
            .classList
            .add(
                "hidden"
            );


        mostrarMensagem(
            ""
        );
    }


    async function abrirFormularioCampus(
        campus = null
    ) {

        limparFormulario();


        const modal =
            document.getElementById(
                "campi-modal"
            );


        const titulo =
            document.getElementById(
                "campi-modal-titulo"
            );


        modal.classList.remove(
            "hidden"
        );


        document.body.style.overflow =
            "hidden";


        if (
            campus
        ) {

            campusEdicaoId =
                Number(
                    campus.id
                );


            titulo.textContent =
                "Editar campus";


            document
                .getElementById(
                    "campus-ativo-wrapper"
                )
                .classList
                .remove(
                    "hidden"
                );


            document
                .getElementById(
                    "campus-nome"
                )
                .value =
                campus.nome ||
                "";


            document
                .getElementById(
                    "campus-endereco"
                )
                .value =
                campus.endereco ||
                "";


            document
                .getElementById(
                    "campus-numero"
                )
                .value =
                campus.numero ||
                "";


            document
                .getElementById(
                    "campus-complemento"
                )
                .value =
                campus.complemento ||
                "";


            document
                .getElementById(
                    "campus-bairro"
                )
                .value =
                campus.bairro ||
                "";


            document
                .getElementById(
                    "campus-cidade"
                )
                .value =
                campus.cidade ||
                "";


            document
                .getElementById(
                    "campus-estado"
                )
                .value =
                campus.estado ||
                "";


            document
                .getElementById(
                    "campus-cep"
                )
                .value =
                campus.cep ||
                "";


            document
                .getElementById(
                    "campus-latitude"
                )
                .value =
                campus.latitude ||
                "";


            document
                .getElementById(
                    "campus-longitude"
                )
                .value =
                campus.longitude ||
                "";


            document
                .getElementById(
                    "campus-principal"
                )
                .checked =
                Boolean(
                    campus.principal
                );


            document
                .getElementById(
                    "campus-ativo"
                )
                .checked =
                Boolean(
                    campus.ativo
                );


            await criarMapa(
                campus.latitude,
                campus.longitude,
                16
            );


        } else {

            titulo.textContent =
                "Novo campus";


            const existePrincipal =
                campi.some(
                    item =>
                        item.principal &&
                        item.ativo
                );


            document
                .getElementById(
                    "campus-principal"
                )
                .checked =
                !existePrincipal;


            await criarMapa();
        }
    }


    function fecharFormularioCampus() {

        const modal =
            document.getElementById(
                "campi-modal"
            );


        if (
            modal
        ) {

            modal.classList.add(
                "hidden"
            );
        }


        if (
            mapa
        ) {

            mapa.remove();

            mapa =
                null;
        }


        marcador =
            null;


        document.body.style.overflow =
            "";
    }


    // =====================================================
    // PESQUISAR ENDEREÇO
    // =====================================================

    async function pesquisarEndereco() {

        const input =
            document.getElementById(
                "campus-pesquisa-endereco"
            );


        const botao =
            document.getElementById(
                "btn-campus-pesquisar"
            );


        const container =
            document.getElementById(
                "campus-resultados-endereco"
            );


        const consulta =
            input.value
                .trim();


        if (
            consulta.length <
            3
        ) {

            mostrarMensagem(
                "Digite pelo menos 3 caracteres para pesquisar.",
                "error"
            );


            return;
        }


        botao.disabled =
            true;

        botao.textContent =
            "Pesquisando...";


        container.innerHTML =
            "";


        mostrarMensagem(
            "Pesquisando endereço..."
        );


        try {

            const resposta =
                await fetch(
                    "/api/mapa/buscar-endereco?q=" +
                    encodeURIComponent(
                        consulta
                    )
                );


            const dados =
                await resposta.json();


            if (
                !resposta.ok
            ) {

                throw new Error(
                    dados.erro ||
                    "Erro ao pesquisar endereço"
                );
            }


            resultadosPesquisa =
                Array.isArray(
                    dados.resultados
                )
                    ? dados.resultados
                    : [];


            if (
                resultadosPesquisa.length ===
                0
            ) {

                mostrarMensagem(
                    "Nenhum endereço encontrado.",
                    "error"
                );


                return;
            }


            container.innerHTML =
                resultadosPesquisa
                    .map(
                        (
                            resultado,
                            indice
                        ) => `

                            <button
                                type="button"
                                class="campi-search-result"
                                data-endereco-index="${indice}"
                            >
                                ${escapar(
                                    resultado.nome
                                )}
                            </button>
                        `
                    )
                    .join("");


            container
                .querySelectorAll(
                    "[data-endereco-index]"
                )
                .forEach(
                    item => {

                        item.addEventListener(
                            "click",
                            () => {

                                const indice =
                                    Number(
                                        item.dataset
                                            .enderecoIndex
                                    );


                                selecionarEndereco(
                                    resultadosPesquisa[
                                        indice
                                    ]
                                );
                            }
                        );
                    }
                );


            mostrarMensagem(
                "Selecione o endereço correto na lista."
            );


        } catch (erro) {

            console.error(
                "Erro ao pesquisar endereço:",
                erro
            );


            mostrarMensagem(
                erro.message ||
                "Erro ao pesquisar endereço.",
                "error"
            );


        } finally {

            botao.disabled =
                false;

            botao.textContent =
                "Pesquisar";
        }
    }


    function selecionarEndereco(
        resultado
    ) {

        if (
            !resultado
        ) {

            return;
        }


        resultadoEnderecoSelecionado =
            resultado;


        const endereco =
            resultado.endereco ||
            {};


        const nomeInicial =
            String(
                resultado.nome ||
                ""
            )
                .split(
                    ","
                )[0]
                .trim();


        if (
            !document
                .getElementById(
                    "campus-nome"
                )
                .value
                .trim()
        ) {

            document
                .getElementById(
                    "campus-nome"
                )
                .value =
                nomeInicial;
        }


        document
            .getElementById(
                "campus-endereco"
            )
            .value =
            endereco.rua ||
            nomeInicial;


        document
            .getElementById(
                "campus-bairro"
            )
            .value =
            endereco.bairro ||
            "";


        document
            .getElementById(
                "campus-cidade"
            )
            .value =
            endereco.cidade ||
            "";


        document
            .getElementById(
                "campus-estado"
            )
            .value =
            obterSiglaEstado(
                endereco.estado
            );


        document
            .getElementById(
                "campus-cep"
            )
            .value =
            endereco.cep ||
            "";


        document
            .getElementById(
                "campus-latitude"
            )
            .value =
            resultado.latitude;


        document
            .getElementById(
                "campus-longitude"
            )
            .value =
            resultado.longitude;


        document
            .getElementById(
                "campus-resultados-endereco"
            )
            .innerHTML =
            "";


        document
            .getElementById(
                "campus-pesquisa-endereco"
            )
            .value =
            resultado.nome;


        atualizarMarcador(
            resultado.latitude,
            resultado.longitude
        );


        mostrarMensagem(
            "Localização selecionada. Confira os dados antes de salvar.",
            "success"
        );
    }


    // =====================================================
    // MENSAGEM
    // =====================================================

    function mostrarMensagem(
        mensagem,
        tipo = ""
    ) {

        const elemento =
            document.getElementById(
                "campi-form-mensagem"
            );


        if (
            !elemento
        ) {

            return;
        }


        elemento.className =
            "campi-message";


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
    // SALVAR
    // =====================================================

    async function salvarCampus(
        event
    ) {

        event.preventDefault();


        const latitude =
            numeroValido(
                document
                    .getElementById(
                        "campus-latitude"
                    )
                    .value
            );


        const longitude =
            numeroValido(
                document
                    .getElementById(
                        "campus-longitude"
                    )
                    .value
            );


        if (
            latitude === null ||
            longitude === null
        ) {

            mostrarMensagem(
                "Pesquise e selecione o endereço do campus antes de salvar.",
                "error"
            );


            return;
        }


        const estado =
            document
                .getElementById(
                    "campus-estado"
                )
                .value;


        if (
            estado.length !==
            2
        ) {

            mostrarMensagem(
                "Selecione o estado.",
                "error"
            );


            return;
        }


        const payload = {

            nome:
                document
                    .getElementById(
                        "campus-nome"
                    )
                    .value
                    .trim(),

            endereco:
                document
                    .getElementById(
                        "campus-endereco"
                    )
                    .value
                    .trim(),

            numero:
                document
                    .getElementById(
                        "campus-numero"
                    )
                    .value
                    .trim(),

            complemento:
                document
                    .getElementById(
                        "campus-complemento"
                    )
                    .value
                    .trim(),

            bairro:
                document
                    .getElementById(
                        "campus-bairro"
                    )
                    .value
                    .trim(),

            cidade:
                document
                    .getElementById(
                        "campus-cidade"
                    )
                    .value
                    .trim(),

            estado,

            cep:
                document
                    .getElementById(
                        "campus-cep"
                    )
                    .value
                    .trim(),

            latitude,

            longitude,

            principal:
                document
                    .getElementById(
                        "campus-principal"
                    )
                    .checked
        };


        if (
            campusEdicaoId !==
            null
        ) {

            payload.ativo =
                document
                    .getElementById(
                        "campus-ativo"
                    )
                    .checked;
        }


        if (
            !payload.nome ||
            !payload.endereco ||
            !payload.cidade
        ) {

            mostrarMensagem(
                "Preencha nome, endereço e cidade.",
                "error"
            );


            return;
        }


        const botao =
            document.getElementById(
                "btn-salvar-campus"
            );


        botao.disabled =
            true;

        botao.textContent =
            "Salvando...";


        try {

            const editando =
                campusEdicaoId !==
                null;


            const resposta =
                await fetch(
                    editando

                        ? `/api/campi/${campusEdicaoId}`

                        : "/api/campi",

                    {
                        method:
                            editando
                                ? "PATCH"
                                : "POST",

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


            if (
                !resposta.ok
            ) {

                throw new Error(
                    dados.erro ||
                    "Erro ao salvar campus"
                );
            }


            mostrarMensagem(
                editando
                    ? "Campus atualizado com sucesso."
                    : "Campus cadastrado com sucesso.",
                "success"
            );


            await carregarCampi();


            window.setTimeout(
                fecharFormularioCampus,
                500
            );


        } catch (erro) {

            console.error(
                "Erro ao salvar campus:",
                erro
            );


            mostrarMensagem(
                erro.message ||
                "Não foi possível salvar o campus.",
                "error"
            );


        } finally {

            botao.disabled =
                false;

            botao.textContent =
                "Salvar campus";
        }
    }


    // =====================================================
    // INICIALIZAÇÃO
    // =====================================================

    async function inicializar() {

        adicionarEstilos();


        const permitido =
            await possuiPermissaoCampi();


        if (
            !permitido
        ) {

            return;
        }


        criarInterface();
    }


    inicializar();

})();