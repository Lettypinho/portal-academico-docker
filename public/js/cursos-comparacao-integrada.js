// =========================================================
// SIA - COMPARAÇÃO DE CURSOS INTEGRADA
// =========================================================


// =========================================================
// ABRIR ABA CURSOS E IR PARA COMPARAÇÃO
// =========================================================

function abrirComparacaoCursosIntegrada() {

    if (
        typeof abrirSecao ===
        "function"
    ) {

        abrirSecao(
            "cursos"
        );
    }


    const comparacao =
        document.getElementById(
            "comparacao-cursos-integrada"
        );


    if (!comparacao) {

        return;
    }


    window.setTimeout(
        () => {

            comparacao.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "start"
            });


            const campoCurso =
                document.getElementById(
                    "curso-comparacao"
                );


            if (campoCurso) {

                window.setTimeout(
                    () => {

                        campoCurso.focus();

                    },
                    550
                );
            }

        },
        80
    );
}


// =========================================================
// BOTÃO DA HOME
// =========================================================

const botaoHeroComparar =
    document.getElementById(
        "btn-ir-comparar"
    );


if (botaoHeroComparar) {

    /*
        O explorar.js possui o comportamento antigo,
        que tenta abrir a antiga seção "comparar".

        O listener em modo capture executa antes
        daquele comportamento antigo e impede que
        ele seja disparado.
    */

    botaoHeroComparar.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopImmediatePropagation();


            abrirComparacaoCursosIntegrada();

        },
        true
    );
}


// =========================================================
// BOTÃO DA ABA CURSOS
// =========================================================

const botaoAtalhoComparacao =
    document.getElementById(
        "btn-ir-comparacao-cursos"
    );


if (botaoAtalhoComparacao) {

    botaoAtalhoComparacao.addEventListener(
        "click",
        abrirComparacaoCursosIntegrada
    );
}