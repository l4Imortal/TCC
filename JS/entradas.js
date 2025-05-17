// Variáveis globais para armazenar dados
let produtosLista = [];
let fornecedoresLista = [];
let currentRowToDelete = null;

// Funções auxiliares de formatação
function formatarNotaFiscal(nota) {
    if (!nota) return '';
    const numeros = nota.replace(/\D/g, '');
    return numeros.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
}

function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

function formatarValor(valor) {
    return valor ? `R$ ${parseFloat(valor).toFixed(2)}` : 'R$ 0.00';
}

// Função para encontrar nome pelo ID
function encontrarNomePorId(lista, id) {
    if (!id) return '';
    const item = lista.find(item => item.id == id);
    return item ? item.nome : '';
}

// Função para adicionar entrada na tabela
function adicionarEntradaNaTabela(entrada) {
    const tabela = document.querySelector("table tbody");
    if (!tabela) return;

    const novaLinha = document.createElement("tr");
    novaLinha.dataset.id = entrada.id;

    // Obter nomes dos produtos e fornecedores
    const nomeProduto = entrada.produto || encontrarNomePorId(produtosLista, entrada.produto_id);
    const nomeFornecedor = entrada.fornecedor || encontrarNomePorId(fornecedoresLista, entrada.fornecedor_id);

    novaLinha.innerHTML = `
        <td>${entrada.ean || ''}</td>
        <td>${nomeProduto}</td>
        <td>${entrada.quantidade || 0}</td>
        <td>${nomeFornecedor}</td>
        <td>${entrada.nota_fiscal ? `N° ${formatarNotaFiscal(entrada.nota_fiscal)}` : ''}</td>
        <td>${formatarValor(entrada.valor_unitario)}</td>
        <td>${entrada.responsavel || ''}</td>
        <td>${entrada.data_entrada ? formatarData(entrada.data_entrada) : ''}</td>
        <td>
            <button class="btn-editar"><i class="fas fa-edit"></i> Editar</button>
            <button class="btn-excluir"><i class="fas fa-trash"></i> Excluir</button>
        </td>
    `;

    tabela.appendChild(novaLinha);

    novaLinha.querySelector('.btn-editar').addEventListener('click', () => abrirPopupEdicao(entrada));
    novaLinha.querySelector('.btn-excluir').addEventListener('click', () => confirmarExclusao(entrada));
}

// Função para carregar entradas do banco de dados
async function carregarEntradas() {
    try {
        const response = await fetch('http://localhost:3000/api/entradas');
        if (!response.ok) throw new Error('Erro ao carregar entradas');
        
        const entradas = await response.json();
        const tabela = document.querySelector("table tbody");
        tabela.innerHTML = '';
        
        entradas.forEach(entrada => adicionarEntradaNaTabela(entrada));
    } catch (error) {
        console.error('Erro ao carregar entradas:', error);
        alert('Erro ao carregar entradas: ' + error.message);
    }
}

// Função para carregar produtos
async function carregarProdutos() {
    try {
        const response = await fetch('http://localhost:3000/api/produtos');
        if (!response.ok) throw new Error('Erro ao carregar produtos');
        
        produtosLista = await response.json();
        const select = document.getElementById('produtoEntrada');
        
        select.innerHTML = '<option value="">Selecione um produto</option>';
        
        produtosLista.forEach(produto => {
            const option = document.createElement('option');
            option.value = produto.id;
            option.textContent = produto.nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        alert('Erro ao carregar lista de produtos');
    }
}

// Função para carregar fornecedores
async function carregarFornecedores() {
    try {
        const response = await fetch('http://localhost:3000/api/fornecedores');
        if (!response.ok) throw new Error('Erro ao carregar fornecedores');
        
        fornecedoresLista = await response.json();
        const select = document.getElementById('fornecedorEntrada');
        
        select.innerHTML = '<option value="">Selecione um fornecedor</option>';
        
        fornecedoresLista.forEach(fornecedor => {
            const option = document.createElement('option');
            option.value = fornecedor.id;
            option.textContent = fornecedor.nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
        alert('Erro ao carregar lista de fornecedores');
    }
}

// Função para abrir popup de edição
function abrirPopupEdicao(entrada) {
    // Configura os valores do formulário
    document.getElementById('editMode').value = 'true';
    document.getElementById('entradaId').value = entrada.id;
    document.getElementById('eanEntrada').value = entrada.ean || '';
    document.getElementById('quantidadeEntrada').value = entrada.quantidade || '';
    document.getElementById('notaFiscalEntrada').value = entrada.nota_fiscal || '';
    document.getElementById('valorEntrada').value = entrada.valor_unitario || '';
    document.getElementById('responsavelEntrada').value = entrada.responsavel || '';
    document.getElementById('dataEntrada').value = entrada.data_entrada ? entrada.data_entrada.split('T')[0] : '';

    // Configura produto selecionado
    const produtoSelect = document.getElementById('produtoEntrada');
    if (produtoSelect) {
        produtoSelect.value = entrada.produto_id || '';
    }

    // Configura fornecedor selecionado
    const fornecedorSelect = document.getElementById('fornecedorEntrada');
    if (fornecedorSelect) {
        fornecedorSelect.value = entrada.fornecedor_id || '';
    }

    document.getElementById('popupTitle').textContent = 'Editar Entrada';
    document.getElementById('popupOverlay').style.display = 'block';
    document.getElementById('entradaPopup').style.display = 'block';
}

// Função para confirmar exclusão
function confirmarExclusao(entrada) {
    currentRowToDelete = entrada;
    document.getElementById('deleteMessage').textContent = `Tem certeza que deseja excluir a entrada do produto "${entrada.produto || encontrarNomePorId(produtosLista, entrada.produto_id)}"?`;
    document.getElementById('popupOverlay').style.display = 'block';
    document.getElementById('deletePopup').style.display = 'block';
}

// Função para salvar entrada (criar ou atualizar)
async function salvarEntrada(event) {
    event.preventDefault();
    
    const form = event.target;
    const isEditMode = document.getElementById('editMode').value === 'true';
    const entradaId = document.getElementById('entradaId')?.value || '';
    
    // Coleta os dados do formulário
    const entradaData = {
        ean: form.eanEntrada.value.padStart(13, '0'),
        produto_id: form.produtoEntrada.value,
        quantidade: parseInt(form.quantidadeEntrada.value),
        fornecedor_id: form.fornecedorEntrada.value,
        nota_fiscal: form.notaFiscalEntrada.value.replace(/\D/g, ''),
        valor_unitario: parseFloat(form.valorEntrada.value.replace(',', '.')),
        responsavel: form.responsavelEntrada.value,
        data_entrada: form.dataEntrada.value
    };

    // Validações
    if (!/^\d{13}$/.test(entradaData.ean)) {
        alert('O EAN deve conter exatamente 13 dígitos');
        return;
    }

    if (!entradaData.produto_id) {
        alert('Selecione um produto');
        return;
    }

    if (!entradaData.fornecedor_id) {
        alert('Selecione um fornecedor');
        return;
    }

    if (entradaData.quantidade <= 0 || isNaN(entradaData.quantidade)) {
        alert('A quantidade deve ser maior que zero');
        return;
    }

    if (!entradaData.nota_fiscal) {
        alert('Informe o número da nota fiscal');
        return;
    }

    try {
        const url = isEditMode 
            ? `http://localhost:3000/api/entradas/${entradaId}`
            : 'http://localhost:3000/api/entradas';
            
        const method = isEditMode ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entradaData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao salvar entrada');
        }

        fecharPopup();
        await carregarEntradas();
        alert(`Entrada ${isEditMode ? 'atualizada' : 'criada'} com sucesso!`);
    } catch (error) {
        console.error('Erro ao salvar entrada:', error);
        alert('Erro: ' + error.message);
    }
}

// Função para excluir entrada
async function excluirEntrada() {
    if (!currentRowToDelete) return;

    try {
        const response = await fetch(`http://localhost:3000/api/entradas/${currentRowToDelete.id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao excluir entrada');
        }

        fecharPopup();
        await carregarEntradas();
        alert('Entrada excluída com sucesso!');
    } catch (error) {
        console.error('Erro ao excluir entrada:', error);
        alert('Erro: ' + error.message);
    }
}

// Função para fechar popups
function fecharPopup() {
    document.getElementById('popupOverlay').style.display = 'none';
    document.getElementById('entradaPopup').style.display = 'none';
    document.getElementById('deletePopup').style.display = 'none';
    currentRowToDelete = null;
}

// Inicialização da página
document.addEventListener('DOMContentLoaded', async () => {
    // Adiciona um campo hidden para o ID da entrada
    const form = document.getElementById('entradaForm');
    if (form && !document.getElementById('entradaId')) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.id = 'entradaId';
        input.name = 'entradaId';
        form.prepend(input);
    }

    // Carrega os dados iniciais (produtos e fornecedores primeiro)
    await Promise.all([carregarProdutos(), carregarFornecedores()]);
    await carregarEntradas();

    // Configura a data atual como padrão
    document.getElementById('dataEntrada').value = new Date().toISOString().split('T')[0];

    // Configura eventos
    document.getElementById('novaEntradaBtn').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('entradaForm').reset();
        document.getElementById('editMode').value = 'false';
        document.getElementById('popupTitle').textContent = 'Nova Entrada';
        document.getElementById('popupOverlay').style.display = 'block';
        document.getElementById('entradaPopup').style.display = 'block';
    });

    document.getElementById('entradaForm').addEventListener('submit', salvarEntrada);
    document.getElementById('confirmDelete').addEventListener('click', excluirEntrada);
    document.getElementById('cancelDelete').addEventListener('click', fecharPopup);
    document.getElementById('cancelarEntrada').addEventListener('click', fecharPopup);

    // Fechar popup ao clicar no overlay
    document.getElementById('popupOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('popupOverlay')) {
            fecharPopup();
        }
    });
});
