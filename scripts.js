document.addEventListener("DOMContentLoaded", function () {
    // Função para buscar produtos do backend
    function carregarProdutos() {
        fetch("http://localhost:3000/produtos")
            .then((response) => response.json())
            .then((produtos) => {
                const container = document.createElement("div");
                container.classList.add("produtos-container");

                produtos.forEach((produto) => {
                    const produtoDiv = document.createElement("div");
                    produtoDiv.classList.add("produto");

                    produtoDiv.innerHTML = `
                        <h2>${produto.nome}</h2>
                        <p>${produto.descricao}</p>
                        <p>Preço: R$ ${produto.preco.toFixed(2).replace(".", ",")}</p>
                        <p>Categoria: ${produto.categoria || "Sem categoria"}</p>
                    `;

                    container.appendChild(produtoDiv);
                });

                document.body.appendChild(container);
            })
            .catch((error) => {
                console.error("Erro ao carregar os produtos:", error);
            });
    }

    // Chamar a função para carregar os produtos
    carregarProdutos();

    // Exemplo de dados para os gráficos
    const entradasSaidasData = [12, 19, 3, 5, 2, 3, 7, 10, 12, 8];
    const atividadesData = [2, 3, 20, 5, 1, 4, 6, 8, 9, 6];

    // Exemplo de função para exibir gráficos (você pode usar uma biblioteca como Chart.js)
    function drawChart(id, data) {
        const chartElement = document.getElementById(id);
        chartElement.innerHTML = "<p>Dados: " + data.join(", ") + "</p>";
    }

    drawChart("entradas-saidas", entradasSaidasData);
    drawChart("atividades-sistema", atividadesData);
});
