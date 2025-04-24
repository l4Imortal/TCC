// Função para mudar entre as abas de relatórios
function mudarTab(tabId) {
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
    document.getElementById(tabId + '-tab').classList.add('active');
    
    // Ativar o botão da aba selecionada
    const activeTab = document.querySelector(`.tab[onclick="mudarTab('${tabId}')"]`);
    if (activeTab) {
      activeTab.classList.add('active');
    }
  }
  
  // Funções para gerar relatórios
  function gerarRelatorioEstoque() {
    alert('Gerando relatório de estoque...');
    // Aqui você implementaria a lógica para gerar o relatório
  }
  
  function gerarRelatorioMovimentacoes() {
    alert('Gerando relatório de movimentações...');
    // Aqui você implementaria a lógica para gerar o relatório
  }
  
  // Funções de exportação
  function exportarPDF() {
    alert('Exportando para PDF...');
    // Implementação da exportação para PDF
  }
  
  function exportarExcel() {
    alert('Exportando para Excel...');
    // Implementação da exportação para Excel
  }
  
  function imprimirRelatorio() {
    window.print();
  }
  
  // Inicializar a página com a primeira aba ativa
  document.addEventListener('DOMContentLoaded', function() {
    // A aba de estoque já está ativa por padrão no HTML
  });
  