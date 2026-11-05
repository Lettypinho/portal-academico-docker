// =========================================================
// SIA - ÁREA DO ALUNO
// =========================================================

let dadosAlunoSia =
    null;


// =========================================================
// UTILITÁRIO
// =========================================================

function escaparAluno(
    valor
) {

    return String(
        valor ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// =========================================================
// CRIAR ABAS
// =========================================================

function criarAreaAluno() {

    const nav =
        document.querySelector(
            ".public-nav"
        );


    const main =
        document.querySelector(
            ".public-main"
        );


    if (
        !nav ||
        !main
    ) {

        return;
    }


    // =====================================================
    // ABA DISCIPLINAS
    // =====================================================

    const botaoDisciplinas =
        document.createElement(
            "button"
        );


    botaoDisciplinas.type =
        "button";

    botaoDisciplinas.className =
        "nav-item";

    botaoDisciplinas.dataset.section =
        "minhas-disciplinas";

    botaoDisciplinas.textContent =
        "Disciplinas";


    nav.appendChild(
        botaoDisciplinas
    );


    // =====================================================
    // ABA NOTAS DE CORTE
    // =====================================================

    const botaoNotas =
        document.createElement(
            "button"
        );


    botaoNotas.type =
        "button";

    botaoNotas.className =
        "nav-item";

    botaoNotas.dataset.section =
        "notas-corte-aluno";

    botaoNotas.textContent =
        "Notas de corte";


    nav.appendChild(
        botaoNotas
    );


    // =====================================================
    // SEÇÃO DISCIPLINAS
    // =====================================================

    const secaoDisciplinas =
        document.createElement(
            "section"
        );


    secaoDisciplinas.id =
        "minhas-disciplinas";

    secaoDisciplinas.className =
        "page-section";


    secaoDisciplinas.innerHTML = `

        <div class="section-header">

            <div>

                <span class="section-eyebrow">
                    Área do aluno
                </span>

                <h2>
                    Disciplinas
                </h2>

                <p>
                    Estrutura acadêmica do curso ao qual
                    você está vinculado.
                </p>

            </div>

        </div>


        <div class="public-data-notice">

            <strong>
                ${escaparAluno(
                    dadosAlunoSia.curso
                )}
            </strong>

            <span>
                Matrícula:
                ${escaparAluno(
                    dadosAlunoSia.matricula
                )}
            </span>

        </div>


        <div class="empty-state">

            <h3>
                Disciplinas do curso
            </h3>

            <p>
                Em breve esta área apresentará a matriz
                curricular, disciplinas, carga horária,
                período, pré-requisitos e ementas do curso.
            </p>

        </div>
    `;


    main.appendChild(
        secaoDisciplinas
    );


    // =====================================================
    // SEÇÃO NOTAS
    // =====================================================

    const secaoNotas =
        document.createElement(
            "section"
        );


    secaoNotas.id =
        "notas-corte-aluno";

    secaoNotas.className =
        "page-section";


    secaoNotas.innerHTML = `

        <div class="section-header">

            <div>

                <span class="section-eyebrow">
                    Processo seletivo
                </span>

                <h2>
                    Notas de corte
                </h2>

                <p>
                    Consulte as notas de corte publicadas
                    para o seu curso.
                </p>

            </div>

        </div>


        <div class="public-data-notice">

            <strong>
                ${escaparAluno(
                    dadosAlunoSia.curso
                )}
            </strong>

            <span>
                ${escaparAluno(
                    dadosAlunoSia.universidade_sigla ||
                    dadosAlunoSia.universidade
                )}
            </span>

        </div>


        <div
            id="notas-corte-aluno-lista"
        >
            Carregando notas de corte...
        </div>
    `;


    main.appendChild(
        secaoNotas
    );


    // =====================================================
    // EVENTOS
    // =====================================================

    botaoDisciplinas
        .addEventListener(
            "click",
            () => {

                abrirAreaAluno(
                    "minhas-disciplinas"
                );
            }
        );


    botaoNotas
        .addEventListener(
            "click",
            () => {

                abrirAreaAluno(
                    "notas-corte-aluno"
                );

                carregarNotasCorteAluno();
            }
        );
}


// =========================================================
// NAVEGAÇÃO
// =========================================================

function abrirAreaAluno(
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


    document
        .getElementById(
            id
        )
        ?.classList
        .add(
            "active"
        );


    document
        .querySelector(
            `[data-section="${id}"]`
        )
        ?.classList
        .add(
            "active"
        );
}


// =========================================================
// NOTAS DE CORTE
// =========================================================

async function carregarNotasCorteAluno() {

    const container =
        document.getElementById(
            "notas-corte-aluno-lista"
        );


    if (
        !container ||
        !dadosAlunoSia
    ) {

        return;
    }


    try {

        const resposta =
            await fetch(
                `/api/notas-corte/curso/${dadosAlunoSia.curso_id}`
            );


        if (
            !resposta.ok
        ) {

            throw new Error(
                "Erro ao consultar notas"
            );
        }


        const notas =
            await resposta.json();


        if (
            notas.length ===
            0
        ) {

            container.innerHTML = `

                <div class="empty-state">

                    <h3>
                        Nenhuma nota publicada
                    </h3>

                    <p>
                        Ainda não existem notas de corte
                        vigentes publicadas para este curso.
                    </p>

                </div>
            `;

            return;
        }


        container.innerHTML = `

            <div
                style="
                    overflow-x:auto;
                    margin-top:20px;
                "
            >

                <table
                    style="
                        width:100%;
                        border-collapse:collapse;
                        background:white;
                    "
                >

                    <thead>

                        <tr>

                            <th style="padding:12px;text-align:left;">
                                Ano
                            </th>

                            <th style="padding:12px;text-align:left;">
                                Processo
                            </th>

                            <th style="padding:12px;text-align:left;">
                                Modalidade
                            </th>

                            <th style="padding:12px;text-align:left;">
                                Tipo
                            </th>

                            <th style="padding:12px;text-align:left;">
                                Nota
                            </th>

                            <th style="padding:12px;text-align:left;">
                                Vagas
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${notas
                            .map(
                                nota => `

                                    <tr>

                                        <td style="padding:12px;border-top:1px solid #eee;">
                                            ${escaparAluno(
                                                nota.ano
                                            )}
                                        </td>

                                        <td style="padding:12px;border-top:1px solid #eee;">
                                            ${escaparAluno(
                                                nota.processo_seletivo ||
                                                "-"
                                            )}
                                        </td>

                                        <td style="padding:12px;border-top:1px solid #eee;">
                                            ${escaparAluno(
                                                nota.modalidade_nome ||
                                                nota.grupo_concorrencia ||
                                                "-"
                                            )}
                                        </td>

                                        <td style="padding:12px;border-top:1px solid #eee;">
                                            ${escaparAluno(
                                                nota.tipo_nota ||
                                                "-"
                                            )}
                                        </td>

                                        <td style="padding:12px;border-top:1px solid #eee;">
                                            <strong>
                                                ${escaparAluno(
                                                    nota.nota
                                                )}
                                            </strong>
                                        </td>

                                        <td style="padding:12px;border-top:1px solid #eee;">
                                            ${escaparAluno(
                                                nota.vagas ??
                                                "-"
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


    } catch (erro) {

        console.error(
            "Erro ao carregar notas de corte:",
            erro
        );


        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Não foi possível carregar
                </h3>

                <p>
                    Houve um erro ao consultar
                    as notas de corte.
                </p>

            </div>
        `;
    }
}


// =========================================================
// INICIAR
// =========================================================

async function iniciarAreaAluno() {

    try {

        const usuarioResposta =
            await fetch(
                "/api/auth/me"
            );


        if (
            !usuarioResposta.ok
        ) {

            return;
        }


        const usuario =
            await usuarioResposta.json();


        if (
            usuario.perfil !==
            "aluno"
        ) {

            return;
        }


        const resposta =
            await fetch(
                "/api/perfil/aluno"
            );


        if (
            !resposta.ok
        ) {

            console.error(
                "Vínculo acadêmico do aluno não encontrado."
            );

            return;
        }


        dadosAlunoSia =
            await resposta.json();


        criarAreaAluno();


    } catch (erro) {

        console.error(
            "Erro ao iniciar área do aluno:",
            erro
        );
    }
}


iniciarAreaAluno();