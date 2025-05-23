// Variáveis globais para armazenar dados
let produtosLista = [];
let fornecedoresLista = [];
let currentRowToDelete = null;

// Funções auxiliares de formatação
function formatarNotaFiscal(nota) {
  if (!nota) return "";
  const numeros = nota.replace(/\D/g, "");
  return numeros.replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3");
}

function formatarData(dataString) {
  if (!dataString) return "";
  const data = new Date(dataString);
  return data.toLocaleDateString("pt-BR");
}

function formatarValor(valor) {
  if (!valor) return "R$ 0,00";
  const num =
    typeof valor === "string"
      ? parseFloat(valor.replace(/[^\d,.-]/g, "").replace(",", "."))
      : parseFloat(valor);
  return `R$ ${num.toFixed(2).replace(".", ",")}`;
}

// Função para encontrar nome pelo ID
function encontrarNomePorId(lista, id) {
  if (!id || !Array.isArray(lista)) return "";
  const item = lista.find((item) => item.id == id);
  return item ? item.nome : "";
}

// Função para adicionar entrada na tabela
function adicionarEntradaNaTabela(entrada) {
  const tabela = document.querySelector("table tbody");
  if (!tabela) return;

  const novaLinha = document.createElement("tr");
  novaLinha.dataset.id = entrada.id;

  // Obter nomes dos produtos e fornecedores
  const nomeProduto =
    entrada.produto || encontrarNomePorId(produtosLista, entrada.produto_id);
  const nomeFornecedor =
    entrada.fornecedor ||
    encontrarNomePorId(fornecedoresLista, entrada.fornecedor_id);

  novaLinha.innerHTML = `
        <td>${entrada.ean || ""}</td>
        <td>${nomeProduto}</td>
        <td>${entrada.quantidade || 0}</td>
        <td>${nomeFornecedor}</td>
        <td>${
          entrada.nota_fiscal
            ? `N° ${formatarNotaFiscal(entrada.nota_fiscal)}`
            : ""
        }</td>
        <td>${formatarValor(entrada.valor_unitario)}</td>
        <td>${entrada.responsavel || ""}</td>
        <td>${
          entrada.data_entrada ? formatarData(entrada.data_entrada) : ""
        }</td>
        <td class="actions">
           <button class="btn-editar" data-id="${entrada.ean}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-excluir" data-id="${entrada.ean}">
          <i class="fas fa-trash-alt"></i>
        </button>
        </td>
    `;

  tabela.appendChild(novaLinha);

  // Adiciona eventos aos botões
  novaLinha
    .querySelector(".btn-editar")
    .addEventListener("click", () => abrirPopupEdicao(entrada));
  novaLinha
    .querySelector(".btn-excluir")
    .addEventListener("click", () => confirmarExclusao(entrada));
}

// Função para carregar entradas do banco de dados
async function carregarEntradas() {
  try {
    const response = await fetch("http://localhost:3000/api/entradas");
    if (!response.ok)
      throw new Error(`Erro ${response.status}: ${response.statusText}`);

    const entradas = await response.json();
    const tabela = document.querySelector("table tbody");
    if (!tabela) throw new Error("Tabela não encontrada");

    tabela.innerHTML = "";

    if (entradas.length === 0) {
      tabela.innerHTML =
        '<tr><td colspan="9" class="no-data">Nenhuma entrada registrada</td></tr>';
      return;
    }

    entradas.forEach((entrada) => adicionarEntradaNaTabela(entrada));
  } catch (error) {
    console.error("Erro ao carregar entradas:", error);
    showError("Erro ao carregar entradas: " + error.message);
  }
}

// Função para carregar produtos
async function carregarProdutos() {
  const select = document.getElementById("produtoEntrada");
  if (!select) {
    console.error("Elemento select de produtos não encontrado");
    return;
  }

  try {
    select.disabled = true;
    select.innerHTML = '<option value="">Carregando produtos...</option>';

    const response = await fetch("http://localhost:3000/api/produtos");

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const dados = await response.json();

    produtosLista = dados
      .map((item) => ({
        id: item.produto,
        nome: item.produto,
      }))
      .filter((item) => item.id && item.nome);

    select.innerHTML = '<option value="">Selecione um produto</option>';

    if (produtosLista.length === 0) {
      select.innerHTML +=
        '<option value="" disabled>Nenhum produto encontrado</option>';
    } else {
      produtosLista
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .forEach((produto) => {
          const option = new Option(produto.nome, produto.nome);
          select.add(option);
        });
    }
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    select.innerHTML = `
            <option value="">Erro ao carregar produtos</option>
            <option value="" disabled>${error.message}</option>
        `;
  } finally {
    select.disabled = false;
  }
}

// Função para carregar fornecedores
async function carregarFornecedores() {
  const select = document.getElementById("fornecedorEntrada");
  if (!select) {
    console.error("Elemento select de fornecedores não encontrado");
    return;
  }

  try {
    select.disabled = true;
    select.innerHTML = '<option value="">Carregando fornecedores...</option>';

    const response = await fetch("http://localhost:3000/api/fornecedores");
    if (!response.ok)
      throw new Error(`Erro ${response.status}: ${response.statusText}`);

    const dados = await response.json();
    fornecedoresLista = Array.isArray(dados) ? dados : [];

    select.innerHTML = '<option value="">Selecione um fornecedor</option>';

    if (fornecedoresLista.length === 0) {
      select.innerHTML +=
        '<option value="" disabled>Nenhum fornecedor cadastrado</option>';
    } else {
      fornecedoresLista.forEach((fornecedor) => {
        const option = new Option(fornecedor.nome, fornecedor.id);
        select.add(option);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar fornecedores:", error);
    select.innerHTML = `
            <option value="">Erro ao carregar fornecedores</option>
            <option value="" disabled>${error.message}</option>
        `;
  } finally {
    select.disabled = false;
  }
}

// Função para abrir popup de edição
function abrirPopupEdicao(entrada) {
  document.getElementById("editMode").value = "true";
  document.getElementById("entradaId").value = entrada.id;
  document.getElementById("eanEntrada").value = entrada.ean || "";
  document.getElementById("quantidadeEntrada").value = entrada.quantidade || "";
  document.getElementById("notaFiscalEntrada").value =
    entrada.nota_fiscal || "";
  document.getElementById("valorEntrada").value = entrada.valor_unitario || "";
  document.getElementById("responsavelEntrada").value =
    entrada.responsavel || "";
  document.getElementById("dataEntrada").value = entrada.data_entrada
    ? entrada.data_entrada.split("T")[0]
    : "";

  const produtoSelect = document.getElementById("produtoEntrada");
  if (produtoSelect) {
    produtoSelect.value = entrada.produto || "";
  }

  const fornecedorSelect = document.getElementById("fornecedorEntrada");
  if (fornecedorSelect) {
    fornecedorSelect.value = entrada.fornecedor || "";
  }

  document.getElementById("popupTitle").textContent = "Editar Entrada";
  abrirPopup("entradaPopup");
}

// Função para confirmar exclusão
function confirmarExclusao(entrada) {
  currentRowToDelete = entrada;
  document.getElementById(
    "deleteMessage"
  ).textContent = `Tem certeza que deseja excluir a entrada do produto "${
    entrada.produto || encontrarNomePorId(produtosLista, entrada.produto_id)
  }"?`;
  abrirPopup("deletePopup");
}

// Função para salvar entrada (criar ou atualizar)
async function salvarEntrada(event) {
  event.preventDefault();

  const form = event.target;
  const isEditMode = document.getElementById("editMode").value === "true";
  const entradaId = document.getElementById("entradaId")?.value || "";
  const submitBtn = form.querySelector('button[type="submit"]');

  try {
    submitBtn.disabled = true;

    const entradaData = {
      ean: form.eanEntrada.value.padStart(13, "0"),
      produto: form.produtoEntrada.value,
      quantidade: parseInt(form.quantidadeEntrada.value),
      fornecedor: form.fornecedorEntrada.value,
      nota_fiscal: form.notaFiscalEntrada.value.replace(/\D/g, ""),
      valor_unitario:
        parseFloat(form.valorEntrada.value.replace(",", ".")) || 0,
      responsavel: form.responsavelEntrada.value,
      data_entrada: form.dataEntrada.value,
    };

    const url = isEditMode
      ? `http://localhost:3000/api/entradas/${entradaData.ean}`
      : "http://localhost:3000/api/entradas";

    const method = isEditMode ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entradaData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao salvar entrada");
    }

    fecharPopup();
    await carregarEntradas();
    showSuccess(`Entrada ${isEditMode ? "atualizada" : "criada"} com sucesso!`);
  } catch (error) {
    console.error("Erro ao salvar entrada:", error);
    showError("Erro: " + error.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
    }
  }
}

// Função para excluir entrada
async function excluirEntrada() {
  if (!currentRowToDelete) return;

  const deleteBtn = document.getElementById("confirmDelete");

  try {
    deleteBtn.disabled = true;

    const response = await fetch(
      `http://localhost:3000/api/entradas/${currentRowToDelete.ean}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao excluir entrada");
    }

    fecharPopup();
    await carregarEntradas();
    showSuccess("Entrada excluída com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir entrada:", error);
    showError("Erro: " + error.message);
  } finally {
    if (deleteBtn) {
      deleteBtn.disabled = false;
    }
  }
}

// Funções auxiliares para UI
function abrirPopup(popupId) {
  document.getElementById("popupOverlay").style.display = "block";
  document.getElementById(popupId).style.display = "block";
}

function fecharPopup() {
  document.getElementById("popupOverlay").style.display = "none";
  document.getElementById("entradaPopup").style.display = "none";
  document.getElementById("deletePopup").style.display = "none";
  document.getElementById("entradaForm").reset();
  currentRowToDelete = null;
}

function showError(message) {
  const errorElement =
    document.getElementById("errorMessage") || createMessageElement("error");
  errorElement.textContent = message;
  errorElement.style.display = "block";
  setTimeout(() => (errorElement.style.display = "none"), 5000);
}

function showSuccess(message) {
  const successElement =
    document.getElementById("successMessage") ||
    createMessageElement("success");
  successElement.textContent = message;
  successElement.style.display = "block";
  setTimeout(() => (successElement.style.display = "none"), 3000);
}

function createMessageElement(type) {
  const element = document.createElement("div");
  element.id = `${type}Message`;
  element.className = `message ${type}`;
  document.body.appendChild(element);
  return element;
}

// Inicialização da página
document.addEventListener("DOMContentLoaded", async () => {
  // Configura a data atual como padrão
  const dataInput = document.getElementById("dataEntrada");
  if (dataInput) {
    dataInput.value = new Date().toISOString().split("T")[0];
  }

  // Configura eventos dos botões
  document.getElementById("novaEntradaBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("entradaForm").reset();
    document.getElementById("editMode").value = "false";
    document.getElementById("popupTitle").textContent = "Nova Entrada";
    abrirPopup("entradaPopup");
  });

  // Formulário de entrada
  document
    .getElementById("entradaForm")
    ?.addEventListener("submit", salvarEntrada);

  // Botões do popup de exclusão
  document
    .getElementById("confirmDelete")
    ?.addEventListener("click", excluirEntrada);
  document
    .getElementById("cancelDelete")
    ?.addEventListener("click", fecharPopup);

  // Botões do popup de edição/cadastro
  document
    .getElementById("cancelarEntrada")
    ?.addEventListener("click", fecharPopup);
  document
    .getElementById("btnFecharPopup")
    ?.addEventListener("click", fecharPopup);
  document
    .getElementById("btnFecharDeletePopup")
    ?.addEventListener("click", fecharPopup);

  // Fechar popup ao clicar no overlay
  document.getElementById("popupOverlay")?.addEventListener("click", (e) => {
    if (e.target === document.getElementById("popupOverlay")) {
      fecharPopup();
    }
  });

  // Carrega os dados iniciais
  try {
    await Promise.all([carregarProdutos(), carregarFornecedores()]);
    await carregarEntradas();
  } catch (error) {
    console.error("Erro ao carregar dados iniciais:", error);
    showError("Erro ao carregar dados iniciais: " + error.message);
  }
});

// Carrega os produtos ao carregar a página
window.addEventListener("load", carregarProdutosNaTabela);

function salvarEntradaNoServidor(entrada) {
  // Adaptar o objeto produto para o formato esperado pela API
  const entradaParaAPI = {
    ean: entrada.ean || "",
    produto: entrada.produto, // Usando 'nome' do formulário para o campo 'produto' do banco
    quantidade: entrada.quantidade,
    fornecedor: entrada.fornecedor,
    nota_fiscal: entrada.nota_fiscal,
    valor_unitario: entrada.valor_unitario,
    responsavel: entrada.responsavel,
    data_entrada:
      entrada.data_entrada || new Date().toISOString().split("T")[0], // Data atual no formato YYYY-MM-DD
  };

  // Enviar para o servidor usando fetch API
  return fetch("http://localhost:3000/api/entradas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entradaParaAPI),
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Erro ao cadastrar entrada: " + response.statusText);
    }
    return response.json();
  });
}
async function testarConexaoAPI() {
  try {
    const response = await fetch("http://localhost:3000/api/entradas", {
      method: "HEAD",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`API retornou status ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Falha na conexão com a API:", error);
    showError("Não foi possível conectar ao servidor. Verifique sua conexão.");
    return false;
  }
}
