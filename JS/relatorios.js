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
function exportarPDF() {
  console.log('Iniciando impressão do documento...');
  
  if (!dadosRelatorioAtual || !Array.isArray(dadosRelatorioAtual) || dadosRelatorioAtual.length === 0) {
    alert('Não há dados para exportar. Por favor, gere um relatório primeiro.');
    return;
  }
  
  try {
    // Criar um elemento de estilo para impressão
    const estiloImpressao = document.createElement('style');
    estiloImpressao.id = 'estilo-impressao-temporario';
    estiloImpressao.innerHTML = `
      @media print {
        /* Ocultar elementos que não devem ser impressos */
        header, nav, footer, .sidebar, .tab-buttons, .actions-container, 
        .filter-container, button, .no-print, input, select {
          display: none !important;
        }
        
        /* Configurações gerais da página */
        @page {
          size: A4;
          margin: 2cm 1.5cm;
        }
        
        /* Garantir que o fundo seja branco */
        body, html {
          background-color: white !important;
          margin: 0 !important;
          padding: 0 !important;
          font-family: 'Arial', sans-serif !important;
          color: #000000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Estilizar o conteúdo do relatório */
        .report-preview {
          padding: 0 !important;
          width: 100% !important;
          box-shadow: none !important;
        }
        
        /* Tabela em estilo formal */
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin-top: 20px !important;
          border: 1px solid #000 !important;
        }
        
        th {
          background-color: #f2f2f2 !important;
          color: #000 !important;
          font-weight: bold !important;
          padding: 10px 8px !important;
          text-align: left !important;
          border: 1px solid #000 !important;
          font-size: 10pt !important;
          text-transform: uppercase !important;
        }
        
        td {
          padding: 8px !important;
          border: 1px solid #000 !important;
          font-size: 10pt !important;
          vertical-align: top !important;
        }
        
        tr:nth-child(even) {
          background-color: #f9f9f9 !important;
        }
        
        /* Status com cores mais discretas */
        .status-sem-estoque {
          color: #8b0000 !important;
          font-weight: bold !important;
        }
        
        .status-critico {
          color: #8b4513 !important;
          font-weight: bold !important;
        }
        
        .status-baixo {
          color: #b8860b !important;
          font-weight: bold !important;
        }
        
        .status-normal {
          color: #006400 !important;
        }
        
        .tipo-entrada {
          color: #006400 !important;
          font-weight: bold !important;
        }
        
        .tipo-saida {
          color: #8b0000 !important;
          font-weight: bold !important;
        }
        
        /* Mostrar apenas a aba ativa */
        .tab-content {
          display: block !important;
        }
        
        .tab-pane {
          display: none !important;
        }
        
        .tab-pane.active {
          display: block !important;
        }
      }
    `;
    
    // Adicionar o estilo ao documento
    document.head.appendChild(estiloImpressao);
    
    // Adicionar um cabeçalho corporativo temporário
    const cabecalhoImpressao = document.createElement('div');
    cabecalhoImpressao.id = 'cabecalho-impressao-temporario';
    cabecalhoImpressao.className = 'print-only';
    cabecalhoImpressao.style.display = 'none';
    
    // Determinar o título do relatório
    const tituloRelatorio = relatorioAtual === 'estoque' ? 'RELATÓRIO DE ESTOQUE' : 'RELATÓRIO DE MOVIMENTAÇÕES';
    const dataAtual = formatarData(new Date());
    
    cabecalhoImpressao.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #000;">
        <h2 style="margin: 0; font-size: 16pt; text-transform: uppercase; font-weight: bold;">SISTEMA DE GESTÃO DE ESTOQUE</h2>
        <h3 style="margin: 10px 0; font-size: 14pt; text-transform: uppercase; font-weight: bold;">${tituloRelatorio}</h3>
        <p style="margin: 5px 0; font-size: 10pt;">CNPJ: 00.000.000/0001-00</p>
        <p style="margin: 5px 0; font-size: 10pt;">Endereço: Av. Principal, 1000 - Centro - CEP 00000-000</p>
        <p style="margin: 5px 0; font-size: 10pt;">Data de emissão: ${dataAtual}</p>
      </div>
    `;
    
    // Adicionar um rodapé formal temporário
    const rodapeImpressao = document.createElement('div');
    rodapeImpressao.id = 'rodape-impressao-temporario';
    rodapeImpressao.className = 'print-only';
    rodapeImpressao.style.display = 'none';
    rodapeImpressao.innerHTML = `
      <div style="margin-top: 30px; border-top: 1px solid #000; padding-top: 10px;">
        <table style="width: 100%; border: none !important;">
          <tr style="background: none !important;">
            <td style="border: none !important; text-align: left; font-size: 9pt; padding: 0 !important;">
              Documento gerado em: ${dataAtual}
            </td>
            <td style="border: none !important; text-align: right; font-size: 9pt; padding: 0 !important;">
              Página 1 de 1
            </td>
          </tr>
        </table>
        <p style="text-align: center; font-size: 9pt; margin-top: 10px;">
          Este documento é válido apenas com assinatura e carimbo.
        </p>
        <div style="margin-top: 30px; display: flex; justify-content: space-between;">
          <div style="width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 5px; font-size: 9pt;">
            Responsável pela emissão
          </div>
          <div style="width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 5px; font-size: 9pt;">
            Conferência
          </div>
        </div>
      </div>
    `;
    
    // Adicionar resumo para relatório de estoque
    let resumoHTML = '';
    if (relatorioAtual === 'estoque') {
      const totalProdutos = dadosRelatorioAtual.length;
      let totalItens = 0;
      let produtosComEstoqueBaixo = 0;
      let produtosSemEstoque = 0;
      
      dadosRelatorioAtual.forEach(produto => {
        const quantidade = parseInt(produto.quantidade_atual || 0);
        const estoqueMinimo = parseInt(produto.estoque_minimo || 5);
        
        totalItens += quantidade > 0 ? quantidade : 0;
        
        if (quantidade <= 0) {
          produtosSemEstoque++;
        } else if (quantidade <= estoqueMinimo) {
          produtosComEstoqueBaixo++;
        }
      });
      
      resumoHTML = `
        <div style="margin-bottom: 25px; border: 1px solid #000; padding: 15px; background-color: #f9f9f9;">
          <div style="display: flex; justify-content: space-between; text-align: center;">
            <div style="flex: 1; padding: 10px 5px; border-right: 1px solid #ccc;">
              <span style="font-size: 14pt; font-weight: bold; display: block; margin-bottom: 5px;">${totalProdutos}</span>
              <span style="font-size: 9pt; text-transform: uppercase;">Produtos</span>
            </div>
            <div style="flex: 1; padding: 10px 5px; border-right: 1px solid #ccc;">
              <span style="font-size: 14pt; font-weight: bold; display: block; margin-bottom: 5px;">${totalItens}</span>
              <span style="font-size: 9pt; text-transform: uppercase;">Itens em Estoque</span>
            </div>
            <div style="flex: 1; padding: 10px 5px; border-right: 1px solid #ccc;">
              <span style="font-size: 14pt; font-weight: bold; display: block; margin-bottom: 5px;">${produtosSemEstoque}</span>
              <span style="font-size: 9pt; text-transform: uppercase;">Sem Estoque</span>
            </div>
            <div style="flex: 1; padding: 10px 5px;">
              <span style="font-size: 14pt; font-weight: bold; display: block; margin-bottom: 5px;">${produtosComEstoqueBaixo}</span>
              <span style="font-size: 9pt; text-transform: uppercase;">Estoque Baixo</span>
            </div>
          </div>
        </div>
      `;
    }
    
    const resumoContainer = document.createElement('div');
    resumoContainer.id = 'resumo-impressao-temporario';
    resumoContainer.className = 'print-only';
    resumoContainer.style.display = 'none';
    resumoContainer.innerHTML = resumoHTML;
    
    // Obter o container do relatório
    const containerRelatorio = document.querySelector(`#${relatorioAtual}-tab .report-preview`);
    
    // Inserir o cabeçalho no início do container
    containerRelatorio.insertBefore(cabecalhoImpressao, containerRelatorio.firstChild);
    
    // Inserir o resumo após o cabeçalho (se for relatório de estoque)
    if (relatorioAtual === 'estoque') {
      containerRelatorio.insertBefore(resumoContainer, cabecalhoImpressao.nextSibling);
    }
    
    // Adicionar o rodapé ao final do container
    containerRelatorio.appendChild(rodapeImpressao);
    
    // Mostrar elementos para impressão
    cabecalhoImpressao.style.display = 'block';
    rodapeImpressao.style.display = 'block';
    if (relatorioAtual === 'estoque') {
      resumoContainer.style.display = 'block';
    }
    
    // Imprimir a página
    window.print();
    
    // Remover os elementos temporários após a impressão
    setTimeout(() => {
      const estiloTemp = document.getElementById('estilo-impressao-temporario');
      if (estiloTemp) estiloTemp.remove();
      
      const cabecalhoTemp = document.getElementById('cabecalho-impressao-temporario');
      if (cabecalhoTemp) cabecalhoTemp.remove();
      
      const resumoTemp = document.getElementById('resumo-impressao-temporario');
      if (resumoTemp) resumoTemp.remove();
      
      const rodapeTemp = document.getElementById('rodape-impressao-temporario');
      if (rodapeTemp) rodapeTemp.remove();
      
      console.log('Elementos temporários de impressão removidos');
    }, 1000);
    
    console.log('Impressão iniciada com sucesso');
    
  } catch (error) {
    console.error('Erro ao preparar documento para impressão:', error);
    alert(`Erro ao preparar documento para impressão: ${error.message}`);
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

