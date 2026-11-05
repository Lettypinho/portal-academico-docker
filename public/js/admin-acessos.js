// =========================================================
// SIA - CARREGADOR DOS MÓDULOS ADMINISTRATIVOS
//
// Carrega:
// 1. acessos e permissões existentes;
// 2. central de aprovações.
// =========================================================

(function iniciarModulosAdmin() {

    carregarScript(
        "/js/admin-acessos-core.js?v=4",
        "script-admin-acessos-core",
        () => {

            carregarScript(
                "/js/admin-aprovacoes.js?v=1",
                "script-admin-aprovacoes"
            );
        }
    );


    function carregarScript(
        src,
        id,
        callback = null
    ) {

        if (
            document.getElementById(
                id
            )
        ) {

            callback?.();

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

                callback?.();
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

})();