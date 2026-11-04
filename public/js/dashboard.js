// =========================================================
// SIA - CARREGADOR DO DASHBOARD INSTITUCIONAL
//
// Carrega:
// 1. dashboard institucional existente
// 2. core do dashboard
// 3. gestão Curso <-> Campi
// 4. cursos ofertados por campus
// 5. exclusão lógica de campus
// =========================================================

(function iniciarDashboard() {

    carregarScript(
        "/js/dashboard-institucional.js?v=1",
        "script-dashboard-institucional",
        () => {

            aguardarDashboardCore(
                () => {

                    carregarScript(
                        "/js/dashboard-curso-campus.js?v=2",
                        "script-dashboard-curso-campus"
                    );


                    carregarScript(
                        "/js/dashboard-campi-cursos.js?v=1",
                        "script-dashboard-campi-cursos"
                    );


                    carregarScript(
                        "/js/dashboard-campi-excluir.js?v=2",
                        "script-dashboard-campi-excluir"
                    );
                }
            );
        }
    );


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