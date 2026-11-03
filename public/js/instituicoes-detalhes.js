// =========================================================
// SIA - DETALHES PÚBLICOS DAS INSTITUIÇÕES
// =========================================================


// =========================================================
// ESTADO DO MAPA / MOBILIDADE
// =========================================================

let mapaInstituicao = null;

let marcadorDestinoInstituicao = null;

let marcadorOrigemInstituicao = null;

let camadaRotaInstituicao = null;

let campiInstituicao = [];

let campusAtualInstituicao = null;

let origemAtualInstituicao = null;

let resultadosEnderecoInstituicao = [];

let rotasInstituicao = [];

let leafletPromiseInstituicao = null;


// =========================================================
// SEGURANÇA
// =========================================================

function escaparHtmlDetalhe(
    valor
) {

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

function formatarInteiroDetalhe(
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
        Number(
            valor
        );


    if (
        !Number.isFinite(
            numero
        )
    ) {

        return "-";
    }


    return numero.toLocaleString(
        "pt-BR"
    );
}


function formatarNumeroDetalhe(
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
        Number(
            valor
        );


    if (
        !Number.isFinite(
            numero
        )
    ) {

        return "-";
    }


    return numero.toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits:
                casas,

            maximumFractionDigits:
                casas
        }
    );
}


function formatarPercentualDetalhe(
    valor
) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return "-";
    }


    return (
        formatarNumeroDetalhe(
            valor,
            1
        ) +
        "%"
    );
}


function formatarDuracaoMobilidade(
    minutos
) {

    const total =
        Number(
            minutos
        );


    if (
        !Number.isFinite(
            total
        )
    ) {

        return "-";
    }


    if (
        total < 60
    ) {

        return `${Math.round(total)} min`;
    }


    const horas =
        Math.floor(
            total / 60
        );


    const minutosRestantes =
        Math.round(
            total % 60
        );


    if (
        minutosRestantes === 0
    ) {

        return `${horas} h`;
    }


    return `${horas} h ${minutosRestantes} min`;
}


function formatarEnderecoCampus(
    campus
) {

    if (!campus) {

        return "";
    }


    const primeiraLinha = [

        campus.endereco,

        campus.numero

    ]
        .filter(
            Boolean
        )
        .join(
            ", "
        );


    const segundaLinha = [

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


    const partes = [

        primeiraLinha,

        segundaLinha,

        campus.cep
            ? `CEP ${campus.cep}`
            : null

    ]
        .filter(
            Boolean
        );


    return partes.join(
        " • "
    );
}


// =========================================================
// ESTILOS DA ÁREA DE MOBILIDADE
// =========================================================

function carregarEstilosMobilidade() {

    if (
        document.getElementById(
            "sia-mobilidade-estilos"
        )
    ) {

        return;
    }


    const estilo =
        document.createElement(
            "style"
        );


    estilo.id =
        "sia-mobilidade-estilos";


    estilo.textContent = `

        .ies-mobility-grid {
            display: grid;
            grid-template-columns:
                minmax(280px, 0.9fr)
                minmax(360px, 1.4fr);
            gap: 20px;
            margin-top: 18px;
            align-items: stretch;
        }

        .ies-mobility-panel {
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 18px;
            background: #ffffff;
        }

        .ies-mobility-panel h4 {
            margin: 0 0 14px;
            font-size: 16px;
        }

        .ies-mobility-field {
            margin-bottom: 16px;
        }

        .ies-mobility-field label {
            display: block;
            margin-bottom: 6px;
            font-size: 13px;
            font-weight: 700;
            color: #334155;
        }

        .ies-mobility-field select,
        .ies-mobility-field input {
            width: 100%;
            box-sizing: border-box;
            min-height: 42px;
            padding: 9px 11px;
            border: 1px solid #cbd5e1;
            border-radius: 9px;
            background: #ffffff;
            font: inherit;
            color: #0f172a;
        }

        .ies-mobility-field select:focus,
        .ies-mobility-field input:focus {
            outline: 2px solid rgba(37, 99, 235, 0.18);
            border-color: #2563eb;
        }

        .ies-campus-address {
            padding: 11px 12px;
            margin-bottom: 16px;
            border-radius: 10px;
            background: #f8fafc;
            color: #475569;
            font-size: 13px;
            line-height: 1.5;
        }

        .ies-mobility-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }

        .ies-mobility-button {
            min-height: 40px;
            padding: 9px 13px;
            border: 1px solid #cbd5e1;
            border-radius: 9px;
            background: #ffffff;
            color: #0f172a;
            font-weight: 700;
            cursor: pointer;
        }

        .ies-mobility-button:hover {
            background: #f8fafc;
        }

        .ies-mobility-button-primary {
            border-color: #2563eb;
            background: #2563eb;
            color: #ffffff;
        }

        .ies-mobility-button-primary:hover {
            background: #1d4ed8;
        }

        .ies-mobility-button:disabled {
            cursor: not-allowed;
            opacity: 0.55;
        }

        .ies-address-search {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 8px;
        }

        .ies-address-results {
            display: grid;
            gap: 7px;
            margin-top: 8px;
        }

        .ies-address-result {
            width: 100%;
            text-align: left;
            padding: 10px;
            border: 1px solid #e2e8f0;
            border-radius: 9px;
            background: #ffffff;
            color: #334155;
            cursor: pointer;
            line-height: 1.35;
        }

        .ies-address-result:hover {
            background: #f8fafc;
        }

        .ies-map-wrapper {
            min-width: 0;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            overflow: hidden;
            background: #f1f5f9;
        }

        #ies-campus-map {
            width: 100%;
            min-height: 430px;
            height: 100%;
        }

        .ies-mobility-status {
            min-height: 20px;
            margin-top: 10px;
            font-size: 13px;
            color: #64748b;
        }

        .ies-mobility-status.error {
            color: #b91c1c;
        }

        .ies-mobility-status.success {
            color: #15803d;
        }

        .ies-route-results {
            display: grid;
            gap: 8px;
            margin-top: 16px;
        }

        .ies-route-card {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 12px;
            align-items: center;
            width: 100%;
            text-align: left;
            padding: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background: #ffffff;
            cursor: pointer;
            color: #0f172a;
        }

        .ies-route-card:hover {
            border-color: #94a3b8;
            background: #f8fafc;
        }

        .ies-route-card.active {
            border-color: #2563eb;
            background: #eff6ff;
        }

        .ies-route-card strong {
            display: block;
            margin-bottom: 3px;
        }

        .ies-route-card small {
            color: #64748b;
        }

        .ies-route-time {
            font-weight: 800;
            white-space: nowrap;
        }

        .ies-route-unavailable {
            padding: 11px;
            border: 1px dashed #cbd5e1;
            border-radius: 9px;
            color: #64748b;
            font-size: 13px;
        }

        .ies-mobility-empty {
            padding: 20px;
            border: 1px dashed #cbd5e1;
            border-radius: 12px;
            background: #f8fafc;
        }

        .ies-mobility-empty strong {
            display: block;
            margin-bottom: 6px;
        }

        .ies-origin-current {
            margin-top: 10px;
            padding: 9px 11px;
            border-radius: 8px;
            background: #f0fdf4;
            color: #166534;
            font-size: 13px;
        }

        @media (max-width: 850px) {

            .ies-mobility-grid {
                grid-template-columns: 1fr;
            }

            #ies-campus-map {
                min-height: 340px;
            }
        }

        @media (max-width: 520px) {

            .ies-address-search {
                grid-template-columns: 1fr;
            }

            .ies-mobility-actions {
                flex-direction: column;
            }

            .ies-mobility-button {
                width: 100%;
            }

            #ies-campus-map {
                min-height: 300px;
            }
        }
    `;


    document.head.appendChild(
        estilo
    );
}


// =========================================================
// LEAFLET
// =========================================================

function carregarLeaflet() {

    if (
        window.L
    ) {

        return Promise.resolve(
            window.L
        );
    }


    if (
        leafletPromiseInstituicao
    ) {

        return leafletPromiseInstituicao;
    }


    leafletPromiseInstituicao =
        new Promise(
            (
                resolve,
                reject
            ) => {

                if (
                    !document.getElementById(
                        "leaflet-css-sia"
                    )
                ) {

                    const link =
                        document.createElement(
                            "link"
                        );


                    link.id =
                        "leaflet-css-sia";

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


                const existente =
                    document.getElementById(
                        "leaflet-js-sia"
                    );


                if (
                    existente
                ) {

                    existente.addEventListener(
                        "load",
                        () => {

                            resolve(
                                window.L
                            );
                        },
                        {
                            once: true
                        }
                    );


                    existente.addEventListener(
                        "error",
                        reject,
                        {
                            once: true
                        }
                    );


                    return;
                }


                const script =
                    document.createElement(
                        "script"
                    );


                script.id =
                    "leaflet-js-sia";

                script.src =
                    "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";

                script.integrity =
                    "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";

                script.crossOrigin =
                    "anonymous";


                script.addEventListener(
                    "load",
                    () => {

                        resolve(
                            window.L
                        );
                    }
                );


                script.addEventListener(
                    "error",
                    () => {

                        reject(
                            new Error(
                                "Não foi possível carregar o mapa"
                            )
                        );
                    }
                );


                document.body.appendChild(
                    script
                );
            }
        );


    return leafletPromiseInstituicao;
}


// =========================================================
// DESTRUIR MAPA
// =========================================================

function destruirMapaInstituicao() {

    if (
        mapaInstituicao
    ) {

        mapaInstituicao.remove();

        mapaInstituicao =
            null;
    }


    marcadorDestinoInstituicao =
        null;

    marcadorOrigemInstituicao =
        null;

    camadaRotaInstituicao =
        null;

    campiInstituicao =
        [];

    campusAtualInstituicao =
        null;

    origemAtualInstituicao =
        null;

    resultadosEnderecoInstituicao =
        [];

    rotasInstituicao =
        [];
}


// =========================================================
// CRIAR MODAL
// =========================================================

function criarModalInstituicao() {

    if (
        document.getElementById(
            "ies-modal-backdrop"
        )
    ) {

        return;
    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "ies-modal-backdrop";


    modal.className =
        "ies-modal-backdrop hidden";


    modal.innerHTML = `

        <div
            class="ies-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Detalhes da instituição"
        >

            <div
                id="ies-modal-conteudo"
            ></div>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                fecharModalInstituicao();
            }
        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                fecharModalInstituicao();
            }
        }
    );
}


// =========================================================
// FECHAR
// =========================================================

function fecharModalInstituicao() {

    const modal =
        document.getElementById(
            "ies-modal-backdrop"
        );


    if (!modal) {

        return;
    }


    destruirMapaInstituicao();


    modal.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";
}


// =========================================================
// EXTRAIR CÓDIGO DO CARD
// =========================================================

function obterCodigoIesDoCard(
    card
) {

    const texto =
        card.textContent ||
        "";


    const resultado =
        texto.match(
            /Código IES:\s*([^\s]+)/i
        );


    if (!resultado) {

        return null;
    }


    return resultado[1]
        .trim();
}


// =========================================================
// RENDERIZAR CURSOS
// =========================================================

function renderizarCursosInstituicao(
    cursos
) {

    if (
        !Array.isArray(
            cursos
        ) ||
        cursos.length ===
            0
    ) {

        return `

            <div class="empty-state">

                <h3>
                    Nenhum curso encontrado
                </h3>

                <p>
                    Não há cursos ativos disponíveis
                    para esta instituição.
                </p>

            </div>
        `;
    }


    return `

        <div class="ies-courses-list">

            ${cursos
                .map(
                    curso => `

                        <article class="ies-course-item">

                            <h4>

                                ${escaparHtmlDetalhe(
                                    curso.nome
                                )}

                            </h4>


                            <p>

                                Código Inep:

                                ${escaparHtmlDetalhe(
                                    curso.codigo_inep ||
                                    "-"
                                )}

                            </p>


                            <div class="ies-course-tags">

                                ${
                                    curso.grau_academico

                                        ? `

                                            <span>

                                                ${escaparHtmlDetalhe(
                                                    curso.grau_academico
                                                )}

                                            </span>
                                        `

                                        : ""
                                }


                                ${
                                    curso.modalidade

                                        ? `

                                            <span>

                                                ${escaparHtmlDetalhe(
                                                    curso.modalidade
                                                )}

                                            </span>
                                        `

                                        : ""
                                }


                                ${
                                    curso.cpc_faixa !==
                                        null &&
                                    curso.cpc_faixa !==
                                        undefined

                                        ? `

                                            <span>

                                                CPC:
                                                ${escaparHtmlDetalhe(
                                                    curso.cpc_faixa
                                                )}

                                            </span>
                                        `

                                        : ""
                                }


                                ${
                                    curso.conceito_enade_faixa !==
                                        null &&
                                    curso.conceito_enade_faixa !==
                                        undefined

                                        ? `

                                            <span>

                                                Enade:
                                                ${escaparHtmlDetalhe(
                                                    curso.conceito_enade_faixa
                                                )}

                                            </span>
                                        `

                                        : ""
                                }

                            </div>

                        </article>
                    `
                )
                .join("")}

        </div>
    `;
}


// =========================================================
// SEÇÃO "COMO CHEGAR"
// =========================================================

function renderizarSecaoMobilidade() {

    return `

        <section class="ies-detail-section">

            <h3>
                Como chegar
            </h3>

            <p>
                Consulte a localização dos campi e compare
                distância e tempo estimados de carro,
                caminhada ou bicicleta.
            </p>

            <div
                id="ies-mobility-content"
            >

                <div class="ies-loading">
                    Carregando localização dos campi...
                </div>

            </div>

        </section>
    `;
}


// =========================================================
// RENDERIZAR DETALHES
// =========================================================

function renderizarDetalheInstituicao(
    dados
) {

    const instituicao =
        dados.instituicao;


    const cursosResumo =
        dados.resumo_cursos ||
        {};


    const igc =
        dados.igc;


    const trajetoria =
        dados.trajetoria;


    const sigla =
        instituicao.sigla ||
        "IES";


    const conteudo =
        document.getElementById(
            "ies-modal-conteudo"
        );


    conteudo.innerHTML = `

        <div class="ies-modal-header">

            <div class="ies-modal-title">

                <div class="ies-modal-logo">

                    ${escaparHtmlDetalhe(
                        sigla
                    )}

                </div>


                <div>

                    <h2>

                        ${escaparHtmlDetalhe(
                            instituicao.nome
                        )}

                    </h2>


                    <p>

                        ${escaparHtmlDetalhe(
                            instituicao.cidade
                        )}

                        -

                        ${escaparHtmlDetalhe(
                            instituicao.estado
                        )}

                        •

                        Código IES:

                        ${escaparHtmlDetalhe(
                            instituicao.codigo
                        )}

                    </p>

                </div>

            </div>


            <button
                type="button"
                class="ies-modal-close"
                id="btn-fechar-ies"
                aria-label="Fechar"
            >
                ×
            </button>

        </div>


        <div class="ies-modal-body">


            <div class="ies-info-grid">


                <div class="ies-info-card">

                    <span>
                        Organização acadêmica
                    </span>

                    <strong>

                        ${escaparHtmlDetalhe(
                            instituicao.organizacao_academica ||
                            "-"
                        )}

                    </strong>

                </div>


                <div class="ies-info-card">

                    <span>
                        Categoria administrativa
                    </span>

                    <strong>

                        ${escaparHtmlDetalhe(
                            instituicao.categoria_administrativa ||
                            "-"
                        )}

                    </strong>

                </div>


                <div class="ies-info-card">

                    <span>
                        Cursos ativos
                    </span>

                    <strong>

                        ${formatarInteiroDetalhe(
                            cursosResumo.total_cursos
                        )}

                    </strong>

                </div>


                <div class="ies-info-card">

                    <span>
                        Ano do Censo
                    </span>

                    <strong>

                        ${escaparHtmlDetalhe(
                            instituicao.ano_censo ||
                            "-"
                        )}

                    </strong>

                </div>

            </div>


            <section class="ies-detail-section">

                <h3>
                    Indicadores da instituição
                </h3>

                <p>
                    Informações públicas provenientes
                    das bases oficiais do Inep.
                </p>


                <div class="ies-indicators-grid">


                    <div class="ies-indicator-card">

                        <span>
                            IGC
                        </span>

                        <strong>

                            ${
                                igc &&
                                igc.igc_faixa !==
                                    null

                                    ? escaparHtmlDetalhe(
                                        igc.igc_faixa
                                    )

                                    : "-"
                            }

                        </strong>

                        <small>

                            ${
                                igc

                                    ? `Ano ${escaparHtmlDetalhe(
                                        igc.ano
                                    )}`

                                    : "Sem IGC disponível"
                            }

                        </small>

                    </div>


                    <div class="ies-indicator-card">

                        <span>
                            Conclusão acumulada
                        </span>

                        <strong>

                            ${formatarPercentualDetalhe(
                                trajetoria
                                    ?.taxa_conclusao_acumulada
                            )}

                        </strong>

                        <small>
                            Coorte de 2015
                        </small>

                    </div>


                    <div class="ies-indicator-card">

                        <span>
                            Desistência acumulada
                        </span>

                        <strong>

                            ${formatarPercentualDetalhe(
                                trajetoria
                                    ?.taxa_desistencia_acumulada
                            )}

                        </strong>

                        <small>
                            Coorte de 2015
                        </small>

                    </div>


                    <div class="ies-indicator-card">

                        <span>
                            Permanência
                        </span>

                        <strong>

                            ${formatarPercentualDetalhe(
                                trajetoria
                                    ?.taxa_permanencia
                            )}

                        </strong>

                        <small>

                            ${
                                trajetoria
                                    ?.ano_referencia

                                    ? `Acompanhamento até ${escaparHtmlDetalhe(
                                        trajetoria.ano_referencia
                                    )}`

                                    : "Sem trajetória disponível"
                            }

                        </small>

                    </div>

                </div>

            </section>


            ${renderizarSecaoMobilidade()}


            <section class="ies-detail-section">

                <h3>
                    Oferta de cursos
                </h3>


                <p>

                    ${formatarInteiroDetalhe(
                        cursosResumo.cursos_presenciais
                    )}

                    presenciais e

                    ${formatarInteiroDetalhe(
                        cursosResumo.cursos_ead
                    )}

                    EAD.

                    ${
                        Number(
                            cursosResumo.total_cursos ||
                            0
                        ) >
                        100

                            ? "Exibindo os primeiros 100 cursos."

                            : ""
                    }

                </p>


                ${renderizarCursosInstituicao(
                    dados.cursos
                )}

            </section>


        </div>
    `;


    document
        .getElementById(
            "btn-fechar-ies"
        )
        .addEventListener(
            "click",
            fecharModalInstituicao
        );


    inicializarMobilidadeInstituicao(
        instituicao.id
    );
}


// =========================================================
// STATUS DA MOBILIDADE
// =========================================================

function mostrarStatusMobilidade(
    mensagem,
    tipo = ""
) {

    const elemento =
        document.getElementById(
            "ies-mobility-status"
        );


    if (!elemento) {

        return;
    }


    elemento.className =
        "ies-mobility-status";


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


// =========================================================
// CAMPUS SELECIONADO
// =========================================================

function obterCampusSelecionado() {

    const select =
        document.getElementById(
            "ies-campus-select"
        );


    if (!select) {

        return null;
    }


    const id =
        Number(
            select.value
        );


    return (
        campiInstituicao.find(
            campus =>
                Number(
                    campus.id
                ) === id
        ) ||
        null
    );
}


// =========================================================
// ATUALIZAR MARCADOR DO DESTINO
// =========================================================

function atualizarMarcadorDestino() {

    if (
        !mapaInstituicao ||
        !campusAtualInstituicao ||
        !window.L
    ) {

        return;
    }


    const latitude =
        Number(
            campusAtualInstituicao.latitude
        );


    const longitude =
        Number(
            campusAtualInstituicao.longitude
        );


    if (
        marcadorDestinoInstituicao
    ) {

        marcadorDestinoInstituicao
            .remove();
    }


    marcadorDestinoInstituicao =
        window.L
            .marker(
                [
                    latitude,
                    longitude
                ]
            )
            .addTo(
                mapaInstituicao
            )
            .bindPopup(
                `<strong>${escaparHtmlDetalhe(
                    campusAtualInstituicao.nome
                )}</strong>`
            );


    mapaInstituicao.setView(
        [
            latitude,
            longitude
        ],
        15
    );


    if (
        origemAtualInstituicao
    ) {

        mapaInstituicao.fitBounds(
            [
                [
                    origemAtualInstituicao.latitude,
                    origemAtualInstituicao.longitude
                ],
                [
                    latitude,
                    longitude
                ]
            ],
            {
                padding: [
                    40,
                    40
                ]
            }
        );
    }
}


// =========================================================
// CRIAR MAPA
// =========================================================

async function criarMapaCampus() {

    const campus =
        campusAtualInstituicao;


    if (!campus) {

        return;
    }


    try {

        const L =
            await carregarLeaflet();


        const elemento =
            document.getElementById(
                "ies-campus-map"
            );


        if (!elemento) {

            return;
        }


        if (
            mapaInstituicao
        ) {

            mapaInstituicao.remove();
        }


        mapaInstituicao =
            L.map(
                elemento
            )
                .setView(
                    [
                        Number(
                            campus.latitude
                        ),
                        Number(
                            campus.longitude
                        )
                    ],
                    15
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
                mapaInstituicao
            );


        atualizarMarcadorDestino();


        if (
            origemAtualInstituicao
        ) {

            atualizarMarcadorOrigem();
        }


        window.setTimeout(
            () => {

                if (
                    mapaInstituicao
                ) {

                    mapaInstituicao
                        .invalidateSize();
                }
            },
            100
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar mapa:",
            erro
        );


        mostrarStatusMobilidade(
            "Não foi possível carregar o mapa.",
            "erro"
        );
    }
}


// =========================================================
// MARCADOR DA ORIGEM
// =========================================================

function atualizarMarcadorOrigem() {

    if (
        !mapaInstituicao ||
        !origemAtualInstituicao ||
        !window.L
    ) {

        return;
    }


    if (
        marcadorOrigemInstituicao
    ) {

        marcadorOrigemInstituicao
            .remove();
    }


    marcadorOrigemInstituicao =
        window.L
            .marker(
                [
                    origemAtualInstituicao.latitude,
                    origemAtualInstituicao.longitude
                ]
            )
            .addTo(
                mapaInstituicao
            )
            .bindPopup(
                "Sua origem"
            );


    if (
        campusAtualInstituicao
    ) {

        mapaInstituicao.fitBounds(
            [
                [
                    origemAtualInstituicao.latitude,
                    origemAtualInstituicao.longitude
                ],
                [
                    Number(
                        campusAtualInstituicao.latitude
                    ),
                    Number(
                        campusAtualInstituicao.longitude
                    )
                ]
            ],
            {
                padding: [
                    40,
                    40
                ]
            }
        );
    }
}


// =========================================================
// DEFINIR ORIGEM
// =========================================================

function definirOrigemMobilidade(
    origem,
    descricao
) {

    origemAtualInstituicao = {

        latitude:
            Number(
                origem.latitude
            ),

        longitude:
            Number(
                origem.longitude
            )
    };


    atualizarMarcadorOrigem();


    const origemTexto =
        document.getElementById(
            "ies-origin-current"
        );


    if (
        origemTexto
    ) {

        origemTexto.innerHTML = `

            <strong>Origem definida</strong><br>

            ${escaparHtmlDetalhe(
                descricao
            )}
        `;


        origemTexto.classList.remove(
            "hidden"
        );
    }


    const botao =
        document.getElementById(
            "btn-comparar-rotas"
        );


    if (
        botao
    ) {

        botao.disabled =
            false;
    }


    rotasInstituicao =
        [];


    const resultado =
        document.getElementById(
            "ies-route-results"
        );


    if (
        resultado
    ) {

        resultado.innerHTML =
            "";
    }


    if (
        camadaRotaInstituicao
    ) {

        camadaRotaInstituicao.remove();

        camadaRotaInstituicao =
            null;
    }


    mostrarStatusMobilidade(
        "Origem definida. Clique em comparar trajetos.",
        "success"
    );
}


// =========================================================
// LOCALIZAÇÃO ATUAL
// =========================================================

function usarLocalizacaoAtual() {

    if (
        !navigator.geolocation
    ) {

        mostrarStatusMobilidade(
            "Seu navegador não oferece suporte à localização atual.",
            "erro"
        );


        return;
    }


    if (
        !window.isSecureContext
    ) {

        mostrarStatusMobilidade(
            "A localização atual exige HTTPS. Você ainda pode informar um endereço manualmente.",
            "erro"
        );


        return;
    }


    const botao =
        document.getElementById(
            "btn-localizacao-atual"
        );


    if (
        botao
    ) {

        botao.disabled =
            true;

        botao.textContent =
            "Obtendo localização...";
    }


    navigator.geolocation.getCurrentPosition(

        posicao => {

            definirOrigemMobilidade(
                {
                    latitude:
                        posicao.coords
                            .latitude,

                    longitude:
                        posicao.coords
                            .longitude
                },
                "Sua localização atual"
            );


            if (
                botao
            ) {

                botao.disabled =
                    false;

                botao.textContent =
                    "Usar minha localização";
            }
        },

        erro => {

            console.error(
                "Erro de geolocalização:",
                erro
            );


            let mensagem =
                "Não foi possível obter sua localização.";


            if (
                erro.code ===
                1
            ) {

                mensagem =
                    "A permissão de localização foi negada.";
            }


            mostrarStatusMobilidade(
                mensagem,
                "erro"
            );


            if (
                botao
            ) {

                botao.disabled =
                    false;

                botao.textContent =
                    "Usar minha localização";
            }
        },

        {
            enableHighAccuracy:
                true,

            timeout:
                15000,

            maximumAge:
                60000
        }
    );
}


// =========================================================
// PESQUISAR ENDEREÇO
// =========================================================

async function pesquisarEnderecoOrigem() {

    const input =
        document.getElementById(
            "ies-origin-address"
        );


    const lista =
        document.getElementById(
            "ies-address-results"
        );


    const botao =
        document.getElementById(
            "btn-pesquisar-endereco"
        );


    if (
        !input ||
        !lista
    ) {

        return;
    }


    const consulta =
        input.value
            .trim();


    if (
        consulta.length <
        3
    ) {

        mostrarStatusMobilidade(
            "Digite pelo menos 3 caracteres para pesquisar.",
            "erro"
        );


        return;
    }


    lista.innerHTML =
        "";


    resultadosEnderecoInstituicao =
        [];


    if (
        botao
    ) {

        botao.disabled =
            true;

        botao.textContent =
            "Pesquisando...";
    }


    mostrarStatusMobilidade(
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


        resultadosEnderecoInstituicao =
            Array.isArray(
                dados.resultados
            )
                ? dados.resultados
                : [];


        if (
            resultadosEnderecoInstituicao.length ===
            0
        ) {

            mostrarStatusMobilidade(
                "Nenhum endereço encontrado.",
                "erro"
            );


            return;
        }


        lista.innerHTML =
            resultadosEnderecoInstituicao
                .map(
                    (
                        resultado,
                        indice
                    ) => `

                        <button
                            type="button"
                            class="ies-address-result"
                            data-address-index="${indice}"
                        >

                            ${escaparHtmlDetalhe(
                                resultado.nome
                            )}

                        </button>
                    `
                )
                .join("");


        lista
            .querySelectorAll(
                ".ies-address-result"
            )
            .forEach(
                botaoResultado => {

                    botaoResultado
                        .addEventListener(
                            "click",
                            () => {

                                const indice =
                                    Number(
                                        botaoResultado
                                            .dataset
                                            .addressIndex
                                    );


                                const resultado =
                                    resultadosEnderecoInstituicao[
                                        indice
                                    ];


                                if (!resultado) {

                                    return;
                                }


                                definirOrigemMobilidade(
                                    resultado,
                                    resultado.nome
                                );


                                lista.innerHTML =
                                    "";


                                input.value =
                                    resultado.nome;
                            }
                        );
                }
            );


        mostrarStatusMobilidade(
            "Selecione um dos endereços encontrados."
        );


    } catch (erro) {

        console.error(
            "Erro ao pesquisar endereço:",
            erro
        );


        mostrarStatusMobilidade(
            erro.message ||
            "Não foi possível pesquisar o endereço.",
            "erro"
        );


    } finally {

        if (
            botao
        ) {

            botao.disabled =
                false;

            botao.textContent =
                "Pesquisar";
        }
    }
}


// =========================================================
// NOMES DOS MODOS
// =========================================================

function nomeModoMobilidade(
    modo
) {

    const nomes = {

        carro:
            "Carro",

        caminhada:
            "Caminhada",

        bicicleta:
            "Bicicleta"
    };


    return nomes[
        modo
    ] ||
    modo;
}


// =========================================================
// DESENHAR ROTA
// =========================================================

function desenharRotaMobilidade(
    rota,
    botaoSelecionado = null
) {

    if (
        !mapaInstituicao ||
        !window.L ||
        !rota ||
        !rota.geometria
    ) {

        return;
    }


    if (
        camadaRotaInstituicao
    ) {

        camadaRotaInstituicao.remove();
    }


    camadaRotaInstituicao =
        window.L.geoJSON(
            {
                type:
                    "Feature",

                properties:
                    {},

                geometry:
                    rota.geometria
            },
            {
                style: {
                    color:
                        "#2563eb",

                    weight:
                        5,

                    opacity:
                        0.85
                }
            }
        )
            .addTo(
                mapaInstituicao
            );


    const limites =
        camadaRotaInstituicao
            .getBounds();


    if (
        limites.isValid()
    ) {

        mapaInstituicao.fitBounds(
            limites,
            {
                padding: [
                    35,
                    35
                ]
            }
        );
    }


    document
        .querySelectorAll(
            ".ies-route-card"
        )
        .forEach(
            card => {

                card.classList.remove(
                    "active"
                );
            }
        );


    if (
        botaoSelecionado
    ) {

        botaoSelecionado
            .classList
            .add(
                "active"
            );
    }
}


// =========================================================
// RENDERIZAR ROTAS
// =========================================================

function renderizarRotasMobilidade(
    rotas
) {

    const container =
        document.getElementById(
            "ies-route-results"
        );


    if (!container) {

        return;
    }


    if (
        !Array.isArray(
            rotas
        ) ||
        rotas.length ===
            0
    ) {

        container.innerHTML = `

            <div class="ies-route-unavailable">
                Nenhuma rota disponível.
            </div>
        `;


        return;
    }


    container.innerHTML =
        rotas
            .map(
                rota => {

                    if (
                        !rota.disponivel
                    ) {

                        return `

                            <div
                                class="ies-route-unavailable"
                            >

                                <strong>
                                    ${escaparHtmlDetalhe(
                                        nomeModoMobilidade(
                                            rota.modo
                                        )
                                    )}
                                </strong>

                                <br>

                                ${escaparHtmlDetalhe(
                                    rota.erro ||
                                    "Rota indisponível"
                                )}

                            </div>
                        `;
                    }


                    return `

                        <button
                            type="button"
                            class="ies-route-card"
                            data-route-mode="${escaparHtmlDetalhe(
                                rota.modo
                            )}"
                        >

                            <div>

                                <strong>
                                    ${escaparHtmlDetalhe(
                                        nomeModoMobilidade(
                                            rota.modo
                                        )
                                    )}
                                </strong>

                                <small>

                                    ${formatarNumeroDetalhe(
                                        rota.distancia_km,
                                        2
                                    )}
                                    km

                                </small>

                            </div>

                            <div class="ies-route-time">

                                ${escaparHtmlDetalhe(
                                    formatarDuracaoMobilidade(
                                        rota.duracao_minutos
                                    )
                                )}

                            </div>

                        </button>
                    `;
                }
            )
            .join("");


    container
        .querySelectorAll(
            ".ies-route-card"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        const modo =
                            botao.dataset
                                .routeMode;


                        const rota =
                            rotasInstituicao
                                .find(
                                    item =>
                                        item.modo ===
                                        modo &&
                                        item.disponivel
                                );


                        desenharRotaMobilidade(
                            rota,
                            botao
                        );
                    }
                );
            }
        );


    const primeira =
        rotasInstituicao
            .find(
                rota =>
                    rota.disponivel &&
                    rota.geometria
            );


    if (
        primeira
    ) {

        const botao =
            container
                .querySelector(
                    `[data-route-mode="${primeira.modo}"]`
                );


        desenharRotaMobilidade(
            primeira,
            botao
        );
    }
}


// =========================================================
// COMPARAR ROTAS
// =========================================================

async function compararRotasMobilidade() {

    if (
        !origemAtualInstituicao
    ) {

        mostrarStatusMobilidade(
            "Defina sua origem primeiro.",
            "erro"
        );


        return;
    }


    if (
        !campusAtualInstituicao
    ) {

        mostrarStatusMobilidade(
            "Selecione um campus.",
            "erro"
        );


        return;
    }


    const botao =
        document.getElementById(
            "btn-comparar-rotas"
        );


    if (
        botao
    ) {

        botao.disabled =
            true;

        botao.textContent =
            "Calculando...";
    }


    mostrarStatusMobilidade(
        "Calculando trajetos..."
    );


    try {

        const resposta =
            await fetch(
                "/api/mapa/comparar",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            {
                                origem: {
                                    latitude:
                                        origemAtualInstituicao
                                            .latitude,

                                    longitude:
                                        origemAtualInstituicao
                                            .longitude
                                },

                                destino: {
                                    latitude:
                                        Number(
                                            campusAtualInstituicao
                                                .latitude
                                        ),

                                    longitude:
                                        Number(
                                            campusAtualInstituicao
                                                .longitude
                                        )
                                }
                            }
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
                "Não foi possível calcular as rotas"
            );
        }


        rotasInstituicao =
            Array.isArray(
                dados.rotas
            )
                ? dados.rotas
                : [];


        renderizarRotasMobilidade(
            rotasInstituicao
        );


        const disponiveis =
            rotasInstituicao
                .filter(
                    rota =>
                        rota.disponivel
                )
                .length;


        if (
            disponiveis ===
            0
        ) {

            mostrarStatusMobilidade(
                "Não foram encontradas rotas para este trajeto.",
                "erro"
            );


            return;
        }


        mostrarStatusMobilidade(
            "Trajetos calculados. Clique em uma opção para visualizar no mapa.",
            "success"
        );


    } catch (erro) {

        console.error(
            "Erro ao comparar rotas:",
            erro
        );


        mostrarStatusMobilidade(
            erro.message ||
            "Não foi possível calcular os trajetos.",
            "erro"
        );


    } finally {

        if (
            botao
        ) {

            botao.disabled =
                false;

            botao.textContent =
                "Comparar trajetos";
        }
    }
}


// =========================================================
// TROCAR CAMPUS
// =========================================================

function alterarCampusMobilidade() {

    campusAtualInstituicao =
        obterCampusSelecionado();


    if (
        !campusAtualInstituicao
    ) {

        return;
    }


    const endereco =
        document.getElementById(
            "ies-campus-address"
        );


    if (
        endereco
    ) {

        endereco.textContent =
            formatarEnderecoCampus(
                campusAtualInstituicao
            );
    }


    rotasInstituicao =
        [];


    const resultados =
        document.getElementById(
            "ies-route-results"
        );


    if (
        resultados
    ) {

        resultados.innerHTML =
            "";
    }


    if (
        camadaRotaInstituicao
    ) {

        camadaRotaInstituicao.remove();

        camadaRotaInstituicao =
            null;
    }


    atualizarMarcadorDestino();
}


// =========================================================
// RENDERIZAR CAMPI
// =========================================================

function renderizarMobilidadeComCampi(
    campi
) {

    const container =
        document.getElementById(
            "ies-mobility-content"
        );


    if (!container) {

        return;
    }


    if (
        !Array.isArray(
            campi
        ) ||
        campi.length ===
            0
    ) {

        container.innerHTML = `

            <div class="ies-mobility-empty">

                <strong>
                    Localização ainda não cadastrada
                </strong>

                <span>
                    Esta instituição ainda não possui
                    campus com localização disponível no SIA.
                </span>

            </div>
        `;


        return;
    }


    campiInstituicao =
        campi;


    campusAtualInstituicao =
        campi.find(
            campus =>
                campus.principal
        ) ||
        campi[0];


    container.innerHTML = `

        <div class="ies-mobility-grid">

            <div class="ies-mobility-panel">

                <h4>
                    Planejar trajeto
                </h4>


                <div class="ies-mobility-field">

                    <label for="ies-campus-select">
                        Campus de destino
                    </label>

                    <select id="ies-campus-select">

                        ${campi
                            .map(
                                campus => `

                                    <option
                                        value="${escaparHtmlDetalhe(
                                            campus.id
                                        )}"
                                        ${
                                            Number(
                                                campus.id
                                            ) ===
                                            Number(
                                                campusAtualInstituicao.id
                                            )
                                                ? "selected"
                                                : ""
                                        }
                                    >

                                        ${escaparHtmlDetalhe(
                                            campus.nome
                                        )}

                                        ${
                                            campus.principal
                                                ? " — Principal"
                                                : ""
                                        }

                                    </option>
                                `
                            )
                            .join("")}

                    </select>

                </div>


                <div
                    id="ies-campus-address"
                    class="ies-campus-address"
                >

                    ${escaparHtmlDetalhe(
                        formatarEnderecoCampus(
                            campusAtualInstituicao
                        )
                    )}

                </div>


                <div class="ies-mobility-field">

                    <label>
                        Origem
                    </label>


                    <div class="ies-mobility-actions">

                        <button
                            type="button"
                            id="btn-localizacao-atual"
                            class="ies-mobility-button"
                        >
                            Usar minha localização
                        </button>

                    </div>

                </div>


                <div class="ies-mobility-field">

                    <label for="ies-origin-address">
                        Ou informe um endereço
                    </label>


                    <div class="ies-address-search">

                        <input
                            type="text"
                            id="ies-origin-address"
                            maxlength="200"
                            placeholder="Rua, bairro ou cidade"
                        >

                        <button
                            type="button"
                            id="btn-pesquisar-endereco"
                            class="ies-mobility-button"
                        >
                            Pesquisar
                        </button>

                    </div>


                    <div
                        id="ies-address-results"
                        class="ies-address-results"
                    ></div>

                </div>


                <div
                    id="ies-origin-current"
                    class="ies-origin-current hidden"
                ></div>


                <button
                    type="button"
                    id="btn-comparar-rotas"
                    class="
                        ies-mobility-button
                        ies-mobility-button-primary
                    "
                    disabled
                >
                    Comparar trajetos
                </button>


                <div
                    id="ies-mobility-status"
                    class="ies-mobility-status"
                ></div>


                <div
                    id="ies-route-results"
                    class="ies-route-results"
                ></div>

            </div>


            <div class="ies-map-wrapper">

                <div
                    id="ies-campus-map"
                    aria-label="Mapa do campus"
                ></div>

            </div>

        </div>
    `;


    document
        .getElementById(
            "ies-campus-select"
        )
        .addEventListener(
            "change",
            alterarCampusMobilidade
        );


    document
        .getElementById(
            "btn-localizacao-atual"
        )
        .addEventListener(
            "click",
            usarLocalizacaoAtual
        );


    document
        .getElementById(
            "btn-pesquisar-endereco"
        )
        .addEventListener(
            "click",
            pesquisarEnderecoOrigem
        );


    document
        .getElementById(
            "ies-origin-address"
        )
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    pesquisarEnderecoOrigem();
                }
            }
        );


    document
        .getElementById(
            "btn-comparar-rotas"
        )
        .addEventListener(
            "click",
            compararRotasMobilidade
        );


    criarMapaCampus();
}


// =========================================================
// CARREGAR CAMPI
// =========================================================

async function inicializarMobilidadeInstituicao(
    universidadeId
) {

    carregarEstilosMobilidade();


    const container =
        document.getElementById(
            "ies-mobility-content"
        );


    if (!container) {

        return;
    }


    try {

        const resposta =
            await fetch(
                "/api/campi?universidade_id=" +
                encodeURIComponent(
                    universidadeId
                )
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


        renderizarMobilidadeComCampi(
            dados
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar mobilidade:",
            erro
        );


        container.innerHTML = `

            <div class="ies-mobility-empty">

                <strong>
                    Não foi possível carregar os campi
                </strong>

                <span>
                    Tente novamente mais tarde.
                </span>

            </div>
        `;
    }
}


// =========================================================
// ABRIR INSTITUIÇÃO
// =========================================================

async function abrirDetalheInstituicao(
    codigo
) {

    if (!codigo) {

        return;
    }


    criarModalInstituicao();


    destruirMapaInstituicao();


    const modal =
        document.getElementById(
            "ies-modal-backdrop"
        );


    const conteudo =
        document.getElementById(
            "ies-modal-conteudo"
        );


    modal.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";


    conteudo.innerHTML = `

        <div class="ies-loading">

            Carregando informações
            da instituição...

        </div>
    `;


    try {

        const resposta =
            await fetch(

                "/api/universidades/codigo/" +

                encodeURIComponent(
                    codigo
                )
            );


        const dados =
            await resposta.json();


        if (
            !resposta.ok
        ) {

            throw new Error(
                dados.erro ||
                "Erro ao carregar instituição"
            );
        }


        renderizarDetalheInstituicao(
            dados
        );


    } catch (erro) {

        console.error(
            "Erro ao abrir instituição:",
            erro
        );


        conteudo.innerHTML = `

            <div class="ies-loading">

                <h3>
                    Não foi possível carregar
                    esta instituição
                </h3>

                <p>
                    Tente novamente.
                </p>

                <br>

                <button
                    type="button"
                    class="btn-filter-secondary"
                    id="btn-fechar-ies-erro"
                >
                    Fechar
                </button>

            </div>
        `;


        document
            .getElementById(
                "btn-fechar-ies-erro"
            )
            .addEventListener(
                "click",
                fecharModalInstituicao
            );
    }
}


// =========================================================
// PREPARAR CARD
// =========================================================

function prepararCardInstituicao(
    card
) {

    if (
        card.dataset
            .detalhePreparado ===
        "true"
    ) {

        return;
    }


    card.dataset
        .detalhePreparado =
        "true";


    card.setAttribute(
        "role",
        "button"
    );


    card.setAttribute(
        "tabindex",
        "0"
    );


    card.setAttribute(
        "aria-label",
        "Ver detalhes da instituição"
    );
}


// =========================================================
// OBSERVAR CARDS DINÂMICOS
// =========================================================

function prepararCardsInstituicoes() {

    document
        .querySelectorAll(
            ".institution-card"
        )
        .forEach(
            prepararCardInstituicao
        );
}


const observadorInstituicoes =
    new MutationObserver(
        prepararCardsInstituicoes
    );


observadorInstituicoes.observe(
    document.body,
    {
        childList:
            true,

        subtree:
            true
    }
);


prepararCardsInstituicoes();


// =========================================================
// CLICK GLOBAL NOS CARDS
// =========================================================

document.addEventListener(
    "click",
    event => {

        if (
            event.target.closest(
                "button, a, input, select, label"
            )
        ) {

            return;
        }


        const card =
            event.target.closest(
                ".institution-card"
            );


        if (!card) {

            return;
        }


        const codigo =
            obterCodigoIesDoCard(
                card
            );


        abrirDetalheInstituicao(
            codigo
        );
    }
);


// =========================================================
// TECLADO
// =========================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
                "Enter" &&
            event.key !==
                " "
        ) {

            return;
        }


        const card =
            event.target.closest(
                ".institution-card"
            );


        if (!card) {

            return;
        }


        if (
            event.target.closest(
                "button, a, input, select"
            )
        ) {

            return;
        }


        event.preventDefault();


        const codigo =
            obterCodigoIesDoCard(
                card
            );


        abrirDetalheInstituicao(
            codigo
        );
    }
);