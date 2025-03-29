document.addEventListener("DOMContentLoaded", function () {
  // Elementos DOM principais
  const tbody = document.querySelector(".center-table tbody");
  let rowToDelete = null;

  // ===== FUNÇÕES DE ARMAZENAMENTO =====

  // Salvar produtos no localStorage
  function salvarProdutosNoLocalStorage() {
    const produtos = [];
    document.querySelectorAll(".center-table tbody tr").forEach((row) => {
      const cells = row.querySelectorAll("td");
      produtos.push({
        foto: cells[0].querySelector("img")?.src || "",
        cod: cells[1].textContent,
        nome: cells[2].textContent,
        categoria: cells[3].textContent,
        un: cells[4].textContent,
        data: cells[5].textContent,
        fornecedor: cells[6].textContent,
        compra: cells[7].textContent,
        venda: cells[8].textContent,
        estoque: cells[9].textContent,
        estoqueMinimo: cells[10].textContent,
      });
    });
    localStorage.setItem("produtos", JSON.stringify(produtos));
  }

  // Carregar produtos do localStorage
  function carregarProdutosDoLocalStorage() {
    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    tbody.innerHTML = ""; // Limpa a tabela antes de adicionar

    produtos.forEach((produto) => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td><img src="${produto.foto}" alt="${produto.nome}" width="50"></td>
          <td>${produto.cod}</td>
          <td>${produto.nome}</td>
          <td>${produto.categoria}</td>
          <td>${produto.un}</td>
          <td>${produto.data}</td>
          <td>${produto.fornecedor}</td>
          <td>${produto.compra}</td>
          <td>${produto.venda}</td>
          <td class="estoque">${produto.estoque}</td>
          <td>${produto.estoqueMinimo}</td>
          <td>
            <a href="#" class="edit-button"><i class="fas fa-edit" style="color: #4caf50; font-size: 20px"></i></a>
            <a href="#" class="delete-button"><i class="fas fa-trash" style="color: #dc3545; font-size: 20px"></i></a>
          </td>
        `;
      tbody.appendChild(row);
    });
  }

  // ===== FUNÇÕES DE INTERFACE =====

  // Carregar categorias e fornecedores para os selects
  function carregarCategoriasEFornecedores() {
    const categorias = new Set();
    const fornecedores = new Set();

    document.querySelectorAll(".center-table tbody tr").forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 7) {
        const categoria = cells[3].textContent.trim();
        const fornecedor = cells[6].textContent.trim();

        if (categoria) categorias.add(categoria);
        if (fornecedor) fornecedores.add(fornecedor);
      }
    });

    // Preencher select de categorias
    const categoriaSelect = document.getElementById("novoProdutoCategoria");
    categoriaSelect.innerHTML = '<option value="">Selecione</option>';
    categorias.forEach((categoria) => {
      const option = document.createElement("option");
      option.value = categoria;
      option.textContent = categoria;
      categoriaSelect.appendChild(option);
    });

    // Preencher select de fornecedores
    const fornecedorSelect = document.getElementById("novoProdutoFornecedor");
    fornecedorSelect.innerHTML = '<option value="">Selecione</option>';
    fornecedores.forEach((fornecedor) => {
      const option = document.createElement("option");
      option.value = fornecedor;
      option.textContent = fornecedor;
      fornecedorSelect.appendChild(option);
    });

    // Também preencher o select de filtro de fornecedores
    const filterFornecedorSelect = document.getElementById("filterFornecedor");
    filterFornecedorSelect.innerHTML = '<option value="">Selecione</option>';
    fornecedores.forEach((fornecedor) => {
      const option = document.createElement("option");
      option.value = fornecedor;
      option.textContent = fornecedor;
      filterFornecedorSelect.appendChild(option);
    });
  }

  // ===== FUNÇÕES DE FORMATAÇÃO =====

  // Formatar valores monetários
  function formatarValorReais(valor) {
    valor = valor.replace(/[^\d,]/g, "");

    const partes = valor.split(",");
    if (partes.length > 2) {
      valor = partes[0] + "," + partes[1].slice(0, 2);
    }

    if (partes[1]) {
      partes[1] = partes[1].slice(0, 2);
    }

    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return partes.join(",");
  }

  // Adicionar centavos se necessário
  function adicionarCentavos(valor) {
    if (!valor) return "0,00";

    if (!valor.includes(",")) {
      return valor + ",00";
    }

    const partes = valor.split(",");
    if (partes[1].length === 0) {
      return valor + "00";
    } else if (partes[1].length === 1) {
      return valor + "0";
    }

    return valor;
  }

  // ===== INICIALIZAÇÃO =====

  // Carregar dados iniciais
  carregarProdutosDoLocalStorage();
  carregarCategoriasEFornecedores();

  // Configurar validação de campos
  const campoCompra = document.getElementById("novoProdutoCompra");
  const campoVenda = document.getElementById("novoProdutoVenda");

  // Validação para campos monetários
  [campoCompra, campoVenda].forEach((campo) => {
    campo.addEventListener("input", function () {
      let valor = this.value.replace("R$ ", "").trim();
      const valorFormatado = formatarValorReais(valor);
      this.value = `R$ ${valorFormatado}`;
    });

    campo.addEventListener("focus", function () {
      if (!this.value.startsWith("R$")) {
        this.value = "R$ ";
      }
    });

    campo.addEventListener("blur", function () {
      if (this.value === "R$ ") {
        this.value = "";
      }
    });
  });

  // Validação para campos numéricos
  const campoEstoque = document.getElementById("novoProdutoEstoque");
  const campoEstoqueMinimo = document.getElementById(
    "novoProdutoEstoqueMinimo"
  );

  [campoEstoque, campoEstoqueMinimo].forEach((campo) => {
    campo.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "");
    });
  });

  // ===== EVENT LISTENERS =====

  // Botão de filtro
  document
    .getElementById("filterButton")
    .addEventListener("click", function () {
      document.getElementById("popupOverlay").style.display = "block";
      document.getElementById("popup").style.display = "block";
    });

  // Fechar popup ao clicar no overlay
  document
    .getElementById("popupOverlay")
    .addEventListener("click", function () {
      document.getElementById("popupOverlay").style.display = "none";
      document.getElementById("popup").style.display = "none";
    });

  // Aplicar filtro
  document.getElementById("applyFilter").addEventListener("click", function () {
    const cod = document.getElementById("filterCod").value.toLowerCase();
    const produto = document
      .getElementById("filterProduto")
      .value.toLowerCase();
    const categoria = document
      .getElementById("filterCategoria")
      .value.toLowerCase();
    const un = document.getElementById("filterUn").value.toLowerCase();
    const fornecedor = document
      .getElementById("filterFornecedor")
      .value.toLowerCase();
    const estoque = document
      .getElementById("filterEstoque")
      .value.toLowerCase();

    document.querySelectorAll(".center-table tbody tr").forEach((row) => {
      const cells = row.querySelectorAll("td");

      const codMatch = cells[1].textContent.toLowerCase().includes(cod);
      const produtoMatch = cells[2].textContent.toLowerCase().includes(produto);
      const categoriaMatch = cells[3].textContent
        .toLowerCase()
        .includes(categoria);
      const unMatch = cells[4].textContent.toLowerCase().includes(un);
      const fornecedorMatch = cells[6].textContent
        .toLowerCase()
        .includes(fornecedor);
      const estoqueMatch = estoque
        ? cells[9].textContent.toLowerCase().includes(estoque)
        : true;

      if (
        codMatch &&
        produtoMatch &&
        categoriaMatch &&
        unMatch &&
        fornecedorMatch &&
        estoqueMatch
      ) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });

    document.getElementById("popupOverlay").style.display = "none";
    document.getElementById("popup").style.display = "none";
  });

  // Botão Novo Produto
  document
    .getElementById("novoProdutoButton")
    .addEventListener("click", function () {
      document.getElementById("novoProdutoPopupOverlay").style.display =
        "block";
      document.getElementById("novoProdutoPopup").style.display = "block";
    });

  // Botão Cancelar no popup de novo produto
  document
    .getElementById("cancelarProduto")
    .addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("novoProdutoPopupOverlay").style.display = "none";
      document.getElementById("novoProdutoPopup").style.display = "none";
      document.querySelector("#novoProdutoPopup form").reset();
    });

  // Botão Cadastrar Produto
  document
    .getElementById("cadastrarProduto")
    .addEventListener("click", function (e) {
      e.preventDefault();

      // Obter valores do formulário
      const fotoInput = document.getElementById("novoProdutoFoto");
      const foto = fotoInput.files[0]
        ? URL.createObjectURL(fotoInput.files[0])
        : "";
      const cod = document.getElementById("novoProdutoCod").value;
      const nome = document.getElementById("novoProdutoNome").value;
      const categoria = document.getElementById("novoProdutoCategoria").value;
      const un = document.getElementById("novoProdutoUn").value;
      const fornecedor = document.getElementById("novoProdutoFornecedor").value;
      let compra = document
        .getElementById("novoProdutoCompra")
        .value.replace("R$ ", "")
        .trim();
      let venda = document
        .getElementById("novoProdutoVenda")
        .value.replace("R$ ", "")
        .trim();
      const estoque = document.getElementById("novoProdutoEstoque").value;
      const estoqueMinimo = document.getElementById(
        "novoProdutoEstoqueMinimo"
      ).value;
      const data = new Date().toLocaleDateString("pt-BR");

      // Validar campos obrigatórios
      if (!nome || !cod) {
        alert("Por favor, preencha pelo menos o código e o nome do produto.");
        return;
      }

      // Formatar valores
      compra = adicionarCentavos(compra);
      venda = adicionarCentavos(venda);

      // Criar nova linha na tabela
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><img src="${foto}" alt="${nome}" width="50"></td>
        <td>${cod}</td>
        <td>${nome}</td>
        <td>${categoria}</td>
        <td>${un}</td>
        <td>${data}</td>
        <td>${fornecedor}</td>
        <td>R$ ${compra}</td>
        <td>R$ ${venda}</td>
        <td class="estoque">${estoque}</td>
        <td>${estoqueMinimo}</td>
        <td>
          <a href="#" class="edit-button"><i class="fas fa-edit" style="color: #4caf50; font-size: 20px"></i></a>
          <a href="#" class="delete-button"><i class="fas fa-trash" style="color: #dc3545; font-size: 20px"></i></a>
        </td>
      `;

      tbody.appendChild(row);

      // Salvar no localStorage e atualizar selects
      salvarProdutosNoLocalStorage();
      carregarCategoriasEFornecedores();

      // Fechar popup e limpar formulário
      document.getElementById("novoProdutoPopupOverlay").style.display = "none";
      document.getElementById("novoProdutoPopup").style.display = "none";
      document.querySelector("#novoProdutoPopup form").reset();
    });

  // Eventos de exclusão
  tbody.addEventListener("click", function (e) {
    // Botão de exclusão
    if (e.target.closest(".delete-button")) {
      e.preventDefault();
      rowToDelete = e.target.closest("tr");
      document.getElementById("deletePopupOverlay").style.display = "block";
      document.getElementById("deletePopup").style.display = "block";
    }
  });

  // Confirmar exclusão
  document
    .getElementById("confirmDelete")
    .addEventListener("click", function () {
      if (rowToDelete) {
        rowToDelete.remove();
        salvarProdutosNoLocalStorage();
        carregarCategoriasEFornecedores();
        rowToDelete = null;
      }

      document.getElementById("deletePopupOverlay").style.display = "none";
      document.getElementById("deletePopup").style.display = "none";
    });

  // Cancelar exclusão
  document
    .getElementById("cancelDelete")
    .addEventListener("click", function () {
      rowToDelete = null;
      document.getElementById("deletePopupOverlay").style.display = "none";
      document.getElementById("deletePopup").style.display = "none";
    });
});
