// =========================================================
// SIA - Autenticação
// =========================================================


// =========================================================
// MOSTRAR / OCULTAR SENHA
// =========================================================

document
    .querySelectorAll(".toggle-password")
    .forEach((botao) => {

        botao.addEventListener("click", () => {

            const campoId =
                botao.dataset.target;

            const campo =
                document.getElementById(campoId);

            if (campo.type === "password") {
                campo.type = "text";
                botao.textContent = "Ocultar";
            } else {
                campo.type = "password";
                botao.textContent = "Mostrar";
            }
        });

    });


// =========================================================
// MENSAGEM
// =========================================================

function mostrarMensagem(texto, tipo = "erro") {

    const elemento =
        document.getElementById("mensagem");

    if (!elemento) {
        return;
    }

    elemento.textContent = texto;

    elemento.className =
        `form-message ${tipo}`;
}


// =========================================================
// LOGIN
// =========================================================

const formLogin =
    document.getElementById("form-login");

if (formLogin) {

    formLogin.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            mostrarMensagem("");

            const email =
                document
                    .getElementById("email")
                    .value;

            const senha =
                document
                    .getElementById("senha")
                    .value;

            try {

                const resposta =
                    await fetch(
                        "/api/auth/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email,
                                senha
                            })
                        }
                    );

                const dados =
                    await resposta.json();

                if (!resposta.ok) {

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

                setTimeout(() => {
                    window.location.href =
                        "/index.html";
                }, 500);

            } catch (erro) {

                console.error(erro);

                mostrarMensagem(
                    "Não foi possível conectar ao servidor."
                );
            }
        }
    );
}


// =========================================================
// CARREGAR UNIVERSIDADES
// =========================================================

async function carregarUniversidades() {

    const select =
        document.getElementById(
            "universidade"
        );

    if (!select) {
        return;
    }

    try {

        const resposta =
            await fetch(
                "/api/universidades"
            );

        const universidades =
            await resposta.json();

        select.innerHTML = `
            <option value="">
                Selecione sua universidade
            </option>
        `;

        universidades.forEach(
            (universidade) => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    universidade.id;

                option.textContent =
                    `${universidade.nome} (${universidade.sigla || universidade.estado})`;

                select.appendChild(
                    option
                );
            }
        );

    } catch (erro) {

        console.error(erro);

        select.innerHTML = `
            <option value="">
                Erro ao carregar universidades
            </option>
        `;
    }
}


// =========================================================
// CADASTRO
// =========================================================

const formCadastro =
    document.getElementById(
        "form-cadastro"
    );

if (formCadastro) {

    carregarUniversidades();

    formCadastro.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            mostrarMensagem("");

            const nome =
                document
                    .getElementById("nome")
                    .value;

            const email =
                document
                    .getElementById("email")
                    .value;

            const universidade_id =
                document
                    .getElementById(
                        "universidade"
                    )
                    .value;

            const senha =
                document
                    .getElementById("senha")
                    .value;

            const confirmarSenha =
                document
                    .getElementById(
                        "confirmar-senha"
                    )
                    .value;


            if (senha !== confirmarSenha) {

                mostrarMensagem(
                    "As senhas não coincidem."
                );

                return;
            }


            try {

                const resposta =
                    await fetch(
                        "/api/auth/cadastro",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                nome,
                                email,
                                senha,
                                universidade_id
                            })
                        }
                    );

                const dados =
                    await resposta.json();

                if (!resposta.ok) {

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

                setTimeout(() => {

                    window.location.href =
                        "/login.html";

                }, 1200);

            } catch (erro) {

                console.error(erro);

                mostrarMensagem(
                    "Não foi possível conectar ao servidor."
                );
            }
        }
    );
}