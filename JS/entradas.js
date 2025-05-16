let currentRowToDelete = null;

// Função para adicionar uma entrada na tabela (no escopo global)
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
  if (!tabela) {
    console.error("Tabela não encontrada no documento");
    return;
  }
 
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
      <button type="button" class="edit-button"><i class="fas fa-edit"></i></button>
      <button type="button" class="delete-button"><i class="fas fa-trash"></i></button>
    </td>
  `;
  tabela.appendChild(novaLinha);
 
  // Adicionar eventos diretamente aos botões recém-criados
  const editButton = novaLinha.querySelector(".edit-button");
  const deleteButton = novaLinha.querySelector(".delete-button");
 
  if (editButton) {
    editButton.addEventListener("click", (event) => {
      console.log("Botão Editar clicado diretamente");
      showEditPopup(event, novaLinha);
    });
  }
 
  if (deleteButton) {
    deleteButton.addEventListener("click", (event) => {
      console.log("Botão Excluir clicado diretamente");
      const itemName = novaLinha.cells[1].textContent;
      showDeletePopup(event, itemName);
    });
  }
}

// Função para carregar fornecedores do banco de dados
function carregarFornecedores() {
  console.log("Carregando fornecedores...");
 
  // Tentar buscar do banco de dados primeiro
  fetch('http://localhost:3000/api/fornecedores')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao buscar fornecedores');
      }
      return response.json();
    })
    .then(fornecedores => {
      console.log(`${fornecedores.length} fornecedores carregados do banco`);
      preencherSelectFornecedores(fornecedores);
    })
    .catch(error => {
      console.error('Erro ao carregar fornecedores do banco:', error);
      console.log('Usando fornecedores estáticos como fallback');
       
      // Fallback para fornecedores estáticos
      const fornecedoresEstaticos = ["Distribuidora ABC", "Fornecedora XYZ"];
      preencherSelectFornecedores(fornecedoresEstaticos.map(nome => ({ nome })));
    });
}

// Função para preencher o select de fornecedores
function preencherSelectFornecedores(fornecedores) {
  const fornecedorSelect = document.getElementById("fornecedorEntrada");
  if (!fornecedorSelect) {
    console.error("Select de fornecedores não encontrado");
    return;
  }
 
  // Limpar opções existentes
  fornecedorSelect.innerHTML = '<option value="">Selecione um fornecedor</option>';
 
  // Adicionar novos fornecedores
  fornecedores.forEach(fornecedor => {
    const nome = fornecedor.nome || fornecedor;
    const option = document.createElement("option");
    option.value = nome;
    option.textContent = nome;
    fornecedorSelect.appendChild(option);
  });
}

// Função para carregar produtos do banco de dados
function carregarProdutos() {
  console.log("Carregando produtos...");
 
  // Tentar buscar do banco de dados primeiro
  fetch('http://localhost:3000/api/produtos')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao buscar produtos');
      }
      return response.json();
    })
    .then(produtos => {
      console.log(`${produtos.length} produtos carregados do banco`);
      preencherSelectProdutos(produtos);
    })
    .catch(error => {
      console.error('Erro ao carregar produtos do banco:', error);
      console.log('Usando produtos estáticos como fallback');
       
      // Fallback para produtos estáticos
      const produtosEstaticos = ["Notebook", "Mouse", "Teclado"];
      preencherSelectProdutos(produtosEstaticos.map(nome => ({ nome })));
    });
}

// Função para preencher o select de produtos
function preencherSelectProdutos(produtos) {
  const produtoSelect = document.getElementById("produtoEntrada");
  if (!produtoSelect) {
    console.error("Select de produtos não encontrado");
    return;
  }
 
  // Limpar opções existentes
  produtoSelect.innerHTML = '<option value="">Selecione um produto</option>';
 
  // Verificar se produtos é um array
  if (!Array.isArray(produtos)) {
    console.error("Dados de produtos não são um array:", produtos);
    return;
  }
 
  // Adicionar novos produtos
  produtos.forEach(produto => {
    let nomeProduto, valorProduto;
   
    // Caso 1: produto é uma string simples
    if (typeof produto === 'string') {
      nomeProduto = produto;
      valorProduto = produto;
    }
    // Caso 2: produto é um objeto
    else if (produto && typeof produto === 'object') {
      // Tentar extrair o nome do produto usando propriedades comuns
      if (produto.nome) {
        nomeProduto = produto.nome;
        valorProduto = produto.id || produto.nome;
      }
      else if (produto.descricao) {
        nomeProduto = produto.descricao;
        valorProduto = produto.id || produto.descricao;
      }
      else if (produto.produto) {
        nomeProduto = produto.produto;
        valorProduto = produto.id || produto.produto;
      }
      // Se nenhuma propriedade conhecida for encontrada, use a primeira propriedade string
      else {
        for (const key in produto) {
          if (typeof produto[key] === 'string') {
            nomeProduto = produto[key];
            valorProduto = produto.id || produto[key];
            break;
          }
        }
      }
       
      // Se ainda não encontrou um nome, use uma representação JSON do objeto
      if (!nomeProduto) {
        console.warn("Não foi possível extrair o nome do produto:", produto);
        nomeProduto = JSON.stringify(produto);
        valorProduto = produto.id || JSON.stringify(produto);
      }
    }
    else {
      console.warn("Formato de produto inválido:", produto);
      return; // Pular este produto
    }
   
    // Criar a opção com o nome extraído
    const option = document.createElement("option");
    option.value = valorProduto;
    option.textContent = nomeProduto;
    produtoSelect.appendChild(option);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado - Inicializando scripts de entradas");
 
  // Carregar fornecedores e produtos
  carregarFornecedores();
  carregarProdutos();
 
  // Verificar se os elementos existem antes de tentar acessá-los
  const novaEntradaBtn = document.getElementById("novaEntradaBtn");
  const popupOverlay = document.getElementById("popupOverlay");
  const entradaPopup = document.getElementById("entradaPopup");
  const entradaForm = document.getElementById("entradaForm");
  const popupTitle = document.getElementById("popupTitle");
  const editModeInput = document.getElementById("editMode");
  const cancelarEntradaBtn = document.getElementById("cancelarEntrada");
  const deletePopup = document.getElementById("deletePopup");
  const confirmDeleteBtn = document.getElementById("confirmDelete");
  const cancelDeleteBtn = document.getElementById("cancelDelete");

  // Verificar se os elementos existem
  if (!novaEntradaBtn) console.error("Botão 'novaEntradaBtn' não encontrado");
  if (!popupOverlay) console.error("Elemento 'popupOverlay' não encontrado");
  if (!entradaPopup) console.error("Elemento 'entradaPopup' não encontrado");
  if (!entradaForm) console.error("Formulário 'entradaForm' não encontrado");
  if (!popupTitle) console.error("Elemento 'popupTitle' não encontrado");
  if (!editModeInput) console.error("Input 'editMode' não encontrado");
  if (!cancelarEntradaBtn) console.error("Botão 'cancelarEntrada' não encontrado");
  if (!deletePopup) console.error("Elemento 'deletePopup' não encontrado");
  if (!confirmDeleteBtn) console.error("Botão 'confirmDelete' não encontrado");
  if (!cancelDeleteBtn) console.error("Botão 'cancelDelete' não encontrado");

  // Abrir o popup de nova entrada
  if (novaEntradaBtn) {
    novaEntradaBtn.addEventListener("click", (e) => {
      console.log("Botão Nova Entrada clicado");
      e.preventDefault();
      // Resetar o formulário
      if (entradaForm) entradaForm.reset();
      // Configurar para modo de criação
      if (editModeInput) editModeInput.value = "false";
      if (popupTitle) popupTitle.textContent = "Cadastrar Nova Entrada";
      // Definir a data atual como padrão
      const today = new Date().toISOString().split("T")[0];
      const dataEntradaInput = document.getElementById("dataEntrada");
      if (dataEntradaInput) dataEntradaInput.value = today;
      // Mostrar popup
      if (popupOverlay) popupOverlay.style.display = "block";
      if (entradaPopup) entradaPopup.style.display = "block";
    });
  }

  // Fechar o popup ao clicar no overlay
  if (popupOverlay) {
    popupOverlay.addEventListener("click", (e) => {
      if (e.target === popupOverlay) {
        console.log("Clique no overlay - fechando popups");
        popupOverlay.style.display = "none";
        if (entradaPopup) entradaPopup.style.display = "none";
        if (deletePopup) deletePopup.style.display = "none";
        currentRowToDelete = null;
      }
    });
  }

  // Fechar o popup ao clicar em cancelar
  if (cancelarEntradaBtn) {
    cancelarEntradaBtn.addEventListener("click", (e) => {
      console.log("Botão Cancelar clicado");
      e.preventDefault();
      if (entradaPopup) entradaPopup.style.display = "none";
      if (popupOverlay) popupOverlay.style.display = "none";
    });
  }

  // Processar o formulário de entrada
  if (entradaForm) {
    entradaForm.addEventListener("submit", async (e) => {
      console.log("Formulário submetido");
      e.preventDefault();
       
      try {
        const eanInput = document.getElementById("eanEntrada");
        if (!eanInput) {
          console.error("Campo EAN não encontrado");
          return;
        }
           
        // Garantir que o EAN tenha 13 dígitos
        let ean = eanInput.value.trim();
        ean = ean.padStart(13, '0');
           
        // Validar o EAN
        if (!/^\d{13}$/.test(ean)) {
          alert(`O EAN deve conter exatamente 13 dígitos. Valor atual: ${ean} (${ean.length} dígitos)`);
          eanInput.focus();
          return;
        }
           
        const produtoSelect = document.getElementById("produtoEntrada");
        const quantidadeInput = document.getElementById("quantidadeEntrada");
        const fornecedorSelect = document.getElementById("fornecedorEntrada");
        const notaFiscalInput = document.getElementById("notaFiscalEntrada");
        const valorInput = document.getElementById("valorEntrada");
        const responsavelInput = document.getElementById("responsavelEntrada");
        const dataInput = document.getElementById("dataEntrada");
           
        if (!produtoSelect || !quantidadeInput || !fornecedorSelect || 
            !notaFiscalInput || !valorInput || !responsavelInput || !dataInput) {
          console.error("Um ou mais campos do formulário não foram encontrados");
          return;
        }
           
        const produto = produtoSelect.value;
        const quantidade = parseInt(quantidadeInput.value, 10);
        const fornecedor = fornecedorSelect.value;
        let notaFiscal = notaFiscalInput.value;
           
        // Limpar a nota fiscal (remover pontos e limitar a 9 caracteres)
        notaFiscal = notaFiscal.replace(/\./g, "").substring(0, 9);
           
        // Processar o valor unitário (garantir que seja um número)
        let valorUnitario = valorInput.value.trim();
        valorUnitario = parseFloat(valorUnitario.replace(/[^\d.,]/g, '').replace(',', '.'));
           
        const responsavel = responsavelInput.value.trim();
           
        // Formatar a data para YYYY-MM-DD
        let dataEntrada = dataInput.value.trim();
           
        // Verificar se todos os campos obrigatórios estão preenchidos
        const camposVazios = [];
        if (!ean || ean.length !== 13) camposVazios.push("EAN (deve ter 13 dígitos)");
        if (!produto) camposVazios.push("Produto");
        if (isNaN(quantidade) || quantidade <= 0) camposVazios.push("Quantidade (deve ser maior que zero)");
        if (!fornecedor) camposVazios.push("Fornecedor");
        if (!notaFiscal) camposVazios.push("Nota Fiscal");
        if (isNaN(valorUnitario) || valorUnitario <= 0) camposVazios.push("Valor Unitário (deve ser maior que zero)");
        if (!responsavel) camposVazios.push("Responsável");
        if (!dataEntrada) camposVazios.push("Data de Entrada");
        
        if (camposVazios.length > 0) {
          alert(`Os seguintes campos estão vazios ou inválidos:\n- ${camposVazios.join('\n- ')}`);
          console.error("Campos vazios ou inválidos:", camposVazios);
          return;
        }
        
        console.log("Valores validados com sucesso:", {
          ean, produto, quantidade, fornecedor, notaFiscal, valorUnitario, responsavel, dataEntrada
        });
           
        // Verificar se o modo de edição está ativado
        const editMode = document.getElementById("editMode");
        const isEditMode = editMode && editMode.value === "true";
           
        // Criar objeto com os dados da entrada
        const entradaData = {
          ean: String(ean),
          produto: String(produto),
          quantidade: Number(quantidade),
          fornecedor: String(fornecedor),
          nota_fiscal: String(notaFiscal).replace(/\./g, ""), // Remover pontos
          valor_unitario: Number(valorUnitario),
          responsavel: String(responsavel),
          data_entrada: String(dataEntrada)
        };
        
        console.log("Objeto final a ser enviado:", JSON.stringify(entradaData));
           
        // Log detalhado dos dados
        console.log("Dados a serem enviados (JSON):", JSON.stringify(entradaData, null, 2));
        console.log("Tipos de dados:");
        Object.entries(entradaData).forEach(([key, value]) => {
          console.log(`${key}: ${typeof value} - ${value}`);
        });
           
        // Enviar dados para o servidor
        const response = await fetch('http://localhost:3000/api/entradas', {
          method: isEditMode ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entradaData),
        });
           
        // Capturar o corpo da resposta mesmo em caso de erro
        const responseText = await response.text();
        console.log(`Resposta do servidor (status ${response.status}):`, responseText);
           
        if (!response.ok) {
          throw new Error(`Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} entrada: ${response.status} - ${responseText}`);
        }
           
        const data = responseText ? JSON.parse(responseText) : {};
        console.log(`Entrada ${isEditMode ? 'atualizada' : 'cadastrada'} com sucesso:`, data);
           
        // Formatar a Nota Fiscal com zeros à esquerda e pontos para exibição
        const notaFiscalFormatada = `N° ${formatarNotaFiscalComZeros(notaFiscal)}`;
           
        // Se for edição, recarregar a tabela
        if (isEditMode) {
          const tabela = document.querySelector("table tbody");
          if (tabela) {
            tabela.innerHTML = '';
            carregarEntradasExistentes();
          }
        } else {
          // Adicionar à tabela apenas se for uma nova entrada
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
        }
           
        // Fechar o popup
        if (entradaPopup) entradaPopup.style.display = "none";
        if (popupOverlay) popupOverlay.style.display = "none";
           
        // Limpar o formulário
        entradaForm.reset();
           
        // Mostrar mensagem de sucesso
        alert(`Entrada ${isEditMode ? 'atualizada' : 'cadastrada'} com sucesso!`);
      } catch (error) {
        console.error('Erro:', error);
        alert(error.message);
      }
    });
  }

  // Configurar botões do popup de exclusão
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
      console.log("Botão Confirmar Exclusão clicado");
      if (currentRowToDelete) {
        // Obter o EAN e a nota fiscal para identificar a entrada a ser excluída
        const ean = currentRowToDelete.cells[0].textContent;
        const notaFiscal = currentRowToDelete.cells[4].textContent.replace("N° ", "");
           
        // Enviar solicitação de exclusão para o servidor
        fetch(`http://localhost:3000/api/entradas/${ean}/${notaFiscal.replace(/\./g, "")}`, {
          method: 'DELETE',
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Erro ao excluir entrada: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Entrada excluída com sucesso:', data);
               
          // Remover a linha da tabela
          currentRowToDelete.remove();
               
          // Fechar o popup
          if (popupOverlay) popupOverlay.style.display = "none";
          if (deletePopup) deletePopup.style.display = "none";
               
          // Mostrar mensagem de sucesso
          alert("Entrada excluída com sucesso!");
               
          // Limpar a referência
          currentRowToDelete = null;
        })
        .catch(error => {
          console.error('Erro ao excluir entrada:', error);
          alert(`Erro ao excluir entrada: ${error.message}`);
        });
      }
    });
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
      console.log("Botão Cancelar Exclusão clicado");
      if (popupOverlay) popupOverlay.style.display = "none";
      if (deletePopup) deletePopup.style.display = "none";
      currentRowToDelete = null;
    });
  }

  // Adicionar evento de input no campo de Nota Fiscal
  const notaFiscalInput = document.getElementById("notaFiscalEntrada");
  if (notaFiscalInput) {
    notaFiscalInput.addEventListener("input", function () {
      formatarNotaFiscal(this);
    });
  }

  // Carregar entradas existentes (se houver)
  carregarEntradasExistentes();
});

// Função para validar o EAN
function validarEAN(ean) {
  return /^\d{13}$/.test(ean); // Verifica se o EAN contém exatamente 13 dígitos
}

// Função para mostrar o popup de edição
function showEditPopup(event, row) {
  console.log("Função showEditPopup chamada");
  event.preventDefault();

  // Obter os dados da linha com os índices corretos
  const ean = row.cells[0].textContent;
  const produto = row.cells[1].textContent;
  const quantidade = row.cells[2].textContent;
  const fornecedor = row.cells[3].textContent;
  const notaFiscal = row.cells[4].textContent.replace("N° ", "");
  const valorUnitario = row.cells[5].textContent;
  const responsavel = row.cells[6].textContent;
  const dataEntrada = row.cells[7].textContent;

  console.log("Dados da linha:", { ean, produto, quantidade, fornecedor, notaFiscal, valorUnitario, responsavel, dataEntrada });

  // Converter a data para o formato do input date (YYYY-MM-DD)
  let dataFormatada = '';
  if (dataEntrada) {
    const dataParts = dataEntrada.split("/");
    dataFormatada = dataParts.length === 3
      ? `${dataParts[2]}-${dataParts[1].padStart(2, "0")}-${dataParts[0].padStart(2, "0")}`
      : dataEntrada; // Manter o formato original se não for DD/MM/YYYY
  }

  // Preencher o formulário
  const editMode = document.getElementById("editMode");
  const popupTitle = document.getElementById("popupTitle");
  const eanInput = document.getElementById("eanEntrada");
  const dataInput = document.getElementById("dataEntrada");
  const valorInput = document.getElementById("valorEntrada");
  const responsavelInput = document.getElementById("responsavelEntrada");
  const produtoSelect = document.getElementById("produtoEntrada");
  const quantidadeInput = document.getElementById("quantidadeEntrada");
  const fornecedorSelect = document.getElementById("fornecedorEntrada");
  const notaFiscalInput = document.getElementById("notaFiscalEntrada");

  if (editMode) editMode.value = "true";
  if (popupTitle) popupTitle.textContent = "Editar Entrada";
  if (eanInput) eanInput.value = ean;
  if (dataInput) dataInput.value = dataFormatada;
  if (valorInput) valorInput.value = valorUnitario;
  if (responsavelInput) responsavelInput.value = responsavel;

  // Selecionar o produto no dropdown
  if (produtoSelect) {
    let produtoEncontrado = false;
    for (let i = 0; i < produtoSelect.options.length; i++) {
      if (produtoSelect.options[i].text === produto) {
        produtoSelect.selectedIndex = i;
        produtoEncontrado = true;
        break;
      }
    }
    
    // Se o produto não for encontrado, adicione-o
    if (!produtoEncontrado && produto) {
      const option = document.createElement("option");
      option.value = produto;
      option.textContent = produto;
      produtoSelect.appendChild(option);
      produtoSelect.value = produto;
    }
  }

  if (quantidadeInput) quantidadeInput.value = quantidade;

  // Selecionar o fornecedor no dropdown
  if (fornecedorSelect) {
    let fornecedorEncontrado = false;
    for (let i = 0; i < fornecedorSelect.options.length; i++) {
      if (fornecedorSelect.options[i].text === fornecedor) {
        fornecedorSelect.selectedIndex = i;
        fornecedorEncontrado = true;
        break;
      }
    }
    
    // Se o fornecedor não for encontrado, adicione-o
    if (!fornecedorEncontrado && fornecedor) {
      const option = document.createElement("option");
      option.value = fornecedor;
      option.textContent = fornecedor;
      fornecedorSelect.appendChild(option);
      fornecedorSelect.value = fornecedor;
    }
  }

  if (notaFiscalInput) notaFiscalInput.value = notaFiscal;

  // Mostrar o popup
  const popupOverlay = document.getElementById("popupOverlay");
  const entradaPopup = document.getElementById("entradaPopup");

  if (popupOverlay) popupOverlay.style.display = "block";
  if (entradaPopup) entradaPopup.style.display = "block";
}

// Função para mostrar o popup de exclusão
function showDeletePopup(event, itemName) {
  console.log("Função showDeletePopup chamada");
  event.preventDefault();
  event.stopPropagation();

  const popupOverlay = document.getElementById("popupOverlay");
  const deletePopup = document.getElementById("deletePopup");
  const deleteMessage = document.getElementById("deleteMessage");

  if (!popupOverlay || !deletePopup) {
    console.error("Elementos de popup não encontrados");
    return;
  }

  // Armazenar a linha a ser excluída
  currentRowToDelete = event.target.closest("tr");

  // Definir a mensagem de confirmação
  if (deleteMessage) {
    deleteMessage.textContent = `Tem certeza que deseja excluir a entrada do produto "${itemName}"?`;
  }

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
  if (!notaFiscal) return "000.000.000";
  
  let valor = notaFiscal.replace(/\D/g, ""); // Remove caracteres não numéricos
  valor = valor.padStart(9, "0"); // Preenche com zeros à esquerda até 9 dígitos
  valor = valor.replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3"); // Adiciona pontos
  return valor;
}

// Função para carregar entradas existentes do banco de dados
function carregarEntradasExistentes() {
  console.log("Iniciando carregamento de entradas existentes");
  
  fetch('http://localhost:3000/api/entradas')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(entradas => {
      console.log(`Carregadas ${entradas.length} entradas do banco de dados`);
      
      if (entradas.length === 0) {
        console.log("Nenhuma entrada encontrada no banco de dados");
        return;
      }
      
      entradas.forEach(entrada => {
        // Formatar a nota fiscal
        const notaFiscalFormatada = `N° ${formatarNotaFiscalComZeros(entrada.nota_fiscal || '')}`;
        
        // Formatar a data (assumindo que vem como YYYY-MM-DD do banco)
        let dataFormatada = '';
        if (entrada.data_entrada) {
          const dataObj = new Date(entrada.data_entrada);
          dataFormatada = dataObj.toISOString().split('T')[0];
        }
        
        adicionarEntradaNaTabela(
          entrada.ean || '',
          entrada.produto || '',
          entrada.quantidade || 0,
          entrada.fornecedor || '',
          notaFiscalFormatada,
          entrada.valor_unitario || 0,
          entrada.responsavel || '',
          dataFormatada
        );
      });
    })
    .catch(error => {
      console.error('Erro ao carregar entradas:', error);
    });
}
