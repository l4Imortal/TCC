document.addEventListener("DOMContentLoaded", () => {
  // Elementos do DOM
  const novaSaidaBtn = document.getElementById("novaSaidaBtn");
  const saidaForm = document.getElementById("saidaForm");
  const popupOverlay = document.getElementById("popupOverlay");
  const saidaPopup = document.getElementById("saidaPopup");
  const fecharPopupBtn = document.getElementById("fecharPopup");
  const salvarSaidaBtn = document.getElementById("salvarSaida");
  const deletePopup = document.getElementById("deletePopup");
  const confirmDeleteBtn = document.getElementById("confirmDelete");
  const cancelDeleteBtn = document.getElementById("cancelDelete");
  const produtoSelect = document.getElementById("produtoSaida");
  const fornecedorSelect = document.getElementById("fornecedorSaida");
  
  let currentRowToDelete = null;
  let currentEanToEdit = null;
  let currentNotaFiscalToEdit = null;

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

  // Formatar o campo "Nota Fiscal" enquanto o usuário digita
  document.getElementById("notaFiscalSaida").addEventListener("input", (e) => {
    let valor = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
    valor = valor.slice(0, 9); // Limita a 9 dígitos numéricos
    
    // Adiciona os pontos no formato apenas se houver dígitos suficientes
    if (valor.length >= 7) {
      valor = valor.replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3");
    } else if (valor.length >= 4) {
      valor = valor.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    }
    
    e.target.value = valor; // Atualiza o valor do campo com o formato
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

    // Validação básica
    if (!ean || !produto || !quantidade || !fornecedor || !notaFiscal || !valorUnitario || !responsavel || !dataSaida) {
      alert("Todos os campos são obrigatórios!");
      return;
    }

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

  // Função para carregar as saídas do banco de dados
  function carregarSaidas() {
    console.log('Iniciando carregamento de saídas...');
    
    fetch('http://localhost:3000/api/saidas')
      .then(response => {
        console.log('Resposta recebida:', response.status);
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(saidas => {
        console.log('Dados recebidos:', saidas);
        
        const tabela = document.querySelector("table tbody");
        tabela.innerHTML = ''; // Limpa a tabela antes de adicionar novos dados
        
        if (!Array.isArray(saidas) || saidas.length === 0) {
          console.log('Nenhuma saída encontrada');
          const novaLinha = document.createElement("tr");
          novaLinha.innerHTML = '<td colspan="9" class="text-center">Nenhuma saída cadastrada</td>';
          tabela.appendChild(novaLinha);
          return;
        }
        
        saidas.forEach(saida => {
          try {
            const novaLinha = document.createElement("tr");
            
            // Verificar se nota_fiscal existe antes de formatá-la
            let notaFiscalFormatada = "";
            if (saida.nota_fiscal) {
              notaFiscalFormatada = "N° " + saida.nota_fiscal.replace(/\D/g, "")
                .padStart(9, "0")
                .replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3");
            }
            
            // Verificar se data_saida existe antes de formatá-la
            let dataFormatada = "";
            if (saida.data_saida) {
              // Verificar se a data contém 'T' antes de fazer split
              dataFormatada = saida.data_saida.includes('T') 
                ? saida.data_saida.split('T')[0] 
                : saida.data_saida;
            }
            
            // Armazenar a nota fiscal original como atributo de dados para uso posterior
            novaLinha.dataset.ean = saida.ean;
            novaLinha.dataset.notaFiscal = saida.nota_fiscal;
            
            novaLinha.innerHTML = `
              <td>${saida.ean || ''}</td>
              <td>${saida.produto || ''}</td>
              <td>${saida.quantidade || ''}</td>
              <td>${saida.fornecedor || ''}</td>
              <td>${notaFiscalFormatada || ''}</td>
              <td>${saida.valor_unitario || ''}</td>
              <td>${saida.responsavel || ''}</td>
              <td>${dataFormatada || ''}</td>
              <td>
                <button class="edit-button"><i class="fas fa-edit"></i></button>
                <button class="delete-button"><i class="fas fa-trash"></i></button>
              </td>
            `;
            
            tabela.appendChild(novaLinha);
          } catch (error) {
            console.error('Erro ao processar saída:', error, saida);
          }
        });
      })
      .catch(error => {
        console.error('Erro ao carregar saídas:', error);
        
        const tabela = document.querySelector("table tbody");
        tabela.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Erro ao carregar dados: ${error.message}</td></tr>`;
        
        alert('Erro ao carregar saídas do banco de dados: ' + error.message);
      });
  }

  // Função para adicionar uma nova saída na tabela
  function adicionarSaidaNaTabela(ean, produto, quantidade, fornecedor, notaFiscal, valorUnitario, responsavel, dataSaida) {
    // Criar objeto com os dados da saída
    const novaSaida = {
      ean,
      produto,
      quantidade,
      fornecedor,
      nota_fiscal: notaFiscal,
      valor_unitario: valorUnitario,
      responsavel,
      data_saida: dataSaida
    };

    console.log('Enviando nova saída para o servidor:', novaSaida);

    // Enviar para o servidor
    fetch('http://localhost:3000/api/saidas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(novaSaida)
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.error || 'Erro ao cadastrar saída');
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Saída cadastrada com sucesso:', data);
        // Recarregar a tabela para mostrar os dados atualizados
        carregarSaidas();
      })
      .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao cadastrar saída: ' + error.message);
      });
  }

  // Função para atualizar uma saída no servidor
  function atualizarSaidaNaTabela(ean, produto, quantidade, fornecedor, notaFiscal, valorUnitario, responsavel, dataSaida) {
    // Criar objeto com os dados atualizados
    const saidaAtualizada = {
      produto,
      quantidade,
      fornecedor,
      nota_fiscal: notaFiscal,
      valor_unitario: valorUnitario,
      responsavel,
      data_saida: dataSaida
    };

    console.log('Atualizando saída no servidor:', saidaAtualizada);
    console.log('EAN:', ean, 'Nota Fiscal original:', currentNotaFiscalToEdit);

    // Enviar para o servidor
    fetch(`http://localhost:3000/api/saidas/${ean}/${encodeURIComponent(currentNotaFiscalToEdit)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(saidaAtualizada)
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.error || 'Erro ao atualizar saída');
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Saída atualizada com sucesso:', data);
        // Recarregar a tabela para mostrar os dados atualizados
        carregarSaidas();
      })
      .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao atualizar saída: ' + error.message);
      });
  }

  // Função para mostrar o popup de edição
  document.querySelector("table tbody").addEventListener("click", (e) => {
    if (e.target.closest(".edit-button")) {
      const row = e.target.closest("tr");
      
      // Obter os valores originais para identificação
      currentEanToEdit = row.dataset.ean;
      currentNotaFiscalToEdit = row.dataset.notaFiscal;
      
      const ean = row.cells[0].textContent;
      const produto = row.cells[1].textContent;
      const quantidade = row.cells[2].textContent;
      const fornecedor = row.cells[3].textContent;
      
      // Remover formatação da nota fiscal para edição
      const notaFiscalText = row.cells[4].textContent;
      const notaFiscal = notaFiscalText.replace(/[^\d.]/g, ""); // Remove "N° " e mantém apenas dígitos e pontos
      
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
      
      document.getElementById("deleteMessage").textContent = `Tem certeza que deseja excluir a saída do produto "${itemName}"?`;
      
      popupOverlay.style.display = "block";
      deletePopup.style.display = "block";
    }
  });

  // Confirmar exclusão
  confirmDeleteBtn.addEventListener("click", () => {
    if (currentRowToDelete) {
      const ean = currentRowToDelete.dataset.ean;
      const notaFiscal = currentRowToDelete.dataset.notaFiscal;
      
      console.log('Excluindo saída:', ean, notaFiscal);
      
      // Enviar solicitação de exclusão para o servidor
      fetch(`http://localhost:3000/api/saidas/${ean}/${encodeURIComponent(notaFiscal)}`, {
        method: 'DELETE'
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => {
              throw new Error(err.error || 'Erro ao excluir saída');
            });
          }
          return response.json();
        })
        .then(data => {
          console.log('Saída excluída com sucesso:', data);
          currentRowToDelete = null;
          // Recarregar a tabela para mostrar os dados atualizados
          carregarSaidas();
        })
        .catch(error => {
          console.error('Erro:', error);
          alert('Erro ao excluir saída: ' + error.message);
        });
      
      popupOverlay.style.display = "none";
      deletePopup.style.display = "none";
    }
  });

  // Cancelar exclusão
  cancelDeleteBtn.addEventListener("click", () => {
    popupOverlay.style.display = "none";
    deletePopup.style.display = "none";
    currentRowToDelete = null;
  });

  // Função para carregar produtos do banco de dados
  function carregarProdutos() {
    fetch('http://localhost:3000/api/produtos')
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao buscar produtos');
        }
        return response.json();
      })
      .then(produtos => {
        produtoSelect.innerHTML = '<option value="">Selecione um produto</option>';
        produtos.forEach(produto => {
          const option = document.createElement("option");
          option.value = produto.produto;
          option.textContent = produto.produto;
          produtoSelect.appendChild(option);
        });
      })
      .catch(error => {
        console.error('Erro ao carregar produtos:', error);
        // Adicionar opção padrão mesmo em caso de erro
        produtoSelect.innerHTML = '<option value="">Erro ao carregar produtos</option>';
      });
  }

  // Função para carregar fornecedores do banco de dados
  function carregarFornecedores() {
    fetch('http://localhost:3000/api/fornecedores')
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao buscar fornecedores');
        }
        return response.json();
      })
      .then(fornecedores => {
        fornecedorSelect.innerHTML = '<option value="">Selecione um fornecedor</option>';
        fornecedores.forEach(fornecedor => {
          const option = document.createElement("option");
          option.value = fornecedor.nome;
          option.textContent = fornecedor.nome;
          fornecedorSelect.appendChild(option);
        });
      })
      .catch(error => {
        console.error('Erro ao carregar fornecedores:', error);
        // Adicionar opção padrão mesmo em caso de erro
        fornecedorSelect.innerHTML = '<option value="">Erro ao carregar fornecedores</option>';
      });
  }

  // Carregar dados quando a página é carregada
  carregarSaidas();
  carregarProdutos();
  carregarFornecedores();
});

