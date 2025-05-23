/**
 * Sistema de Relatórios - Controle de Estoque
 * Versão aprimorada com melhor tratamento de erros e funcionalidades adicionais
 */

// Configurações globais
const API_BASE_URL = 'http://localhost:3000/api';
let relatorioAtual = null;
let dadosRelatorioAtual = null;

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

// Função para exibir mensagens de carregamento ou erro
function exibirMensagem(containerId, tipo, mensagem) {
  const container = document.querySelector(`#${containerId} .report-preview`);
  if (!container) return;
  
  let icone = '';
  let classe = '';
  
  switch (tipo) {
    case 'carregando':
      icone = '<i class="fas fa-spinner fa-spin"></i>';
      classe = 'mensagem-carregando';
      break;
    case 'erro':
      icone = '<i class="fas fa-exclamation-triangle"></i>';
      classe = 'mensagem-erro';
      break;
    case 'sucesso':
      icone = '<i class="fas fa-check-circle"></i>';
      classe = 'mensagem-sucesso';
      break;
    case 'info':
      icone = '<i class="fas fa-info-circle"></i>';
      classe = 'mensagem-info';
      break;
  }
  
  container.innerHTML = `
    <div class="mensagem ${classe}">
      ${icone}
      <p>${mensagem}</p>
    </div>
  `;
}

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
    
    // Atualizar a variável global de relatório atual
    relatorioAtual = tabId;
    
    // Habilitar/desabilitar botões de exportação com base na disponibilidade de dados
    atualizarBotoesExportacao(tabId);
  } else {
    console.error(`Elemento não encontrado: ${tabId}-tab`);
  }
  
  // Ativar o botão da aba selecionada
  const activeTab = document.getElementById(tabId);
  if (activeTab) {
    console.log(`Ativando botão da aba: ${tabId}`);
    activeTab.classList.add('active');
  } else {
    console.error(`Botão da aba não encontrado para: ${tabId}`);
  }
}

// Função para determinar o status do estoque com base na quantidade e estoque mínimo
function determinarStatusEstoque(quantidade, estoqueMinimo = 5) {
  if (quantidade <= 0) return { texto: 'Sem Estoque', classe: 'status-sem-estoque' };
  if (quantidade <= estoqueMinimo * 0.5) return { texto: 'Crítico', classe: 'status-critico' };
  if (quantidade <= estoqueMinimo) return { texto: 'Baixo', classe: 'status-baixo' };
  return { texto: 'Normal', classe: 'status-normal' };
}

// Função para formatar valores monetários
function formatarMoeda(valor) {
  return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
}

// Função para formatar datas
function formatarData(dataString) {
  if (!dataString) return 'N/A';
  
  try {
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return 'Data inválida';
    
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Erro na data';
  }
}

// Função para buscar dados da API com tratamento de erros aprimorado
async function fetchAPI(endpoint, params = {}) {
  try {
    // Construir URL com parâmetros
    const queryParams = new URLSearchParams(params);
    const url = `${API_BASE_URL}/${endpoint}${params ? '?' + queryParams.toString() : ''}`;
    
    console.log(`Buscando dados de: ${url}`);
    
    const response = await fetch(url);
    
    // Verificar se a resposta é JSON válido
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Resposta não é JSON válido: ${text}`);
    }
    
    // Verificar status HTTP
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar ${endpoint}:`, error);
    throw error;
  }
}

// Função para gerar relatório de estoque
async function gerarRelatorioEstoque() {
  console.log('Iniciando geração de relatório de estoque...');
  const containerId = 'estoque-tab';
  exibirMensagem(containerId, 'carregando', 'Carregando dados do estoque...');

  try {
    // 1. Buscar produtos
    const produtosResponse = await fetch('http://localhost:3000/api/produtos');
    if (!produtosResponse.ok) {
      throw new Error(`Erro HTTP: ${produtosResponse.status} ${produtosResponse.statusText}`);
    }
    
    const produtos = await produtosResponse.json();
    console.log('Dados de produtos recebidos:', produtos);

    // 2. Buscar entradas
    const entradasResponse = await fetch('http://localhost:3000/api/entradas');
    if (!entradasResponse.ok) {
      throw new Error(`Erro HTTP: ${entradasResponse.status} ${entradasResponse.statusText}`);
    }
    
    const entradas = await entradasResponse.json();
    console.log('Dados de entradas recebidos:', entradas);

    // 3. Buscar saídas
    const saidasResponse = await fetch('http://localhost:3000/api/saidas');
    if (!saidasResponse.ok) {
      throw new Error(`Erro HTTP: ${saidasResponse.status} ${saidasResponse.statusText}`);
    }
    
    const saidas = await saidasResponse.json();
    console.log('Dados de saídas recebidos:', saidas);

    // 4. Calcular o estoque atual para cada produto
    const produtosComEstoque = produtos.map(produto => {
      // Filtrar entradas e saídas para este produto usando o EAN
      const entradasDoProduto = entradas.filter(
        entrada => entrada.ean === produto.ean
      );
      
      const saidasDoProduto = saidas.filter(
        saida => saida.ean === produto.ean
      );
      
      // Calcular estoque atual
      let totalEntradas = 0;
      entradasDoProduto.forEach(entrada => {
        totalEntradas += parseInt(entrada.quantidade || 0);
      });
      
      let totalSaidas = 0;
      saidasDoProduto.forEach(saida => {
        totalSaidas += parseInt(saida.quantidade || 0);
      });
      
      const estoqueAtual = totalEntradas - totalSaidas;
      
      // Adicionar estoque atual ao produto
      return {
        ...produto,
        estoque_atual: estoqueAtual
      };
    });

    // 5. Verificar se temos produtos
    if (!produtosComEstoque || produtosComEstoque.length === 0) {
      exibirMensagem(containerId, 'info', 'Nenhum produto encontrado no estoque.');
      atualizarBotoesExportacao('estoque', false);
      return;
    }

    // 6. Calcular totais
    let totalItens = 0;
    let produtosComEstoqueBaixo = 0;
    let produtosSemEstoque = 0;

    const produtosProcessados = produtosComEstoque.map(produto => {
      const quantidade = parseInt(produto.estoque_atual || 0);
      const estoqueMinimo = parseInt(produto.estoque_minimo || 5);
      
      totalItens += Math.max(0, quantidade);
      if (quantidade <= 0) produtosSemEstoque++;
      else if (quantidade <= estoqueMinimo) produtosComEstoqueBaixo++;

      return {
        ...produto,
        quantidade_atual: quantidade,
        status: determinarStatusEstoque(quantidade, estoqueMinimo)
      };
    });

    // 7. Armazenar dados para exportação
    dadosRelatorioAtual = produtosProcessados;
    relatorioAtual = 'estoque';

    // 8. Gerar HTML do relatório
    const tabelaHTML = `
      <div class="relatorio-info">
        <h3>Relatório de Estoque</h3>
        <p>Data de geração: ${new Date().toLocaleString()}</p>
        <div class="relatorio-resumo">
          ${gerarResumoEstoque(produtosProcessados.length, totalItens, produtosSemEstoque, produtosComEstoqueBaixo)}
        </div>
      </div>
      <div class="table-container">
        ${gerarTabelaEstoque(produtosProcessados)}
      </div>
    `;

    // 9. Inserir no DOM
    const tabelaContainer = document.querySelector(`#${containerId} .report-preview`);
    if (tabelaContainer) {
      tabelaContainer.innerHTML = tabelaHTML;
    }

    // 10. Habilitar exportação
    atualizarBotoesExportacao('estoque', true);

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    exibirMensagem(containerId, 'erro', `Erro: ${error.message}`);
    atualizarBotoesExportacao('estoque', false);
  }
}



// Funções auxiliares
function gerarResumoEstoque(totalProdutos, totalItens, semEstoque, estoqueBaixo) {
  return `
    <div class="resumo-item">
      <span class="resumo-valor">${totalProdutos}</span>
      <span class="resumo-label">Produtos</span>
    </div>
    <div class="resumo-item">
      <span class="resumo-valor">${totalItens}</span>
      <span class="resumo-label">Itens</span>
    </div>
    <div class="resumo-item">
      <span class="resumo-valor">${semEstoque}</span>
      <span class="resumo-label">Sem Estoque</span>
    </div>
    <div class="resumo-item">
      <span class="resumo-valor">${estoqueBaixo}</span>
      <span class="resumo-label">Estoque Baixo</span>
    </div>
  `;
}

function gerarTabelaEstoque(produtos) {
  return `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>EAN</th>
          <th>Produto</th>
          <th>Categoria</th>
          <th>Fornecedor</th>
          <th>Estoque Atual</th>
          <th>Estoque Mínimo</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${produtos.map(produto => `
          <tr>
            <td>${produto.id_produto || 'N/A'}</td>
            <td>${produto.ean || 'N/A'}</td>
            <td>${produto.produto || 'N/A'}</td>
            <td>${produto.categoria || 'N/A'}</td>
            <td>${produto.fornecedor || 'N/A'}</td>
            <td class="${produto.status.classe}-texto">${produto.quantidade_atual}</td>
            <td>${produto.estoque_minimo}</td>
            <td class="${produto.status.classe}">${produto.status.texto}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}


function determinarStatusEstoque(quantidade, estoqueMinimo = 5) {
  if (quantidade <= 0) return { texto: 'Sem Estoque', classe: 'status-sem-estoque' };
  if (quantidade <= estoqueMinimo * 0.5) return { texto: 'Crítico', classe: 'status-critico' };
  if (quantidade <= estoqueMinimo) return { texto: 'Baixo', classe: 'status-baixo' };
  return { texto: 'Normal', classe: 'status-normal' };
}


// Função para gerar relatório de movimentações
async function gerarRelatorioMovimentacoes() {
  console.log('Iniciando geração de relatório de movimentações...');
  
  // Referência ao container da tabela
  const containerId = 'movimentacoes-tab';
  
  // Obter valores dos filtros
  const dataInicio = document.getElementById('mov-data-inicio').value;
  const dataFim = document.getElementById('mov-data-fim').value;
  const tipoMovimentacao = document.getElementById('mov-tipo').value;
  
  // Construir parâmetros de consulta
  const params = {};
  if (dataInicio) params.dataInicio = dataInicio;
  if (dataFim) params.dataFim = dataFim;
  if (tipoMovimentacao && tipoMovimentacao !== 'todos') params.tipo = tipoMovimentacao;
  
  // Mostrar indicador de carregamento
  exibirMensagem(containerId, 'carregando', 'Carregando dados de movimentações...');
  
  try {
    // Buscar dados do servidor
    const movimentacoes = await fetchAPI('relatorios/movimentacoes', params);
    
    // Armazenar dados para exportação
    dadosRelatorioAtual = movimentacoes;
    
    // Verificar se temos movimentações
    if (!movimentacoes || !Array.isArray(movimentacoes) || movimentacoes.length === 0) {
      exibirMensagem(containerId, 'info', 'Nenhuma movimentação encontrada para o período selecionado.');
      return;
    }
    
    // Calcular valores totais para exibição
    let valorTotalEntradas = 0;
    let valorTotalSaidas = 0;
    let quantidadeEntradas = 0;
    let quantidadeSaidas = 0;
    
    movimentacoes.forEach(mov => {
      const quantidade = parseInt(mov.quantidade || 0);
      const valorUnitario = parseFloat(mov.valor_unitario || 0);
      const valorTotal = valorUnitario * quantidade;
      
      if (mov.tipo_movimentacao === 'entrada') {
        valorTotalEntradas += valorTotal;
        quantidadeEntradas += quantidade;
      } else if (mov.tipo_movimentacao === 'saida') {
        valorTotalSaidas += valorTotal;
        quantidadeSaidas += quantidade;
      }
    });
    
    // Criar a tabela HTML
    let tabelaHTML = `
      <div class="relatorio-info">
        <h3>Relatório de Movimentações</h3>
        <p>Data de geração: ${formatarData(new Date())}</p>
        <p>Período: ${dataInicio ? formatarData(dataInicio) : 'Início'} a ${dataFim ? formatarData(dataFim) : 'Hoje'}</p>
        <div class="relatorio-resumo">
          <div class="resumo-item">
            <span class="resumo-valor">${movimentacoes.length}</span>
            <span class="resumo-label">Movimentações</span>
          </div>
          <div class="resumo-item">
            <span class="resumo-valor">${quantidadeEntradas}</span>
            <span class="resumo-label">Itens Entrada</span>
          </div>
          <div class="resumo-item">
            <span class="resumo-valor">${quantidadeSaidas}</span>
            <span class="resumo-label">Itens Saída</span>
          </div>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Data</th>
              <th>Tipo</th>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Responsável</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Adicionar linhas para cada movimentação
    movimentacoes.forEach(mov => {
      const quantidade = parseInt(mov.quantidade || 0);
      
      // Formatar a data
      const data = formatarData(mov.data_movimentacao);
      
      // Determinar o tipo de movimentação
      const tipoClasse = mov.tipo_movimentacao === 'entrada' ? 'tipo-entrada' : 'tipo-saida';
      const tipoTexto = mov.tipo_movimentacao === 'entrada' ? 'Entrada' : 'Saída';
      
      tabelaHTML += `
        <tr>
          <td>${mov.id_movimentacao || 'N/A'}</td>
          <td>${data}</td>
          <td class="${tipoClasse}">${tipoTexto}</td>
          <td>${mov.nome_produto || 'N/A'}</td>
          <td>${quantidade}</td>
          <td>${mov.responsavel || 'Sistema'}</td>
        </tr>
      `;
    });
    
    // Fechar a tabela
    tabelaHTML += `
          </tbody>
        </table>
      </div>
    `;
    
    // Inserir a tabela no container
    const tabelaContainer = document.querySelector(`#${containerId} .report-preview`);
    if (tabelaContainer) {
      tabelaContainer.innerHTML = tabelaHTML;
    }
    
    console.log('Tabela de relatório de movimentações gerada com sucesso');
    
    // Habilitar botões de exportação
    atualizarBotoesExportacao('movimentacoes', true);
    
  } catch (error) {
    console.error('Erro ao gerar relatório de movimentações:', error);
    exibirMensagem(containerId, 'erro', `Erro ao gerar relatório de movimentações: ${error.message}`);
    
    // Desabilitar botões de exportação
    atualizarBotoesExportacao('movimentacoes', false);
  }
}

// Funções de exportação
async function exportarPDF() {
  if (!dadosRelatorioAtual?.length) {
    alert('Não há dados para exportar. Gere o relatório primeiro.');
    return;
  }

  try {
    // Mostrar loading
    Swal.fire({
      title: 'Gerando PDF',
      html: 'Aguarde enquanto preparamos seu documento...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    // Criar PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm'
    });

    // Adicionar conteúdo básico
    doc.setFont('helvetica');
    doc.setFontSize(16);
    doc.text('Relatório de Estoque', 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 15, 25);

    // Criar tabela
    const headers = [['EAN', 'Produto', 'Quantidade', 'Status']];
    const data = dadosRelatorioAtual.map(item => [
      item.ean || '',
      item.produto || '',
      item.quantidade_atual || 0,
      determinarStatusEstoque(item.quantidade_atual, item.estoque_minimo).texto
    ]);

    doc.autoTable({
      head: headers,
      body: data,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    // Salvar PDF
    doc.save(`relatorio_estoque_${new Date().toISOString().slice(0,10)}.pdf`);
    
    // Fechar loading
    Swal.close();
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    Swal.fire('Erro', 'Não foi possível gerar o PDF', 'error');
  }
}

// Funções auxiliares
async function carregarBibliotecasPDF() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  }
  if (!window.jspdf || !window.jspdf.autoTable) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js');
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function adicionarCabecalhoPDF(doc, margin, contentWidth) {
  // Adicionar logo (se disponível)
  try {
    const logoResponse = await fetch('/assets/img/logo.png');
    if (logoResponse.ok) {
      const logoData = await logoResponse.blob();
      const logoUrl = URL.createObjectURL(logoData);
      doc.addImage(logoUrl, 'PNG', margin.left, margin.top, 30, 15);
    }
  } catch (e) {
    console.log('Logo não encontrado, continuando sem logo...');
  }

  // Informações da empresa
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('NOME DA EMPRESA', margin.left + 35, margin.top + 8);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('CNPJ: 00.000.000/0001-00', margin.left + 35, margin.top + 14);
  doc.text('Endereço: Av. Principal, 1000 - Centro - CEP 00000-000', margin.left + 35, margin.top + 20);
  
  // Linha divisória
  doc.setDrawColor(200);
  doc.setLineWidth(0.5);
  doc.line(margin.left, margin.top + 25, margin.left + contentWidth, margin.top + 25);
}

async function adicionarResumoEstoquePDF(doc, margin, contentWidth) {
  const totalProdutos = dadosRelatorioAtual.length;
  let totalItens = 0;
  let valorTotalEstoque = 0;
  let produtosComEstoqueBaixo = 0;
  let produtosSemEstoque = 0;
  
  dadosRelatorioAtual.forEach(produto => {
    const quantidade = parseInt(produto.quantidade_atual || 0);
    const estoqueMinimo = parseInt(produto.estoque_minimo || 5);
    const valorUnitario = parseFloat(produto.valor_unitario || 0);
    
    totalItens += quantidade > 0 ? quantidade : 0;
    valorTotalEstoque += quantidade * valorUnitario;
    
    if (quantidade <= 0) {
      produtosSemEstoque++;
    } else if (quantidade <= estoqueMinimo) {
      produtosComEstoqueBaixo++;
    }
  });
  
  // Configurações do bloco de resumo
  const resumoY = margin.top + 40;
  const colWidth = contentWidth / 4;
  
  doc.setFillColor(241, 243, 245);
  doc.rect(margin.left, resumoY, contentWidth, 20, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMO DO ESTOQUE', margin.left + 5, resumoY + 8);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  // Total de Produtos
  doc.setFillColor(52, 152, 219);
  doc.rect(margin.left, resumoY + 15, colWidth, 15, 'F');
  doc.setTextColor(255);
  doc.text('TOTAL DE PRODUTOS', margin.left + colWidth/2, resumoY + 22, { align: 'center' });
  doc.setFontSize(12);
  doc.text(totalProdutos.toString(), margin.left + colWidth/2, resumoY + 28, { align: 'center' });
  
  // Itens em Estoque
  doc.setFillColor(46, 204, 113);
  doc.rect(margin.left + colWidth, resumoY + 15, colWidth, 15, 'F');
  doc.text('ITENS EM ESTOQUE', margin.left + colWidth + colWidth/2, resumoY + 22, { align: 'center' });
  doc.setFontSize(12);
  doc.text(totalItens.toString(), margin.left + colWidth + colWidth/2, resumoY + 28, { align: 'center' });
  
  // Valor Total
  doc.setFillColor(155, 89, 182);
  doc.rect(margin.left + colWidth*2, resumoY + 15, colWidth, 15, 'F');
  doc.text('VALOR TOTAL', margin.left + colWidth*2 + colWidth/2, resumoY + 22, { align: 'center' });
  doc.setFontSize(12);
  doc.text(formatarMoeda(valorTotalEstoque), margin.left + colWidth*2 + colWidth/2, resumoY + 28, { align: 'center' });
  
  // Produtos com Estoque Baixo
  doc.setFillColor(230, 126, 34);
  doc.rect(margin.left + colWidth*3, resumoY + 15, colWidth, 15, 'F');
  doc.text('ESTOQUE BAIXO', margin.left + colWidth*3 + colWidth/2, resumoY + 22, { align: 'center' });
  doc.setFontSize(12);
  doc.text(produtosComEstoqueBaixo.toString(), margin.left + colWidth*3 + colWidth/2, resumoY + 28, { align: 'center' });
  
  // Resetar cores
  doc.setTextColor(40);
  doc.setFillColor(255, 255, 255);
}

function formatarStatusEstoque(quantidade, estoqueMinimo) {
  const qtd = parseInt(quantidade || 0);
  const min = parseInt(estoqueMinimo || 5);
  
  if (qtd <= 0) return 'SEM ESTOQUE';
  if (qtd <= min * 0.3) return 'CRÍTICO';
  if (qtd <= min) return 'BAIXO';
  return 'NORMAL';
}

function formatarMoeda(valor) {
  return parseFloat(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function formatarData(data, formato = 'DD/MM/YYYY') {
  if (!data) return '';
  const date = new Date(data);
  
  if (formato === 'DD/MM/YYYY') {
    return date.toLocaleDateString('pt-BR');
  } else {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}







// Função para reinicializar os event listeners após restaurar o conteúdo original
function inicializarEventListeners() {
  // Botões de relatório
  const btnGerarRelatorioEstoque = document.getElementById('btnGerarRelatorioEstoque');
  const btnGerarRelatorioMovimentacoes = document.getElementById('btnGerarRelatorioMovimentacoes');
  const btnExportarPDF = document.getElementById('btnExportarPDF');
  const btnExportarExcel = document.getElementById('btnExportarExcel');
  const btnImprimir = document.getElementById('btnImprimir');
  
  // Tabs
  const tabEstoque = document.getElementById('estoque-tab');
  const tabMovimentacoes = document.getElementById('movimentacoes-tab');
  
  // Adicionar event listeners
  if (btnGerarRelatorioEstoque) {
    btnGerarRelatorioEstoque.addEventListener('click', gerarRelatorioEstoque);
  }
  
  if (btnGerarRelatorioMovimentacoes) {
    btnGerarRelatorioMovimentacoes.addEventListener('click', gerarRelatorioMovimentacoes);
  }
  
  if (btnExportarPDF) {
    btnExportarPDF.addEventListener('click', exportarPDF);
  }
  
  if (btnExportarExcel) {
    btnExportarExcel.addEventListener('click', exportarExcel);
  }
  
  if (btnImprimir) {
    btnImprimir.addEventListener('click', imprimirRelatorio);
  }
  
  // Adicionar listeners para as tabs
  if (tabEstoque) {
    tabEstoque.addEventListener('click', () => mudarTab('estoque'));
  }
  
  if (tabMovimentacoes) {
    tabMovimentacoes.addEventListener('click', () => mudarTab('movimentacoes'));
  }
  
  // Adicionar listener para limpar filtros
  const btnLimparFiltros = document.getElementById('mov-limpar-filtros');
  if (btnLimparFiltros) {
    btnLimparFiltros.addEventListener('click', () => {
      const hoje = new Date();
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      
      const inputDataInicio = document.getElementById('mov-data-inicio');
      const inputDataFim = document.getElementById('mov-data-fim');
      const selectTipo = document.getElementById('mov-tipo');
      
      if (inputDataInicio) inputDataInicio.valueAsDate = primeiroDiaMes;
      if (inputDataFim) inputDataFim.valueAsDate = hoje;
      if (selectTipo) selectTipo.value = 'todos';
      
      gerarRelatorioMovimentacoes();
    });
  }
}



async function exportarExcel() {
  console.log('Iniciando exportação para Excel...');
  
  if (!dadosRelatorioAtual || !relatorioAtual) {
    alert('Não há dados para exportar. Por favor, gere um relatório primeiro.');
    return;
  }
  
  try {
    // Importar a biblioteca SheetJS (xlsx) dinamicamente
    const XLSX = await import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm');
    
    // Preparar os dados para o Excel
    let dados;
    
    if (relatorioAtual === 'estoque') {
      dados = dadosRelatorioAtual.map(p => ({
        'ID': p.id_produto || '',
        'EAN': p.ean || '',
        'Produto': p.produto || '',
        'Categoria': p.categoria || '',
        'Fornecedor': p.fornecedor || '',
        'Estoque Atual': p.quantidade_atual || '0',
        'Estoque Mínimo': p.estoque_minimo || '0',
        'Status': parseInt(p.quantidade_atual || 0) <= 0 ? 'Sem Estoque' : 
                 parseInt(p.quantidade_atual || 0) <= parseInt(p.estoque_minimo || 5) ? 'Baixo' : 'Normal'
      }));
    } else {
      dados = dadosRelatorioAtual.map(m => ({
        'ID': m.id_movimentacao || '',
        'Data': formatarData(m.data_movimentacao),
        'Tipo': m.tipo_movimentacao === 'entrada' ? 'Entrada' : 'Saída',
        'Produto': m.nome_produto || '',
        'Quantidade': m.quantidade || '0',
        'Responsável': m.responsavel || 'Sistema'
      }));
    }
    
    // Criar uma nova planilha
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, relatorioAtual === 'estoque' ? 'Estoque' : 'Movimentações');
    
    // Salvar o arquivo Excel
    const nomeArquivo = `${relatorioAtual}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
    
    console.log(`Excel exportado com sucesso: ${nomeArquivo}`);
    
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    alert(`Erro ao exportar para Excel: ${error.message}`);
  }
}

function imprimirRelatorio() {
  console.log('Iniciando impressão do relatório...');
  
  if (!dadosRelatorioAtual || !relatorioAtual) {
    alert('Não há dados para imprimir. Por favor, gere um relatório primeiro.');
    return;
  }
  
  try {
    // Criar uma nova janela para impressão
    const janelaImpressao = window.open('', '_blank');
    
    if (!janelaImpressao) {
      throw new Error('Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desativado.');
    }
    
    // Obter o conteúdo atual do relatório
    const conteudoRelatorio = document.querySelector(`#${relatorioAtual}-tab .report-preview`).innerHTML;
    
    // Estilos para a impressão
    const estilos = `
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        .relatorio-info {
          margin-bottom: 20px;
        }
        .relatorio-resumo {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 20px;
        }
        .resumo-item {
          background-color: #f5f5f5;
          padding: 10px;
          border-radius: 5px;
          text-align: center;
          min-width: 120px;
        }
        .resumo-valor {
          font-size: 18px;
          font-weight: bold;
          display: block;
        }
        .resumo-label {
          font-size: 12px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .status-sem-estoque {
          color: #e74c3c;
          font-weight: bold;
        }
        .status-critico {
          color: #e67e22;
          font-weight: bold;
        }
        .status-baixo {
          color: #f39c12;
          font-weight: bold;
        }
        .status-normal {
          color: #27ae60;
        }
        .tipo-entrada {
          color: #27ae60;
          font-weight: bold;
        }
        .tipo-saida {
          color: #e74c3c;
          font-weight: bold;
        }
        @media print {
          .no-print {
            display: none;
          }
        }
      </style>
    `;
    
    // Título da página
    const titulo = relatorioAtual === 'estoque' ? 'Relatório de Estoque' : 'Relatório de Movimentações';
    
    // Escrever o conteúdo na nova janela
    janelaImpressao.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${titulo}</title>
        ${estilos}
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()">Imprimir</button>
          <button onclick="window.close()">Fechar</button>
        </div>
        ${conteudoRelatorio}
      </body>
      </html>
    `);
    
    janelaImpressao.document.close();
    
    // Iniciar a impressão após o carregamento da página
    janelaImpressao.onload = function() {
      setTimeout(() => {
        janelaImpressao.focus();
        janelaImpressao.print();
      }, 500);
    };
    
    console.log('Janela de impressão aberta com sucesso');
    
  } catch (error) {
    console.error('Erro ao imprimir relatório:', error);
    alert(`Erro ao imprimir relatório: ${error.message}`);
  }
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
    console.log('Inicializando página de relatórios');
    
    // Definir valores padrão para os campos de data
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    const inputDataInicio = document.getElementById('mov-data-inicio');
    const inputDataFim = document.getElementById('mov-data-fim');
    
    if (inputDataInicio) {
      inputDataInicio.valueAsDate = primeiroDiaMes;
    }
    
    if (inputDataFim) {
      inputDataFim.valueAsDate = hoje;
    }
    
    // Ativar a aba de estoque por padrão
    mudarTab('estoque');
    
    // Gerar relatório de estoque automaticamente
    setTimeout(() => {
      gerarRelatorioEstoque();
    }, 500);
  } else {
    console.log('Não estamos na página de relatórios ou elementos não encontrados');
  }
});

// Adicionar listener para limpar filtros de movimentações
const btnLimparFiltros = document.getElementById('mov-limpar-filtros');
if (btnLimparFiltros) {
  btnLimparFiltros.addEventListener('click', () => {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    const inputDataInicio = document.getElementById('mov-data-inicio');
    const inputDataFim = document.getElementById('mov-data-fim');
    const selectTipo = document.getElementById('mov-tipo');
    
    if (inputDataInicio) inputDataInicio.valueAsDate = primeiroDiaMes;
    if (inputDataFim) inputDataFim.valueAsDate = hoje;
    if (selectTipo) selectTipo.value = 'todos';
    
    // Gerar relatório com os filtros limpos
    gerarRelatorioMovimentacoes();
  });
}
// Função para atualizar o estado dos botões de exportação
function atualizarBotoesExportacao(tabId, temDados = false) {
  console.log(`Atualizando botões de exportação para aba ${tabId}, temDados: ${temDados}`);
  
  // Selecionar os botões de exportação
  const btnExportarPDF = document.getElementById("btnExportarPDF");
  const btnExportarExcel = document.getElementById("btnExportarExcel");
  const btnImprimir = document.getElementById("btnImprimir");
  
  const botoes = [btnExportarPDF, btnExportarExcel, btnImprimir];
  
  botoes.forEach(botao => {
    if (botao) {
      botao.disabled = !temDados;
      botao.classList.toggle('disabled', !temDados);
    }
  });
}

