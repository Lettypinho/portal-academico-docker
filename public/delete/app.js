async function carregarAlunos() {

    try {

        const resposta = await fetch("/api/alunos");

        const alunos = await resposta.json();

        const tabela = document.getElementById("tabela-alunos");

        tabela.innerHTML = "";

        alunos.forEach(aluno => {

            const linha = document.createElement("tr");

            linha.innerHTML = `
                <td>${aluno.id}</td>
                <td>${aluno.nome}</td>
                <td>${aluno.email}</td>
                <td>${aluno.data_nascimento}</td>
                <td>${aluno.curso || "Sem curso"}</td>
            `;

            tabela.appendChild(linha);

        });

    } catch (erro) {

        console.error("Erro:", erro);

        alert("Erro ao buscar os alunos.");

    }
}
