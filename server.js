const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // Adicionar esta linha para importar o CORS
const app = express();
const PORT = 3000;

// Habilitar CORS para todas as rotas
app.use(cors());
app.use(express.json());

// Configuração do banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'cursoads',
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

// CRIAR - Adicionar um novo produto
app.post('/api/produtos', (req, res) => {
  const { nome, descricao, preco, categoria } = req.body;
  
  // Usando consultas parametrizadas para prevenir injeção de SQL
  const query = 'INSERT INTO produtos (nome, descricao, preco, categoria) VALUES (?, ?, ?, ?)';
  
  db.query(query, [nome, descricao, preco, categoria], (err, results) => {
    if (err) {
      console.error('Erro ao criar produto:', err.message);
      res.status(500).send('Erro no servidor');
      return;
    }
    res.status(201).json({
      sucesso: true,
      id: results.insertId,
      mensagem: 'Produto criado com sucesso'
    });
  });
});

// LER - Obter todos os produtos
app.get('/api/produtos', (req, res) => {
  db.query('SELECT * FROM produtos', (err, results) => {
    if (err) {
      console.error('Erro ao buscar produtos:', err.message);
      res.status(500).send('Erro no servidor');
      return;
    }
    res.json(results);
  });
});

// LER - Obter um produto específico pelo ID
app.get('/api/produtos/:id', (req, res) => {
  const id = req.params.id;
  
  // Usando consulta parametrizada
  db.query('SELECT * FROM produtos WHERE id_produto = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar produto:', err.message);
      res.status(500).send('Erro no servidor');
      return;
    }
    
    if (results.length === 0) {
      res.status(404).json({ mensagem: 'Produto não encontrado' });
      return;
    }
    
    res.json(results[0]);
  });
});

// ATUALIZAR - Atualizar um produto
app.put('/api/produtos/:id', (req, res) => {
  const id = req.params.id;
  const { nome, descricao, preco, categoria } = req.body;
  
  // Usando consulta parametrizada
  const query = 'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, categoria = ? WHERE id_produto = ?';
  
  db.query(query, [nome, descricao, preco, categoria, id], (err, results) => {
    if (err) {
      console.error('Erro ao atualizar produto:', err.message);
      res.status(500).send('Erro no servidor');
      return;
    }
    
    if (results.affectedRows === 0) {
      res.status(404).json({ mensagem: 'Produto não encontrado ou nenhuma alteração feita' });
      return;
    }
    
    res.json({
      sucesso: true,
      mensagem: 'Produto atualizado com sucesso'
    });
  });
});

// DELETAR - Excluir um produto
app.delete('/api/produtos/:id', (req, res) => {
  const id = req.params.id;
  
  // Usando consulta parametrizada
  db.query('DELETE FROM produtos WHERE id_produto = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao excluir produto:', err.message);
      res.status(500).send('Erro no servidor');
      return;
    }
    
    if (results.affectedRows === 0) {
      res.status(404).json({ mensagem: 'Produto não encontrado' });
      return;
    }
    
    res.json({
      sucesso: true,
      mensagem: 'Produto excluído com sucesso'
    });
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
// Endpoints para Fornecedores

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
  if (!nome) {
    return res.status(400).json({ error: 'Nome do fornecedor é obrigatório' });
  }
  
  const query = 'INSERT INTO fornecedores (nome, cnpj, telefone, email, endereco) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [nome, cnpj, telefone, email, endereco], (err, results) => {
    if (err) {
      // Verificar se é erro de CNPJ duplicado (chave única)
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
  if (!nome) {
    return res.status(400).json({ error: 'Nome do fornecedor é obrigatório' });
  }
  
  const query = 'UPDATE fornecedores SET nome = ?, cnpj = ?, telefone = ?, email = ?, endereco = ? WHERE id_fornecedor = ?';
  db.query(query, [nome, cnpj, telefone, email, endereco, id], (err, results) => {
    if (err) {
      // Verificar se é erro de CNPJ duplicado
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

// GET - Listar todas as movimentações
app.get('/api/movimentacoes', (req, res) => {
  db.query('SELECT * FROM movimentacoes', (err, results) => {
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
  db.query('SELECT * FROM movimentacoes WHERE id_movimentacao = ?', [id], (err, results) => {
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
app.post('/api/movimentacoes', (req, res) => {
  const { id_produto, tipo_movimentacao, quantidade, data_movimentacao } = req.body;

  // Validação básica
  if (!id_produto || !tipo_movimentacao || !quantidade) {
    return res.status(400).json({ error: 'Campos obrigatórios: id_produto, tipo_movimentacao, quantidade' });
  }

  const query = 'INSERT INTO movimentacoes (id_produto, tipo_movimentacao, quantidade, data_movimentacao) VALUES (?, ?, ?, ?)';
  db.query(query, [id_produto, tipo_movimentacao, quantidade, data_movimentacao || new Date()], (err, results) => {
    if (err) {
      console.error('Erro ao criar movimentação:', err.message);
      return res.status(500).send('Erro no servidor');
    }

    res.status(201).json({
      id: results.insertId,
      message: 'Movimentação criada com sucesso'
    });
  });
});

// PUT - Atualizar uma movimentação existente
app.put('/api/movimentacoes/:id', (req, res) => {
  const id = req.params.id;
  const { id_produto, tipo_movimentacao, quantidade, data_movimentacao } = req.body;

  // Validação básica
  if (!id_produto || !tipo_movimentacao || !quantidade) {
    return res.status(400).json({ error: 'Campos obrigatórios: id_produto, tipo_movimentacao, quantidade' });
  }

  const query = 'UPDATE movimentacoes SET id_produto = ?, tipo_movimentacao = ?, quantidade = ?, data_movimentacao = ? WHERE id_movimentacao = ?';
  db.query(query, [id_produto, tipo_movimentacao, quantidade, data_movimentacao || new Date(), id], (err, results) => {
    if (err) {
      console.error('Erro ao atualizar movimentação:', err.message);
      return res.status(500).send('Erro no servidor');
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Movimentação não encontrada' });
    }

    res.json({
      message: 'Movimentação atualizada com sucesso'
    });
  });
});

// DELETE - Remover uma movimentação
app.delete('/api/movimentacoes/:id', (req, res) => {
  const id = req.params.id;

  db.query('DELETE FROM movimentacoes WHERE id_movimentacao = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao excluir movimentação:', err.message);
      return res.status(500).send('Erro no servidor');
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Movimentação não encontrada' });
    }

    res.json({
      message: 'Movimentação excluída com sucesso'
    });
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

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
  const { username, senha } = req.body;

  // Validação básica
  if (!username || !senha) {
    return res.status(400).json({ error: 'Campos obrigatórios: username e senha' });
  }

  const query = 'INSERT INTO usuarios (username, senha) VALUES (?, ?)';
  db.query(query, [username, senha], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Usuário já existe' });
      }
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
  const { username, senha } = req.body;

  // Validação básica
  if (!username || !senha) {
    return res.status(400).json({ error: 'Campos obrigatórios: username e senha' });
  }

  const query = 'UPDATE usuarios SET username = ?, senha = ? WHERE id_usuario = ?';
  db.query(query, [username, senha, id], (err, results) => {
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