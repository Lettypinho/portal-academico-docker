// =========================================================
// SIA - CARREGADOR DO DASHBOARD INSTITUCIONAL
//
// Carrega:
// 1. dashboard institucional existente
// 2. core do dashboard
// 3. gestão Curso -> Campus
// =========================================================

(function iniciarDashboard() {

    carregarScript(
        "/js/dashboard-institucional.js?v=1",
        "script-dashboard-institucional",
        () => {

            aguardarDashboardCore(
                () => {

                    carregarScript(
                        "/js/dashboard-curso-campus.js?v=1",
                        "script-dashboard-curso-campus"
                    );
                }
            );
        }
    );


    // =====================================================
    // CARREGAR SCRIPT
    // =====================================================

    function carregarScript(
        src,
        id,
        callback = null
    ) {

        const existente =
            document.getElementById(
                id
            );


        if (
            existente
        ) {

            if (
                callback
            ) {

                callback();
            }


            return;
        }


        const script =
            document.createElement(
                "script"
            );


        script.id =
            id;


        script.src =
            src;


        script.onload =
            () => {

                if (
                    callback
                ) {

                    callback();
                }
            };


        script.onerror =
            () => {

                console.error(
                    `Não foi possível carregar ${src}`
                );
            };


        document.body.appendChild(
            script
        );
    }


    // =====================================================
    // AGUARDAR CORE
    // =====================================================

    function aguardarDashboardCore(
        callback,
        tentativas = 0
    ) {

        if (
            typeof window.abrirSecao ===
            "function"
        ) {

            callback();

            return;
        }


        if (
            tentativas >=
            100
        ) {

            console.error(
                "O core do dashboard não foi carregado."
            );

            return;
        }


        window.setTimeout(
            () => {

                aguardarDashboardCore(
                    callback,
                    tentativas + 1
                );
            },
            50
        );
    }

})();