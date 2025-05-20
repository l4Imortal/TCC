document.addEventListener("DOMContentLoaded", () => {
  // Selecionar elementos do DOM
  const novoFornecedorButton = document.getElementById("novoFornecedorBtn");
  const popupOverlay = document.getElementById("popupOverlay");
  const popup = document.getElementById("popup");
  const deletePopup = document.getElementById("deletePopup");
  const codigoFornecedorInput = document.getElementById("codigoFornecedor");
  const fornecedorForm = document.getElementById("fornecedorForm");
  const tabelaBody = document.querySelector("table tbody");
  const confirmDeleteButton = document.getElementById("confirmDelete");
  const cancelDeleteButton = document.getElementById("cancelDelete");
  const deleteMessage = document.getElementById("deleteMessage");
  const popupTitle = document.getElementById("popupTitle");
  const salvarFornecedorButton = document.getElementById("salvarFornecedor");
  const editModeInput = document.getElementById("editMode");
  const btnCancelar = document.getElementById("btnCancelar");
  
  let fornecedorParaExcluir = null; // Variável para armazenar o fornecedor a ser excluído

  // Função para gerar o próximo código
  function gerarProximoCodigo() {
    // Buscar todos os códigos existentes na tabela
    const rows = document.querySelector("table tbody").querySelectorAll("tr");
    let maxCodigo = 0;
    
    // Encontrar o maior código
    rows.forEach(row => {
      const codigo = parseInt(row.cells[0].textContent);
      if (!isNaN(codigo) && codigo > maxCodigo) {
        maxCodigo = codigo;
      }
    });
    
    // Retornar o próximo código (maior + 1)
    return maxCodigo + 1;
  }

  // Função para formatar CNPJ
  function formatarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  // Função para formatar telefone
  function formatarTelefone(telefone) {
    telefone = telefone.replace(/\D/g, '');
    if (telefone.length === 11) {
      return telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (telefone.length === 10) {
      return telefone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    return telefone;
  }

  // Adicionar máscaras aos campos
  const cnpjInput = document.getElementById("cnpjFornecedor");
  if (cnpjInput) {
    cnpjInput.addEventListener("input", function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length <= 14) {
        e.target.value = formatarCNPJ(value);
      } else {
        e.target.value = formatarCNPJ(value.substring(0, 14));
      }
    });
  }

  const telefoneInput = document.getElementById("telefoneFornecedor");
  if (telefoneInput) {
    telefoneInput.addEventListener("input", function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length <= 11) {
        e.target.value = formatarTelefone(value);
      } else {
        e.target.value = formatarTelefone(value.substring(0, 11));
      }
    });
  }

  // Adicionar máscara de CEP
  const cepInput = document.getElementById("cepFornecedor");
  if (cepInput) {
    cepInput.addEventListener("input", function(e) {
      let cep = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
      if (cep.length > 5) {
        cep = cep.slice(0, 5) + "-" + cep.slice(5, 8); // Adiciona o hífen no formato XXXXX-XXX
      }
      e.target.value = cep; // Atualiza o valor do campo
    });

    // Buscar endereço pelo CEP
    cepInput.addEventListener("blur", function() {
      const cep = this.value.replace(/\D/g, '');
      if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
          .then(response => {
            if (!response.ok) {
              throw new Error("Erro ao buscar o CEP");
            }
            return response.json();
          })
          .then(data => {
            if (data.erro) {
              alert("CEP não encontrado!");
              return;
            }
            
            // Preencher o campo de endereço com os dados retornados
            const enderecoCompleto = `${data.logradouro}, ${data.bairro}, ${data.localidade}-${data.uf}, ${cep}`;
            document.getElementById("enderecoFornecedor").value = enderecoCompleto;
          })
          .catch(error => {
            console.error("Erro ao buscar o CEP:", error);
            alert("Não foi possível buscar o CEP. Tente novamente.");
          });
      } else if (cep.length > 0) {
        alert("CEP inválido! Certifique-se de que possui 8 dígitos.");
      }
    });
  }

  // Abrir o pop-up de novo fornecedor
  if (novoFornecedorButton) {
    novoFornecedorButton.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Resetar o formulário
      fornecedorForm.reset();
      
      // Configurar para modo de criação
      editModeInput.value = "false";
      popupTitle.textContent = "Cadastrar Novo Fornecedor";
      salvarFornecedorButton.textContent = "Cadastrar";
      
      // Gerar próximo código
      codigoFornecedorInput.value = gerarProximoCodigo();
      
      // Mostrar popup
      popupOverlay.style.display = "block";
      popup.style.display = "block";
      deletePopup.style.display = "none";
    });
  }

  // Fechar popup ao clicar no overlay
  if (popupOverlay) {
    popupOverlay.addEventListener("click", (e) => {
      if (e.target === popupOverlay) {
        popupOverlay.style.display = "none";
        popup.style.display = "none";
        deletePopup.style.display = "none";
        fornecedorParaExcluir = null;
      }
    });
  }

  // Cadastrar/Editar fornecedor
  if (fornecedorForm) {
    fornecedorForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const isEditMode = editModeInput.value === "true";
      const id_fornecedor = codigoFornecedorInput.value;
      const nome = document.getElementById("nomeFornecedor").value;
      const cnpj = document.getElementById("cnpjFornecedor").value;
      const telefone = document.getElementById("telefoneFornecedor").value;
      const email = document.getElementById("emailFornecedor").value;
      const endereco = document.getElementById("enderecoFornecedor").value;

      if (isEditMode) {
        // Atualizar fornecedor existente
        fetch(`http://localhost:3000/api/fornecedores/${id_fornecedor}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nome,
            cnpj,
            telefone,
            email,
            endereco
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Erro ao atualizar fornecedor');
          }
          return response.json();
        })
        .then(data => {
          alert("Fornecedor atualizado com sucesso!");
          // Recarregar a lista de fornecedores
          carregarFornecedores();
          // Fechar o popup
          popupOverlay.style.display = "none";
          popup.style.display = "none";
        })
        .catch(error => {
          console.error('Erro:', error);
          alert('Erro ao atualizar fornecedor: ' + error.message);
        });
      } else {
        // Cadastrar novo fornecedor
        fetch('http://localhost:3000/api/fornecedores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nome,
            cnpj,
            telefone,
            email,
            endereco
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Erro ao cadastrar fornecedor');
          }
          return response.json();
        })
        .then(data => {
          alert("Fornecedor cadastrado com sucesso!");
          // Recarregar a lista de fornecedores
          carregarFornecedores();
          // Fechar o popup
          popupOverlay.style.display = "none";
          popup.style.display = "none";
        })
        .catch(error => {
          console.error('Erro:', error);
          alert('Erro ao cadastrar fornecedor: ' + error.message);
        });
      }
    });
  }

  // Manipuladores de eventos para o popup de exclusão
  if (confirmDeleteButton) {
    confirmDeleteButton.addEventListener("click", () => {
      if (fornecedorParaExcluir) {
        const id = fornecedorParaExcluir;
        
        // Excluir do servidor
        fetch(`http://localhost:3000/api/fornecedores/${id}`, {
          method: 'DELETE'
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Erro ao excluir fornecedor');
          }
          return response.json();
        })
        .then(data => {
          // Fechar o popup
          popupOverlay.style.display = "none";
          deletePopup.style.display = "none";
          
          // Mostrar mensagem de sucesso
          alert("Fornecedor excluído com sucesso!");
          
          // Recarregar a lista de fornecedores
          carregarFornecedores();
          
          // Limpar a referência
          fornecedorParaExcluir = null;
        })
        .catch(error => {
          console.error('Erro:', error);
          alert('Erro ao excluir fornecedor: ' + error.message);
        });
      }
    });
  }

  if (cancelDeleteButton) {
    cancelDeleteButton.addEventListener("click", () => {
      popupOverlay.style.display = "none";
      popup.style.display = "none"; // Fecha o popup principal
      deletePopup.style.display = "none"; // Fecha o popup de exclusão
      fornecedorParaExcluir = null;
    });
  }

  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      popupOverlay.style.display = "none"; // Oculta o overlay
      popup.style.display = "none"; // Oculta o popup principal
    });
  }

  // Função para editar fornecedor
  function editarFornecedor(id) {
    // Ocultar o popup de exclusão, caso esteja visível
    deletePopup.style.display = "none";

    // Buscar dados do fornecedor no servidor
    fetch(`http://localhost:3000/api/fornecedores/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao buscar fornecedor');
        }
        return response.json();
      })
      .then(fornecedor => {
        // Preencher o formulário
        document.getElementById("editMode").value = "true";
        document.getElementById("popupTitle").textContent = "Editar Fornecedor";
        document.getElementById("salvarFornecedor").textContent = "Atualizar";

        document.getElementById("codigoFornecedor").value = fornecedor.id_fornecedor;
        document.getElementById("nomeFornecedor").value = fornecedor.nome;
        document.getElementById("cnpjFornecedor").value = fornecedor.cnpj;
        document.getElementById("telefoneFornecedor").value = fornecedor.telefone || "";
        document.getElementById("emailFornecedor").value = fornecedor.email || "";
        document.getElementById("enderecoFornecedor").value = fornecedor.endereco || "";

        // Mostrar o popup de edição
        popupOverlay.style.display = "block";
        popup.style.display = "block";
      })
      .catch(error => {
        console.error('Erro ao buscar fornecedor:', error);
        alert('Erro ao buscar dados do fornecedor: ' + error.message);
      });
  }

  // Função para excluir fornecedor
  function excluirFornecedor(id, nome) {
    // Ocultar o popup de edição, caso esteja visível
    popup.style.display = "none";

    fornecedorParaExcluir = id;

    // Configurar mensagem de confirmação
    if (deleteMessage) {
      deleteMessage.textContent = `Tem certeza que deseja excluir "${nome}"?`;
    }

    // Mostrar popup de confirmação
    popupOverlay.style.display = "block";
    deletePopup.style.display = "block";
  }

  // Função para adicionar eventos aos botões após carregar os fornecedores
  function adicionarEventosBotoes() {
    // Adicionar eventos aos botões de editar
    document.querySelectorAll(".btn-editar").forEach(botao => {
      botao.addEventListener("click", function() {
        const id = this.getAttribute("data-id");
        editarFornecedor(id);
      });
    });

    // Adicionar eventos aos botões de excluir
    document.querySelectorAll(".btn-excluir").forEach(botao => {
      botao.addEventListener("click", function() {
        const id = this.getAttribute("data-id");
        const nome = this.closest("tr").cells[1].textContent;
        excluirFornecedor(id, nome);
      });
    });
  }

  // Função para carregar fornecedores do servidor
  function carregarFornecedores() {
    fetch('http://localhost:3000/api/fornecedores')
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao buscar fornecedores');
        }
        return response.json();
      })
      .then(fornecedores => {
        if (!tabelaBody) {
          console.error('Elemento da tabela não encontrado');
          return;
        }
        
        tabelaBody.innerHTML = ""; // Limpa a tabela
        
        fornecedores.forEach(fornecedor => {
          const novaLinha = document.createElement("tr");
          novaLinha.setAttribute("data-id", fornecedor.id_fornecedor);
          
          
          novaLinha.innerHTML = `
  <td>${fornecedor.id_fornecedor}</td>
  <td>${fornecedor.nome}</td>
  <td>${fornecedor.cnpj || ""}</td>
  <td>${fornecedor.telefone || ""}</td>
  <td>${fornecedor.email || ""}</td>
  <td>${fornecedor.endereco || ""}</td>
  <td>-</td>
  <td class="acoes-coluna">
    <button class="btn-editar" data-id="${fornecedor.id_fornecedor}">
      <i class="fas fa-edit"></i>
    </button>
    <button class="btn-excluir" data-id="${fornecedor.id_fornecedor}">
      <i class="fas fa-trash-alt"></i>
    </button>
  </td>
`;

          tabelaBody.appendChild(novaLinha);
        });
        
        // Adicionar eventos aos botões após carregar os fornecedores
        adicionarEventosBotoes();
      })
      .catch(error => {
        console.error('Erro ao carregar fornecedores:', error);
        alert('Erro ao carregar fornecedores: ' + error.message);
      });
  }

  // Carregar fornecedores ao iniciar a página
  carregarFornecedores();
});
