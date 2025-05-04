const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Habilitar CORS para todas as rotas
app.use(cors());
app.use(express.json()); // Para permitir o envio de JSON no corpo da requisição

// Configurações do banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '26216911a',
  database: 'estoque'
});

// Testar conexão com o MySQL
db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err.message);
    return;
  }
  console.log('Conectado ao MySQL!');
});

// Endpoint para buscar dados de produtos
app.get('/api/produtos', (req, res) => {
  db.query('SELECT * FROM produtos', (err, results) => {
    if (err) {
      console.error('Erro ao buscar dados:', err.message);
      res.status(500).send('Erro no servidor');
      return;
    }
    res.json(results); // Retornar os dados como JSON
  });
});

// Endpoint para buscar dados de um produto específico
app.get('/api/produtos/:id', (req, res) => {
  const id = req.params.id;
  console.log('ID recebido:', id);
  db.query('SELECT * FROM produtos WHERE id_produto = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar dados:', err.message);
      res.status(500).send('Erro no servidor');
      return;
    }
    res.json(results); // Retornar os dados como JSON
  });
});

// Endpoint para criar um novo produto
app.post('/api/produtos', (req, res) => {
  const { nome, descricao, preco, categoria } = req.body;
  
  // Validação básica
  if (!nome || !descricao || !preco || !categoria) {
    return res.status(400).json({ error: 'Campos obrigatórios: nome, descrição, preço, categoria' });
  }
  
  const query = 'INSERT INTO produtos (nome, descricao, preco, categoria) VALUES (?, ?, ?, ?)';
  db.query(query, [nome, descricao, preco, categoria], (err, results) => {
    if (err) {
      console.error('Erro ao cadastrar produto:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    res.status(201).json({
      id: results.insertId,
      message: 'Produto cadastrado com sucesso'
    });
  });
});

// Endpoint para atualizar um produto existente
app.put('/api/produtos/:id', (req, res) => {
  const id = req.params.id;
  const { nome, descricao, preco, categoria } = req.body;
  
  // Validação básica
  if (!nome || !descricao || !preco || !categoria) {
    return res.status(400).json({ error: 'Campos obrigatórios: nome, descrição, preço, categoria' });
  }
  
  const query = 'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, categoria = ? WHERE id_produto = ?';
  db.query(query, [nome, descricao, preco, categoria, id], (err, results) => {
    if (err) {
      console.error('Erro ao atualizar produto:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json({
      message: 'Produto atualizado com sucesso'
    });
  });
});

// Endpoint para excluir um produto
app.delete('/api/produtos/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM produtos WHERE id_produto = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao excluir produto:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json({
      message: 'Produto excluído com sucesso'
    });
  });
});

// CRUD para Fornecedores
// GET - Listar todos os fornecedores
app.get('/api/fornecedores', (req, res) => {
  db.query('SELECT * FROM fornecedores', (err, results) => {
    if (err) {
      console.error('Erro ao buscar fornecedores:', err.message);
      res.status(500).send('Erro no servidor');
      return;
    }
    res.json(results);
  });
});

// GET - Buscar um fornecedor específico pelo ID
app.get('/api/fornecedores/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM fornecedores WHERE id_fornecedor = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar fornecedor:', err.message);
      res.status(500).send('Erro no servidor');
      return;
    }
    if (results.length === 0) {
      res.status(404).send('Fornecedor não encontrado');
      return;
    }
    res.json(results[0]);
  });
});

// POST - Criar um novo fornecedor
app.post('/api/fornecedores', (req, res) => {
  const { nome, cnpj, telefone, email, endereco } = req.body;
  
  // Validação básica
  if (!nome || !cnpj) {
    return res.status(400).json({ error: 'Campos obrigatórios: nome e cnpj' });
  }
  
  const query = 'INSERT INTO fornecedores (nome, cnpj, telefone, email, endereco, data_cadastro) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [nome, cnpj, telefone, email, endereco, new Date()], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'CNPJ já cadastrado' });
      }
      console.error('Erro ao cadastrar fornecedor:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    res.status(201).json({
      id: results.insertId,
      message: 'Fornecedor cadastrado com sucesso'
    });
  });
});

// PUT - Atualizar um fornecedor existente
app.put('/api/fornecedores/:id', (req, res) => {
  const id = req.params.id;
  const { nome, cnpj, telefone, email, endereco } = req.body;
  
  // Validação básica
  if (!nome || !cnpj) {
    return res.status(400).json({ error: 'Campos obrigatórios: nome e cnpj' });
  }
  
  const query = 'UPDATE fornecedores SET nome = ?, cnpj = ?, telefone = ?, email = ?, endereco = ? WHERE id_fornecedor = ?';
  db.query(query, [nome, cnpj, telefone, email, endereco, id], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'CNPJ já cadastrado para outro fornecedor' });
      }
      console.error('Erro ao atualizar fornecedor:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }
    res.json({
      message: 'Fornecedor atualizado com sucesso'
    });
  });
});

// DELETE - Remover um fornecedor
app.delete('/api/fornecedores/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM fornecedores WHERE id_fornecedor = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao excluir fornecedor:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }
    res.json({
      message: 'Fornecedor excluído com sucesso'
    });
  });
});

// CRUD para Movimentações
// Endpoint para obter o último código de movimentação
app.get('/api/movimentacoes/ultimo-codigo', (req, res) => {
  db.query('SELECT MAX(id_movimentacao) as ultimoCodigo FROM movimentacoes', (err, results) => {
    if (err) {
      console.error('Erro ao buscar último código:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    res.json({ ultimoCodigo: results[0].ultimoCodigo || 0 });
  });
});

// GET - Listar todas as movimentações com informações relacionadas
app.get('/api/movimentacoes', (req, res) => {
  const query = `
    SELECT m.*, p.nome as produto_nome, f.nome as fornecedor_nome
    FROM movimentacoes m
    LEFT JOIN produtos p ON m.id_produto = p.id_produto
    LEFT JOIN fornecedores f ON m.id_fornecedor = f.id_fornecedor
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar movimentações:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    res.json(results);
  });
});

// GET - Buscar uma movimentação específica pelo ID
app.get('/api/movimentacoes/:id', (req, res) => {
  const id = req.params.id;
  const query = `
    SELECT m.*, p.nome as produto_nome, f.nome as fornecedor_nome
    FROM movimentacoes m
    LEFT JOIN produtos p ON m.id_produto = p.id_produto
    LEFT JOIN fornecedores f ON m.id_fornecedor = f.id_fornecedor
    WHERE m.id_movimentacao = ?
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar movimentação:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Movimentação não encontrada' });
    }
    res.json(results[0]);
  });
});

// POST - Criar uma nova movimentação
// POST - Criar uma nova movimentação
app.post('/api/movimentacoes', (req, res) => {
  const { 
    produto_id, 
    tipo, 
    quantidade, 
    fornecedor_id, 
    nota_fiscal, 
    valor_unitario, 
    data_movimentacao, 
    observacao,
    responsavel 
  } = req.body;

  // Validação básica - verificar se produto_id é um número válido
  if (!produto_id || isNaN(parseInt(produto_id))) {
    return res.status(400).json({ error: 'ID do produto inválido ou não fornecido' });
  }

  if (!tipo || !quantidade) {
    return res.status(400).json({ error: 'Campos obrigatórios: tipo, quantidade' });
  }

  // Converter produto_id para número
  const produtoIdNumerico = parseInt(produto_id);

  // Verificar se a tabela tem as colunas necessárias
  db.query('SHOW COLUMNS FROM movimentacoes', (err, columns) => {
    if (err) {
      console.error('Erro ao verificar estrutura da tabela:', err.message);
      return res.status(500).send('Erro no servidor');
    }

    // Obter nomes das colunas
    const columnNames = columns.map(col => col.Field);
    console.log('Colunas disponíveis:', columnNames);

    // Construir query dinamicamente com base nas colunas disponíveis
    let fields = ['id_produto', 'tipo_movimentacao', 'quantidade'];
    let values = [produtoIdNumerico, tipo, quantidade];
    let placeholders = ['?', '?', '?'];

    // Adicionar campos opcionais se as colunas existirem
    if (columnNames.includes('id_fornecedor') && fornecedor_id) {
      fields.push('id_fornecedor');
      values.push(parseInt(fornecedor_id) || null);
      placeholders.push('?');
    }

    if (columnNames.includes('nota_fiscal') && nota_fiscal) {
      fields.push('nota_fiscal');
      values.push(nota_fiscal);
      placeholders.push('?');
    }

    if (columnNames.includes('valor_unitario') && valor_unitario) {
      fields.push('valor_unitario');
      values.push(parseFloat(valor_unitario) || 0);
      placeholders.push('?');
    }

    if (columnNames.includes('data_movimentacao')) {
      fields.push('data_movimentacao');
      values.push(data_movimentacao || new Date());
      placeholders.push('?');
    }

    if (columnNames.includes('observacao') && observacao) {
      fields.push('observacao');
      values.push(observacao);
      placeholders.push('?');
    }

    if (columnNames.includes('responsavel') && responsavel) {
      fields.push('responsavel');
      values.push(responsavel);
      placeholders.push('?');
    }

    // Construir a query
    const query = `INSERT INTO movimentacoes (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
    console.log('Query construída:', query);
    console.log('Valores:', values);

    // Executar a query
    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Erro ao criar movimentação:', err.message);
        return res.status(500).send('Erro no servidor');
      }
      
      // Atualizar estoque do produto
      atualizarEstoqueProduto(produtoIdNumerico, quantidade, tipo);
      
      res.status(201).json({
        id: results.insertId,
        message: 'Movimentação criada com sucesso'
      });
    });
  });
});


// PUT - Atualizar uma movimentação existente
app.put('/api/movimentacoes/:id', (req, res) => {
  const id = req.params.id;
  const { 
    produto_id, 
    tipo, 
    quantidade, 
    fornecedor_id, 
    nota_fiscal, 
    valor_unitario, 
    data_movimentacao, 
    observacao,
    responsavel 
  } = req.body;

  // Validação básica
  if (!produto_id || !tipo || !quantidade) {
    return res.status(400).json({ error: 'Campos obrigatórios: produto_id, tipo, quantidade' });
  }

  // Primeiro, obter a movimentação atual para calcular a diferença de estoque
  db.query('SELECT * FROM movimentacoes WHERE id_movimentacao = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar movimentação atual:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Movimentação não encontrada' });
    }
    
    const movimentacaoAtual = results[0];
    
    // Verificar se a tabela tem as colunas necessárias
    db.query('SHOW COLUMNS FROM movimentacoes', (err, columns) => {
      if (err) {
        console.error('Erro ao verificar estrutura da tabela:', err.message);
        return res.status(500).send('Erro no servidor');
      }

      // Obter nomes das colunas
      const columnNames = columns.map(col => col.Field);
      
      // Construir query dinamicamente com base nas colunas disponíveis
      let updates = ['id_produto = ?', 'tipo_movimentacao = ?', 'quantidade = ?'];
      let values = [produto_id, tipo, quantidade];

      // Adicionar campos opcionais se as colunas existirem
      if (columnNames.includes('id_fornecedor')) {
        updates.push('id_fornecedor = ?');
        values.push(fornecedor_id || null);
      }

      if (columnNames.includes('nota_fiscal')) {
        updates.push('nota_fiscal = ?');
        values.push(nota_fiscal || null);
      }

      if (columnNames.includes('valor_unitario')) {
        updates.push('valor_unitario = ?');
        values.push(valor_unitario || 0);
      }

      if (columnNames.includes('data_movimentacao')) {
        updates.push('data_movimentacao = ?');
        values.push(data_movimentacao || new Date());
      }

      if (columnNames.includes('observacao')) {
        updates.push('observacao = ?');
        values.push(observacao || null);
      }

      if (columnNames.includes('responsavel')) {
        updates.push('responsavel = ?');
        values.push(responsavel || null);
      }

      // Adicionar o ID no final dos valores
      values.push(id);

      // Construir a query
      const query = `UPDATE movimentacoes SET ${updates.join(', ')} WHERE id_movimentacao = ?`;

      // Executar a query
      db.query(query, values, (err, results) => {
        if (err) {
          console.error('Erro ao atualizar movimentação:', err.message);
          return res.status(500).send('Erro no servidor');
        }
        
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Movimentação não encontrada' });
        }
        
        // Atualizar estoque do produto - primeiro reverter a movimentação anterior
        if (movimentacaoAtual.id_produto === produto_id) {
          // Se for o mesmo produto, apenas ajustar a diferença
          const diferencaQuantidade = quantidade - movimentacaoAtual.quantidade;
          if (diferencaQuantidade !== 0) {
            atualizarEstoqueProduto(produto_id, diferencaQuantidade, tipo);
          }
        } else {
          // Se mudou o produto, reverter a movimentação anterior e aplicar a nova
          const tipoInverso = movimentacaoAtual.tipo_movimentacao === 'entrada' ? 'saida' : 'entrada';
          atualizarEstoqueProduto(movimentacaoAtual.id_produto, movimentacaoAtual.quantidade, tipoInverso);
          atualizarEstoqueProduto(produto_id, quantidade, tipo);
        }
        
        res.json({
          message: 'Movimentação atualizada com sucesso'
        });
      });
    });
  });
});

// DELETE - Remover uma movimentação
app.delete('/api/movimentacoes/:id', (req, res) => {
  const id = req.params.id;
  
  // Primeiro, obter a movimentação para reverter o estoque
  db.query('SELECT * FROM movimentacoes WHERE id_movimentacao = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar movimentação:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Movimentação não encontrada' });
    }
    
    const movimentacao = results[0];
    
    // Excluir a movimentação
    db.query('DELETE FROM movimentacoes WHERE id_movimentacao = ?', [id], (err, deleteResults) => {
      if (err) {
        console.error('Erro ao excluir movimentação:', err.message);
        return res.status(500).send('Erro no servidor');
      }
      
      if (deleteResults.affectedRows === 0) {
        return res.status(404).json({ error: 'Movimentação não encontrada' });
      }
      
      // Reverter o efeito no estoque
      const tipoInverso = movimentacao.tipo_movimentacao === 'entrada' ? 'saida' : 'entrada';
      atualizarEstoqueProduto(movimentacao.id_produto, movimentacao.quantidade, tipoInverso);
      
      res.json({
        message: 'Movimentação excluída com sucesso'
      });
    });
  });
});

// Função para atualizar o estoque do produto
function atualizarEstoqueProduto(produtoId, quantidade, tipo) {
  // Verificar se a tabela produtos tem a coluna estoque
  db.query('SHOW COLUMNS FROM produtos', (err, columns) => {
    if (err) {
      console.error('Erro ao verificar estrutura da tabela produtos:', err.message);
      return;
    }
    
    // Verificar se a coluna estoque existe
    const temColunaEstoque = columns.some(col => col.Field === 'estoque');
    
    if (!temColunaEstoque) {
      console.log('A tabela produtos não tem coluna estoque. Ignorando atualização de estoque.');
      return;
    }
    
    // Calcular a alteração no estoque
    const alteracao = tipo === 'entrada' ? quantidade : -quantidade;
    
    // Atualizar o estoque
    const query = 'UPDATE produtos SET estoque = estoque + ? WHERE id_produto = ?';
    db.query(query, [alteracao, produtoId], (err, results) => {
      if (err) {
        console.error('Erro ao atualizar estoque do produto:', err.message);
        return;
      }
      console.log(`Estoque do produto ${produtoId} atualizado: ${alteracao > 0 ? '+' : ''}${alteracao} unidades`);
    });
  });
}

// CRUD para Usuários
// GET - Listar todos os usuários
app.get('/api/usuarios', (req, res) => {
  db.query('SELECT id_usuario, username FROM usuarios', (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuários:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    res.json(results);
  });
});

// GET - Buscar um usuário específico pelo ID
app.get('/api/usuarios/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT id_usuario, username FROM usuarios WHERE id_usuario = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(results[0]);
  });
});

// POST - Criar um novo usuário
app.post('/api/usuarios', (req, res) => {
  const { username, senha, nome, email } = req.body;
  
  // Validação básica
  if (!username || !senha || !nome || !email) {
    return res.status(400).json({ error: 'Campos obrigatórios: username, senha, nome, email' });
  }
  
  const query = 'INSERT INTO usuarios (username, senha, nome, email) VALUES (?, ?, ?, ?)';
  db.query(query, [username, senha, nome, email], (err, results) => {
    if (err) {
      console.error('Erro ao criar usuário:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    res.status(201).json({
      id: results.insertId,
      message: 'Usuário criado com sucesso'
    });
  });
});

// PUT - Atualizar um usuário existente
app.put('/api/usuarios/:id', (req, res) => {
  const id = req.params.id;
  const { username, senha, nome, email } = req.body;
  
  // Validação básica
  if (!username || !senha || !nome || !email) {
    return res.status(400).json({ error: 'Campos obrigatórios: username, senha, nome, email' });
  }
  
  const query = 'UPDATE usuarios SET username = ?, senha = ?, nome = ?, email = ? WHERE id_usuario = ?';
  db.query(query, [username, senha, nome, email, id], (err, results) => {
    if (err) {
      console.error('Erro ao atualizar usuário:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json({
      message: 'Usuário atualizado com sucesso'
    });
  });
});

// DELETE - Remover um usuário
app.delete('/api/usuarios/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM usuarios WHERE id_usuario = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao excluir usuário:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json({
      message: 'Usuário excluído com sucesso'
    });
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
