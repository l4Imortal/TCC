let currentRowToDelete = null;

document.addEventListener("DOMContentLoaded", () => {
  const novaEntradaBtn = document.getElementById("novaEntradaBtn");
  const popupOverlay = document.getElementById("popupOverlay");
  const entradaPopup = document.getElementById("entradaPopup");
  const entradaForm = document.getElementById("entradaForm");
  const codigoEntradaInput = document.getElementById("codigoEntrada");
  const popupTitle = document.getElementById("popupTitle");
  const editModeInput = document.getElementById("editMode");
  const cancelarEntradaBtn = document.getElementById("cancelarEntrada");
  const deletePopup = document.getElementById("deletePopup");
  const confirmDeleteBtn = document.getElementById("confirmDelete");
  const cancelDeleteBtn = document.getElementById("cancelDelete");

  const produtoSelect = document.getElementById("produtoEntrada");
  const fornecedorSelect = document.getElementById("fornecedorEntrada");

  // Produtos e fornecedores cadastrados (exemplo)
  const produtosCadastrados = ["Notebook", "Mouse", "Teclado"];
  const fornecedoresCadastrados = ["Distribuidora ABC", "Fornecedora XYZ"];

  // Preencher o campo de produtos
  produtosCadastrados.forEach((produto) => {
    const option = document.createElement("option");
    option.value = produto;
    option.textContent = produto;
    produtoSelect.appendChild(option);
  });

  // Preencher o campo de fornecedores
  fornecedoresCadastrados.forEach((fornecedor) => {
    const option = document.createElement("option");
    option.value = fornecedor;
    option.textContent = fornecedor;
    fornecedorSelect.appendChild(option);
  });

  // Abrir o popup de nova entrada
  novaEntradaBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Resetar o formulário
    entradaForm.reset();

    // Configurar para modo de criação
    editModeInput.value = "false";
    popupTitle.textContent = "Cadastrar Nova Entrada";

    // Definir a data atual como padrão
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("dataEntrada").value = today;

    // Mostrar popup
    popupOverlay.style.display = "block";
    entradaPopup.style.display = "block";
  });

  // Fechar o popup ao clicar no overlay
  popupOverlay.addEventListener("click", (e) => {
    if (e.target === popupOverlay) {
      popupOverlay.style.display = "none";
      entradaPopup.style.display = "none";
      deletePopup.style.display = "none";
      currentRowToDelete = null;
    }
  });

  // Fechar o popup ao clicar em cancelar
  cancelarEntradaBtn.addEventListener("click", () => {
    entradaPopup.style.display = "none"; // Esconde o popup
    popupOverlay.style.display = "none"; // Esconde o overlay
  });

  // Processar o formulário de entrada
  entradaForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const ean = document.getElementById("eanEntrada").value;
    const produto = document.getElementById("produtoEntrada").value;
    const quantidade = document.getElementById("quantidadeEntrada").value;
    const fornecedor = document.getElementById("fornecedorEntrada").value;
    const notaFiscal = document.getElementById("notaFiscalEntrada").value;
    const valorUnitario = document.getElementById("valorEntrada").value;
    const responsavel = document.getElementById("responsavelEntrada").value;
    const dataEntrada = document.getElementById("dataEntrada").value;

    // Formatar a Nota Fiscal com zeros à esquerda e pontos
    const notaFiscalFormatada = `N° ${formatarNotaFiscalComZeros(notaFiscal)}`;

    adicionarEntradaNaTabela(
      ean,
      produto,
      quantidade,
      fornecedor,
      notaFiscalFormatada,
      valorUnitario,
      responsavel,
      dataEntrada
    );

    // Fechar o popup
    entradaPopup.style.display = "none";
    popupOverlay.style.display = "none";

    // Limpar o formulário
    entradaForm.reset();
  });

  // Configurar botões do popup de exclusão
  confirmDeleteBtn.addEventListener("click", () => {
    if (currentRowToDelete) {
      currentRowToDelete.remove();

      // Fechar o popup
      popupOverlay.style.display = "none";
      deletePopup.style.display = "none";

      // Mostrar mensagem de sucesso
      alert("Entrada excluída com sucesso!");

      // Limpar a referência
      currentRowToDelete = null;
    }
  });

  cancelDeleteBtn.addEventListener("click", () => {
    popupOverlay.style.display = "none";
    deletePopup.style.display = "none";
    currentRowToDelete = null;
  });

  // Adicionar evento de input no campo de Nota Fiscal
  const notaFiscalInput = document.getElementById("notaFiscalEntrada");
  notaFiscalInput.addEventListener("input", function () {
    formatarNotaFiscal(this);
  });

  // Função para adicionar uma entrada na tabela
  function adicionarEntradaNaTabela(
    ean,
    produto,
    quantidade,
    fornecedor,
    notaFiscal,
    valorUnitario,
    responsavel,
    dataEntrada
  ) {
    const tabela = document.querySelector("table tbody");
    const novaLinha = document.createElement("tr");

    // Adicionar os dados na ordem correta
    novaLinha.innerHTML = `
      <td>${ean}</td>
      <td>${produto}</td>
      <td>${quantidade}</td>
      <td>${fornecedor}</td>
      <td>${notaFiscal}</td>
      <td>${valorUnitario}</td>
      <td>${responsavel}</td>
      <td>${dataEntrada}</td>
      <td>
        <button class="edit-button"><i class="fas fa-edit"></i></button>
        <button class="delete-button"><i class="fas fa-trash"></i></button>
      </td>
    `;

    tabela.appendChild(novaLinha);
  }

  const tabela = document.querySelector("table tbody");

  // Delegar eventos para os botões de editar e excluir
  tabela.addEventListener("click", (event) => {
    const target = event.target;

    // Verificar se o clique foi no botão de editar
    if (target.closest(".edit-button")) {
      const row = target.closest("tr");
      showEditPopup(event, row);
    }

    // Verificar se o clique foi no botão de excluir
    if (target.closest(".delete-button")) {
      const row = target.closest("tr");
      const itemName = row.cells[1].textContent; // Nome do produto
      showDeletePopup(event, itemName);
    }
  });
});

// Função para validar o EAN
function validarEAN(ean) {
  return /^\d{13}$/.test(ean); // Verifica se o EAN contém exatamente 13 dígitos
}

// Evento de submissão do formulário
document.getElementById("entradaForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Evita o envio padrão do formulário

  const eanInput = document.getElementById("eanEntrada");
  const ean = eanInput.value;

  // Valida o EAN
  if (!validarEAN(ean)) {
    alert("O EAN deve conter exatamente 13 dígitos.");
    eanInput.focus();
    return;
  }

  // Continue com o cadastro se o EAN for válido
  const notaFiscalInput = document.getElementById("notaFiscalEntrada");
  const notaFiscalFormatada = formatarNotaFiscalComZeros(notaFiscalInput.value);

  adicionarEntradaNaTabela(
    ean, // EAN
    "Produto Exemplo", // Produto (exemplo)
    10, // Quantidade (exemplo)
    "Fornecedor Exemplo", // Fornecedor (exemplo)
    `N° ${notaFiscalFormatada}`, // Nota Fiscal formatada
    "2025-05-06" // Data de entrada (exemplo)
  );

  // Limpa o formulário após o cadastro
  this.reset();
});

// Função para mostrar o popup de edição
function showEditPopup(event, row) {
  event.preventDefault();

  // Obter os dados da linha
  const ean = row.cells[0].textContent;
  const produto = row.cells[1].textContent;
  const quantidade = row.cells[2].textContent;
  const fornecedor = row.cells[3].textContent;
  const notaFiscal = row.cells[4].textContent.replace("N° ", "");
  const dataEntrada = row.cells[5].textContent;

  // Converter a data para o formato do input date (YYYY-MM-DD)
  const dataParts = dataEntrada.split("/");
  const dataFormatada =
    dataParts.length === 3
      ? `${dataParts[2]}-${dataParts[1].padStart(
          2,
          "0"
        )}-${dataParts[0].padStart(2, "0")}`
      : "";

  // Preencher o formulário
  document.getElementById("editMode").value = "true";
  document.getElementById("popupTitle").textContent = "Editar Entrada";

  document.getElementById("eanEntrada").value = ean;
  document.getElementById("dataEntrada").value = dataFormatada;

  // Selecionar o produto no dropdown
  const produtoSelect = document.getElementById("produtoEntrada");
  for (let i = 0; i < produtoSelect.options.length; i++) {
    if (produtoSelect.options[i].text === produto) {
      produtoSelect.selectedIndex = i;
      break;
    }
  }

  document.getElementById("quantidadeEntrada").value = quantidade;

  // Selecionar o fornecedor no dropdown
  const fornecedorSelect = document.getElementById("fornecedorEntrada");
  for (let i = 0; i < fornecedorSelect.options.length; i++) {
    if (fornecedorSelect.options[i].text === fornecedor) {
      fornecedorSelect.selectedIndex = i;
      break;
    }
  }

  document.getElementById("notaFiscalEntrada").value = notaFiscal;

  // Mostrar o popup
  document.getElementById("popupOverlay").style.display = "block";
  document.getElementById("entradaPopup").style.display = "block";
}

// Função para mostrar o popup de exclusão
function showDeletePopup(event, itemName) {
  event.preventDefault();
  event.stopPropagation();

  const popupOverlay = document.getElementById("popupOverlay");
  const deletePopup = document.getElementById("deletePopup");
  const deleteMessage = document.getElementById("deleteMessage");

  // Armazenar a linha a ser excluída
  currentRowToDelete = event.target.closest("tr");

  // Definir a mensagem de confirmação
  deleteMessage.textContent = `Tem certeza que deseja excluir a entrada do produto "${itemName}"?`;

  // Mostrar o popup
  popupOverlay.style.display = "block";
  deletePopup.style.display = "block";
}

// Função para formatar a Nota Fiscal com pontos
function formatarNotaFiscal(input) {
  let valor = input.value.replace(/\D/g, ""); // Remove caracteres não numéricos
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2"); // Adiciona o primeiro ponto
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2"); // Adiciona o segundo ponto
  input.value = valor;
}

// Função para formatar a Nota Fiscal com zeros à esquerda e pontos
function formatarNotaFiscalComZeros(notaFiscal) {
  let valor = notaFiscal.replace(/\D/g, ""); // Remove caracteres não numéricos
  valor = valor.padStart(9, "0"); // Preenche com zeros à esquerda até 9 dígitos
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2"); // Adiciona o primeiro ponto
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2"); // Adiciona o segundo ponto
  return valor;
}
