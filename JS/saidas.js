document.addEventListener("DOMContentLoaded", () => {
  const novaSaidaBtn = document.getElementById("novaSaidaBtn");
  const saidaForm = document.getElementById("saidaForm");
  const popupOverlay = document.getElementById("popupOverlay");
  const saidaPopup = document.getElementById("saidaPopup");
  const fecharPopupBtn = document.getElementById("fecharPopup");
  const salvarSaidaBtn = document.getElementById("salvarSaida");
  const deletePopup = document.getElementById("deletePopup");
  const confirmDeleteBtn = document.getElementById("confirmDelete");
  const cancelDeleteBtn = document.getElementById("cancelDelete");
  let currentRowToDelete = null;

  const produtoSelect = document.getElementById("produtoSaida");
  const fornecedorSelect = document.getElementById("fornecedorSaida");

  // Produtos e fornecedores cadastrados (exemplo)
  const produtosCadastrados = ["Notebook", "Mouse", "Teclado", "Monitor"];
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

  // Abrir o popup para cadastrar nova saída
  novaSaidaBtn.addEventListener("click", (e) => {
    e.preventDefault();
    saidaForm.reset(); // Limpa o formulário
    document.getElementById("editMode").value = "false";
    document.getElementById("popupTitle").textContent = "Cadastrar Nova Saída";
    salvarSaidaBtn.textContent = "Cadastrar";
    popupOverlay.style.display = "block";
    saidaPopup.style.display = "block";
  });

  // Fechar o popup
  fecharPopupBtn.addEventListener("click", () => {
    popupOverlay.style.display = "none";
    saidaPopup.style.display = "none";
  });

  // Submissão do formulário
  saidaForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const ean = document.getElementById("eanSaida").value;
    const produto = document.getElementById("produtoSaida").value;
    const quantidade = document.getElementById("quantidadeSaida").value;
    const fornecedor = document.getElementById("fornecedorSaida").value;
    const notaFiscal = document.getElementById("notaFiscalSaida").value;
    const valorUnitario = document.getElementById("valorUnitarioSaida").value;
    const responsavel = document.getElementById("responsavelSaida").value;
    const dataSaida = document.getElementById("dataSaida").value;

    if (document.getElementById("editMode").value === "false") {
      adicionarSaidaNaTabela(
        ean,
        produto,
        quantidade,
        fornecedor,
        notaFiscal,
        valorUnitario,
        responsavel,
        dataSaida
      );
    } else {
      atualizarSaidaNaTabela(
        ean,
        produto,
        quantidade,
        fornecedor,
        notaFiscal,
        valorUnitario,
        responsavel,
        dataSaida
      );
    }

    popupOverlay.style.display = "none";
    saidaPopup.style.display = "none";
    saidaForm.reset();
  });

  // Formatar o campo "Nota Fiscal" enquanto o usuário digita (limitar ao formato 000.000.000)
  document.getElementById("notaFiscalSaida").addEventListener("input", (e) => {
    let valor = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
    valor = valor.slice(0, 9); // Limita a 9 dígitos numéricos
    valor = valor.replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3"); // Adiciona os pontos no formato
    e.target.value = valor; // Atualiza o valor do campo com o formato
  });

  // Função para adicionar uma nova saída na tabela
  function adicionarSaidaNaTabela(
    ean,
    produto,
    quantidade,
    fornecedor,
    notaFiscal,
    valorUnitario,
    responsavel,
    dataSaida
  ) {
    const tabela = document.querySelector("table tbody");
    const novaLinha = document.createElement("tr");

    // Formatar a Nota Fiscal para exibição na tabela (adicionando zeros à esquerda e o prefixo "N°")
    const notaFiscalFormatada =
      "N° " +
      notaFiscal
        .replace(/\D/g, "") // Remove caracteres não numéricos
        .padStart(9, "0") // Preenche com zeros à esquerda até 9 caracteres
        .replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3"); // Adiciona os pontos

    // Adicionar os dados na ordem correta
    novaLinha.innerHTML = `
      <td>${ean}</td>
      <td>${produto}</td>
      <td>${quantidade}</td>
      <td>${fornecedor}</td>
      <td>${notaFiscalFormatada}</td>
      <td>${valorUnitario}</td>
      <td>${responsavel}</td>
      <td>${dataSaida}</td>
      <td>
        <button class="edit-button"><i class="fas fa-edit"></i></button>
        <button class="delete-button"><i class="fas fa-trash"></i></button>
      </td>
    `;

    tabela.appendChild(novaLinha);
  }

  // Função para mostrar o popup de edição
  document.querySelector("table tbody").addEventListener("click", (e) => {
    if (e.target.closest(".edit-button")) {
      const row = e.target.closest("tr");
      const ean = row.cells[0].textContent;
      const produto = row.cells[1].textContent;
      const quantidade = row.cells[2].textContent;
      const fornecedor = row.cells[3].textContent;
      const notaFiscal = row.cells[4].textContent.replace(/\./g, ""); // Remove os pontos para edição
      const valorUnitario = row.cells[5].textContent;
      const responsavel = row.cells[6].textContent;
      const dataSaida = row.cells[7].textContent;

      document.getElementById("editMode").value = "true";
      document.getElementById("popupTitle").textContent = "Editar Saída";
      salvarSaidaBtn.textContent = "Atualizar";

      document.getElementById("eanSaida").value = ean;
      document.getElementById("produtoSaida").value = produto;
      document.getElementById("quantidadeSaida").value = quantidade;
      document.getElementById("fornecedorSaida").value = fornecedor;
      document.getElementById("notaFiscalSaida").value = notaFiscal;
      document.getElementById("valorUnitarioSaida").value = valorUnitario;
      document.getElementById("responsavelSaida").value = responsavel;
      document.getElementById("dataSaida").value = dataSaida;

      popupOverlay.style.display = "block";
      saidaPopup.style.display = "block";
    }
  });

  // Função para mostrar o popup de exclusão
  document.querySelector("table tbody").addEventListener("click", (e) => {
    if (e.target.closest(".delete-button")) {
      currentRowToDelete = e.target.closest("tr");
      const itemName = currentRowToDelete.cells[1].textContent;

      document.getElementById(
        "deleteMessage"
      ).textContent = `Tem certeza que deseja excluir a saída do produto "${itemName}"?`;
      popupOverlay.style.display = "block";
      deletePopup.style.display = "block";
    }
  });

  // Confirmar exclusão
  confirmDeleteBtn.addEventListener("click", () => {
    if (currentRowToDelete) {
      currentRowToDelete.remove();
      currentRowToDelete = null;
    }
    popupOverlay.style.display = "none";
    deletePopup.style.display = "none";
  });

  // Cancelar exclusão
  cancelDeleteBtn.addEventListener("click", () => {
    popupOverlay.style.display = "none";
    deletePopup.style.display = "none";
    currentRowToDelete = null;
  });
});
