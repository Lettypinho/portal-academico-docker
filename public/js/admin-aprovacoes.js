// =========================================================
// SIA - CENTRAL DE APROVAÇÕES
//
// Super Admin:
// - aprova/rejeita campi;
// - analisa notas de corte;
// - abre comprovantes;
// - aprova/rejeita notas.
// =========================================================

(function iniciarCentralAprovacoes() {

    let campiPendentes =
        [];

    let notasPendentes =
        [];

    let carregando =
        false;


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


    function formatarData(
        valor
    ) {

        if (
            !valor
        ) {

            return "-";
        }


        const data =
            new Date(
                valor
            );


        if (
            Number.isNaN(
                data.getTime()
            )
        ) {

            return "-";
        }


        return new Intl
            .DateTimeFormat(
                "pt-BR",
                {
                    dateStyle:
                        "short",

                    timeStyle:
                        "short"
                }
            )
            .format(
                data
            );
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


    function rotuloFonte(
        fonte
    ) {

        const fontes = {

            mec_sisu:
                "MEC / Sisu",

            inep:
                "INEP",

            ies:
                "Instituição",

            outra_oficial:
                "Outra fonte oficial"
        };


        return fontes[
            fonte
        ] ||
        fonte ||
        "-";
    }


    function rotuloGrupo(
        grupo
    ) {

        const grupos = {

            ampla:
                "Ampla concorrência",

            cota:
                "Cota",

            acao_afirmativa:
                "Ação afirmativa",

            outro:
                "Outro"
        };


        return grupos[
            grupo
        ] ||
        grupo ||
        "-";
    }


    function rotuloTipoNota(
        tipo
    ) {

        const tipos = {

            parcial:
                "Parcial",

            encerramento:
                "Encerramento",

            chamada_regular:
                "Chamada regular"
        };


        return tipos[
            tipo
        ] ||
        tipo ||
        "-";
    }


    async function lerResposta(
        resposta
    ) {

        const dados =
            await resposta
                .json()
                .catch(
                    () => ({})
                );


        if (
            !resposta.ok
        ) {

            throw new Error(
                dados.erro ||
                "Não foi possível concluir a operação."
            );
        }


        return dados;
    }


    // =====================================================
    // ESTILOS
    // =====================================================

    function adicionarEstilos() {

        if (
            document.getElementById(
                "admin-aprovacoes-estilos"
            )
        ) {

            return;
        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "admin-aprovacoes-estilos";


        style.textContent = `

            .admin-aprovacoes-menu {
                display: inline-flex;
                align-items: center;
                gap: 7px;
            }


            .admin-aprovacoes-contador {
                min-width: 20px;
                height: 20px;

                display: inline-flex;
                align-items: center;
                justify-content: center;

                padding: 0 6px;

                border-radius: 999px;

                color: #ffffff;
                background: #dc2626;

                font-size: 10px;
                font-weight: 800;
            }


            .admin-aprovacoes-contador.vazio {
                background: #94a3b8;
            }


            .admin-aprovacoes-resumo {
                display: grid;

                grid-template-columns:
                    repeat(
                        3,
                        minmax(
                            0,
                            1fr
                        )
                    );

                gap: 14px;

                margin-bottom: 22px;
            }


            .admin-aprovacoes-stat {
                padding: 17px;

                border:
                    1px solid #e2e8f0;

                border-radius: 12px;

                background: #ffffff;
            }


            .admin-aprovacoes-stat span {
                display: block;

                margin-bottom: 5px;

                color: #64748b;

                font-size: 11px;
                font-weight: 700;
            }


            .admin-aprovacoes-stat strong {
                display: block;

                color: #0f172a;

                font-size: 26px;
            }


            .admin-aprovacoes-grid {
                display: grid;
                gap: 24px;
            }


            .admin-aprovacoes-panel {
                padding: 20px;

                border:
                    1px solid #e2e8f0;

                border-radius: 14px;

                background: #ffffff;
            }


            .admin-aprovacoes-panel-header {
                display: flex;

                align-items: flex-start;
                justify-content: space-between;

                gap: 15px;

                margin-bottom: 17px;
            }


            .admin-aprovacoes-panel-header h2 {
                margin:
                    3px 0 4px;
            }


            .admin-aprovacoes-panel-header p {
                margin: 0;

                color: #64748b;

                font-size: 12px;
            }


            .admin-aprovacoes-atualizar {
                min-height: 38px;

                padding:
                    8px 13px;

                border:
                    1px solid #6d28d9;

                border-radius: 8px;

                color: #6d28d9;
                background: #ffffff;

                font-weight: 700;

                cursor: pointer;
            }


            .admin-aprovacoes-atualizar:hover {
                color: #ffffff;
                background: #6d28d9;
            }


            .admin-aprovacoes-lista {
                display: grid;
                gap: 12px;
            }


            .admin-aprovacao-card {
                padding: 16px;

                border:
                    1px solid #e2e8f0;

                border-radius: 12px;

                background: #f8fafc;
            }


            .admin-aprovacao-card-header {
                display: flex;

                align-items: flex-start;
                justify-content: space-between;

                gap: 15px;

                flex-wrap: wrap;
            }


            .admin-aprovacao-card-header h3 {
                margin:
                    0 0 4px;

                color: #0f172a;

                font-size: 15px;
            }


            .admin-aprovacao-card-header p {
                margin: 0;

                color: #64748b;

                font-size: 12px;
            }


            .admin-aprovacao-badge {
                display: inline-flex;

                align-items: center;

                padding:
                    5px 9px;

                border-radius: 999px;

                color: #b45309;
                background: #fffbeb;

                font-size: 10px;
                font-weight: 800;
            }


            .admin-aprovacao-dados {
                display: grid;

                grid-template-columns:
                    repeat(
                        3,
                        minmax(
                            0,
                            1fr
                        )
                    );

                gap: 10px;

                margin-top: 14px;
            }


            .admin-aprovacao-dado {
                padding: 10px;

                border-radius: 8px;

                background: #ffffff;
            }


            .admin-aprovacao-dado span {
                display: block;

                margin-bottom: 3px;

                color: #94a3b8;

                font-size: 9px;

                text-transform: uppercase;

                letter-spacing: .04em;
            }


            .admin-aprovacao-dado strong {
                display: block;

                color: #334155;

                font-size: 11px;

                word-break: break-word;
            }


            .admin-aprovacao-acoes {
                display: flex;

                align-items: center;
                justify-content: flex-end;

                flex-wrap: wrap;

                gap: 8px;

                margin-top: 14px;

                padding-top: 14px;

                border-top:
                    1px solid #e2e8f0;
            }


            .admin-aprovacao-btn {
                min-height: 36px;

                padding:
                    7px 12px;

                border-radius: 8px;

                font-weight: 700;

                cursor: pointer;
            }


            .admin-aprovacao-btn:disabled {
                opacity: .55;
                cursor: not-allowed;
            }


            .admin-aprovacao-btn.aprovar {
                border:
                    1px solid #15803d;

                color: #ffffff;
                background: #15803d;
            }


            .admin-aprovacao-btn.aprovar:hover {
                background: #166534;
            }


            .admin-aprovacao-btn.rejeitar {
                border:
                    1px solid #dc2626;

                color: #dc2626;
                background: #ffffff;
            }


            .admin-aprovacao-btn.rejeitar:hover {
                color: #ffffff;
                background: #dc2626;
            }


            .admin-aprovacao-btn.comprovante {
                border:
                    1px solid #6d28d9;

                color: #6d28d9;
                background: #ffffff;
            }


            .admin-aprovacao-btn.comprovante:hover {
                color: #ffffff;
                background: #6d28d9;
            }


            .admin-aprovacao-btn.fonte {
                border:
                    1px solid #475569;

                color: #475569;
                background: #ffffff;
            }


            .admin-aprovacao-vazio {
                padding: 28px;

                border:
                    1px dashed #cbd5e1;

                border-radius: 10px;

                color: #64748b;

                text-align: center;
            }


            .admin-aprovacao-vazio strong {
                display: block;

                margin-bottom: 4px;

                color: #0f172a;
            }


            .admin-aprovacoes-status {
                min-height: 20px;

                margin-bottom: 14px;

                font-size: 12px;
            }


            .admin-aprovacoes-status.erro {
                color: #b91c1c;
            }


            .admin-aprovacoes-status.sucesso {
                color: #15803d;
            }


            @media (
                max-width: 800px
            ) {

                .admin-aprovacoes-resumo,
                .admin-aprovacao-dados {
                    grid-template-columns: 1fr;
                }


                .admin-aprovacao-acoes {
                    flex-direction: column;
                    align-items: stretch;
                }


                .admin-aprovacao-btn {
                    width: 100%;
                }
            }
        `;


        document.head.appendChild(
            style
        );
    }


    // =====================================================
    // MENU
    // =====================================================

    function criarMenu() {

        if (
            document.querySelector(
                '[data-section="aprovacoes"]'
            )
        ) {

            return;
        }


        const menu =
            document.querySelector(
                ".admin-menu"
            );


        if (
            !menu
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
            "nav-item admin-menu-item admin-aprovacoes-menu";


        botao.dataset.section =
            "aprovacoes";


        botao.innerHTML = `

            <span>
                Aprovações
            </span>

            <span
                id="admin-aprovacoes-contador"
                class="
                    admin-aprovacoes-contador
                    vazio
                "
            >
                0
            </span>
        `;


        botao.addEventListener(
            "click",
            () => {

                if (
                    typeof abrirSecao ===
                    "function"
                ) {

                    abrirSecao(
                        "aprovacoes"
                    );
                }


                carregarAprovacoes();
            }
        );


        menu.appendChild(
            botao
        );
    }


    // =====================================================
    // SEÇÃO
    // =====================================================

    function criarSecao() {

        if (
            document.getElementById(
                "aprovacoes"
            )
        ) {

            return;
        }


        const main =
            document.querySelector(
                ".admin-main"
            );


        if (
            !main
        ) {

            return;
        }


        const secao =
            document.createElement(
                "section"
            );


        secao.id =
            "aprovacoes";


        secao.className =
            "admin-section";


        secao.innerHTML = `

            <div class="admin-page-heading">

                <div>

                    <span class="section-eyebrow">
                        Moderação
                    </span>

                    <h1>
                        Aprovações
                    </h1>

                    <p>
                        Analise informações institucionais
                        antes da publicação no SIA.
                    </p>

                </div>


                <button
                    type="button"
                    id="btn-atualizar-aprovacoes"
                    class="admin-aprovacoes-atualizar"
                >
                    Atualizar
                </button>

            </div>


            <div
                id="admin-aprovacoes-status"
                class="admin-aprovacoes-status"
            ></div>


            <div class="admin-aprovacoes-resumo">

                <article class="admin-aprovacoes-stat">

                    <span>
                        Total pendente
                    </span>

                    <strong id="aprovacoes-total">
                        0
                    </strong>

                </article>


                <article class="admin-aprovacoes-stat">

                    <span>
                        Campi
                    </span>

                    <strong id="aprovacoes-campi-total">
                        0
                    </strong>

                </article>


                <article class="admin-aprovacoes-stat">

                    <span>
                        Notas de corte
                    </span>

                    <strong id="aprovacoes-notas-total">
                        0
                    </strong>

                </article>

            </div>


            <div class="admin-aprovacoes-grid">

                <article class="admin-aprovacoes-panel">

                    <div class="admin-aprovacoes-panel-header">

                        <div>

                            <span class="section-eyebrow">
                                Instituições
                            </span>

                            <h2>
                                Campi pendentes
                            </h2>

                            <p>
                                Confirme se o campus realmente
                                pertence à instituição solicitante.
                            </p>

                        </div>

                    </div>


                    <div
                        id="lista-aprovacoes-campi"
                        class="admin-aprovacoes-lista"
                    >
                        Carregando...
                    </div>

                </article>


                <article class="admin-aprovacoes-panel">

                    <div class="admin-aprovacoes-panel-header">

                        <div>

                            <span class="section-eyebrow">
                                Dados oficiais
                            </span>

                            <h2>
                                Notas de corte pendentes
                            </h2>

                            <p>
                                Confira a fonte e o comprovante
                                antes de publicar a nota.
                            </p>

                        </div>

                    </div>


                    <div
                        id="lista-aprovacoes-notas"
                        class="admin-aprovacoes-lista"
                    >
                        Carregando...
                    </div>

                </article>

            </div>
        `;


        main.appendChild(
            secao
        );


        document
            .getElementById(
                "btn-atualizar-aprovacoes"
            )
            .addEventListener(
                "click",
                carregarAprovacoes
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
                "admin-aprovacoes-status"
            );


        if (
            !elemento
        ) {

            return;
        }


        elemento.className =
            "admin-aprovacoes-status";


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
    // CARREGAR
    // =====================================================

    async function carregarAprovacoes() {

        if (
            carregando
        ) {

            return;
        }


        carregando =
            true;


        mostrarStatus(
            "Carregando aprovações..."
        );


        try {

            const [
                respostaCampi,
                respostaNotas
            ] =
                await Promise.all([

                    fetch(
                        "/api/campi/pendentes"
                    ),

                    fetch(
                        "/api/notas-corte/admin/pendentes"
                    )
                ]);


            campiPendentes =
                await lerResposta(
                    respostaCampi
                );


            notasPendentes =
                await lerResposta(
                    respostaNotas
                );


            if (
                !Array.isArray(
                    campiPendentes
                )
            ) {

                campiPendentes =
                    [];
            }


            if (
                !Array.isArray(
                    notasPendentes
                )
            ) {

                notasPendentes =
                    [];
            }


            mostrarStatus(
                ""
            );


            renderizarTudo();


        } catch (erro) {

            console.error(
                "Erro ao carregar aprovações:",
                erro
            );


            mostrarStatus(
                erro.message ||
                "Erro ao carregar aprovações.",
                "erro"
            );


        } finally {

            carregando =
                false;
        }
    }


    // =====================================================
    // RESUMO
    // =====================================================

    function atualizarResumo() {

        const total =
            campiPendentes.length +
            notasPendentes.length;


        document
            .getElementById(
                "aprovacoes-total"
            )
            .textContent =
            total;


        document
            .getElementById(
                "aprovacoes-campi-total"
            )
            .textContent =
            campiPendentes.length;


        document
            .getElementById(
                "aprovacoes-notas-total"
            )
            .textContent =
            notasPendentes.length;


        const contador =
            document.getElementById(
                "admin-aprovacoes-contador"
            );


        if (
            contador
        ) {

            contador.textContent =
                total;


            contador.classList.toggle(
                "vazio",
                total === 0
            );
        }
    }


    // =====================================================
    // CAMPI
    // =====================================================

    function renderizarCampi() {

        const container =
            document.getElementById(
                "lista-aprovacoes-campi"
            );


        if (
            !container
        ) {

            return;
        }


        if (
            campiPendentes.length ===
            0
        ) {

            container.innerHTML = `

                <div class="admin-aprovacao-vazio">

                    <strong>
                        Nenhum campus aguardando aprovação
                    </strong>

                    As solicitações institucionais
                    aparecerão aqui.

                </div>
            `;


            return;
        }


        container.innerHTML =
            campiPendentes
                .map(
                    campus => `

                        <article class="admin-aprovacao-card">

                            <div class="admin-aprovacao-card-header">

                                <div>

                                    <h3>
                                        ${escaparHtml(
                                            campus.nome
                                        )}
                                    </h3>

                                    <p>
                                        ${escaparHtml(
                                            campus.universidade_sigla ||
                                            campus.universidade
                                        )}
                                        —
                                        ${escaparHtml(
                                            campus.universidade
                                        )}
                                    </p>

                                </div>


                                <span class="admin-aprovacao-badge">
                                    Pendente
                                </span>

                            </div>


                            <div class="admin-aprovacao-dados">

                                <div class="admin-aprovacao-dado">

                                    <span>
                                        Endereço
                                    </span>

                                    <strong>
                                        ${escaparHtml(
                                            formatarEndereco(
                                                campus
                                            )
                                        )}
                                    </strong>

                                </div>


                                <div class="admin-aprovacao-dado">

                                    <span>
                                        Solicitado por
                                    </span>

                                    <strong>
                                        ${escaparHtml(
                                            campus.solicitado_por_nome ||
                                            "-"
                                        )}
                                    </strong>

                                </div>


                                <div class="admin-aprovacao-dado">

                                    <span>
                                        Solicitação
                                    </span>

                                    <strong>
                                        ${escaparHtml(
                                            formatarData(
                                                campus.solicitado_em
                                            )
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div class="admin-aprovacao-acoes">

                                <button
                                    type="button"
                                    class="
                                        admin-aprovacao-btn
                                        rejeitar
                                    "
                                    data-rejeitar-campus="${campus.id}"
                                >
                                    Rejeitar
                                </button>


                                <button
                                    type="button"
                                    class="
                                        admin-aprovacao-btn
                                        aprovar
                                    "
                                    data-aprovar-campus="${campus.id}"
                                >
                                    Aprovar campus
                                </button>

                            </div>

                        </article>
                    `
                )
                .join("");


        container
            .querySelectorAll(
                "[data-aprovar-campus]"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        () => {

                            aprovarCampus(
                                Number(
                                    botao.dataset
                                        .aprovarCampus
                                ),
                                botao
                            );
                        }
                    );
                }
            );


        container
            .querySelectorAll(
                "[data-rejeitar-campus]"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        () => {

                            rejeitarCampus(
                                Number(
                                    botao.dataset
                                        .rejeitarCampus
                                ),
                                botao
                            );
                        }
                    );
                }
            );
    }


    async function aprovarCampus(
        id,
        botao
    ) {

        const campus =
            campiPendentes.find(
                item =>
                    Number(
                        item.id
                    ) ===
                    Number(
                        id
                    )
            );


        if (
            !campus
        ) {

            return;
        }


        if (
            !window.confirm(
                `Aprovar o campus "${campus.nome}" para ${campus.universidade}?`
            )
        ) {

            return;
        }


        botao.disabled =
            true;


        botao.textContent =
            "Aprovando...";


        try {

            await lerResposta(
                await fetch(
                    `/api/campi/${id}/aprovar`,
                    {
                        method:
                            "PATCH"
                    }
                )
            );


            mostrarStatus(
                "Campus aprovado com sucesso.",
                "sucesso"
            );


            await carregarAprovacoes();


        } catch (erro) {

            mostrarStatus(
                erro.message,
                "erro"
            );


            botao.disabled =
                false;


            botao.textContent =
                "Aprovar campus";
        }
    }


    async function rejeitarCampus(
        id,
        botao
    ) {

        const motivo =
            window.prompt(
                "Informe o motivo da rejeição do campus:"
            );


        if (
            motivo === null
        ) {

            return;
        }


        if (
            motivo.trim().length <
            3
        ) {

            window.alert(
                "Informe um motivo para a rejeição."
            );

            return;
        }


        botao.disabled =
            true;


        botao.textContent =
            "Rejeitando...";


        try {

            await lerResposta(
                await fetch(
                    `/api/campi/${id}/rejeitar`,
                    {
                        method:
                            "PATCH",

                        headers: {

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                motivo:
                                    motivo.trim()
                            })
                    }
                )
            );


            mostrarStatus(
                "Solicitação de campus rejeitada.",
                "sucesso"
            );


            await carregarAprovacoes();


        } catch (erro) {

            mostrarStatus(
                erro.message,
                "erro"
            );


            botao.disabled =
                false;


            botao.textContent =
                "Rejeitar";
        }
    }


    // =====================================================
    // NOTAS DE CORTE
    // =====================================================

    function renderizarNotas() {

        const container =
            document.getElementById(
                "lista-aprovacoes-notas"
            );


        if (
            !container
        ) {

            return;
        }


        if (
            notasPendentes.length ===
            0
        ) {

            container.innerHTML = `

                <div class="admin-aprovacao-vazio">

                    <strong>
                        Nenhuma nota de corte pendente
                    </strong>

                    As notas enviadas pelas instituições
                    aparecerão aqui.

                </div>
            `;


            return;
        }


        container.innerHTML =
            notasPendentes
                .map(
                    nota => `

                        <article class="admin-aprovacao-card">

                            <div class="admin-aprovacao-card-header">

                                <div>

                                    <h3>
                                        ${escaparHtml(
                                            nota.curso
                                        )}
                                    </h3>

                                    <p>

                                        ${escaparHtml(
                                            nota.universidade_sigla ||
                                            nota.universidade
                                        )}

                                        —

                                        ${escaparHtml(
                                            nota.universidade
                                        )}

                                    </p>

                                </div>


                                <span class="admin-aprovacao-badge">
                                    Nota ${escaparHtml(
                                        nota.nota
                                    )}
                                </span>

                            </div>


                            <div class="admin-aprovacao-dados">

                                <div class="admin-aprovacao-dado">

                                    <span>
                                        Processo
                                    </span>

                                    <strong>
                                        ${escaparHtml(
                                            nota.processo_seletivo
                                        )}
                                        /
                                        ${escaparHtml(
                                            nota.edicao
                                        )}
                                        —
                                        ${escaparHtml(
                                            nota.ano
                                        )}
                                    </strong>

                                </div>


                                <div class="admin-aprovacao-dado">

                                    <span>
                                        Concorrência
                                    </span>

                                    <strong>
                                        ${escaparHtml(
                                            rotuloGrupo(
                                                nota.grupo_concorrencia
                                            )
                                        )}
                                        —
                                        ${escaparHtml(
                                            nota.modalidade_nome
                                        )}
                                    </strong>

                                </div>


                                <div class="admin-aprovacao-dado">

                                    <span>
                                        Tipo
                                    </span>

                                    <strong>
                                        ${escaparHtml(
                                            rotuloTipoNota(
                                                nota.tipo_nota
                                            )
                                        )}
                                    </strong>

                                </div>


                                <div class="admin-aprovacao-dado">

                                    <span>
                                        Turno
                                    </span>

                                    <strong>
                                        ${escaparHtml(
                                            nota.turno
                                        )}
                                    </strong>

                                </div>


                                <div class="admin-aprovacao-dado">

                                    <span>
                                        Fonte
                                    </span>

                                    <strong>
                                        ${escaparHtml(
                                            rotuloFonte(
                                                nota.fonte
                                            )
                                        )}
                                    </strong>

                                </div>


                                <div class="admin-aprovacao-dado">

                                    <span>
                                        Enviado por
                                    </span>

                                    <strong>
                                        ${escaparHtml(
                                            nota.enviado_por_nome ||
                                            "-"
                                        )}
                                    </strong>

                                </div>


                                <div class="admin-aprovacao-dado">

                                    <span>
                                        Comprovante
                                    </span>

                                    <strong>
                                        ${escaparHtml(
                                            nota.comprovante_nome ||
                                            "-"
                                        )}
                                    </strong>

                                </div>


                                <div class="admin-aprovacao-dado">

                                    <span>
                                        Vagas
                                    </span>

                                    <strong>
                                        ${escaparHtml(
                                            nota.vagas ??
                                            "-"
                                        )}
                                    </strong>

                                </div>


                                <div class="admin-aprovacao-dado">

                                    <span>
                                        Enviado em
                                    </span>

                                    <strong>
                                        ${escaparHtml(
                                            formatarData(
                                                nota.criado_em
                                            )
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div class="admin-aprovacao-acoes">

                                ${
                                    nota.fonte_url

                                        ? `
                                            <button
                                                type="button"
                                                class="
                                                    admin-aprovacao-btn
                                                    fonte
                                                "
                                                data-fonte-nota="${nota.id}"
                                            >
                                                Fonte oficial
                                            </button>
                                        `

                                        : ""
                                }


                                <button
                                    type="button"
                                    class="
                                        admin-aprovacao-btn
                                        comprovante
                                    "
                                    data-comprovante-nota="${nota.id}"
                                >
                                    Ver comprovante
                                </button>


                                <button
                                    type="button"
                                    class="
                                        admin-aprovacao-btn
                                        rejeitar
                                    "
                                    data-rejeitar-nota="${nota.id}"
                                >
                                    Rejeitar
                                </button>


                                <button
                                    type="button"
                                    class="
                                        admin-aprovacao-btn
                                        aprovar
                                    "
                                    data-aprovar-nota="${nota.id}"
                                >
                                    Aprovar e publicar
                                </button>

                            </div>

                        </article>
                    `
                )
                .join("");


        registrarEventosNotas(
            container
        );
    }


    function registrarEventosNotas(
        container
    ) {

        container
            .querySelectorAll(
                "[data-comprovante-nota]"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        () => {

                            const id =
                                Number(
                                    botao.dataset
                                        .comprovanteNota
                                );


                            window.open(
                                `/api/notas-corte/${id}/comprovante`,
                                "_blank",
                                "noopener"
                            );
                        }
                    );
                }
            );


        container
            .querySelectorAll(
                "[data-fonte-nota]"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        () => {

                            const id =
                                Number(
                                    botao.dataset
                                        .fonteNota
                                );


                            const nota =
                                notasPendentes.find(
                                    item =>
                                        Number(
                                            item.id
                                        ) ===
                                        id
                                );


                            if (
                                nota?.fonte_url
                            ) {

                                window.open(
                                    nota.fonte_url,
                                    "_blank",
                                    "noopener,noreferrer"
                                );
                            }
                        }
                    );
                }
            );


        container
            .querySelectorAll(
                "[data-aprovar-nota]"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        () => {

                            aprovarNota(
                                Number(
                                    botao.dataset
                                        .aprovarNota
                                ),
                                botao
                            );
                        }
                    );
                }
            );


        container
            .querySelectorAll(
                "[data-rejeitar-nota]"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        () => {

                            rejeitarNota(
                                Number(
                                    botao.dataset
                                        .rejeitarNota
                                ),
                                botao
                            );
                        }
                    );
                }
            );
    }


    async function aprovarNota(
        id,
        botao
    ) {

        const nota =
            notasPendentes.find(
                item =>
                    Number(
                        item.id
                    ) ===
                    Number(
                        id
                    )
            );


        if (
            !nota
        ) {

            return;
        }


        if (
            !window.confirm(
                `Aprovar e publicar a nota ${nota.nota} do curso ${nota.curso}?`
            )
        ) {

            return;
        }


        const observacao =
            window.prompt(
                "Observação da aprovação (opcional):",
                ""
            );


        if (
            observacao ===
            null
        ) {

            return;
        }


        botao.disabled =
            true;


        botao.textContent =
            "Publicando...";


        try {

            await lerResposta(
                await fetch(
                    `/api/notas-corte/admin/${id}/aprovar`,
                    {
                        method:
                            "PATCH",

                        headers: {

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                observacao:
                                    observacao.trim()
                            })
                    }
                )
            );


            mostrarStatus(
                "Nota de corte aprovada e publicada.",
                "sucesso"
            );


            await carregarAprovacoes();


        } catch (erro) {

            mostrarStatus(
                erro.message,
                "erro"
            );


            botao.disabled =
                false;


            botao.textContent =
                "Aprovar e publicar";
        }
    }


    async function rejeitarNota(
        id,
        botao
    ) {

        const observacao =
            window.prompt(
                "Informe o motivo da rejeição da nota de corte:"
            );


        if (
            observacao ===
            null
        ) {

            return;
        }


        if (
            !observacao.trim()
        ) {

            window.alert(
                "Informe o motivo da rejeição."
            );

            return;
        }


        botao.disabled =
            true;


        botao.textContent =
            "Rejeitando...";


        try {

            await lerResposta(
                await fetch(
                    `/api/notas-corte/admin/${id}/rejeitar`,
                    {
                        method:
                            "PATCH",

                        headers: {

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                observacao:
                                    observacao.trim()
                            })
                    }
                )
            );


            mostrarStatus(
                "Nota de corte rejeitada.",
                "sucesso"
            );


            await carregarAprovacoes();


        } catch (erro) {

            mostrarStatus(
                erro.message,
                "erro"
            );


            botao.disabled =
                false;


            botao.textContent =
                "Rejeitar";
        }
    }


    // =====================================================
    // RENDERIZAR
    // =====================================================

    function renderizarTudo() {

        atualizarResumo();

        renderizarCampi();

        renderizarNotas();
    }


    // =====================================================
    // AUTENTICAÇÃO
    // =====================================================

    async function usuarioEhSuperAdmin() {

        try {

            const resposta =
                await fetch(
                    "/api/auth/me"
                );


            if (
                !resposta.ok
            ) {

                return false;
            }


            const usuario =
                await resposta.json();


            return (
                usuario.perfil ===
                "super_admin"
            );


        } catch {

            return false;
        }
    }


    // =====================================================
    // INICIAR
    // =====================================================

    async function iniciar() {

        const autorizado =
            await usuarioEhSuperAdmin();


        if (
            !autorizado
        ) {

            return;
        }


        adicionarEstilos();

        criarMenu();

        criarSecao();

        await carregarAprovacoes();
    }


    iniciar();

})();