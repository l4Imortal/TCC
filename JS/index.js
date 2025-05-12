document.addEventListener("DOMContentLoaded", () => {
  // Hamburger menu functionality
  const menuIcon = document.getElementById("menuIcon");
  const menuContent = document.getElementById("menuContent");
  
  menuIcon.addEventListener("click", function () {
    this.classList.toggle("open");
    if (menuContent.style.display === "block") {
      menuContent.style.display = "none";
    } else {
      menuContent.style.display = "block";
    }
  });

  // Close menu when clicking outside
  document.addEventListener("click", function (event) {
    if (!menuIcon.contains(event.target) && !menuContent.contains(event.target)) {
      menuIcon.classList.remove("open");
      menuContent.style.display = "none";
    }
  });

  // Logout button functionality
  document.getElementById("logoutButton").addEventListener("click", function () {
    // Clear user session data
    localStorage.removeItem("usuarioLogado");
    // Redirect to login page
    window.location.href = "login.html";
  });

  // Função para extrair número de um valor (string ou número)
  function extrairNumero(valor) {
    if (valor === undefined || valor === null) return 0;
    if (typeof valor === "number") return valor;
    if (typeof valor === "string") {
      // Remove R$, espaços e substitui vírgula por ponto
      return parseFloat(valor.replace(/[R$\s]/g, "").replace(",", ".")) || 0;
    }
    return 0;
  }

  // Função para formatar valores monetários
  function formatarMoeda(valor) {
    return `R$ ${parseFloat(valor).toFixed(2)}`;
  }

  // Função para atualizar os contadores
  function atualizarContadores() {
    console.log("Iniciando atualização dos contadores...");
    
    // Obter produtos do localStorage
    let produtos = [];
    try {
      const produtosString = localStorage.getItem("produtos");
      console.log("Dados brutos do localStorage:", produtosString);
      if (produtosString && produtosString !== "null") {
        produtos = JSON.parse(produtosString);
        console.log("Produtos carregados:", produtos.length);
      } else {
        console.warn("Nenhum produto encontrado no localStorage");
        // Não criar produtos de teste, usar array vazio
        produtos = [];
      }
    } catch (e) {
      console.error("Erro ao carregar produtos:", e);
      produtos = [];
    }

    // Contar produtos cadastrados
    const produtosCadastrados = produtos.length;
    
    // Calcular total de itens em estoque
    let totalItensEstoque = 0;
    produtos.forEach((produto) => {
      const quantidade = extrairNumero(produto.estoque);
      totalItensEstoque += quantidade;
    });

    // Calcular investimento total (preço de compra * quantidade em estoque)
    let investimentoTotal = 0;
    // Calcular retorno previsto (preço de venda * quantidade em estoque)
    let retornoPrevisto = 0;
    
    produtos.forEach((produto) => {
      const quantidade = extrairNumero(produto.estoque);
      const precoCompra = extrairNumero(produto.precoCompra);
      const precoVenda = extrairNumero(produto.precoVenda);
      
      const investimentoProduto = quantidade * precoCompra;
      const retornoProduto = quantidade * precoVenda;
      
      console.log(`Produto: ${produto.nome}, Quantidade: ${quantidade}, Preço Compra: ${precoCompra}, Preço Venda: ${precoVenda}`);
      console.log(`Investimento: ${investimentoProduto}, Retorno: ${retornoProduto}`);
      
      investimentoTotal += investimentoProduto;
      retornoPrevisto += retornoProduto;
    });

    // Calcular margem de lucro
    let lucro = retornoPrevisto - investimentoTotal;
    let margemLucro = 0;
    if (retornoPrevisto > 0) {
      margemLucro = (lucro / retornoPrevisto) * 100;
    }
    
    console.log("Investimento total calculado:", investimentoTotal);
    console.log("Retorno previsto calculado:", retornoPrevisto);
    console.log("Margem de lucro calculada:", margemLucro);

    // Atualizar o texto do botão azul
    document.getElementById("produtosCadastradosLink").textContent = `${produtosCadastrados} Produtos Cadastrados, ${totalItensEstoque} Itens no Estoque`;

    // Contar produtos com estoque zerado
    const zeradoCount = produtos.filter((p) => extrairNumero(p.estoque) === 0).length;
    document.getElementById("estoqueZeradoLink").textContent = `${zeradoCount} Produtos Com Estoque Zerado`;

    // Contar produtos que atingiram o estoque mínimo
    const minimoCount = produtos.filter((p) => {
      const qtd = extrairNumero(p.estoque);
      const min = extrairNumero(p.estoqueMinimo);
      return qtd > 0 && qtd <= min;
    }).length;
    
    document.getElementById("estoqueMinimoLink").textContent = `${minimoCount} Produtos Atingiram o Estoque Mínimo`;

    // Atualizar o texto do botão verde com todas as informações solicitadas
    const boxGreen = document.querySelector(".box.green");
    if (boxGreen) {
      boxGreen.innerHTML = `<a href="produtos.html?filter=investimentos">Investimento: ${formatarMoeda(investimentoTotal)}<br>Retorno Previsto: ${formatarMoeda(retornoPrevisto)}<br>Margem de Lucro: ${margemLucro.toFixed(2)}%</a>`;
      console.log("Botão verde atualizado com todos os valores");
    } else {
      console.error("Elemento .box.green não encontrado!");
    }

    // Salvar valores no localStorage para uso em outras páginas
    localStorage.setItem("produtosCadastrados", produtosCadastrados);
    localStorage.setItem("totalItensEstoque", totalItensEstoque);
    localStorage.setItem("produtosEstoqueZerado", zeradoCount);
    localStorage.setItem("produtosEstoqueMinimo", minimoCount);
    localStorage.setItem("investimentoTotal", investimentoTotal.toFixed(2));
    localStorage.setItem("retornoPrevisto", retornoPrevisto.toFixed(2));
    localStorage.setItem("margemLucro", margemLucro.toFixed(2));
  }

  // Chamar a função ao carregar a página
  atualizarContadores();

  // Função para carregar dados do gráfico de entradas e saídas do banco de dados
  function carregarDadosGrafico() {
    // Obter os últimos 10 dias para o gráfico
    const hoje = new Date();
    const dataFim = hoje.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - 30); // Últimos 30 dias
    const dataInicioFormatada = dataInicio.toISOString().split('T')[0];
    
    // Buscar dados de entradas
    fetch(`http://localhost:3000/api/relatorios/entradas?dataInicio=${dataInicioFormatada}&dataFim=${dataFim}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao buscar dados de entradas');
        }
        return response.json();
      })
      .then(dadosEntradas => {
        // Buscar dados de saídas
        return fetch(`http://localhost:3000/api/relatorios/saidas?dataInicio=${dataInicioFormatada}&dataFim=${dataFim}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Erro ao buscar dados de saídas');
            }
            return response.json();
          })
          .then(dadosSaidas => {
            // Processar os dados para o gráfico
            const datas = [];
            const quantidadesEntradas = [];
            const quantidadesSaidas = [];
            
            // Criar um mapa de datas para os últimos 10 dias
            for (let i = 9; i >= 0; i--) {
              const data = new Date();
              data.setDate(data.getDate() - i);
              const dataFormatada = data.toISOString().split('T')[0];
              const dataObj = new Date(dataFormatada);
              const dataExibicao = `${dataObj.getDate()}/${dataObj.getMonth()+1}`;              
              datas.push(dataExibicao);
              
              // Encontrar entradas para esta data
              const entradaDia = dadosEntradas.find(e => e.data_entrada === dataFormatada);
              quantidadesEntradas.push(entradaDia ? entradaDia.quantidade_total : 0);
              
              // Encontrar saídas para esta data
              const saidaDia = dadosSaidas.find(s => s.data_saida === dataFormatada);
              quantidadesSaidas.push(saidaDia ? saidaDia.quantidade_total : 0);
            }
            
            // Criar o gráfico com os dados obtidos
            criarGraficoEntradasSaidas(datas, quantidadesEntradas, quantidadesSaidas);
          });
      })
      .catch(error => {
        console.error('Erro ao carregar dados para o gráfico:', error);
        
        // Em caso de erro, criar gráfico com dados vazios
        const datas = ["Dia 1", "Dia 2", "Dia 3", "Dia 4", "Dia 5", "Dia 6", "Dia 7", "Dia 8", "Dia 9", "Dia 10"];
        criarGraficoEntradasSaidas(datas, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      });
  }

  // Função para criar o gráfico de entradas e saídas
  function criarGraficoEntradasSaidas(datas, dadosEntradas, dadosSaidas) {
    const ctx1 = document.getElementById("entradasSaidasChart").getContext("2d");
    
    new Chart(ctx1, {
      type: "bar",
      data: {
        labels: datas,
        datasets: [
          {
            label: "Entradas",
            data: dadosEntradas,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
          {
            label: "Saídas",
            data: dadosSaidas,
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { 
            beginAtZero: true,
            title: {
              display: true,
              text: 'Quantidade'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Período'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Entradas e Saídas (Últimos 10 dias)',
            font: {
              size: 16
            }
          },
          legend: {
            position: 'bottom'
          }
        }
      },
    });
  }

  // Carregar dados para o gráfico
  carregarDadosGrafico();

  // Gráfico de Atividades do Sistema (mantido como estava)
  const ctx2 = document.getElementById("atividadesSistemaChart");
  if (ctx2) { // Verificar se o elemento existe antes de tentar criar o gráfico
    const ctx2Context = ctx2.getContext("2d");
    new Chart(ctx2Context, {
      type: "line",
      data: {
        labels: ["Dia 1", "Dia 2", "Dia 3", "Dia 4", "Dia 5", "Dia 6", "Dia 7", "Dia 8", "Dia 9", "Dia 10"],
        datasets: [{
          label: "Atividades",
          data: [3, 2, 2, 6, 4, 3, 5, 6, 3, 4],
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
          fill: true,
        }],
      },
      options: {
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }
});
