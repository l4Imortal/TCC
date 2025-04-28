const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = 3000; // Usar uma porta adequada para HTTP
app.use(express.json()); // Para permitir o envio de JSON no corpo da requisição

// Configurações do banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
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

// Endpoint para buscar dados
app.get('/api/produtos', (req, res) => {
  db.query('SELECT * FROM produtos', (err, results) => { // Ajuste a tabela para o seu caso
    if (err) {
      console.error('Erro ao buscar dados:', err.message);
      res.status(500).send('Erro no servidor');
      return;
    }
    res.json(results); // Retornar os dados como JSON
  });
});
// Endpoint para buscar dados
app.get('/api/produtos', (req, res) => {
  db.query('SELECT * FROM produtos', (err, results) => { // Ajuste a tabela para o seu caso
    if (err) {
      console.error('Erro ao buscar dados:', err.message);
      res.status(500).send('Erro no servidor');
      return;
    }
    res.json(results); // Retornar os dados como JSON
  });
});
app.post('/api/produtos', (req, res) => {
  const id = req.params.id;
  console.log( req.body);
  const query = `INSERT INTO produtos (nome,descricao,preco,categoria) VALUES("${req.body.nome}","${req.body.descricao}",${req.body.preco},"${req.body.categoria}");`
  console.log ("query", query);
  db.query(query, (err, results) => { // Ajuste a tabela para o seu caso
   
    res.json(true); // Retornar os dados como JSON
  });
});
app.get('/api/produtos/:id', (req, res) => {
  const id = req.params.id;
  console.log('ID recebido:', id);
  db.query('SELECT * FROM produtos WHERE id_produto='+id, (err, results) => { // Ajuste a tabela para o seu caso
    if (err) {
      console.error('Erro ao buscar dados:', err.message);
      res.status(500).send('Erro no servidor');
      return;
    }
    res.json(results); // Retornar os dados como JSON
  });
});
app.delete('/api/produtos/:id', (req, res) => {
  const id = req.params.id;
  console.log('ID recebido:', id);
  db.query('DELETE FROM produtos WHERE id_produto='+id, (err, results) => { // Ajuste a tabela para o seu caso
    
    res.json(true); // Retornar os dados como JSON
  });
});
app.put('/api/produtos/:id', (req, res) => {
  const id = req.params.id;
  const query = `UPDATE produtos SET nome="${req.body.nome}", descricao="${req.body.descricao}", preco=${req.body.preco}, categoria="${req.body.categoria}" WHERE id_produto=${id};`
  console.log('ID recebido:', id);
  db.query(query, (err, results) => { // Ajuste a tabela para o seu caso
    
    res.json(true); // Retornar os dados como JSON
  });
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

