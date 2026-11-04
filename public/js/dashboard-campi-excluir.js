// =========================================================
// SIA - STATUS E EXCLUSÃO DE CAMPI
// =========================================================

(function iniciarControleCampi() {

    let estados =
        new Map();

    let timerAtualizacao =
        null;


    function adicionarEstilos() {

        if (
            document.getElementById(
                "campi-status-estilos"
            )
        ) {

            return;
        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "campi-status-estilos";


        style.textContent = `

            .campus-excluir-button {

                min-height: 38px;
                padding: 8px 13px;

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


            .campus-badge.pendente {

                color:
                    #b45309;

                background:
                    #fffbeb;
            }


            .campus-badge.rejeitado {

                color:
                    #b91c1c;

                background:
                    #fef2f2;
            }
        `;


        document.head.appendChild(
            style
        );
    }


    async function carregarEstados() {

        try {

            const resposta =
                await fetch(
                    "/api/campi/minha-instituicao"
                );


            if (
                !resposta.ok
            ) {

                return;
            }


            const dados =
                await resposta.json();


            estados =
                new Map(
                    dados.map(
                        campus => [
                            Number(
                                campus.id
                            ),
                            campus
                        ]
                    )
                );


            aplicarNosCards();


        } catch (erro) {

            console.error(
                "Erro ao carregar status dos campi:",
                erro
            );
        }
    }


    function aplicarNosCards() {

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

                    const editar =
                        card.querySelector(
                            "[data-editar-campus]"
                        );


                    if (
                        !editar
                    ) {

                        return;
                    }


                    const id =
                        Number(
                            editar.dataset
                                .editarCampus
                        );


                    const campus =
                        estados.get(
                            id
                        );


                    if (
                        !campus
                    ) {

                        return;
                    }


                    const badge =
                        card.querySelector(
                            ".campus-badge.ativo, .campus-badge.inativo, .campus-badge.pendente, .campus-badge.rejeitado"
                        );


                    if (
                        badge
                    ) {

                        badge.classList.remove(
                            "ativo",
                            "inativo",
                            "pendente",
                            "rejeitado"
                        );


                        if (
                            campus.status_aprovacao ===
                            "pendente"
                        ) {

                            badge.classList.add(
                                "pendente"
                            );


                            badge.textContent =
                                "Aguardando aprovação";

                        } else if (
                            campus.status_aprovacao ===
                            "rejeitado"
                        ) {

                            badge.classList.add(
                                "rejeitado"
                            );


                            badge.textContent =
                                "Rejeitado";

                        } else {

                            badge.classList.add(
                                "ativo"
                            );


                            badge.textContent =
                                "Ativo";
                        }
                    }


                    adicionarBotaoExcluir(
                        card,
                        id
                    );
                }
            );
    }


    function adicionarBotaoExcluir(
        card,
        campusId
    ) {

        const acoes =
            card.querySelector(
                ".campus-card-actions"
            );


        if (
            !acoes ||
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


        botao.dataset.excluirCampus =
            campusId;


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


    async function excluirCampus(
        campusId,
        card,
        botao
    ) {

        const nome =
            card
                .querySelector(
                    ".campus-card-header h3"
                )
                ?.textContent
                ?.trim() ||
            "este campus";


        if (
            !window.confirm(
                `Excluir o campus "${nome}"?`
            )
        ) {

            return;
        }


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
                    "Erro ao excluir campus"
                );
            }


            card.remove();


            estados.delete(
                Number(
                    campusId
                )
            );


            window.alert(
                "Campus excluído com sucesso."
            );


        } catch (erro) {

            window.alert(
                erro.message ||
                "Erro ao excluir campus."
            );


            botao.disabled =
                false;


            botao.textContent =
                "Excluir campus";
        }
    }


    function observarLista() {

        const observer =
            new MutationObserver(
                () => {

                    clearTimeout(
                        timerAtualizacao
                    );


                    timerAtualizacao =
                        window.setTimeout(
                            carregarEstados,
                            200
                        );
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


    document.addEventListener(
        "click",

        event => {

            if (
                event.target.closest(
                    '[data-section="campi"]'
                )
            ) {

                carregarEstados();
            }
        }
    );


    adicionarEstilos();

    observarLista();

    carregarEstados();

})();