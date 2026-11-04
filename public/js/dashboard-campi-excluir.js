// =========================================================
// SIA - EXCLUSÃO DE CAMPI
//
// Adiciona:
// - botão Excluir campus;
// - confirmação;
// - exclusão lógica pelo backend.
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
    // ADICIONAR BOTÕES NOS CARDS
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
                        )
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
    // EXCLUIR
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
                "Ele deixará de aparecer no sistema e os vínculos com cursos serão removidos."
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


            window.alert(
                "Campus excluído com sucesso."
            );


            sessionStorage.setItem(
                "sia-reabrir-campi",
                "1"
            );


            window.location.reload();


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
    // OBSERVAR CARDS CRIADOS DINAMICAMENTE
    // =====================================================

    function observarCards() {

        const observer =
            new MutationObserver(
                () => {

                    adicionarBotoes();
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
    // REABRIR CAMPI APÓS EXCLUSÃO
    // =====================================================

    function reabrirCampi() {

        if (
            sessionStorage.getItem(
                "sia-reabrir-campi"
            ) !==
            "1"
        ) {

            return;
        }


        sessionStorage.removeItem(
            "sia-reabrir-campi"
        );


        let tentativas =
            0;


        const tentar =
            () => {

                if (
                    typeof abrirSecao ===
                        "function" &&
                    document.getElementById(
                        "campi"
                    )
                ) {

                    abrirSecao(
                        "campi"
                    );

                    return;
                }


                tentativas +=
                    1;


                if (
                    tentativas <
                    40
                ) {

                    window.setTimeout(
                        tentar,
                        100
                    );
                }
            };


        tentar();
    }


    // =====================================================
    // INICIAR
    // =====================================================

    function iniciar() {

        adicionarEstilos();

        observarCards();

        adicionarBotoes();

        reabrirCampi();
    }


    iniciar();

})();