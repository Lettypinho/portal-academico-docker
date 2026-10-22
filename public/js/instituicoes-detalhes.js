// =========================================================
// SIA - DETALHES PÚBLICOS DAS INSTITUIÇÕES
// =========================================================


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


        if (!resposta.ok) {

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
        childList: true,
        subtree: true
    }
);


prepararCardsInstituicoes();


// =========================================================
// CLICK GLOBAL NOS CARDS
// =========================================================

document.addEventListener(
    "click",
    event => {

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