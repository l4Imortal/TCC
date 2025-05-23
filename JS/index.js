document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado");

  // Hamburger menu functionality
  const menuIcon = document.getElementById("menuIcon");
  const menuContent = document.getElementById("menuContent");

  if (menuIcon && menuContent) {
    menuIcon.addEventListener("click", () => {
      menuIcon.classList.toggle("open");
      menuContent.style.display =
        menuContent.style.display === "block" ? "none" : "block";
    });

    // Close menu when clicking outside
    document.addEventListener("click", (event) => {
      if (
        !menuIcon.contains(event.target) &&
        !menuContent.contains(event.target)
      ) {
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
      if (!response.ok)
        throw new Error(`Erro ao buscar dados: ${response.statusText}`);
      const data = await response.json();
      console.log(`Dados recebidos de ${url}:`, data.length);
      return data;
    } catch (error) {
      console.error(`Erro ao buscar ${url}:`, error);
      return [];
    }
  }

  // Funções para buscar dados da API
  const buscarProdutos = () => fetchJson("http://localhost:3000/api/produtos");
  const buscarEntradas = () => fetchJson("http://localhost:3000/api/entradas");
  const buscarSaidas = () => fetchJson("http://localhost:3000/api/saidas");
  const buscarEstoqueAtual = () =>
    fetchJson("http://localhost:3000/api/relatorios/estoque");

  async function atualizarContadores() {
    try {
      // Buscar dados diretamente da API
      const produtos = await buscarProdutos();
      const entradas = await buscarEntradas();
      const saidas = await buscarSaidas();

      // Calcular estoque atual para cada produto (igual ao relatório)
      const produtosComEstoque = produtos.map((produto) => {
        const entradasDoProduto = entradas.filter((e) => e.ean === produto.ean);
        const saidasDoProduto = saidas.filter((s) => s.ean === produto.ean);

        let totalEntradas = 0;
        entradasDoProduto.forEach((e) => {
          totalEntradas += parseInt(e.quantidade || 0);
        });

        let totalSaidas = 0;
        saidasDoProduto.forEach((s) => {
          totalSaidas += parseInt(s.quantidade || 0);
        });

        const estoqueAtual = totalEntradas - totalSaidas;

        return {
          ...produto,
          quantidade_atual: estoqueAtual,
        };
      });

      // Totais para os cards
      const totalProdutos = produtosComEstoque.length;
      let totalItens = 0;
      let produtosSemEstoque = 0;
      let produtosEstoqueMinimo = 0;

      produtosComEstoque.forEach((produto) => {
        const quantidade = parseInt(produto.quantidade_atual || 0);
        const estoqueMinimo = parseInt(produto.estoque_minimo || 5);

        totalItens += Math.max(0, quantidade);
        if (quantidade <= 0) produtosSemEstoque++;
        else if (quantidade <= estoqueMinimo) produtosEstoqueMinimo++;
      });

      // Atualizar o card azul (produtos cadastrados e itens no estoque)
      const produtosCadastradosLink = document.getElementById(
        "produtosCadastradosLink"
      );
      if (produtosCadastradosLink) {
        let contentDiv = produtosCadastradosLink.querySelector(".card-content");
        if (!contentDiv) {
          contentDiv = document.createElement("div");
          contentDiv.className = "card-content";
          produtosCadastradosLink.appendChild(contentDiv);
        }
        contentDiv.innerHTML = `
          <strong>${totalProdutos}</strong> produtos<br>
          <strong>${totalItens}</strong> itens no estoque
        `;
      }

      // Atualizar o card vermelho (produtos com estoque zerado)
      const estoqueZeradoLink = document.getElementById("estoqueZeradoLink");
      if (estoqueZeradoLink) {
        let contentDiv = estoqueZeradoLink.querySelector(".card-content");
        if (!contentDiv) {
          contentDiv = document.createElement("div");
          contentDiv.className = "card-content";
          estoqueZeradoLink.appendChild(contentDiv);
        }
        contentDiv.innerHTML = `
          <strong>${produtosSemEstoque}</strong> produtos<br>
          com estoque zerado
        `;
      }

      // Atualizar o card amarelo (produtos no estoque mínimo)
      const estoqueMinimoLink = document.getElementById("estoqueMinimoLink");
      if (estoqueMinimoLink) {
        let contentDiv = estoqueMinimoLink.querySelector(".card-content");
        if (!contentDiv) {
          contentDiv = document.createElement("div");
          contentDiv.className = "card-content";
          estoqueMinimoLink.appendChild(contentDiv);
        }
        contentDiv.innerHTML = `
          <strong>${produtosEstoqueMinimo}</strong> produtos<br>
          no estoque mínimo
        `;
      }

      // Carregar atividades recentes normalmente
      carregarAtividadesRecentes(entradas, saidas, produtos);
    } catch (error) {
      console.error("Erro ao atualizar contadores:", error);
    }
  }

  function formatarDataAtividade(data) {
    const agora = new Date();
    const diff = agora - data;
    const umDia = 24 * 60 * 60 * 1000;

    if (diff < umDia && agora.getDate() === data.getDate()) {
      return `Hoje, ${data.getHours().toString().padStart(2, "0")}:${data
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    } else if (diff < 2 * umDia) {
      return `Ontem, ${data.getHours().toString().padStart(2, "0")}:${data
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${data.getDate().toString().padStart(2, "0")}/${(
        data.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${data.getFullYear()}, ${data
        .getHours()
        .toString()
        .padStart(2, "0")}:${data.getMinutes().toString().padStart(2, "0")}`;
    }
  }

  async function carregarAtividadesRecentes(
    entradas = null,
    saidas = null,
    produtos = null
  ) {
    try {
      console.log("Carregando atividades recentes...");

      if (!entradas) entradas = await buscarEntradas();
      if (!saidas) saidas = await buscarSaidas();
      if (!produtos) produtos = await buscarProdutos();

      // Atividades de cadastro de produto (últimos 5 produtos)
      const atividadesProdutos = produtos
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 5)
        .map((p) => ({
          tipo: "product",
          titulo: "Novo Produto Cadastrado",
          descricao: p.produto,
          data: new Date(p.data),
          icone: "box",
        }));

      // Entradas e saídas
      const atividades = [
        ...entradas.map((e) => ({
          tipo: "entry",
          titulo: "Entrada de Produtos",
          descricao: `${e.quantidade} unidades de ${e.produto}`,
          data: new Date(e.data_entrada || e.data_saida),
          icone: "arrow-down",
        })),
        ...saidas.map((s) => ({
          tipo: "exit",
          titulo: "Saída de Produtos",
          descricao: `${s.quantidade} unidades de ${s.produto}`,
          data: new Date(s.data_saida),
          icone: "arrow-up",
        })),
        ...atividadesProdutos,
      ];

      // Ordenar por data (mais recentes primeiro)
      atividades.sort((a, b) => b.data - a.data);

      // Pegar apenas as 5 atividades mais recentes
      const atividadesRecentes = atividades.slice(0, 5);

      // Atualizar a lista de atividades
      const listaAtividades = document.getElementById("recentActivities");
      if (listaAtividades) {
        if (atividadesRecentes.length === 0) {
          listaAtividades.innerHTML = `<p class="sem-atividades">Nenhuma atividade recente.</p>`;
        } else {
          listaAtividades.innerHTML = atividadesRecentes
            .map((atividade) => {
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
            })
            .join("");
        }
      }
    } catch (error) {
      console.error("Erro ao carregar atividades recentes:", error);
    }
  }

  // Inicializar a página
  atualizarContadores();

  console.log("Inicialização da página concluída");
});
