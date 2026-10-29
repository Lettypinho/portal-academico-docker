// =========================================================
// SIA - AUTENTICAÇÃO
// =========================================================


// =========================================================
// MOSTRAR / OCULTAR SENHA
// =========================================================

document
    .querySelectorAll(
        ".toggle-password"
    )
    .forEach(
        botao => {

            botao.addEventListener(
                "click",
                () => {

                    const campoId =
                        botao.dataset
                            .target;


                    const campo =
                        document.getElementById(
                            campoId
                        );


                    if (
                        !campo
                    ) {

                        return;
                    }


                    if (
                        campo.type ===
                        "password"
                    ) {

                        campo.type =
                            "text";


                        botao.textContent =
                            "Ocultar";


                    } else {

                        campo.type =
                            "password";


                        botao.textContent =
                            "Mostrar";
                    }
                }
            );
        }
    );


// =========================================================
// MENSAGENS
// =========================================================

function mostrarMensagem(
    texto,
    tipo = "erro"
) {

    const elemento =
        document.getElementById(
            "mensagem"
        );


    if (
        !elemento
    ) {

        return;
    }


    elemento.textContent =
        texto;


    elemento.className =
        `form-message ${tipo}`;
}


function limparMensagem() {

    const elemento =
        document.getElementById(
            "mensagem"
        );


    if (
        !elemento
    ) {

        return;
    }


    elemento.textContent =
        "";


    elemento.className =
        "form-message";
}


// =========================================================
// LOGIN
// =========================================================

const formLogin =
    document.getElementById(
        "form-login"
    );


if (
    formLogin
) {

    formLogin.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            limparMensagem();


            const email =
                document
                    .getElementById(
                        "email"
                    )
                    .value
                    .trim();


            const senha =
                document
                    .getElementById(
                        "senha"
                    )
                    .value;


            if (
                !email ||
                !senha
            ) {

                mostrarMensagem(
                    "Informe e-mail e senha."
                );

                return;
            }


            const botao =
                formLogin.querySelector(
                    'button[type="submit"]'
                );


            const textoOriginal =
                botao.textContent;


            botao.disabled =
                true;


            botao.textContent =
                "Entrando...";


            try {

                const resposta =
                    await fetch(
                        "/api/auth/login",
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    email,
                                    senha
                                })
                        }
                    );


                const dados =
                    await resposta.json();


                if (
                    !resposta.ok
                ) {

                    mostrarMensagem(
                        dados.erro ||
                        "Não foi possível realizar o login."
                    );

                    return;
                }


                mostrarMensagem(
                    "Login realizado com sucesso.",
                    "sucesso"
                );


                setTimeout(
                    () => {

                        const perfil =
                            dados.usuario
                                .perfil;


                        if (
                            perfil ===
                                "publico" ||
                            perfil ===
                                "aluno"
                        ) {

                            window.location.href =
                                "/explorar.html";

                            return;
                        }


                        if (
                            perfil ===
                                "institucional" ||

                            // Compatibilidade apenas
                            // para sessões antigas.

                            perfil ===
                                "consulta_institucional" ||

                            perfil ===
                                "gestor" ||

                            perfil ===
                                "admin_universidade"
                        ) {

                            window.location.href =
                                "/dashboard.html";

                            return;
                        }


                        if (
                            perfil ===
                            "super_admin"
                        ) {

                            window.location.href =
                                "/admin.html";

                            return;
                        }


                        window.location.href =
                            "/login.html";

                    },
                    500
                );


            } catch (erro) {

                console.error(
                    "Erro no login:",
                    erro
                );


                mostrarMensagem(
                    "Não foi possível conectar ao servidor."
                );


            } finally {

                botao.disabled =
                    false;


                botao.textContent =
                    textoOriginal;
            }
        }
    );
}


// =========================================================
// CADASTRO PÚBLICO
// =========================================================

const formCadastro =
    document.getElementById(
        "form-cadastro"
    );


if (
    formCadastro
) {

    formCadastro.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            limparMensagem();


            const nome =
                document
                    .getElementById(
                        "nome"
                    )
                    .value
                    .trim();


            const email =
                document
                    .getElementById(
                        "email"
                    )
                    .value
                    .trim();


            const senha =
                document
                    .getElementById(
                        "senha"
                    )
                    .value;


            const confirmarSenha =
                document
                    .getElementById(
                        "confirmar-senha"
                    )
                    .value;


            if (
                !nome ||
                !email ||
                !senha ||
                !confirmarSenha
            ) {

                mostrarMensagem(
                    "Preencha todos os campos."
                );

                return;
            }


            if (
                senha.length <
                6
            ) {

                mostrarMensagem(
                    "A senha deve possuir pelo menos 6 caracteres."
                );

                return;
            }


            if (
                senha !==
                confirmarSenha
            ) {

                mostrarMensagem(
                    "As senhas não coincidem."
                );

                return;
            }


            const botao =
                formCadastro
                    .querySelector(
                        'button[type="submit"]'
                    );


            const textoOriginal =
                botao.textContent;


            botao.disabled =
                true;


            botao.textContent =
                "Criando conta...";


            try {

                const resposta =
                    await fetch(
                        "/api/auth/cadastro",
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    nome,
                                    email,
                                    senha
                                })
                        }
                    );


                const dados =
                    await resposta.json();


                if (
                    !resposta.ok
                ) {

                    mostrarMensagem(
                        dados.erro ||
                        "Não foi possível realizar o cadastro."
                    );

                    return;
                }


                mostrarMensagem(
                    "Conta criada com sucesso! Redirecionando para o login...",
                    "sucesso"
                );


                formCadastro.reset();


                setTimeout(
                    () => {

                        window.location.href =
                            "/login.html";

                    },
                    1200
                );


            } catch (erro) {

                console.error(
                    "Erro no cadastro:",
                    erro
                );


                mostrarMensagem(
                    "Não foi possível conectar ao servidor."
                );


            } finally {

                botao.disabled =
                    false;


                botao.textContent =
                    textoOriginal;
            }
        }
    );
}