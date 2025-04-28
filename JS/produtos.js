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
      const ean = linha.children[1].textContent; // Obtém o EAN da linha
      const produtosSalvos = JSON.parse(localStorage.getItem("produtos")) || [];
      const produto = produtosSalvos.find((p) => p.ean === ean);

      if (produto) {
        exibirPopupExcluir(produto, linha);
      }
    });
  });
}

const popupEditarProduto = document.getElementById("popupEditarProduto");
const formEditarProduto = document.getElementById("formEditarProduto");
const btnFecharEditarPopup = document.getElementById("btnFecharEditarPopup");

let produtoParaEditar = null; // Variável para armazenar o produto a ser editado

// Função para abrir o popup de edição e preencher os campos
function preencherFormularioEdicao(produto) {
  produtoParaEditar = produto;

  // Preenche os campos do formulário de edição
  formEditarProduto.editarEanProduto.value = produto.ean;
  formEditarProduto.editarNomeProduto.value = produto.nome;
  formEditarProduto.editarCategoriaProduto.value = produto.categoria;
  formEditarProduto.editarUnidadeProduto.value = produto.unidade;
  formEditarProduto.editarFornecedorProduto.value = produto.fornecedor;
  formEditarProduto.editarEstoqueMinimo.value = produto.estoqueMinimo;

  // Desabilita o campo de fornecedor
  formEditarProduto.editarFornecedorProduto.disabled = true;

  // Exibe o popup de edição
  popupEditarProduto.style.display = "flex";
}

// Fecha o popup de edição
btnFecharEditarPopup.addEventListener("click", () => {
  popupEditarProduto.style.display = "none";
  produtoParaEditar = null; // Reseta a variável
});

// Salva as alterações feitas no produto
formEditarProduto.addEventListener("submit", (event) => {
  event.preventDefault(); // Evita o envio padrão do formulário

  // Atualiza os dados do produto
  produtoParaEditar.ean = formEditarProduto.editarEanProduto.value;
  produtoParaEditar.nome = formEditarProduto.editarNomeProduto.value;
  produtoParaEditar.categoria = formEditarProduto.editarCategoriaProduto.value;
  produtoParaEditar.unidade = formEditarProduto.editarUnidadeProduto.value;
  produtoParaEditar.fornecedor =
    formEditarProduto.editarFornecedorProduto.value;
  produtoParaEditar.estoqueMinimo = formEditarProduto.editarEstoqueMinimo.value;

  // Atualiza o produto no localStorage
  const produtosSalvos = JSON.parse(localStorage.getItem("produtos")) || [];
  const novosProdutos = produtosSalvos.map((produto) =>
    produto.ean === produtoParaEditar.ean ? produtoParaEditar : produto
  );
  localStorage.setItem("produtos", JSON.stringify(novosProdutos));

  // Recarrega os produtos na tabela
  carregarProdutosNaTabela();

  // Fecha o popup de edição
  popupEditarProduto.style.display = "none";
  produtoParaEditar = null; // Reseta a variável
});

// Adiciona o evento de clique no botão "Editar" para cada linha da tabela
function adicionarEventosEditar() {
  const botoesEditar = document.querySelectorAll(".btn-editar");
  botoesEditar.forEach((botao) => {
    botao.addEventListener("click", (event) => {
      const linha = event.target.closest("tr");
      const ean = linha.children[1].textContent; // Obtém o EAN da linha
      const produtosSalvos = JSON.parse(localStorage.getItem("produtos")) || [];
      const produto = produtosSalvos.find((p) => p.ean === ean);

      if (produto) {
        preencherFormularioEdicao(produto);
      }
    });
  });
}

// Atualize a função carregarProdutosNaTabela para incluir os eventos de edição
function carregarProdutosNaTabela() {
  const produtosSalvos = JSON.parse(localStorage.getItem("produtos")) || [];
  const tabelaProdutos = document.querySelector(".center-table tbody");
  tabelaProdutos.innerHTML = ""; // Limpa a tabela antes de carregar os produtos

  produtosSalvos.forEach((produto) => {
    const novaLinha = document.createElement("tr");
    novaLinha.innerHTML = `
      <td>
        ${
          produto.foto
            ? `<img src="${produto.foto}" alt="Foto do Produto" style="width: 50px; height: 50px; object-fit: cover;" />`
            : "Sem Foto"
        }
      </td>
      <td>${produto.ean}</td>
      <td>${produto.nome}</td>
      <td>${produto.categoria}</td>
      <td>${produto.unidade}</td>
      <td>${produto.data}</td>
      <td>${produto.fornecedor}</td>
      <td>${produto.estoqueMinimo}</td>
      <td>
        <button class="btn-editar">
          <i class="fas fa-edit"></i> <!-- Ícone de lápis -->
        </button>
        <button class="btn-excluir">
          <i class="fas fa-trash-alt"></i> <!-- Ícone de lixeira -->
        </button>
      </td>
    `;
    tabelaProdutos.appendChild(novaLinha);
  });

  // Adiciona os eventos de edição e exclusão
  adicionarEventosEditar();
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
formNovoProduto.addEventListener("submit", async (event) => {
  event.preventDefault(); // Evita o envio padrão do formulário

  const ean = formNovoProduto.eanProduto.value;

  // Verifica se o EAN tem exatamente 13 dígitos
  if (!/^\d{13}$/.test(ean)) {
    alert("O EAN deve conter exatamente 13 dígitos.");
    return;
  }

  // Captura os valores do formulário
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

  // Converte a imagem para Base64 (se fornecida)
  const fotoFile = formNovoProduto.fotoProduto.files[0];
  let fotoBase64 = ""; // Define como vazio por padrão
  if (fotoFile) {
    fotoBase64 = await converterImagemParaBase64(fotoFile);
  }

  // Cria um objeto com os dados do produto
  const novoProduto = {
    ean,
    nome,
    categoria,
    unidade,
    fornecedor,
    estoqueMinimo,
    data: dataFormatada,
    foto: fotoBase64, // Adiciona a foto em Base64 (ou vazio se não fornecida)
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

// Limita a entrada no campo de EAN para apenas números e 13 dígitos
document.getElementById("eanProduto").addEventListener("input", (event) => {
  const input = event.target;
  input.value = input.value.replace(/\D/g, ""); // Remove caracteres não numéricos
  if (input.value.length > 13) {
    input.value = input.value.slice(0, 13); // Limita a 13 caracteres
  }
});

// Reforça a validação no formulário de edição (caso necessário)
document
  .getElementById("editarEanProduto")
  .addEventListener("input", (event) => {
    const input = event.target;
    input.value = input.value.replace(/\D/g, ""); // Remove caracteres não numéricos
    if (input.value.length > 13) {
      input.value = input.value.slice(0, 13); // Limita a 13 caracteres
    }
  });
function converterImagemParaBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
