document.addEventListener("DOMContentLoaded", function() {
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
