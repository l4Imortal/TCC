// Seleciona os elementos do DOM
const btnNovoProduto = document.getElementById("btnNovoProduto");
const popupNovoProduto = document.getElementById("popupNovoProduto");
const btnFecharPopup = document.getElementById("btnFecharPopup");
const formNovoProduto = document.getElementById("formNovoProduto");

// Seleciona o popup de confirmação e o botão de fechar
const popupConfirmacao = document.getElementById("popupConfirmacao");
const btnFecharConfirmacao = document.getElementById("btnFecharConfirmacao");

// Função para exibir o popup de confirmação
function exibirPopupConfirmacao() {
  popupConfirmacao.style.display = "flex";
}

// Fecha o popup de confirmação ao clicar no botão "Fechar"
btnFecharConfirmacao.addEventListener("click", () => {
  popupConfirmacao.style.display = "none";
});

// Simula uma lista de fornecedores cadastrados (pode ser substituído por dados reais)
const fornecedoresCadastrados = []; // Lista vazia para simular nenhum fornecedor cadastrado

// Seleciona o campo de fornecedores no formulário
const fornecedorProduto = document.getElementById("fornecedorProduto");

// Preenche o campo de fornecedores com os dados disponíveis
function carregarFornecedores() {
  if (fornecedoresCadastrados.length > 0) {
    fornecedorProduto.innerHTML = ""; // Limpa as opções existentes
    fornecedoresCadastrados.forEach((fornecedor) => {
      const option = document.createElement("option");
      option.value = fornecedor;
      option.textContent = fornecedor;
      fornecedorProduto.appendChild(option);
    });
    fornecedorProduto.disabled = false; // Habilita o campo
  } else {
    fornecedorProduto.innerHTML =
      '<option value="" disabled selected>Nenhum fornecedor disponível</option>';
    fornecedorProduto.disabled = true; // Desabilita o campo
  }
}

// Seleciona a tabela onde os produtos serão adicionados
const tabelaProdutos = document.querySelector(".center-table tbody");

// Função para salvar os produtos no localStorage
function salvarProdutoNoLocalStorage(produto) {
  const produtosSalvos = JSON.parse(localStorage.getItem("produtos")) || [];
  produtosSalvos.push(produto);
  localStorage.setItem("produtos", JSON.stringify(produtosSalvos));
}

// Seleciona o popup de exclusão e os botões
const popupExcluir = document.getElementById("popupExcluir");
const btnConfirmarExcluir = document.getElementById("btnConfirmarExcluir");
const btnCancelarExcluir = document.getElementById("btnCancelarExcluir");
const mensagemExclusao = document.getElementById("mensagemExclusao");

let produtoParaExcluir = null; // Variável para armazenar o produto a ser excluído

// Função para exibir o popup de exclusão
function exibirPopupExcluir(produto, linha) {
  produtoParaExcluir = { produto, linha }; // Armazena o produto e a linha
  mensagemExclusao.textContent = `Tem certeza que deseja excluir o produto "${produto.nome}"?`;
  popupExcluir.style.display = "flex";
}

// Fecha o popup de exclusão
btnCancelarExcluir.addEventListener("click", () => {
  popupExcluir.style.display = "none";
  produtoParaExcluir = null; // Reseta a variável
});

// Confirma a exclusão do produto
btnConfirmarExcluir.addEventListener("click", () => {
  if (produtoParaExcluir) {
    const produtosSalvos = JSON.parse(localStorage.getItem("produtos")) || [];
    const novosProdutos = produtosSalvos.filter(
      (p) => p.sku !== produtoParaExcluir.produto.sku
    );
    localStorage.setItem("produtos", JSON.stringify(novosProdutos)); // Atualiza o localStorage

    // Remove a linha da tabela
    produtoParaExcluir.linha.remove();

    // Fecha o popup
    popupExcluir.style.display = "none";
    produtoParaExcluir = null; // Reseta a variável
  }
});

// Adiciona o evento de clique no botão "Excluir" para cada linha da tabela
function adicionarEventosExcluir() {
  const botoesExcluir = document.querySelectorAll(".btn-excluir");
  botoesExcluir.forEach((botao) => {
    botao.addEventListener("click", (event) => {
      const linha = event.target.closest("tr");
      const sku = linha.children[1].textContent; // Obtém o SKU da linha
      const produtosSalvos = JSON.parse(localStorage.getItem("produtos")) || [];
      const produto = produtosSalvos.find((p) => p.sku === sku);

      if (produto) {
        exibirPopupExcluir(produto, linha);
      }
    });
  });
}

// Função para carregar os produtos do localStorage e exibi-los na tabela
function carregarProdutosNaTabela() {
  const produtosSalvos = JSON.parse(localStorage.getItem("produtos")) || [];
  const tabelaProdutos = document.querySelector(".center-table tbody");
  tabelaProdutos.innerHTML = ""; // Limpa a tabela antes de carregar os produtos

  produtosSalvos.forEach((produto) => {
    const novaLinha = document.createElement("tr");
    novaLinha.innerHTML = `
      <td>Foto</td> <!-- Substitua por lógica para exibir a foto, se necessário -->
      <td>${produto.sku}</td>
      <td>${produto.nome}</td>
      <td>${produto.categoria}</td>
      <td>${produto.unidade}</td>
      <td>${produto.data}</td>
      <td>${produto.fornecedor}</td>
      <td>${produto.estoqueMinimo}</td>
      <td>
        <button class="btn-editar">Editar</button>
        <button class="btn-excluir">
          <i class="fas fa-trash-alt"></i> <!-- Ícone de lixeira -->
        </button>
      </td>
    `;
    tabelaProdutos.appendChild(novaLinha);
  });

  // Adiciona os eventos de exclusão
  adicionarEventosExcluir();
}

// Exibe o popup ao clicar no botão "Novo Produto"
btnNovoProduto.addEventListener("click", () => {
  popupNovoProduto.style.display = "flex";
  carregarFornecedores();
});

// Fecha o popup ao clicar no botão "Fechar"
btnFecharPopup.addEventListener("click", () => {
  popupNovoProduto.style.display = "none";
});

// Fecha o popup ao enviar o formulário e adiciona os dados na tabela
formNovoProduto.addEventListener("submit", (event) => {
  event.preventDefault(); // Evita o envio padrão do formulário

  // Captura os valores do formulário
  const sku = formNovoProduto.skuProduto.value;
  const nome = formNovoProduto.nomeProduto.value;
  const categoria = formNovoProduto.categoriaProduto.value;
  const unidade = formNovoProduto.unidadeProduto.value;
  const fornecedor = formNovoProduto.fornecedorProduto.value;
  const estoqueMinimo = formNovoProduto.estoqueMinimo.value;

  // Obtém a data atual
  const dataAtual = new Date();
  const dataFormatada = `${dataAtual.getDate().toString().padStart(2, "0")}/${(
    dataAtual.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${dataAtual.getFullYear()}`;

  // Cria um objeto com os dados do produto
  const novoProduto = {
    sku,
    nome,
    categoria,
    unidade,
    fornecedor,
    estoqueMinimo,
    data: dataFormatada,
  };

  // Salva o produto no localStorage
  salvarProdutoNoLocalStorage(novoProduto);

  // Recarrega os produtos na tabela
  carregarProdutosNaTabela();

  // Exibe o popup de confirmação
  exibirPopupConfirmacao();

  // Fecha o popup de cadastro e reseta o formulário
  popupNovoProduto.style.display = "none";
  formNovoProduto.reset(); // Limpa os campos do formulário
});

// Carrega os produtos salvos no localStorage ao carregar a página
window.addEventListener("load", carregarProdutosNaTabela);
