// =========================================================
// SIA - EXCLUSÃO DE CAMPI
//
// Exclusão lógica:
// - campus permanece no banco como inativo;
// - campus inativo não aparece na lista normal;
// - vínculos com cursos são removidos;
// - card some imediatamente após excluir.
// =========================================================

(function iniciarExclusaoCampi() {

    // =====================================================
    // ESTILOS
    // =====================================================

    function adicionarEstilos() {

        if (
            document.getElementById(
                "campi-excluir-estilos"
            )
        ) {

            return;
        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "campi-excluir-estilos";


        style.textContent = `

            .campus-excluir-button {

                min-height:
                    38px;

                padding:
                    8px 13px;

                border:
                    1px solid #dc2626;

                border-radius:
                    8px;

                color:
                    #dc2626;

                background:
                    #ffffff;

                font-weight:
                    700;

                cursor:
                    pointer;
            }


            .campus-excluir-button:hover {

                color:
                    #ffffff;

                background:
                    #dc2626;
            }


            .campus-excluir-button:disabled {

                opacity:
                    .55;

                cursor:
                    not-allowed;
            }
        `;


        document.head.appendChild(
            style
        );
    }


    // =====================================================
    // NORMALIZAR LISTA
    //
    // Campus inativo existe no banco para histórico,
    // mas não deve aparecer na interface normal.
    // =====================================================

    function normalizarListaCampi() {

        const lista =
            document.getElementById(
                "campi-lista"
            );


        if (
            !lista
        ) {

            return;
        }


        // =================================================
        // REMOVER CARDS INATIVOS DA INTERFACE
        // =================================================

        lista
            .querySelectorAll(
                ".campus-card.inativo"
            )
            .forEach(
                card => {

                    card.remove();
                }
            );


        const cardsAtivos =
            [
                ...lista.querySelectorAll(
                    ".campus-card"
                )
            ];


        // =================================================
        // RESUMO
        // =================================================

        const resumo =
            document.getElementById(
                "campi-resumo"
            );


        if (
            resumo
        ) {

            const quantidade =
                cardsAtivos.length;


            const texto =
                quantidade === 1
                    ? "1 campus ativo"
                    : `${quantidade} campi ativos`;


            if (
                resumo.textContent.trim() !==
                texto
            ) {

                resumo.textContent =
                    texto;
            }
        }


        // =================================================
        // ESTADO VAZIO
        // =================================================

        const vazioPersonalizado =
            lista.querySelector(
                ".campi-empty-ativos"
            );


        if (
            cardsAtivos.length ===
            0
        ) {

            const vazioExistente =
                lista.querySelector(
                    ".campi-empty"
                );


            if (
                !vazioExistente
            ) {

                const vazio =
                    document.createElement(
                        "div"
                    );


                vazio.className =
                    "campi-empty campi-empty-ativos";


                vazio.innerHTML = `

                    <strong>
                        Nenhum campus ativo
                    </strong>

                    Cadastre um novo campus para
                    disponibilizá-lo no sistema.
                `;


                lista.appendChild(
                    vazio
                );
            }

        } else if (
            vazioPersonalizado
        ) {

            vazioPersonalizado.remove();
        }


        adicionarBotoes();
    }


    // =====================================================
    // ADICIONAR BOTÃO EXCLUIR
    // =====================================================

    function adicionarBotoes() {

        const lista =
            document.getElementById(
                "campi-lista"
            );


        if (
            !lista
        ) {

            return;
        }


        lista
            .querySelectorAll(
                ".campus-card"
            )
            .forEach(
                card => {

                    if (
                        card.classList.contains(
                            "inativo"
                        )
                    ) {

                        return;
                    }


                    const botaoEditar =
                        card.querySelector(
                            "[data-editar-campus]"
                        );


                    if (
                        !botaoEditar
                    ) {

                        return;
                    }


                    const campusId =
                        Number(
                            botaoEditar.dataset
                                .editarCampus
                        );


                    if (
                        !Number.isInteger(
                            campusId
                        ) ||
                        campusId <= 0
                    ) {

                        return;
                    }


                    const acoes =
                        card.querySelector(
                            ".campus-card-actions"
                        );


                    if (
                        !acoes
                    ) {

                        return;
                    }


                    if (
                        acoes.querySelector(
                            `[data-excluir-campus="${campusId}"]`
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
                        "campus-excluir-button";


                    botao.dataset
                        .excluirCampus =
                        String(
                            campusId
                        );


                    botao.textContent =
                        "Excluir campus";


                    botao.addEventListener(
                        "click",
                        () => {

                            excluirCampus(
                                campusId,
                                card,
                                botao
                            );
                        }
                    );


                    acoes.appendChild(
                        botao
                    );
                }
            );
    }


    // =====================================================
    // EXCLUIR CAMPUS
    // =====================================================

    async function excluirCampus(
        campusId,
        card,
        botao
    ) {

        const titulo =
            card.querySelector(
                ".campus-card-header h3"
            );


        const nome =
            titulo
                ?.textContent
                ?.trim() ||
            "este campus";


        const confirmado =
            window.confirm(
                `Excluir o campus "${nome}"?\n\n` +
                "O campus deixará de aparecer no sistema e " +
                "seus vínculos com cursos serão removidos."
            );


        if (
            !confirmado
        ) {

            return;
        }


        const textoOriginal =
            botao.textContent;


        botao.disabled =
            true;


        botao.textContent =
            "Excluindo...";


        try {

            const resposta =
                await fetch(
                    `/api/campi/${campusId}`,
                    {
                        method:
                            "DELETE"
                    }
                );


            const dados =
                await resposta.json();


            if (
                !resposta.ok
            ) {

                throw new Error(
                    dados.erro ||
                    "Não foi possível excluir o campus"
                );
            }


            // =================================================
            // REMOVER IMEDIATAMENTE DA INTERFACE
            // =================================================

            card.remove();


            normalizarListaCampi();


            window.alert(
                "Campus excluído com sucesso."
            );


        } catch (erro) {

            console.error(
                "Erro ao excluir campus:",
                erro
            );


            window.alert(
                erro.message ||
                "Não foi possível excluir o campus."
            );


            botao.disabled =
                false;


            botao.textContent =
                textoOriginal;
        }
    }


    // =====================================================
    // OBSERVAR RENDERIZAÇÃO DOS CAMPI
    // =====================================================

    function observarCards() {

        const observer =
            new MutationObserver(
                () => {

                    normalizarListaCampi();
                }
            );


        observer.observe(
            document.body,
            {
                childList:
                    true,

                subtree:
                    true
            }
        );
    }


    // =====================================================
    // INICIAR
    // =====================================================

    function iniciar() {

        adicionarEstilos();

        observarCards();

        normalizarListaCampi();
    }


    iniciar();

})();