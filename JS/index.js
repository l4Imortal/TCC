document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado");
  
  // Hamburger menu functionality
  const menuIcon = document.getElementById("menuIcon");
  const menuContent = document.getElementById("menuContent");
  
  if (menuIcon && menuContent) {
    menuIcon.addEventListener("click", () => {
      menuIcon.classList.toggle("open");
      menuContent.style.display = menuContent.style.display === "block" ? "none" : "block";
    });
    
    // Close menu when clicking outside
    document.addEventListener("click", (event) => {
      if (!menuIcon.contains(event.target) && !menuContent.contains(event.target)) {
        menuIcon.classList.remove("open");
        menuContent.style.display = "none";
      }
    });
  }
  
  // Logout button functionality
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("usuarioLogado");
      window.location.href = "login.html";
    });
  }
  
  function extrairNumero(valor) {
    if (valor == null) return 0;
    if (typeof valor === "number") return valor;
    if (typeof valor === "string") {
      return parseFloat(valor.replace(/[R$\s]/g, "").replace(",", ".")) || 0;
    }
    return 0;
  }
  
  function formatarMoeda(valor) {
    return `R$ ${Number(valor).toFixed(2)}`;
  }
  
  async function fetchJson(url) {
    try {
      console.log(`Buscando dados de: ${url}`);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Erro ao buscar dados: ${response.statusText}`);
      const data = await response.json();
      console.log(`Dados recebidos de ${url}:`, data.length);
      return data;
    } catch (error) {
      console.error(`Erro ao buscar ${url}:`, error);
      return [];
    }
  }
  
  // Funções para buscar dados da API
  const buscarProdutos = () => fetchJson('http://localhost:3000/api/produtos');
  const buscarEntradas = () => fetchJson('http://localhost:3000/api/entradas');
  const buscarSaidas = () => fetchJson('http://localhost:3000/api/saidas');
  const buscarEstoqueAtual = () => fetchJson('http://localhost:3000/api/relatorios/estoque');
  
  async function atualizarContadores() {
    console.log("Iniciando atualização dos contadores...");
    
    try {
      // Buscar dados diretamente da API em vez de calcular localmente
      const produtos = await buscarProdutos();
      const estoqueAtual = await buscarEstoqueAtual();
      const entradas = await buscarEntradas();
      const saidas = await buscarSaidas();
      
      console.log("Dados recebidos:", {
        produtos: produtos.length,
        estoqueAtual: estoqueAtual.length,
        entradas: entradas.length,
        saidas: saidas.length
      });
      
      // Calcular valores
      const produtosCadastrados = produtos.length;
      const totalItensEstoque = estoqueAtual.reduce((acc, p) => acc + extrairNumero(p.quantidade_atual), 0);
      
      let investimentoTotal = 0;
      let retornoPrevisto = 0;
      
      // Calcular valores financeiros
      estoqueAtual.forEach(produto => {
        const qtdEstoque = extrairNumero(produto.quantidade_atual);
        if (qtdEstoque <= 0) return;
        
        // Buscar o preço médio de compra nas entradas
        const entradasDoProduto = entradas.filter(e => e.ean === produto.ean);
        const precoMedioCompra = entradasDoProduto.length > 0
          ? entradasDoProduto.reduce((acc, e) => acc + extrairNumero(e.valor_unitario), 0) / entradasDoProduto.length
          : 0;
          
        // Calcular preço de venda (30% acima do preço de compra)
        const precoVenda = precoMedioCompra * 1.3;
        
        investimentoTotal += qtdEstoque * precoMedioCompra;
        retornoPrevisto += qtdEstoque * precoVenda;
      });
      
      const lucro = retornoPrevisto - investimentoTotal;
      const margemLucro = retornoPrevisto > 0 ? (lucro / retornoPrevisto) * 100 : 0;
      
      console.log("Valores calculados:", {
        produtosCadastrados,
        totalItensEstoque,
        investimentoTotal,
        retornoPrevisto,
        margemLucro
      });
      
      // Atualizar apenas o texto dos cards, sem substituir os ícones
      const produtosCadastradosLink = document.getElementById("produtosCadastradosLink");
      if (produtosCadastradosLink) {
        // Encontrar ou criar o elemento div para o conteúdo
        let contentDiv = produtosCadastradosLink.querySelector('.card-content');
        if (!contentDiv) {
          contentDiv = document.createElement('div');
          contentDiv.className = 'card-content';
          produtosCadastradosLink.appendChild(contentDiv);
        }
        contentDiv.innerHTML = `
          <strong>${produtosCadastrados}</strong> produtos<br>
          <strong>${totalItensEstoque}</strong> itens no estoque
        `;
      }
      
      // Produtos com estoque zerado
      const estoqueZeradoCount = estoqueAtual.filter(p => extrairNumero(p.quantidade_atual) <= 0).length;
      const estoqueZeradoLink = document.getElementById("estoqueZeradoLink");
      if (estoqueZeradoLink) {
        let contentDiv = estoqueZeradoLink.querySelector('.card-content');
        if (!contentDiv) {
          contentDiv = document.createElement('div');
          contentDiv.className = 'card-content';
          estoqueZeradoLink.appendChild(contentDiv);
        }
        contentDiv.innerHTML = `
          <strong>${estoqueZeradoCount}</strong> produtos<br>
          com estoque zerado
        `;
      }
      
      // Produtos no estoque mínimo
      const estoqueMinimoCount = estoqueAtual.filter(p => {
        const qtd = extrairNumero(p.quantidade_atual);
        const min = extrairNumero(p.estoque_minimo);
        return qtd > 0 && qtd <= min;
      }).length;
      
      const estoqueMinimoLink = document.getElementById("estoqueMinimoLink");
      if (estoqueMinimoLink) {
        let contentDiv = estoqueMinimoLink.querySelector('.card-content');
        if (!contentDiv) {
          contentDiv = document.createElement('div');
          contentDiv.className = 'card-content';
          estoqueMinimoLink.appendChild(contentDiv);
        }
        contentDiv.innerHTML = `
          <strong>${estoqueMinimoCount}</strong> produtos<br>
          no estoque mínimo
        `;
      }
      
      // Adicionar card financeiro
      const financeiroLink = document.getElementById("financeiroLink");
      if (financeiroLink) {
        let contentDiv = financeiroLink.querySelector('.card-content');
        if (!contentDiv) {
          contentDiv = document.createElement('div');
          contentDiv.className = 'card-content';
          financeiroLink.appendChild(contentDiv);
        }
        contentDiv.innerHTML = `
          Investimento: <strong>${formatarMoeda(investimentoTotal)}</strong><br>
          Retorno: <strong>${formatarMoeda(retornoPrevisto)}</strong>
        `;
      }
      
      // Carregar atividades recentes
      carregarAtividadesRecentes(entradas, saidas);
      
    } catch (error) {
      console.error("Erro ao atualizar contadores:", error);
    }
  }
  
  function formatarDataAtividade(data) {
    const agora = new Date();
    const diff = agora - data;
    const umDia = 24 * 60 * 60 * 1000;
    
    if (diff < umDia && agora.getDate() === data.getDate()) {
      return `Hoje, ${data.getHours().toString().padStart(2, '0')}:${data.getMinutes().toString().padStart(2, '0')}`;
    } else if (diff < 2 * umDia) {
      return `Ontem, ${data.getHours().toString().padStart(2, '0')}:${data.getMinutes().toString().padStart(2, '0')}`;
    } else {
      return `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}, ${data.getHours().toString().padStart(2, '0')}:${data.getMinutes().toString().padStart(2, '0')}`;
    }
  }
  
  async function carregarAtividadesRecentes(entradas = null, saidas = null) {
    try {
      console.log("Carregando atividades recentes...");
      
      // Se não foram passados como parâmetros, buscar da API
      if (!entradas) entradas = await buscarEntradas();
      if (!saidas) saidas = await buscarSaidas();
      
      // Combinar e ordenar por data (mais recentes primeiro)
      const atividades = [
        ...entradas.map(e => ({
          tipo: 'entry',
          titulo: 'Entrada de Produtos',
          descricao: `${e.quantidade} unidades de ${e.produto}`,
          data: new Date(e.data_entrada || e.data_saida),
          icone: 'arrow-down'
        })),
        ...saidas.map(s => ({
          tipo: 'exit',
          titulo: 'Saída de Produtos',
          descricao: `${s.quantidade} unidades de ${s.produto}`,
          data: new Date(s.data_saida),
          icone: 'arrow-up'
        }))
      ];
      
      // Ordenar por data (mais recentes primeiro)
      atividades.sort((a, b) => b.data - a.data);
      
      // Pegar apenas as 5 atividades mais recentes
      const atividadesRecentes = atividades.slice(0, 5);
      
      // Se não houver atividades, usar dados de exemplo
      if (atividadesRecentes.length === 0) {
        console.log("Nenhuma atividade encontrada, mantendo dados de exemplo");
        return; // Manter os dados de exemplo do HTML
      }
      
      console.log(`Exibindo ${atividadesRecentes.length} atividades recentes`);
      
      // Atualizar a lista de atividades
      const listaAtividades = document.getElementById('recentActivities');
      if (listaAtividades) {
        listaAtividades.innerHTML = atividadesRecentes.map(atividade => {
          const dataFormatada = formatarDataAtividade(atividade.data);
          return `
            <div class="activity-item">
              <div class="activity-icon ${atividade.tipo}">
                <i class="fas fa-${atividade.icone}"></i>
              </div>
              <div class="activity-details">
                <p class="activity-title">${atividade.titulo}</p>
                <p class="activity-description">${atividade.descricao}</p>
                <p class="activity-time">${dataFormatada}</p>
              </div>
            </div>
          `;
        }).join('');
      }
    } catch (error) {
      console.error("Erro ao carregar atividades recentes:", error);
      // Manter os dados de exemplo do HTML em caso de erro
    }
  }
  
  // Inicializar a página
  atualizarContadores();
  
  console.log("Inicialização da página concluída");
});
