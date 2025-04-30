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
function carregarFornecedores() {
  if (!fornecedorProduto) return;
  
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

// Função para salvar produto no servidor
function salvarProdutoNoServidor(produto) {
  // Adaptar o objeto produto para o formato esperado pela API
  const produtoParaAPI = {
    nome: produto.nome,
    descricao: produto.descricao || produto.categoria, // Usando categoria como descrição se não houver descrição
    preco: produto.preco || 0, // Adicionando um preço padrão se não existir
    categoria: produto.categoria
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
      <td>${produto.nome}</td>
      <td>${produto.descricao}</td>
      <td>R$ ${produto.preco.toFixed(2)}</td>
      <td>${produto.categoria}</td>
      <td>
        <button class="btn-editar" data-id="${produto.id_produto}">Editar</button>
        <button class="btn-excluir" data-id="${produto.id_produto}">Excluir</button>
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
  mensagemExclusao.textContent = `Tem certeza que deseja excluir o produto "${produto.nome}"?`;
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
        // Remove a linha da tabela
        produtoParaExcluir.linha.remove();
        // Fecha o popup
        popupExcluir.style.display = "none";
        produtoParaExcluir = null; // Reseta a variável
      })
      .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao excluir produto: ' + error.message);
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
            exibirPopupExcluir({id_produto: id, nome: produto[0].nome}, linha);
          } else {
            exibirPopupExcluir({id_produto: id, nome: produto.nome}, linha);
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
  const editarNomeProduto = document.getElementById("editarNomeProduto");
  const editarCategoriaProduto = document.getElementById("editarCategoriaProduto");
  
  if (editarNomeProduto) editarNomeProduto.value = produto.nome;
  if (editarCategoriaProduto) editarCategoriaProduto.value = produto.categoria;
  
  // Exibe o popup de edição
  popupEditarProduto.style.display = "flex";
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
    const editarNomeProduto = document.getElementById("editarNomeProduto");
    const editarCategoriaProduto = document.getElementById("editarCategoriaProduto");
    
    const nome = editarNomeProduto ? editarNomeProduto.value : '';
    const categoria = editarCategoriaProduto ? editarCategoriaProduto.value : '';
    const descricao = categoria; // Usando categoria como descrição
    const preco = produtoParaEditar.preco || 0;
    
    // Preparar o objeto para atualização
    const produtoAtualizado = {
      nome,
      descricao,
      preco,
      categoria
    };
    
    // Enviar para o servidor
    fetch(`http://localhost:3000/api/produtos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(produtoAtualizado)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao atualizar produto');
      }
      return response.json();
    })
    .then(data => {
      // Fechar o popup de edição
      popupEditarProduto.style.display = "none";
      // Recarregar a tabela para refletir as alterações
      carregarProdutosNaTabela();
    })
    .catch(error => {
      console.error('Erro:', error);
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
          <td>${produto.id_produto}</td>
          <td>${produto.nome}</td>
          <td>${produto.categoria}</td>
          <td>${produto.unidade || 'Unidade'}</td>
          <td>${produto.data || new Date().toLocaleDateString()}</td>
          <td>${produto.fornecedor || 'N/A'}</td>
          <td>${produto.estoqueMinimo || '0'}</td>
          <td>
            <button class="btn-editar" data-id="${produto.id_produto}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-excluir" data-i
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
    const nome = formNovoProduto.nomeProduto ? formNovoProduto.nomeProduto.value : '';
    const categoria = formNovoProduto.categoriaProduto ? formNovoProduto.categoriaProduto.value : '';
    const descricao = categoria; // Usando categoria como descrição
    const preco = 0; // Valor padrão para preço
    
    // Cria um objeto com os dados do produto
    const novoProduto = {
      nome,
      descricao,
      preco,
      categoria
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
