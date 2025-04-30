// Seleciona os elementos do DOM
const tabEstoque = document.getElementById("estoque");
const tabMovimentacoes = document.getElementById("movimentacoes");
const tabConteudoEstoque = document.getElementById("estoque-tab");
const tabConteudoMovimentacoes = document.getElementById("movimentacoes-tab");
const btnGerarRelatorioEstoque = document.getElementById("btnGerarRelatorioEstoque");
const btnGerarRelatorioMovimentacoes = document.getElementById("btnGerarRelatorioMovimentacoes");
const btnExportarPDF = document.getElementById("btnExportarPDF");
const btnExportarExcel = document.getElementById("btnExportarExcel");
const btnImprimir = document.getElementById("btnImprimir");

// Função para mudar entre as abas de relatórios
function mudarTab(tabId) {
  console.log(`Mudando para a aba: ${tabId}`);
  
  // Esconder todas as abas de conteúdo
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remover a classe ativa de todas as abas
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Ativar a aba selecionada
  const selectedTabContent = document.getElementById(tabId + '-tab');
  if (selectedTabContent) {
    console.log(`Ativando conteúdo da aba: ${tabId}-tab`);
    selectedTabContent.classList.add('active');
  } else {
    console.error(`Elemento não encontrado: ${tabId}-tab`);
  }
  
  // Ativar o botão da aba selecionada
  const activeTab = document.querySelector(`.tab[onclick="mudarTab('${tabId}')"]`);
  if (activeTab) {
    console.log(`Ativando botão da aba: ${tabId}`);
    activeTab.classList.add('active');
  } else {
    console.error(`Botão da aba não encontrado para: ${tabId}`);
  }
}

// Função para determinar o status do estoque com base na quantidade
function determinarStatusEstoque(quantidade) {
  if (quantidade <= 0) return { texto: 'Sem Estoque', classe: 'status-sem-estoque' };
  if (quantidade <= 5) return { texto: 'Crítico', classe: 'status-critico' };
  if (quantidade <= 10) return { texto: 'Baixo', classe: 'status-baixo' };
  return { texto: 'Normal', classe: 'status-normal' };
}

// Funções para gerar relatórios
function gerarRelatorioEstoque() {
  console.log('Iniciando geração de relatório de estoque...');
  
  // Referência ao container da tabela
  const tabelaContainer = document.querySelector('#estoque-tab .report-preview');
  
  // Mostrar indicador de carregamento
  if (tabelaContainer) {
    tabelaContainer.innerHTML = '<p>Carregando dados do estoque...</p>';
  }
  
  // Buscar dados do servidor
  fetch('http://localhost:3000/api/produtos')
    .then(response => {
      console.log('Status da resposta:', response.status);
      if (!response.ok) {
        return response.text().then(text => {
          console.error('Texto da resposta:', text);
          throw new Error(`Erro ao buscar produtos: ${response.status} ${response.statusText}`);
        });
      }
      return response.json();
    })
    .then(produtos => {
      console.log('Produtos recebidos:', produtos);
      
      // Verificar se temos produtos e o container da tabela
      if (!produtos || !Array.isArray(produtos)) {
        throw new Error('Dados de produtos inválidos recebidos do servidor');
      }
      
      if (!tabelaContainer) {
        throw new Error('Container da tabela não encontrado no DOM');
      }
      
      // Calcular valores totais para exibição
      let valorTotalEstoque = 0;
      produtos.forEach(produto => {
        const preco = parseFloat(produto.preco || 0);
        const quantidade = parseInt(produto.quantidade || 0);
        produto.valorTotal = preco * quantidade;
        valorTotalEstoque += produto.valorTotal;
      });
      
      // Criar a tabela HTML
      let tabelaHTML = `
        <div class="relatorio-info">
          <h3>Relatório de Estoque</h3>
          <p>Data de geração: ${new Date().toLocaleString()}</p>
          <p>Total de produtos: ${produtos.length}</p>
          <p>Valor total em estoque: R$ ${valorTotalEstoque.toFixed(2).replace('.', ',')}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Fornecedor</th>
              <th>Quantidade</th>
              <th>Valor Unitário</th>
              <th>Valor Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      // Adicionar linhas para cada produto
      produtos.forEach(produto => {
        const quantidade = parseInt(produto.quantidade || 0);
        const preco = parseFloat(produto.preco || 0);
        const valorTotal = preco * quantidade;
        
        // Determinar o status do estoque
        const status = determinarStatusEstoque(quantidade);
        
        tabelaHTML += `
          <tr>
            <td>${produto.id || 'N/A'}</td>
            <td>${produto.nome || 'N/A'}</td>
            <td>${produto.categoria || 'N/A'}</td>
            <td>${produto.fornecedor || 'N/A'}</td>
            <td>${quantidade}</td>
            <td>R$ ${preco.toFixed(2).replace('.', ',')}</td>
            <td>R$ ${valorTotal.toFixed(2).replace('.', ',')}</td>
            <td class="${status.classe}">${status.texto}</td>
          </tr>
        `;
      });
      
      // Fechar a tabela
      tabelaHTML += `
          </tbody>
        </table>
      `;
      
      // Inserir a tabela no container
      tabelaContainer.innerHTML = tabelaHTML;
      
      console.log('Tabela de relatório de estoque gerada com sucesso');
    })
    .catch(error => {
      console.error('Erro ao gerar relatório de estoque:', error);
      
      // Mostrar mensagem de erro no container da tabela
      if (tabelaContainer) {
        tabelaContainer.innerHTML = `
          <div class="erro-relatorio">
            <p>Erro ao gerar relatório de estoque: ${error.message}</p>
          </div>
        `;
      }
      
      alert('Erro ao gerar relatório de estoque: ' + error.message);
    });
}

function gerarRelatorioMovimentacoes() {
  console.log('Iniciando geração de relatório de movimentações...');
  
  // Referência ao container da tabela
  const tabelaContainer = document.querySelector('#movimentacoes-tab .report-preview');
  
  // Obter valores dos filtros
  const dataInicio = document.getElementById('mov-data-inicio').value;
  const dataFim = document.getElementById('mov-data-fim').value;
  const tipoMovimentacao = document.getElementById('mov-tipo').value;
  
  // Construir parâmetros de consulta
  let queryParams = new URLSearchParams();
  if (dataInicio) queryParams.append('dataInicio', dataInicio);
  if (dataFim) queryParams.append('dataFim', dataFim);
  if (tipoMovimentacao) queryParams.append('tipo', tipoMovimentacao);
  
  // Mostrar indicador de carregamento
  if (tabelaContainer) {
    tabelaContainer.innerHTML = '<p>Carregando dados de movimentações...</p>';
  }
  
  // URL com parâmetros de consulta
  const url = `http://localhost:3000/api/movimentacoes?${queryParams.toString()}`;
  
  // Buscar dados do servidor
  fetch(url)
    .then(response => {
      console.log('Status da resposta:', response.status);
      if (!response.ok) {
        return response.text().then(text => {
          console.error('Texto da resposta:', text);
          throw new Error(`Erro ao buscar movimentações: ${response.status} ${response.statusText}`);
        });
      }
      return response.json();
    })
    .then(movimentacoes => {
      console.log('Movimentações recebidas:', movimentacoes);
      
      // Verificar se temos movimentações e o container da tabela
      if (!movimentacoes || !Array.isArray(movimentacoes)) {
        throw new Error('Dados de movimentações inválidos recebidos do servidor');
      }
      
      if (!tabelaContainer) {
        throw new Error('Container da tabela não encontrado no DOM');
      }
      
      // Calcular valores totais para exibição
      let valorTotalEntradas = 0;
      let valorTotalSaidas = 0;
      
      movimentacoes.forEach(mov => {
        const valor = parseFloat(mov.valor_unitario || 0) * parseInt(mov.quantidade || 0);
        if (mov.tipo === 'entrada') {
          valorTotalEntradas += valor;
        } else if (mov.tipo === 'saida') {
          valorTotalSaidas += valor;
        }
      });
      
      // Criar a tabela HTML
      let tabelaHTML = `
        <div class="relatorio-info">
          <h3>Relatório de Movimentações</h3>
          <p>Data de geração: ${new Date().toLocaleString()}</p>
          <p>Total de movimentações: ${movimentacoes.length}</p>
          <p>Valor total de entradas: R$ ${valorTotalEntradas.toFixed(2).replace('.', ',')}</p>
          <p>Valor total de saídas: R$ ${valorTotalSaidas.toFixed(2).replace('.', ',')}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Data</th>
              <th>Tipo</th>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Valor Unitário</th>
              <th>Valor Total</th>
              <th>Responsável</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      // Adicionar linhas para cada movimentação
      movimentacoes.forEach(mov => {
        const quantidade = parseInt(mov.quantidade || 0);
        const valorUnitario = parseFloat(mov.valor_unitario || 0);
        const valorTotal = valorUnitario * quantidade;
        
        // Formatar a data
        const data = mov.data ? new Date(mov.data).toLocaleDateString() : 'N/A';
        
        // Determinar o tipo de movimentação
        const tipoClasse = mov.tipo === 'entrada' ? 'tipo-entrada' : 'tipo-saida';
        const tipoTexto = mov.tipo === 'entrada' ? 'Entrada' : 'Saída';
        
        tabelaHTML += `
          <tr>
            <td>${mov.id || 'N/A'}</td>
            <td>${data}</td>
            <td class="${tipoClasse}">${tipoTexto}</td>
            <td>${mov.produto_nome || mov.produto_id || 'N/A'}</td>
            <td>${quantidade}</td>
            <td>R$ ${valorUnitario.toFixed(2).replace('.', ',')}</td>
            <td>R$ ${valorTotal.toFixed(2).replace('.', ',')}</td>
            <td>${mov.responsavel || 'N/A'}</td>
          </tr>
        `;
      });
      
      // Fechar a tabela
      tabelaHTML += `
          </tbody>
        </table>
      `;
      
      // Inserir a tabela no container
      tabelaContainer.innerHTML = tabelaHTML;
      
      console.log('Tabela de relatório de movimentações gerada com sucesso');
    })
    .catch(error => {
      console.error('Erro ao gerar relatório de movimentações:', error);
      
      // Mostrar mensagem de erro no container da tabela
      if (tabelaContainer) {
        tabelaContainer.innerHTML = `
          <div class="erro-relatorio">
            <p>Erro ao gerar relatório de movimentações: ${error.message}</p>
          </div>
        `;
      }
      
      alert('Erro ao gerar relatório de movimentações: ' + error.message);
    });
}

// Funções de exportação
function exportarPDF() {
  console.log('Iniciando exportação para PDF...');
  
  // Aqui você implementaria a lógica para exportar para PDF
  // Pode usar bibliotecas como jsPDF ou html2pdf
  
  alert('Exportando para PDF... Esta funcionalidade será implementada em breve.');
}

function exportarExcel() {
  console.log('Iniciando exportação para Excel...');
  
  // Aqui você implementaria a lógica para exportar para Excel
  // Pode usar bibliotecas como SheetJS (xlsx)
  
  alert('Exportando para Excel... Esta funcionalidade será implementada em breve.');
}

function imprimirRelatorio() {
  console.log('Iniciando impressão do relatório...');
  window.print();
}

// Adicionar event listeners aos botões
if (btnGerarRelatorioEstoque) {
  btnGerarRelatorioEstoque.addEventListener('click', gerarRelatorioEstoque);
} else {
  console.warn('Botão de gerar relatório de estoque não encontrado');
}

if (btnGerarRelatorioMovimentacoes) {
  btnGerarRelatorioMovimentacoes.addEventListener('click', gerarRelatorioMovimentacoes);
} else {
  console.warn('Botão de gerar relatório de movimentações não encontrado');
}

if (btnExportarPDF) {
  btnExportarPDF.addEventListener('click', exportarPDF);
} else {
  console.warn('Botão de exportar para PDF não encontrado');
}

if (btnExportarExcel) {
  btnExportarExcel.addEventListener('click', exportarExcel);
} else {
  console.warn('Botão de exportar para Excel não encontrado');
}

if (btnImprimir) {
  btnImprimir.addEventListener('click', imprimirRelatorio);
} else {
  console.warn('Botão de imprimir não encontrado');
}

// Inicializar a primeira aba ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  // Verificar se estamos na página de relatórios
  if (tabEstoque && tabMovimentacoes) {
    // Ativar a aba de estoque por padrão
    mudarTab('estoque');
  }
});
