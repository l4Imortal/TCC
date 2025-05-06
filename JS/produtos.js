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
  if (popupConfirmacao) {
    popupConfirmacao.style.display = "flex";
  }
}

// Fecha o popup de confirmação ao clicar no botão "Fechar"
if (btnFecharConfirmacao) {
  btnFecharConfirmacao.addEventListener("click", () => {
    popupConfirmacao.style.display = "none";
  });
}

// Simula uma lista de fornecedores cadastrados (pode ser substituído por dados reais)
const fornecedoresCadastrados = []; // Lista vazia para simular nenhum fornecedor cadastrado

// Seleciona o campo de fornecedores no formulário
const fornecedorProduto = document.getElementById("fornecedorProduto");

// Preenche o campo de fornecedores com os dados disponíveis
// Função para carregar fornecedores do servidor
function carregarFornecedores() {
  if (!fornecedorProduto) return;
  
  // Buscar fornecedores do servidor
  fetch('http://localhost:3000/api/fornecedores')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao buscar fornecedores');
      }
      return response.json();
    })
    .then(fornecedores => {
      if (fornecedores && fornecedores.length > 0) {
        fornecedorProduto.innerHTML = '<option value="" disabled selected>Selecione um fornecedor</option>'; // Opção padrão
        
        fornecedores.forEach((fornecedor) => {
          const option = document.createElement("option");
          option.value = fornecedor.nome; // Ou fornecedor.id_fornecedor, dependendo do que você precisa
          option.textContent = fornecedor.nome;
          fornecedorProduto.appendChild(option);
        });
        
        fornecedorProduto.disabled = false; // Habilita o campo
      } else {
        fornecedorProduto.innerHTML = '<option value="" disabled selected>Nenhum fornecedor disponível</option>';
        fornecedorProduto.disabled = true; // Desabilita o campo
      }
    })
    .catch(error => {
      console.error('Erro ao carregar fornecedores:', error);
      fornecedorProduto.innerHTML = '<option value="" disabled selected>Erro ao carregar fornecedores</option>';
      fornecedorProduto.disabled = true;
    });
}


// Seleciona a tabela onde os produtos serão adicionados
const tabelaProdutos = document.querySelector(".center-table tbody");

// Função para salvar produto no servidor
function salvarProdutoNoServidor(produto) {
  // Adaptar o objeto produto para o formato esperado pela API
  const produtoParaAPI = {
    ean: produto.ean || "",
    produto: produto.nome, // Usando 'nome' do formulário para o campo 'produto' do banco
    categoria: produto.categoria,
    un: produto.unidade || "UN",
    data: produto.data || new Date().toISOString().split('T')[0], // Data atual no formato YYYY-MM-DD
    fornecedor: produto.fornecedor || 'N/A',
    estoque_minimo: produto.estoqueMinimo || 0
  };

  // Enviar para o servidor usando fetch API
  return fetch('http://localhost:3000/api/produtos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(produtoParaAPI)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Erro ao cadastrar produto');
    }
    return response.json();
  });
}

// Função para carregar produtos do servidor
function carregarProdutos() {
  fetch('http://localhost:3000/api/produtos')
    .then(response => {
      console.log('Status da resposta:', response.status);
      return response.json();
    })
    .then(produtos => {
      console.log('Produtos recebidos:', produtos);
      // Aqui você pode atualizar a interface com os produtos
      exibirProdutosNaTabela(produtos);
    })
    .catch(error => {
      console.error('Erro ao carregar produtos:', error.message, error.stack);
    });
}

// Função para exibir produtos na tabela
function exibirProdutosNaTabela(produtos) {
  const tabela = document.getElementById('tabelaProdutos');
  if (!tabela) {
    console.error('Elemento tabelaProdutos não encontrado');
    return;
  }
  
  tabela.innerHTML = ''; // Limpa a tabela
  
  produtos.forEach(produto => {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${produto.produto}</td>
      <td>${produto.categoria}</td>
      <td>${produto.un || 'UN'}</td>
      <td>${produto.fornecedor || 'N/A'}</td>
      <td class="acoes-coluna">
        <button class="btn-editar" data-id="${produto.id_produto}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-excluir" data-id="${produto.id_produto}">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
    tabela.appendChild(linha);
  });
  
  // Adiciona os eventos aos botões
  adicionarEventosEditar();
  adicionarEventosExcluir();
}

// Seleciona o popup de exclusão e os botões
const popupExcluir = document.getElementById("popupExcluir");
const btnConfirmarExcluir = document.getElementById("btnConfirmarExcluir");
const btnCancelarExcluir = document.getElementById("btnCancelarExcluir");
const mensagemExclusao = document.getElementById("mensagemExclusao");
let produtoParaExcluir = null; // Variável para armazenar o produto a ser excluído

// Função para exibir o popup de exclusão
function exibirPopupExcluir(produto, linha) {
  if (!popupExcluir || !mensagemExclusao) return;
  
  produtoParaExcluir = { produto, linha }; // Armazena o produto e a linha
  mensagemExclusao.textContent = `Tem certeza que deseja excluir o produto "${produto.produto || produto.nome}"?`;
  popupExcluir.style.display = "flex";
}

// Fecha o popup de exclusão
if (btnCancelarExcluir) {
  btnCancelarExcluir.addEventListener("click", () => {
    popupExcluir.style.display = "none";
    produtoParaExcluir = null; // Reseta a variável
  });
}

// Confirma a exclusão do produto
if (btnConfirmarExcluir) {
  btnConfirmarExcluir.addEventListener("click", () => {
    if (produtoParaExcluir) {
      const id = produtoParaExcluir.produto.id_produto;
      
      // Excluir do servidor
      fetch(`http://localhost:3000/api/produtos/${id}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao excluir produto');
        }
        return response.json();
      })
      .then(data => {
        // Verifica se a linha existe antes de tentar removê-la
        if (produtoParaExcluir.linha && typeof produtoParaExcluir.linha.remove === 'function') {
          produtoParaExcluir.linha.remove();
        } else {
          // Se não conseguir remover a linha específica, recarrega toda a tabela
          carregarProdutosNaTabela();
        }
        
        // Fecha o popup
        if (popupExcluir) {
          popupExcluir.style.display = "none";
        }
        
        produtoParaExcluir = null; // Reseta a variável
      })
      .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao excluir produto: ' + error.message);
        
        // Recarrega a tabela mesmo em caso de erro para garantir consistência
        carregarProdutosNaTabela();
      });
    }
  });
}


// Adiciona o evento de clique no botão "Excluir" para cada linha da tabela
function adicionarEventosExcluir() {
  const botoesExcluir = document.querySelectorAll(".btn-excluir");
  botoesExcluir.forEach((botao) => {
    botao.addEventListener("click", (event) => {
      const linha = event.target.closest("tr");
      const id = botao.getAttribute('data-id');
      
      // Buscar o produto pelo ID
      fetch(`http://localhost:3000/api/produtos/${id}`)
        .then(response => response.json())
        .then(produto => {
          if (Array.isArray(produto) && produto.length > 0) {
            exibirPopupExcluir({id_produto: id, produto: produto[0].produto}, linha);
          } else {
            exibirPopupExcluir({id_produto: id, produto: produto.produto}, linha);
          }
        })
        .catch(error => {
          console.error('Erro ao buscar produto para exclusão:', error);
        });
    });
  });
}

// Seleciona o popup de edição e seus elementos
const popupEditarProduto = document.getElementById("popupEditarProduto");
const formEditarProduto = document.getElementById("formEditarProduto");
const btnFecharEditarPopup = document.getElementById("btnFecharEditarPopup");
let produtoParaEditar = null; // Variável para armazenar o produto a ser editado

// Função para abrir o popup de edição e preencher os campos
function preencherFormularioEdicao(produto) {
  if (!popupEditarProduto) return;
  
  // Se o produto vier como array (da API), pega o primeiro item
  if (Array.isArray(produto) && produto.length > 0) {
    produto = produto[0];
  }
  
  produtoParaEditar = produto;
  
  // Preenche os campos do formulário de edição
  const editarEanProduto = document.getElementById("editarEanProduto");
  const editarNomeProduto = document.getElementById("editarNomeProduto");
  const editarCategoriaProduto = document.getElementById("editarCategoriaProduto");
  const editarUnidadeProduto = document.getElementById("editarUnidadeProduto");
  const editarFornecedorProduto = document.getElementById("editarFornecedorProduto");
  const editarEstoqueMinimo = document.getElementById("editarEstoqueMinimo");
  
  if (editarEanProduto) editarEanProduto.value = produto.ean || '';
  if (editarNomeProduto) editarNomeProduto.value = produto.produto || '';
  if (editarCategoriaProduto) editarCategoriaProduto.value = produto.categoria || '';
  if (editarUnidadeProduto) editarUnidadeProduto.value = produto.un || 'UN';
  if (editarEstoqueMinimo) editarEstoqueMinimo.value = produto.estoque_minimo || 0;
  
  // Carregar fornecedores no select de edição
  carregarFornecedoresParaEdicao(produto.fornecedor);
  
  // Exibe o popup de edição
  popupEditarProduto.style.display = "flex";
}

// Função para carregar fornecedores no formulário de edição
function carregarFornecedoresParaEdicao(fornecedorAtual) {
  const editarFornecedorProduto = document.getElementById("editarFornecedorProduto");
  if (!editarFornecedorProduto) return;
  
  // Buscar fornecedores do servidor
  fetch('http://localhost:3000/api/fornecedores')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao buscar fornecedores');
      }
      return response.json();
    })
    .then(fornecedores => {
      editarFornecedorProduto.innerHTML = ''; // Limpa as opções existentes
      
      if (fornecedores && fornecedores.length > 0) {
        // Adiciona opção padrão
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Selecione um fornecedor";
        defaultOption.disabled = true;
        editarFornecedorProduto.appendChild(defaultOption);
        
        fornecedores.forEach((fornecedor) => {
          const option = document.createElement("option");
          option.value = fornecedor.nome; // Ou fornecedor.id_fornecedor
          option.textContent = fornecedor.nome;
          
          // Se for o fornecedor atual do produto, seleciona esta opção
          if (fornecedor.nome === fornecedorAtual) {
            option.selected = true;
          }
          
          editarFornecedorProduto.appendChild(option);
        });
        
        editarFornecedorProduto.disabled = false;
      } else {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Nenhum fornecedor disponível";
        option.disabled = true;
        option.selected = true;
        editarFornecedorProduto.appendChild(option);
        editarFornecedorProduto.disabled = true;
      }
    })
    .catch(error => {
      console.error('Erro ao carregar fornecedores para edição:', error);
      editarFornecedorProduto.innerHTML = '<option value="" disabled selected>Erro ao carregar fornecedores</option>';
      editarFornecedorProduto.disabled = true;
    });
}


// Fecha o popup de edição
if (btnFecharEditarPopup) {
  btnFecharEditarPopup.addEventListener("click", () => {
    popupEditarProduto.style.display = "none";
    produtoParaEditar = null; // Reseta a variável
  });
}

// Salva as alterações feitas no produto
if (formEditarProduto) {
  formEditarProduto.addEventListener("submit", function (event) {
    event.preventDefault();
    
    if (!produtoParaEditar) return;
    
    // Obter os valores do formulário
    const id = produtoParaEditar.id_produto;
    const editarEanProduto = document.getElementById("editarEanProduto");
    const editarNomeProduto = document.getElementById("editarNomeProduto");
    const editarCategoriaProduto = document.getElementById("editarCategoriaProduto");
    const editarUnidadeProduto = document.getElementById("editarUnidadeProduto");
    const editarFornecedorProduto = document.getElementById("editarFornecedorProduto");
    const editarEstoqueMinimo = document.getElementById("editarEstoqueMinimo");
    
    // Verificar se os campos obrigatórios estão preenchidos
    if (!editarNomeProduto || !editarNomeProduto.value.trim()) {
      alert("O nome do produto é obrigatório");
      return;
    }
    
    if (!editarCategoriaProduto || !editarCategoriaProduto.value.trim()) {
      alert("A categoria do produto é obrigatória");
      return;
    }
    
    // Preparar o objeto para atualização - usando o formato esperado pela API
    const produtoAtualizado = {
      nome: editarNomeProduto ? editarNomeProduto.value : '',
      descricao: '', // Se não tiver campo de descrição, envie vazio
      preco: 0, // Se não tiver campo de preço, envie 0
      categoria: editarCategoriaProduto ? editarCategoriaProduto.value : '',
      ean: editarEanProduto ? editarEanProduto.value : '',
      un: editarUnidadeProduto ? editarUnidadeProduto.value : 'UN',
      fornecedor: editarFornecedorProduto ? editarFornecedorProduto.value : '',
      estoque_minimo: editarEstoqueMinimo ? editarEstoqueMinimo.value : 0
    };
    
    console.log('Enviando dados para atualização:', produtoAtualizado);
    
    // Enviar para o servidor
    fetch(`http://localhost:3000/api/produtos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(produtoAtualizado)
    })
    .then(response => {
      console.log('Status da resposta:', response.status);
      
      // Se a resposta não for ok, converter para json e lançar erro com a mensagem
      if (!response.ok) {
        return response.json().then(errorData => {
          throw new Error(errorData.error || 'Erro ao atualizar produto');
        });
      }
      
      return response.json();
    })
    .then(data => {
      console.log('Resposta de sucesso:', data);
      
      // Fechar o popup de edição
      popupEditarProduto.style.display = "none";
      
      // Exibir mensagem de sucesso
      alert('Produto atualizado com sucesso!');
      
      // Recarregar a tabela para refletir as alterações
      carregarProdutosNaTabela();
    })
    .catch(error => {
      console.error('Erro detalhado:', error);
      alert('Erro ao atualizar produto: ' + error.message);
    });
  });
}


// Adiciona o evento de clique no botão "Editar" para cada linha da tabela
function adicionarEventosEditar() {
  const botoesEditar = document.querySelectorAll(".btn-editar");
  botoesEditar.forEach((botao) => {
    botao.addEventListener("click", (event) => {
      const id = botao.getAttribute('data-id');
      
      // Buscar o produto pelo ID
      fetch(`http://localhost:3000/api/produtos/${id}`)
        .then(response => response.json())
        .then(produto => {
          preencherFormularioEdicao(produto);
        })
        .catch(error => {
          console.error('Erro ao buscar produto para edição:', error);
        });
    });
  });
}

// Função para carregar produtos na tabela
function carregarProdutosNaTabela() {
  fetch('http://localhost:3000/api/produtos')
    .then(response => {
      console.log('Status da resposta:', response.status);
      return response.json();
    })
    .then(produtos => {
      console.log('Produtos recebidos:', produtos);
      const tabelaProdutos = document.querySelector(".center-table tbody");
      if (!tabelaProdutos) {
        console.error('Elemento .center-table tbody não encontrado');
        return;
      }
      
      tabelaProdutos.innerHTML = ""; // Limpa a tabela antes de carregar os produtos
      
      produtos.forEach((produto) => {
        const novaLinha = document.createElement("tr");
        novaLinha.innerHTML = `
          <td>
            ${
              produto.foto
                ? `<img src="${produto.foto}" alt="Foto do Produto" style="width: 50px; height: 50px; object-fit: cover;" />`
                : "Sem Foto"
            }
          </td>
          <td>${produto.ean || 'N/A'}</td>
          <td>${produto.produto || produto.nome}</td>
          <td>${produto.categoria}</td>
          <td>${produto.un || 'UN'}</td>
          <td>${produto.data || new Date().toLocaleDateString()}</td>
          <td>${produto.fornecedor || 'N/A'}</td>
          <td>${produto.estoque_minimo || '0'}</td>
          <td class="acoes-coluna">
            <button class="btn-editar" data-id="${produto.id_produto}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-excluir" data-id="${produto.id_produto}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        `;
        tabelaProdutos.appendChild(novaLinha);
      });
      
      // Adiciona os eventos de edição e exclusão
      adicionarEventosEditar();
      adicionarEventosExcluir();
    })
    .catch(error => {
      console.error('Erro ao carregar produtos:', error.message, error.stack);
      alert('Erro ao carregar produtos do servidor: ' + error.message);
    });
}

// Exibe o popup ao clicar no botão "Novo Produto"
if (btnNovoProduto) {
  btnNovoProduto.addEventListener("click", () => {
    if (popupNovoProduto) {
      popupNovoProduto.style.display = "flex";
      carregarFornecedores();
    }
  });
}

// Fecha o popup ao clicar no botão "Fechar"
if (btnFecharPopup) {
  btnFecharPopup.addEventListener("click", () => {
    if (popupNovoProduto) {
      popupNovoProduto.style.display = "none";
    }
  });
}

// Evento de submissão do formulário de novo produto
if (formNovoProduto) {
  formNovoProduto.addEventListener("submit", async (event) => {
    event.preventDefault(); // Evita o envio padrão do formulário
    
    // Captura os valores do formulário
    const ean = formNovoProduto.eanProduto ? formNovoProduto.eanProduto.value : '';
    const nome = formNovoProduto.nomeProduto ? formNovoProduto.nomeProduto.value : '';
    const categoria = formNovoProduto.categoriaProduto ? formNovoProduto.categoriaProduto.value : '';
    const unidade = formNovoProduto.unidadeProduto ? formNovoProduto.unidadeProduto.value : 'UN';
    const fornecedor = formNovoProduto.fornecedorProduto ? formNovoProduto.fornecedorProduto.value : '';
    const estoqueMinimo = formNovoProduto.estoqueMinimo ? formNovoProduto.estoqueMinimo.value : 0;
    
    // Cria um objeto com os dados do produto
    const novoProduto = {
      ean,
      nome,
      categoria,
      unidade,
      fornecedor,
      estoqueMinimo
    };
    
    // Salva o produto no servidor
    salvarProdutoNoServidor(novoProduto)
      .then(data => {
        // Recarrega os produtos na tabela
        carregarProdutosNaTabela();
        // Exibe o popup de confirmação
        exibirPopupConfirmacao();
        // Fecha o popup de cadastro e reseta o formulário
        if (popupNovoProduto) {
          popupNovoProduto.style.display = "none";
        }
        formNovoProduto.reset(); // Limpa os campos do formulário
      })
      .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao cadastrar produto: ' + error.message);
      });
  });
}

// Carrega os produtos ao carregar a página
window.addEventListener("load", carregarProdutosNaTabela);

// Função para converter imagem para Base64
function converterImagemParaBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Verifica se os elementos de EAN existem antes de adicionar eventos
const eanProdutoElement = document.getElementById("eanProduto");
if (eanProdutoElement) {
  eanProdutoElement.addEventListener("input", (event) => {
    const input = event.target;
    input.value = input.value.replace(/\D/g, ""); // Remove caracteres não numéricos
    if (input.value.length > 13) {
      input.value = input.value.slice(0, 13); // Limita a 13 caracteres
    }
  });
}

const editarEanProdutoElement = document.getElementById("editarEanProduto");
if (editarEanProdutoElement) {
  editarEanProdutoElement.addEventListener("input", (event) => {
    const input = event.target;
    input.value = input.value.replace(/\D/g, ""); // Remove caracteres não numéricos
    if (input.value.length > 13) {
      input.value = input.value.slice(0, 13); // Limita a 13 caracteres
    }
  });
}

// Abrir popup de cadastro - usando querySelector com verificação
const btnNovoProdutoAlt = document.querySelector('.btn-novo-produto');
if (btnNovoProdutoAlt) {
  btnNovoProdutoAlt.addEventListener('click', function() {
    const popup = document.querySelector('#popupCadastrarProduto');
    if (popup) popup.style.display = 'flex';
  });
}

// Fechar popups (botões cancelar)
document.querySelectorAll('.popup button[type="button"]').forEach(btn => {
  btn.addEventListener('click', function() {
    const popup = this.closest('.popup-overlay');
    if (popup) popup.style.display = 'none';
  });
});

// Fechar popups de confirmação
document.querySelectorAll('.btn-cancelar').forEach(btn => {
  btn.addEventListener('click', function() {
    const popup = this.closest('.popup-confirmacao-overlay');
    if (popup) popup.style.display = 'none';
  });
});

// Confirmação após cadastro ou edição
const btnConfirmacaoCadastro = document.querySelector('#popupConfirmacaoCadastro button');
if (btnConfirmacaoCadastro) {
  btnConfirmacaoCadastro.addEventListener('click', function() {
    const popup = document.querySelector('#popupConfirmacaoCadastro');
    if (popup) popup.style.display = 'none';
  });
}
// Salva as alterações feitas no produto
if (formEditarProduto) {
  formEditarProduto.addEventListener("submit", function (event) {
    event.preventDefault();
    
    if (!produtoParaEditar) return;
    
    // Obter os valores do formulário
    const id = produtoParaEditar.id_produto;
    const editarEanProduto = document.getElementById("editarEanProduto");
    const editarNomeProduto = document.getElementById("editarNomeProduto");
    const editarCategoriaProduto = document.getElementById("editarCategoriaProduto");
    const editarUnidadeProduto = document.getElementById("editarUnidadeProduto");
    const editarFornecedorProduto = document.getElementById("editarFornecedorProduto");
    const editarEstoqueMinimo = document.getElementById("editarEstoqueMinimo");
    
    // Validação básica
    if (!editarNomeProduto || !editarNomeProduto.value.trim()) {
      alert("O nome do produto é obrigatório");
      return;
    }
    
    if (!editarCategoriaProduto || !editarCategoriaProduto.value.trim()) {
      alert("A categoria do produto é obrigatória");
      return;
    }
    
    // Preparar o objeto para atualização - usando EXATAMENTE os nomes de campos que o servidor espera
    const produtoAtualizado = {
      ean: editarEanProduto ? editarEanProduto.value : '',
      produto: editarNomeProduto ? editarNomeProduto.value : '',
      categoria: editarCategoriaProduto ? editarCategoriaProduto.value : '',
      un: editarUnidadeProduto ? editarUnidadeProduto.value : 'UN',
      data: new Date().toISOString().split('T')[0], // Data atual no formato YYYY-MM-DD
      fornecedor: editarFornecedorProduto ? editarFornecedorProduto.value : '',
      estoque_minimo: editarEstoqueMinimo ? editarEstoqueMinimo.value : 0
    };
    
    console.log('Enviando dados para atualização:', produtoAtualizado);
    
    // Enviar para o servidor
    fetch(`http://localhost:3000/api/produtos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(produtoAtualizado)
    })
    .then(response => {
      console.log('Status da resposta:', response.status);
      
      // Se a resposta não for ok, converter para json e lançar erro com a mensagem
      if (!response.ok) {
        return response.json().then(errorData => {
          throw new Error(errorData.error || 'Erro ao atualizar produto');
        });
      }
      
      return response.json();
    })
    .then(data => {
      console.log('Resposta de sucesso:', data);
      
      // Fechar o popup de edição
      popupEditarProduto.style.display = "none";
      
      // Exibir mensagem de sucesso
      alert('Produto atualizado com sucesso!');
      
      // Recarregar a tabela para refletir as alterações
      carregarProdutosNaTabela();
    })
    .catch(error => {
      console.error('Erro detalhado:', error);
      alert('Erro ao atualizar produto: ' + error.message);
    });
  });
}
