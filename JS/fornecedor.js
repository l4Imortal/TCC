// Seleciona os elementos do DOM
const btnNovoFornecedor = document.getElementById("btnNovoFornecedor");
const popupNovoFornecedor = document.getElementById("popupNovoFornecedor");
const btnFecharPopup = document.getElementById("btnFecharPopup");
const formNovoFornecedor = document.getElementById("formNovoFornecedor");
const popupConfirmacao = document.getElementById("popupConfirmacao");
const btnFecharConfirmacao = document.getElementById("btnFecharConfirmacao");
const popupExcluir = document.getElementById("popupExcluir");
const btnConfirmarExcluir = document.getElementById("btnConfirmarExcluir");
const btnCancelarExcluir = document.getElementById("btnCancelarExcluir");
const mensagemExclusao = document.getElementById("mensagemExclusao");
const popupEditarFornecedor = document.getElementById("popupEditarFornecedor");
const formEditarFornecedor = document.getElementById("formEditarFornecedor");
const btnFecharEditarPopup = document.getElementById("btnFecharEditarPopup");
let fornecedorParaExcluir = null;
let fornecedorParaEditar = null;

// Funções de Popup
function exibirPopupConfirmacao() {
  if (popupConfirmacao) {
    popupConfirmacao.style.display = "flex";
  }
}

function exibirPopupExcluir(fornecedor, linha) {
  if (!popupExcluir || !mensagemExclusao) return;
  fornecedorParaExcluir = { fornecedor, linha };
  mensagemExclusao.textContent = `Tem certeza que deseja excluir o fornecedor "${fornecedor.nome}"?`;
  popupExcluir.style.display = "flex";
}

// Fechar popups
if (btnFecharConfirmacao) {
  btnFecharConfirmacao.addEventListener("click", () => popupConfirmacao.style.display = "none");
}

if (btnFecharPopup) {
  btnFecharPopup.addEventListener("click", () => popupNovoFornecedor.style.display = "none");
}

if (btnFecharEditarPopup) {
  btnFecharEditarPopup.addEventListener("click", () => {
    popupEditarFornecedor.style.display = "none";
    fornecedorParaEditar = null;
  });
}

if (btnCancelarExcluir) {
  btnCancelarExcluir.addEventListener("click", () => {
    popupExcluir.style.display = "none";
    fornecedorParaExcluir = null;
  });
}

// Abrir popup de novo fornecedor
if (btnNovoFornecedor) {
  btnNovoFornecedor.addEventListener("click", function() {
    if (formNovoFornecedor) formNovoFornecedor.reset();
    if (popupNovoFornecedor) popupNovoFornecedor.style.display = "flex";
  });
}

// Função para salvar fornecedor no servidor
function salvarFornecedorNoServidor(fornecedor) {
  console.log('Enviando fornecedor para o servidor:', fornecedor);
  return fetch('http://localhost:3000/api/fornecedores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fornecedor)
  })
    .then(response => {
      console.log('Status da resposta:', response.status);
      if (!response.ok) {
        return response.text().then(text => {
          console.error('Texto da resposta:', text);
          throw new Error(`Erro ao cadastrar fornecedor: ${response.status} ${response.statusText}`);
        });
      }
      return response.json();
    });
}

// Função para carregar fornecedores na tabela
function carregarFornecedoresNaTabela() {
  console.log('Iniciando carregamento de fornecedores...');
  fetch('http://localhost:3000/api/fornecedores')
    .then(response => {
      console.log('Status da resposta:', response.status);
      if (!response.ok) {
        return response.text().then(text => {
          console.error('Texto da resposta:', text);
          throw new Error(`Erro ao buscar fornecedores: ${response.status} ${response.statusText}`);
        });
      }
      return response.json();
    })
    .then(fornecedores => {
      console.log('Fornecedores recebidos:', fornecedores);
      const tabela = document.querySelector(".center-table tbody");
      if (!tabela) {
        console.error('Elemento .center-table tbody não encontrado');
        return;
      }
      
      tabela.innerHTML = ""; // Limpa a tabela antes de carregar os dados
      
      fornecedores.forEach((fornecedor) => {
        const novaLinha = document.createElement("tr");
        novaLinha.innerHTML = `
          <td>${fornecedor.id_fornecedor}</td>
          <td>${fornecedor.nome || 'N/A'}</td>
          <td>${fornecedor.cnpj || 'N/A'}</td>
          <td>${fornecedor.telefone || 'N/A'}</td>
          <td>${fornecedor.email || 'N/A'}</td>
          <td>${fornecedor.endereco || 'N/A'}</td>
          <td>
            <button class="btn-editar" data-id="${fornecedor.id_fornecedor}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-excluir" data-id="${fornecedor.id_fornecedor}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        `;
        tabela.appendChild(novaLinha);
      });
      
      adicionarEventosEditar();
      adicionarEventosExcluir();
    })
    .catch(error => {
      console.error('Erro ao carregar fornecedores:', error.message, error.stack);
      alert('Erro ao carregar fornecedores do servidor: ' + error.message);
    });
}

// Função para adicionar eventos aos botões de editar
function adicionarEventosEditar() {
  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      console.log('Buscando fornecedor para edição, ID:', id);
      
      fetch(`http://localhost:3000/api/fornecedores/${id}`)
        .then(response => {
          if (!response.ok) {
            return response.text().then(text => {
              console.error('Texto da resposta:', text);
              throw new Error(`Erro ao buscar fornecedor: ${response.status} ${response.statusText}`);
            });
          }
          return response.json();
        })
        .then(fornecedor => {
          console.log('Fornecedor para edição:', fornecedor);
          preencherFormularioEdicao(fornecedor);
        })
        .catch(error => {
          console.error('Erro ao buscar fornecedor para edição:', error);
          alert('Erro ao buscar fornecedor: ' + error.message);
        });
    });
  });
}

// Função para adicionar eventos aos botões de excluir
function adicionarEventosExcluir() {
  document.querySelectorAll('.btn-excluir').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const linha = this.closest('tr');
      console.log('Buscando fornecedor para exclusão, ID:', id);
      
      fetch(`http://localhost:3000/api/fornecedores/${id}`)
        .then(response => {
          if (!response.ok) {
            return response.text().then(text => {
              console.error('Texto da resposta:', text);
              throw new Error(`Erro ao buscar fornecedor: ${response.status} ${response.statusText}`);
            });
          }
          return response.json();
        })
        .then(fornecedor => {
          console.log('Fornecedor para exclusão:', fornecedor);
          exibirPopupExcluir(fornecedor, linha);
        })
        .catch(error => {
          console.error('Erro ao buscar fornecedor para exclusão:', error);
          alert('Erro ao buscar fornecedor: ' + error.message);
        });
    });
  });
}

// Função para excluir fornecedor
if (btnConfirmarExcluir) {
  btnConfirmarExcluir.addEventListener("click", () => {
    if (fornecedorParaExcluir) {
      const id = fornecedorParaExcluir.fornecedor.id_fornecedor;
      console.log('Excluindo fornecedor, ID:', id);
      
      fetch(`http://localhost:3000/api/fornecedores/${id}`, { method: 'DELETE' })
        .then(response => {
          if (!response.ok) {
            return response.text().then(text => {
              console.error('Texto da resposta:', text);
              throw new Error(`Erro ao excluir fornecedor: ${response.status} ${response.statusText}`);
            });
          }
          return response.json();
        })
        .then(() => {
          fornecedorParaExcluir.linha.remove();
          popupExcluir.style.display = "none";
          fornecedorParaExcluir = null;
          alert('Fornecedor excluído com sucesso!');
        })
        .catch(error => {
          console.error('Erro ao excluir fornecedor:', error);
          alert('Erro ao excluir fornecedor: ' + error.message);
        });
    }
  });
}

// Função para editar fornecedor
function preencherFormularioEdicao(fornecedor) {
  if (!popupEditarFornecedor) return;
  fornecedorParaEditar = fornecedor;
  
  const editarNomeFornecedor = document.getElementById("editarNomeFornecedor");
  const editarCnpjFornecedor = document.getElementById("editarCnpjFornecedor");
  const editarTelefoneFornecedor = document.getElementById("editarTelefoneFornecedor");
  const editarEmailFornecedor = document.getElementById("editarEmailFornecedor");
  const editarEnderecoFornecedor = document.getElementById("editarEnderecoFornecedor");
  
  if (editarNomeFornecedor) editarNomeFornecedor.value = fornecedor.nome || '';
  if (editarCnpjFornecedor) editarCnpjFornecedor.value = fornecedor.cnpj || '';
  if (editarTelefoneFornecedor) editarTelefoneFornecedor.value = fornecedor.telefone || '';
  if (editarEmailFornecedor) editarEmailFornecedor.value = fornecedor.email || '';
  if (editarEnderecoFornecedor) editarEnderecoFornecedor.value = fornecedor.endereco || '';
  
  popupEditarFornecedor.style.display = "flex";
}

if (formEditarFornecedor) {
  formEditarFornecedor.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!fornecedorParaEditar) return;
    
    const id = fornecedorParaEditar.id_fornecedor;
    console.log('Atualizando fornecedor, ID:', id);
    
    const fornecedorAtualizado = {
      nome: document.getElementById("editarNomeFornecedor").value,
      cnpj: document.getElementById("editarCnpjFornecedor").value,
      telefone: document.getElementById("editarTelefoneFornecedor").value,
      email: document.getElementById("editarEmailFornecedor").value,
      endereco: document.getElementById("editarEnderecoFornecedor").value
    };
    
    // Validação
    if (!fornecedorAtualizado.nome) {
      alert('Nome do fornecedor é obrigatório');
      return;
    }
    
    fetch(`http://localhost:3000/api/fornecedores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fornecedorAtualizado)
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            console.error('Texto da resposta:', text);
            throw new Error(`Erro ao atualizar fornecedor: ${response.status} ${response.statusText}`);
          });
        }
        return response.json();
      })
      .then(() => {
        popupEditarFornecedor.style.display = "none";
        fornecedorParaEditar = null;
        carregarFornecedoresNaTabela();
        alert('Fornecedor atualizado com sucesso!');
      })
      .catch(error => {
        console.error('Erro ao atualizar fornecedor:', error);
        alert('Erro ao atualizar fornecedor: ' + error.message);
      });
  });
}

// Função para formatar CNPJ e Telefone
function formatarCNPJ(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 14) value = value.slice(0, 14);
  if (value.length > 12) {
    value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  } else if (value.length > 8) {
    value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/, '$1.$2.$3/$4');
  } else if (value.length > 5) {
    value = value.replace(/^(\d{2})(\d{3})(\d+)$/, '$1.$2.$3');
  } else if (value.length > 2) {
    value = value.replace(/^(\d{2})(\d+)$/, '$1.$2');
  }
  input.value = value;
}

function formatarTelefone(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 11) value = value.slice(0, 11);
  if (value.length > 10) {
    value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (value.length > 6) {
    value = value.replace(/^(\d{2})(\d{4})(\d+)$/, '($1) $2-$3');
  } else if (value.length > 2) {
    value = value.replace(/^(\d{2})(\d+)$/, '($1) $2');
  }
  input.value = value;
}

// Eventos de formatação
document.addEventListener('DOMContentLoaded', function() {
  const cnpjInput = document.getElementById('cnpjFornecedor');
  const telefoneInput = document.getElementById('telefoneFornecedor');
  const editarCnpjInput = document.getElementById('editarCnpjFornecedor');
  const editarTelefoneInput = document.getElementById('editarTelefoneFornecedor');
  
  if (cnpjInput) cnpjInput.addEventListener('input', function() { formatarCNPJ(this); });
  if (telefoneInput) telefoneInput.addEventListener('input', function() { formatarTelefone(this); });
  if (editarCnpjInput) editarCnpjInput.addEventListener('input', function() { formatarCNPJ(this); });
  if (editarTelefoneInput) editarTelefoneInput.addEventListener('input', function() { formatarTelefone(this); });
});

// Pesquisa fornecedores
function pesquisarFornecedores() {
  const termoPesquisa = document.getElementById('pesquisaFornecedor').value.toLowerCase();
  const linhas = document.querySelectorAll('.center-table tbody tr');
  
  linhas.forEach(linha => {
    const textoLinha = linha.textContent.toLowerCase();
    linha.style.display = textoLinha.includes(termoPesquisa) ? '' : 'none';
  });
}

const campoPesquisa = document.getElementById('pesquisaFornecedor');
const btnPesquisa = document.getElementById('btnPesquisaFornecedor');

if (campoPesquisa) {
  campoPesquisa.addEventListener('input', pesquisarFornecedores);
}

if (btnPesquisa) {
  btnPesquisa.addEventListener('click', pesquisarFornecedores);
}

// Submissão do novo fornecedor
if (formNovoFornecedor) {
  formNovoFornecedor.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    // Obter valores do formulário
    const nome = document.getElementById("nomeFornecedor").value;
    const cnpj = document.getElementById("cnpjFornecedor").value;
    const telefone = document.getElementById("telefoneFornecedor").value;
    const email = document.getElementById("emailFornecedor").value;
    const endereco = document.getElementById("enderecoFornecedor").value;
    
    // Validação
    if (!nome) {
      alert('Nome do fornecedor é obrigatório');
      return;
    }
    
    const novoFornecedor = { nome, cnpj, telefone, email, endereco };
    console.log('Novo fornecedor a ser cadastrado:', novoFornecedor);
    
    try {
      await salvarFornecedorNoServidor(novoFornecedor);
      carregarFornecedoresNaTabela();
      exibirPopupConfirmacao();
      popupNovoFornecedor.style.display = "none";
      formNovoFornecedor.reset();
    } catch (error) {
      console.error('Erro ao cadastrar fornecedor:', error);
      alert('Erro ao cadastrar fornecedor: ' + error.message);
    }
  });
}

// Carrega fornecedores na página
window.addEventListener("DOMContentLoaded", () => {
  console.log('Página carregada, iniciando carregamento de fornecedores...');
  carregarFornecedoresNaTabela();
});

